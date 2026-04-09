'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Filter, Eye, Download, Loader2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { ordersAPI, productsAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  total: number
  notes: string
  created_at: string
  order_items?: OrderItem[]
}

const statusConfig: Record<Order['status'], { color: string; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
  processing: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Processing' },
  completed: { color: 'bg-lime-100 text-lime-700 border-lime-200', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelled' },
}

interface OrderFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  notes: string
}

interface EditableOrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
}

interface EditableOrder {
  form: OrderFormData
  items: EditableOrderItem[]
}

interface ProductOption {
  id: string
  name: string
  price: number
  stock?: number
  is_active?: boolean
}

const createEmptyOrder = (): EditableOrder => ({
  form: {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
  },
  items: [],
})

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [addOrderDialogOpen, setAddOrderDialogOpen] = useState(false)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  // Support multiple orders
  const [ordersList, setOrdersList] = useState<EditableOrder[]>([])
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0)
  
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  // Initialize with one order form
  const initializeOrderForm = () => {
    setOrdersList([createEmptyOrder()])
    setCurrentOrderIndex(0)
    setSelectedProductId('')
  }

  useEffect(() => {
    loadOrders()
    loadProducts()
  }, [statusFilter, searchTerm])

  useEffect(() => {
    setSelectedProductId('')
  }, [currentOrderIndex, addOrderDialogOpen])

  async function loadProducts() {
    try {
      const { products: data } = await productsAPI.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  async function loadOrders() {
    setIsLoading(true)
    try {
      const data = await ordersAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
      })

      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm')
  }

  const handleAddProductToOrder = (orderIdx: number, productId: string) => {
    if (!productId || !ordersList[orderIdx]) return

    const product = products.find((p) => p.id === productId)
    const currentItems = ordersList[orderIdx].items

    if (!product) return

    if (currentItems.some((item) => item.product_id === productId)) {
      toast.error('Produk sudah ada di pesanan ini')
      setSelectedProductId('')
      return
    }

    const newOrdersList = [...ordersList]
    newOrdersList[orderIdx].items = [
      ...currentItems,
      {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.price,
      },
    ]
    setOrdersList(newOrdersList)
    setSelectedProductId('')
  }

  const handleRemoveProductFromOrder = (orderIdx: number, productId: string) => {
    const newOrdersList = [...ordersList]
    newOrdersList[orderIdx].items = newOrdersList[orderIdx].items.filter(item => item.product_id !== productId)
    setOrdersList(newOrdersList)
  }

  const handleUpdateProductQuantity = (orderIdx: number, productId: string, quantity: number) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(1, quantity) : 1
    const newOrdersList = [...ordersList]
    newOrdersList[orderIdx].items = newOrdersList[orderIdx].items.map(item =>
      item.product_id === productId ? { ...item, quantity: safeQuantity } : item
    )
    setOrdersList(newOrdersList)
  }

  const calculateOrderTotal = (orderIdx: number) => {
    const items = ordersList[orderIdx]?.items ?? []
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const addNewOrder = () => {
    const nextIndex = ordersList.length
    setOrdersList([...ordersList, createEmptyOrder()])
    setCurrentOrderIndex(nextIndex)
  }

  const removeOrder = (index: number) => {
    if (ordersList.length <= 1) {
      toast.error('You need at least one order')
      return
    }
    const newOrdersList = ordersList.filter((_, idx) => idx !== index)
    setOrdersList(newOrdersList)
    if (currentOrderIndex > index) {
      setCurrentOrderIndex(currentOrderIndex - 1)
    } else if (currentOrderIndex >= newOrdersList.length) {
      setCurrentOrderIndex(newOrdersList.length - 1)
    }
  }

  const updateOrderForm = (orderIdx: number, field: keyof OrderFormData, value: string) => {
    const newOrdersList = [...ordersList]
    newOrdersList[orderIdx].form = { ...newOrdersList[orderIdx].form, [field]: value }
    setOrdersList(newOrdersList)
  }

  const handleAddOrder = async () => {
    // Validate all orders
    for (let i = 0; i < ordersList.length; i++) {
      const order = ordersList[i]
      if (!order.form.customer_name || !order.form.customer_email) {
        toast.error(`Order ${i + 1}: Please fill in customer name and email`)
        setCurrentOrderIndex(i)
        return
      }
      if (order.items.length === 0) {
        toast.error(`Order ${i + 1}: Please add at least one product`)
        setCurrentOrderIndex(i)
        return
      }
    }

    try {
      setIsSaving(true)
      let successCount = 0

      // Create all orders
      for (let i = 0; i < ordersList.length; i++) {
        const order = ordersList[i]
        const total = calculateOrderTotal(i)

        const orderData = {
          customer_name: order.form.customer_name,
          customer_email: order.form.customer_email,
          customer_phone: order.form.customer_phone || null,
          status: 'pending',
          total,
          notes: order.form.notes || null,
        }

        const createdOrder = await ordersAPI.create(orderData)

        // Create order items
        for (const item of order.items) {
          await supabase.from('order_items').insert({
            order_id: createdOrder.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
          })
        }
        successCount++
      }

      toast.success(`${successCount} order(s) created successfully`)
      setAddOrderDialogOpen(false)
      setOrdersList([])
      setCurrentOrderIndex(0)
      await loadOrders()
    } catch (error) {
      console.error('Failed to create order:', error)
      toast.error('Failed to create orders')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true
    return (
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const currentOrder = ordersList[currentOrderIndex]
  const currentOrderItems = currentOrder?.items ?? []
  const currentOrderTotal = currentOrder ? calculateOrderTotal(currentOrderIndex) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => {
              initializeOrderForm()
              setAddOrderDialogOpen(true)
            }}
            className="gap-2 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600"
          >
            <Plus className="h-4 w-4" />
            Add Orders
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: 'Total Orders', value: pagination.total.toString(), color: 'text-blue-600' },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length.toString(), color: 'text-yellow-600' },
          { label: 'Processing', value: orders.filter(o => o.status === 'processing').length.toString(), color: 'text-blue-600' },
          { label: 'Completed', value: orders.filter(o => o.status === 'completed').length.toString(), color: 'text-lime-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>All Orders</CardTitle>
                <CardDescription className="mt-1">{pagination.total} orders found</CardDescription>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden lg:table-cell">Products</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <p className="text-muted-foreground">No orders found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium font-mono text-xs">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="max-w-[200px]">
                              {order.order_items?.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="text-sm">
                                  {item.product_name} <span className="text-muted-foreground">(x{item.quantity})</span>
                                </div>
                              ))}
                              {order.order_items && order.order_items.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{order.order_items.length - 2} more
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                          <TableCell>
                            <Badge className={statusConfig[order.status].color}>
                              {statusConfig[order.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    Order Details
                                    <Badge variant="outline" className="font-mono text-xs">
                                      #{order.id.slice(0, 8)}
                                    </Badge>
                                  </DialogTitle>
                                  <DialogDescription>
                                    Order placed on {formatDate(order.created_at)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 mt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-semibold">Customer Information</Label>
                                      <div className="mt-2 space-y-1">
                                        <p className="text-sm font-medium">{order.customer_name}</p>
                                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                                        {order.customer_phone && (
                                          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-semibold">Order Status</Label>
                                      <div className="mt-2">
                                        <Badge className={statusConfig[order.status].color}>
                                          {statusConfig[order.status].label}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-semibold">Products</Label>
                                    <div className="mt-2 space-y-2">
                                      {order.order_items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                                          <div>
                                            <p className="text-sm font-medium">{item.product_name}</p>
                                            <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                                          </div>
                                          <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between p-4 bg-lime-50 rounded-lg border border-lime-200">
                                    <Label className="text-sm font-semibold">Total Amount</Label>
                                    <p className="text-2xl font-bold text-lime-700">{formatCurrency(order.total)}</p>
                                  </div>
                                  
                                  {order.notes && (
                                    <div>
                                      <Label className="text-sm font-semibold">Notes</Label>
                                      <p className="mt-2 text-sm p-3 bg-muted rounded-lg">{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Order Dialog */}
      <Dialog
        open={addOrderDialogOpen}
        onOpenChange={(open) => {
          setAddOrderDialogOpen(open)
          if (!open) {
            setSelectedProductId('')
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <DialogTitle>Add Multiple Orders</DialogTitle>
                <DialogDescription>
                  Tambahkan beberapa pesanan, lalu isi detail pada card pesanan yang aktif.
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addNewOrder}
                className="gap-2 self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                Tambah Pesanan
              </Button>
            </div>
          </DialogHeader>
          <div className="px-6 py-4 flex-1 overflow-hidden">
            <div className="h-full flex flex-col gap-4">
              {/* Scrollable Order Cards */}
              <div className="flex gap-3 overflow-x-auto overscroll-x-contain pb-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#84cc16 #f3f4f6' }}>
                {ordersList.map((order, index) => (
                  <Card
                    key={`order-card-${index}`}
                    className={`relative flex-shrink-0 w-[240px] cursor-pointer border-2 transition-all ${
                      index === currentOrderIndex
                        ? 'border-lime-500 bg-lime-50 shadow-md'
                        : 'border-border hover:border-lime-300 hover:shadow-sm'
                    }`}
                    onClick={() => setCurrentOrderIndex(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-muted-foreground">Order #{index + 1}</p>
                        {ordersList.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={(event) => {
                              event.stopPropagation()
                              removeOrder(index)
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold truncate">
                        {order.form.customer_name || 'No customer name'}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{order.items.length} {order.items.length === 1 ? 'product' : 'products'}</p>
                        <p className="text-sm font-bold text-lime-700">
                          {formatCurrency(calculateOrderTotal(index))}
                        </p>
                      </div>
                      {index === currentOrderIndex && (
                        <div className="mt-2 h-0.5 w-full bg-lime-500 rounded-full" />
                      )}
                    </CardContent>
                  </Card>
                ))}
                {/* Add New Order Card */}
                <Card
                  className="relative flex-shrink-0 w-[240px] cursor-pointer border-2 border-dashed border-muted-foreground/25 hover:border-lime-400 transition-colors"
                  onClick={addNewOrder}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[120px]">
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-muted-foreground">Add New Order</p>
                  </CardContent>
                </Card>
              </div>

              {currentOrder ? (
                <div className="flex-1 overflow-y-auto scroll-smooth pr-1 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`customer-name-${currentOrderIndex}`}>Customer Name *</Label>
                        <Input
                          id={`customer-name-${currentOrderIndex}`}
                          value={currentOrder.form.customer_name}
                          onChange={(e) => updateOrderForm(currentOrderIndex, 'customer_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`customer-email-${currentOrderIndex}`}>Email *</Label>
                        <Input
                          id={`customer-email-${currentOrderIndex}`}
                          type="email"
                          value={currentOrder.form.customer_email}
                          onChange={(e) => updateOrderForm(currentOrderIndex, 'customer_email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`customer-phone-${currentOrderIndex}`}>Phone</Label>
                        <Input
                          id={`customer-phone-${currentOrderIndex}`}
                          value={currentOrder.form.customer_phone}
                          onChange={(e) => updateOrderForm(currentOrderIndex, 'customer_phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Products</h3>

                    <div className="flex gap-2">
                      <Select
                        value={selectedProductId}
                        onValueChange={(value) => {
                          setSelectedProductId(value)
                          handleAddProductToOrder(currentOrderIndex, value)
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product to add..." />
                        </SelectTrigger>
                        <SelectContent position="popper" className="z-[100]">
                          {products
                            .filter((p) => p.is_active !== false && p.stock > 0)
                            .map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - Rp {product.price.toLocaleString('id-ID')}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentOrderItems.length > 0 ? (
                      <div className="space-y-2">
                        {currentOrderItems.map((item) => (
                          <div key={item.product_id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString('id-ID')} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Qty:</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateProductQuantity(
                                    currentOrderIndex,
                                    item.product_id,
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                                className="w-20 h-8"
                              />
                            </div>
                            <p className="text-sm font-semibold w-24 text-right">
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveProductFromOrder(currentOrderIndex, item.product_id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Belum ada produk untuk pesanan ini.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-lime-50 rounded-lg border border-lime-200">
                    <Label className="text-sm font-semibold">Total Amount</Label>
                    <p className="text-2xl font-bold text-lime-700">{formatCurrency(currentOrderTotal)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`order-notes-${currentOrderIndex}`}>Notes (Optional)</Label>
                    <textarea
                      id={`order-notes-${currentOrderIndex}`}
                      value={currentOrder.form.notes}
                      onChange={(e) => updateOrderForm(currentOrderIndex, 'notes', e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  Belum ada pesanan. Klik &quot;Tambah Pesanan&quot; untuk mulai.
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 flex-shrink-0 border-t">
            <Button variant="outline" onClick={() => setAddOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddOrder}
              disabled={isSaving}
              className="bg-gradient-to-r from-lime-500 to-green-500"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${ordersList.length} Order${ordersList.length > 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
