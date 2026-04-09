'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Search, Mail, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

export default function CustomersPage() {
  const customers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+62 812-3456-7890', orders: 15, totalSpent: 'Rp 2.500.000' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+62 813-4567-8901', orders: 12, totalSpent: 'Rp 1.800.000' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+62 814-5678-9012', orders: 8, totalSpent: 'Rp 1.200.000' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '+62 815-6789-0123', orders: 20, totalSpent: 'Rp 3.200.000' },
    { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', phone: '+62 816-7890-1234', orders: 5, totalSpent: 'Rp 800.000' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer information</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: 'Total Customers', value: '5', color: 'text-purple-600' },
          { label: 'Active This Month', value: '4', color: 'text-green-600' },
          { label: 'Total Orders', value: '60', color: 'text-blue-600' },
          { label: 'Total Revenue', value: 'Rp 9.5M', color: 'text-lime-600' },
        ].map((stat, i) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Customers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>Customer Directory</CardTitle>
                <CardDescription className="mt-1">View and manage customer data</CardDescription>
              </div>
              
              {/* Search */}
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-10 h-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {customers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-white font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-base">{customer.name}</h3>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Orders</p>
                            <p className="text-lg font-bold">{customer.orders}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Total Spent</p>
                            <p className="text-lg font-bold text-lime-600">{customer.totalSpent}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
