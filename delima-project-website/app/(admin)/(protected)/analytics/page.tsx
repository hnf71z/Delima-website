'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AnalyticsPage() {
  const metrics = [
    {
      title: 'Average Order Value',
      value: 'Rp 158.000',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '+0.8%',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: 'Customer Retention',
      value: '68%',
      change: '+5.3%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Return Rate',
      value: '2.1%',
      change: '-0.5%',
      isPositive: true,
      icon: ShoppingCart,
    },
  ]

  const topProducts = [
    { name: 'Dimsum Ayam', sales: 450, revenue: 'Rp 11.250.000', growth: '+15%' },
    { name: 'Infus Water Lemon', sales: 380, revenue: 'Rp 5.700.000', growth: '+22%' },
    { name: 'Dimsum Udang', sales: 320, revenue: 'Rp 9.600.000', growth: '+8%' },
    { name: 'Infus Water Mint', sales: 290, revenue: 'Rp 4.350.000', growth: '+18%' },
    { name: 'Dimsum Babi', sales: 250, revenue: 'Rp 7.000.000', growth: '+5%' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Detailed business analytics and insights</p>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric, index) => (
          <Card key={metric.title} className="border-0 shadow-sm">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-accent rounded-lg">
                  <metric.icon className="h-4 w-4 text-lime-600" />
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 ${
                    metric.isPositive 
                      ? 'bg-lime-100 text-lime-700 border-0' 
                      : 'bg-red-100 text-red-700 border-0'
                  }`}
                >
                  {metric.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{metric.title}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle>Top Products by Sales</CardTitle>
            <CardDescription className="mt-1">Best performing products this month</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {topProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.revenue}</p>
                    <Badge className="bg-lime-100 text-lime-700 border-0 text-xs">
                      {product.growth}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle>Sales Trends</CardTitle>
            <CardDescription className="mt-1">Key insights from sales data</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="space-y-3">
              <div className="p-3 bg-lime-50 rounded-lg border border-lime-200">
                <p className="text-sm font-medium text-lime-800">Peak Hours</p>
                <p className="text-xs text-lime-700 mt-1">Most orders occur between 11 AM - 2 PM</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Popular Day</p>
                <p className="text-xs text-blue-700 mt-1">Friday has the highest order volume</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-800">Growth Trend</p>
                <p className="text-xs text-purple-700 mt-1">15% increase compared to last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription className="mt-1">Customer behavior analytics</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Repeat Customers</p>
                <p className="text-xs text-green-700 mt-1">68% of customers make repeat purchases</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">Average Order</p>
                <p className="text-xs text-orange-700 mt-1">Customers order 2.3 items per transaction</p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <p className="text-sm font-medium text-cyan-800">New Customers</p>
                <p className="text-xs text-cyan-700 mt-1">25 new customers acquired this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
