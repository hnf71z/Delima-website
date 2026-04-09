'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, Search, Filter, Edit, Trash2, Loader2, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { productsAPI } from '@/lib/api'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    is_active: true,
  })
  const [addForm, setAddForm] = useState({
    name: '',
    category: 'dimsum',
    price: '',
    stock: '',
    is_active: true,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const { products: data } = await productsAPI.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
      toast.error('Failed to load products from database')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      is_active: product.is_active ?? true,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedProduct) return

    try {
      setIsSaving(true)
      await productsAPI.update(selectedProduct.id, {
        name: editForm.name,
        category: editForm.category,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock),
        is_active: editForm.is_active,
      })
      toast.success('Product updated successfully')
      setEditDialogOpen(false)
      await loadProducts()
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error('Failed to update product')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return

    try {
      setIsDeleting(true)
      await productsAPI.delete(selectedProduct.id)
      toast.success('Product deleted successfully')
      setDeleteDialogOpen(false)
      await loadProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddProduct = async () => {
    if (!addForm.name || !addForm.price || !addForm.stock) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)
      await productsAPI.create({
        name: addForm.name,
        category: addForm.category,
        price: parseFloat(addForm.price),
        stock: parseInt(addForm.stock),
        is_active: addForm.is_active,
      })
      toast.success('Product added successfully')
      setAddDialogOpen(false)
      setAddForm({
        name: '',
        category: 'dimsum',
        price: '',
        stock: '',
        is_active: true,
      })
      await loadProducts()
    } catch (error) {
      console.error('Failed to add product:', error)
      toast.error('Failed to add product')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: products.length,
    available: products.filter(p => p.is_active !== false && p.stock > 0).length,
    outOfStock: products.filter(p => p.is_active === false || p.stock === 0).length,
    categories: new Set(products.map(p => p.category)).size,
  }

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()

      // Title
      doc.setFontSize(20)
      doc.setTextColor(34, 197, 94)
      doc.text("De'Lima - Product Catalog", 14, 20)

      // Subtitle
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on ${new Date().toLocaleDateString('id-ID')}`, 14, 28)

      // Stats
      doc.setFontSize(10)
      doc.text(`Total Products: ${stats.total} | Available: ${stats.available} | Out of Stock: ${stats.outOfStock}`, 14, 36)

      // Table
      const tableData = products.map(p => [
        p.name,
        p.category,
        `Rp ${p.price.toLocaleString('id-ID')}`,
        p.stock.toString(),
        p.is_active === false || p.stock === 0 ? 'Out of Stock' : 'Available'
      ])

      ;(doc as any).autoTable({
        startY: 42,
        head: [['Product Name', 'Category', 'Price', 'Stock', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [132, 204, 22],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 35, halign: 'center' }
        }
      })

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Page ${i} of ${pageCount}`,
          (doc as any).internal.pageSize.width / 2,
          (doc as any).internal.pageSize.height - 10,
          { align: 'center' }
        )
      }

      doc.save('delima-product-catalog.pdf')
      toast.success('PDF exported successfully')
    } catch (error) {
      console.error('Failed to export PDF:', error)
      toast.error('Failed to export PDF')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="gap-2 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600"
          >
            <Plus className="h-4 w-4" />
            Add Product
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
          { label: 'Total Products', value: stats.total.toString(), color: 'text-lime-600' },
          { label: 'Available', value: stats.available.toString(), color: 'text-green-600' },
          { label: 'Out of Stock', value: stats.outOfStock.toString(), color: 'text-red-600' },
          { label: 'Categories', value: stats.categories.toString(), color: 'text-blue-600' },
        ].map((stat, i) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription className="mt-1">View and manage Dimsum and Infus Water products</CardDescription>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
                <p className="ml-3 text-sm text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base">{product.name}</h3>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={product.is_active !== false && product.stock > 0 ? 'bg-lime-100 text-lime-700 border-lime-200' : 'bg-red-100 text-red-700 border-red-200'}
                            >
                              {product.is_active === false || product.stock === 0 ? 'Out of Stock' : 'Available'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Price</span>
                              <span className="font-semibold">Rp {product.price.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Stock</span>
                              <span className="font-semibold">{product.stock} units</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the product information below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Product Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Dimsum Ayam"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-category">Category *</Label>
              <select
                id="add-category"
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="dimsum">Dimsum</option>
                <option value="minuman">Infus Water</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-price">Price (Rp) *</Label>
                <Input
                  id="add-price"
                  type="number"
                  value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                  placeholder="25000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-stock">Stock *</Label>
                <Input
                  id="add-stock"
                  type="number"
                  value={addForm.stock}
                  onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="add-active"
                checked={addForm.is_active}
                onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="add-active" className="text-sm">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={isSaving}
              className="bg-gradient-to-r from-lime-500 to-green-500"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (Rp)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-active" className="text-sm">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-gradient-to-r from-lime-500 to-green-500"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedProduct?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
