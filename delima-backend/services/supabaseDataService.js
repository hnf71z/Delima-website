const { randomUUID } = require('crypto');
const { supabase, isConfigured } = require('../config/supabase');

class SupabaseDataService {
  ensureConfigured() {
    if (!isConfigured || !supabase) {
      throw new Error(
        'Supabase belum dikonfigurasi. Tambahkan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di delima-backend/.env'
      );
    }
  }

  isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(value || '').trim()
    );
  }

  normalizeOrderReference(orderRef) {
    return String(orderRef || '')
      .trim()
      .replace(/^#/, '')
      .replace(/^ord[-_]/i, '')
      .trim();
  }

  normalizeStatus(status) {
    const map = {
      pending: 'pending',
      processing: 'processing',
      completed: 'completed',
      cancelled: 'cancelled',
      selesai: 'completed',
      batal: 'cancelled',
      diproses: 'processing',
    };

    const normalized = String(status || '').toLowerCase().trim();
    return map[normalized] || normalized;
  }

  inferCategoryFromName(name) {
    const value = String(name || '').toLowerCase();
    if (value.includes('infus') || value.includes('water') || value.includes('minum') || value.includes('drink')) {
      return 'minuman';
    }
    return 'dimsum';
  }

  async getOrderByReference(orderRef) {
    this.ensureConfigured();

    const normalized = this.normalizeOrderReference(orderRef);
    if (!normalized) return null;

    if (this.isUuid(normalized)) {
      const { data, error } = await supabase.from('orders').select('*').eq('id', normalized).maybeSingle();
      if (error) throw error;
      return data || null;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('id', `${normalized}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  }

  async getProductByName(name) {
    this.ensureConfigured();

    const normalized = String(name || '').trim();
    if (!normalized) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${normalized}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  }

  async getDefaultProductByCategory(category) {
    this.ensureConfigured();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('stock', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  }

  async resolveProductByInput(productName) {
    const byName = await this.getProductByName(productName);
    if (byName) return byName;

    const inferredCategory = this.inferCategoryFromName(productName);
    return this.getDefaultProductByCategory(inferredCategory);
  }

  async createOrder({ customerName, customerEmail, customerPhone, products, notes }) {
    this.ensureConfigured();

    const orderId = randomUUID();
    const normalizedProducts = Array.isArray(products) && products.length > 0 ? products : [{ name: 'Dimsum', quantity: 1 }];

    const itemRows = [];
    let total = 0;

    for (const inputItem of normalizedProducts) {
      const qty = Math.max(parseInt(inputItem.quantity || 1, 10), 1);
      const productName = inputItem.name || inputItem.productName || 'Dimsum';
      const product = await this.resolveProductByInput(productName);

      const fallbackPrice = this.inferCategoryFromName(productName) === 'minuman' ? 15000 : 25000;
      const linePrice = product?.price || fallbackPrice;
      const lineName = product?.name || productName;

      itemRows.push({
        id: randomUUID(),
        order_id: orderId,
        product_id: product?.id || null,
        product_name: lineName,
        quantity: qty,
        price: linePrice,
      });

      total += linePrice * qty;
    }

    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      customer_name: customerName || 'Unknown',
      customer_email: customerEmail || '',
      customer_phone: customerPhone || '',
      status: 'pending',
      total,
      notes: notes || '',
    });

    if (orderError) throw orderError;

    const { error: itemError } = await supabase.from('order_items').insert(itemRows);

    if (itemError) {
      await supabase.from('orders').delete().eq('id', orderId);
      throw itemError;
    }

    return {
      id: orderId,
      total,
      items: itemRows,
    };
  }

  async updateOrderStatus(orderRef, newStatus) {
    this.ensureConfigured();

    const order = await this.getOrderByReference(orderRef);
    if (!order) return null;

    const status = this.normalizeStatus(newStatus);

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async createProduct({ name, price, stock, category }) {
    this.ensureConfigured();

    const productCategory = category || this.inferCategoryFromName(name);
    const payload = {
      id: randomUUID(),
      name,
      category: productCategory,
      price: Math.max(parseInt(price || 0, 10), 0),
      stock: Math.max(parseInt(stock || 0, 10), 0),
      is_active: true,
    };

    const { data, error } = await supabase.from('products').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  }

  async updateProductPrice(productName, newPrice) {
    this.ensureConfigured();

    const product = await this.getProductByName(productName);
    if (!product) return null;

    const { data, error } = await supabase
      .from('products')
      .update({
        price: Math.max(parseInt(newPrice || 0, 10), 0),
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id)
      .select('*')
      .single();

    if (error) throw error;

    return {
      before: product,
      after: data,
    };
  }

  async updateProductStock(productName, newStock) {
    this.ensureConfigured();

    const product = await this.getProductByName(productName);
    if (!product) return null;

    const { data, error } = await supabase
      .from('products')
      .update({
        stock: Math.max(parseInt(newStock || 0, 10), 0),
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id)
      .select('*')
      .single();

    if (error) throw error;

    return {
      before: product,
      after: data,
    };
  }

  async setProductActiveState(productName, isActive) {
    this.ensureConfigured();

    const product = await this.getProductByName(productName);
    if (!product) return null;

    const { data, error } = await supabase
      .from('products')
      .update({
        is_active: Boolean(isActive),
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id)
      .select('*')
      .single();

    if (error) throw error;

    return {
      before: product,
      after: data,
    };
  }

  async deleteProduct(productName) {
    this.ensureConfigured();

    const product = await this.getProductByName(productName);
    if (!product) return null;

    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) throw error;

    return product;
  }

  async getProducts({ category, active, limit = 20 } = {}) {
    this.ensureConfigured();

    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (active !== undefined) {
      query = query.eq('is_active', Boolean(active));
    }

    const { data, error } = await query.limit(Math.max(parseInt(limit || 20, 10), 1));

    if (error) throw error;
    return data || [];
  }

  async updateCustomerInfo(orderRef, { email, phone }) {
    this.ensureConfigured();

    const order = await this.getOrderByReference(orderRef);
    if (!order) return null;

    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (email) payload.customer_email = email;
    if (phone) payload.customer_phone = phone;

    const { data, error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', order.id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async deleteOrder(orderRef) {
    this.ensureConfigured();

    const order = await this.getOrderByReference(orderRef);
    if (!order) return null;

    const { error } = await supabase.from('orders').delete().eq('id', order.id);
    if (error) throw error;

    return order;
  }

  async searchOrdersByCustomer(customerName, limit = 10) {
    this.ensureConfigured();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('customer_name', `%${customerName}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getRecentOrders(limit = 5) {
    this.ensureConfigured();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getPendingOrders() {
    this.ensureConfigured();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async countOrdersByStatus(status) {
    this.ensureConfigured();

    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    if (error) throw error;
    return count || 0;
  }

  async countAllOrders() {
    this.ensureConfigured();

    const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }

  async getOrderStats() {
    const [total, pending, processing, completed, cancelled] = await Promise.all([
      this.countAllOrders(),
      this.countOrdersByStatus('pending'),
      this.countOrdersByStatus('processing'),
      this.countOrdersByStatus('completed'),
      this.countOrdersByStatus('cancelled'),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      cancelled,
    };
  }

  async countProductsWithFilter(filters = {}) {
    this.ensureConfigured();

    let query = supabase.from('products').select('*', { count: 'exact', head: true });

    if (filters.active !== undefined) {
      query = query.eq('is_active', filters.active);
    }

    if (filters.outOfStock) {
      query = query.lte('stock', 0);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async getProductStats() {
    const [total, active, outOfStock, itemsResult] = await Promise.all([
      this.countProductsWithFilter(),
      this.countProductsWithFilter({ active: true }),
      this.countProductsWithFilter({ outOfStock: true }),
      supabase
        .from('order_items')
        .select('product_name, quantity, orders!inner(status)')
        .neq('orders.status', 'cancelled'),
    ]);

    if (itemsResult.error) throw itemsResult.error;

    const aggregate = new Map();
    (itemsResult.data || []).forEach((item) => {
      const name = item.product_name || 'Unknown Product';
      const current = aggregate.get(name) || 0;
      aggregate.set(name, current + (item.quantity || 0));
    });

    const topProducts = Array.from(aggregate.entries())
      .map(([name, totalSold]) => ({ name, total_sold: totalSold }))
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5);

    return {
      total,
      active,
      outOfStock,
      topProducts,
    };
  }

  async getCustomerStats() {
    this.ensureConfigured();

    const { data, error } = await supabase
      .from('orders')
      .select('customer_email, customer_name, status')
      .neq('status', 'cancelled');

    if (error) throw error;

    const customerMap = new Map();

    (data || []).forEach((order) => {
      const email = order.customer_email || 'unknown@customer.local';
      const existing = customerMap.get(email) || {
        name: order.customer_name || 'Unknown',
        order_count: 0,
      };

      existing.order_count += 1;
      if (order.customer_name) {
        existing.name = order.customer_name;
      }

      customerMap.set(email, existing);
    });

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.order_count - a.order_count)
      .slice(0, 5);

    return {
      total: customerMap.size,
      topCustomers,
    };
  }

  async getRevenueFromRows(rows) {
    return (rows || []).reduce((sum, row) => {
      if (row.status === 'cancelled') return sum;
      return sum + (row.total || 0);
    }, 0);
  }

  async getRevenueSummary() {
    this.ensureConfigured();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [allResult, thisMonthResult, lastMonthResult] = await Promise.all([
      supabase.from('orders').select('total, status'),
      supabase.from('orders').select('total, status').gte('created_at', startOfMonth.toISOString()),
      supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', startOfLastMonth.toISOString())
        .lt('created_at', startOfMonth.toISOString()),
    ]);

    if (allResult.error) throw allResult.error;
    if (thisMonthResult.error) throw thisMonthResult.error;
    if (lastMonthResult.error) throw lastMonthResult.error;

    const total = await this.getRevenueFromRows(allResult.data);
    const thisMonth = await this.getRevenueFromRows(thisMonthResult.data);
    const lastMonth = await this.getRevenueFromRows(lastMonthResult.data);

    const growthRate = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : '0.0';

    return {
      total,
      thisMonth,
      lastMonth,
      growthRate,
    };
  }

  async getGrowthRate() {
    const summary = await this.getRevenueSummary();
    return {
      growthRate: summary.growthRate,
      thisMonth: summary.thisMonth,
      lastMonth: summary.lastMonth,
    };
  }

  async getSalesChart(months = 6) {
    this.ensureConfigured();

    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at, status')
      .neq('status', 'cancelled')
      .gte('created_at', start.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const grouped = new Map();

    (data || []).forEach((order) => {
      const createdAt = new Date(order.created_at);
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      const month = createdAt.toLocaleString('id-ID', { month: 'short' });

      const current = grouped.get(key) || { month, sales: 0, orders: 0 };
      current.sales += order.total || 0;
      current.orders += 1;

      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, value]) => value);
  }

  async getProductDistribution() {
    this.ensureConfigured();

    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, products!inner(category), orders!inner(status)')
      .neq('orders.status', 'cancelled');

    if (error) throw error;

    const distribution = {
      dimsum: 0,
      minuman: 0,
    };

    (data || []).forEach((item) => {
      const category = item.products?.category || 'others';
      if (distribution[category] === undefined) {
        distribution[category] = 0;
      }
      distribution[category] += item.quantity || 0;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }

  async getRevenueByProduct(months = 6) {
    this.ensureConfigured();

    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const { data, error } = await supabase
      .from('order_items')
      .select('quantity, price, created_at, products!inner(category), orders!inner(status)')
      .gte('created_at', start.toISOString())
      .neq('orders.status', 'cancelled')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const grouped = new Map();

    (data || []).forEach((item) => {
      const createdAt = new Date(item.created_at);
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      const month = createdAt.toLocaleString('id-ID', { month: 'short' });

      const current = grouped.get(key) || {
        month,
        dimsum: 0,
        infusWater: 0,
      };

      const revenue = (item.price || 0) * (item.quantity || 0);
      if (item.products?.category === 'dimsum') {
        current.dimsum += revenue;
      } else if (item.products?.category === 'minuman') {
        current.infusWater += revenue;
      }

      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, value]) => value);
  }

  async getDailyReport() {
    this.ensureConfigured();

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const { data, error } = await supabase
      .from('orders')
      .select('total, status, customer_email')
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString());

    if (error) throw error;

    const rows = data || [];
    const revenue = await this.getRevenueFromRows(rows);
    const customers = new Set(rows.map((row) => row.customer_email).filter(Boolean));

    return {
      date: now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      revenue,
      orders: rows.length,
      newCustomers: customers.size,
    };
  }

  async getWeeklyReport() {
    this.ensureConfigured();

    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('orders')
      .select('total, status')
      .gte('created_at', start.toISOString());

    if (error) throw error;

    const rows = data || [];
    const revenue = await this.getRevenueFromRows(rows);

    return {
      revenue,
      orders: rows.length,
      dailyAverage: Math.round(revenue / 7),
    };
  }

  async getMonthlyReport() {
    this.ensureConfigured();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data, error } = await supabase
      .from('orders')
      .select('total, status, customer_email')
      .gte('created_at', startOfMonth.toISOString());

    if (error) throw error;

    const rows = data || [];
    const revenue = await this.getRevenueFromRows(rows);
    const customers = new Set(rows.map((row) => row.customer_email).filter(Boolean));
    const currentDay = Math.max(now.getDate(), 1);

    return {
      month: now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
      revenue,
      orders: rows.length,
      customers: customers.size,
      dailyAverage: Math.round(revenue / currentDay),
    };
  }
}

module.exports = new SupabaseDataService();
