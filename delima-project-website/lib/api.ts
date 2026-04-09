import { supabase } from './supabase'

// Auth helpers
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  signup: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'admin' },
      },
    })
    if (error) throw error
    return data
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },
}

// Orders helpers
export const ordersAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    if (params?.search) {
      query = query.or(`customer_name.ilike.%${params.search}%,customer_email.ilike.%${params.search}%,id.ilike.%${params.search}%`)
    }

    query = query.order('created_at', { ascending: false })

    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit
      const to = from + params.limit - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      orders: data || [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / (params?.limit || 10)),
      },
    }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  create: async (orderData: any) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Analytics helpers
export const analyticsAPI = {
  getMetrics: async () => {
    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total')
      .neq('status', 'cancelled')

    if (revenueError) throw revenueError

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'cancelled')

    if (ordersError) throw ordersError

    // Get total customers
    const { data: customersData, error: customersError } = await supabase
      .from('orders')
      .select('customer_email')
      .neq('status', 'cancelled')

    if (customersError) throw customersError

    const uniqueCustomers = new Set(customersData?.map(o => o.customer_email))
    const totalCustomers = uniqueCustomers.size

    // Get this month's revenue
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('orders')
      .select('total')
      .neq('status', 'cancelled')
      .gte('created_at', startOfMonth)

    if (monthlyError) throw monthlyError

    const monthlyRevenue = monthlyData?.reduce((sum, order) => sum + order.total, 0) || 0

    // Get last month's revenue
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

    const { data: lastMonthData, error: lastMonthError } = await supabase
      .from('orders')
      .select('total')
      .neq('status', 'cancelled')
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth)

    if (lastMonthError) throw lastMonthError

    const lastMonthRevenue = lastMonthData?.reduce((sum, order) => sum + order.total, 0) || 0

    const growthRate = lastMonthRevenue > 0
      ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : '0'

    return {
      totalRevenue,
      totalOrders: totalOrders || 0,
      totalCustomers,
      monthlyRevenue,
      lastMonthRevenue,
      growthRate,
    }
  },

  getSalesChart: async () => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .neq('status', 'cancelled')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group by month
    const monthlyData: Record<string, { sales: number; orders: number }> = {}
    
    data?.forEach(order => {
      const month = new Date(order.created_at).toLocaleString('en-US', { month: 'short' })
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, orders: 0 }
      }
      monthlyData[month].sales += order.total
      monthlyData[month].orders += 1
    })

    return Object.entries(monthlyData).map(([month, values]) => ({
      month,
      ...values,
    }))
  },

  getProductDistribution: async () => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        products!inner(category),
        orders(status)
      `)
      .filter('orders.status', 'neq', 'cancelled')

    if (error) throw error

    const distribution: Record<string, number> = {}
    
    data?.forEach((item: any) => {
      const category = item.products.category
      distribution[category] = (distribution[category] || 0) + item.quantity
    })

    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
  },

  getRevenueByProduct: async () => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        created_at,
        products!inner(category),
        orders(status)
      `)
      .gte('created_at', sixMonthsAgo.toISOString())
      .filter('orders.status', 'neq', 'cancelled')
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group by month and category
    const monthlyRevenue: Record<string, { dimsum: number; infusWater: number }> = {}
    
    data?.forEach((item: any) => {
      const month = new Date(item.created_at).toLocaleString('en-US', { month: 'short' })
      const revenue = item.price * item.quantity
      
      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = { dimsum: 0, infusWater: 0 }
      }

      if (item.products.category === 'dimsum') {
        monthlyRevenue[month].dimsum += revenue
      } else if (item.products.category === 'minuman') {
        monthlyRevenue[month].infusWater += revenue
      }
    })

    return Object.entries(monthlyRevenue).map(([month, values]) => ({
      month,
      ...values,
    }))
  },
}

// Products helpers
export const productsAPI = {
  getAll: async (params?: { category?: string; active?: boolean }) => {
    let query = supabase.from('products').select('*')

    if (params?.category) {
      query = query.eq('category', params.category)
    }

    if (params?.active !== undefined) {
      query = query.eq('is_active', params.active)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return { products: data || [] }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  create: async (productData: any) => {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id: string, productData: any) => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

export { supabase }
