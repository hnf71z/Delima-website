'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { analyticsAPI } from '@/lib/api'

interface Metrics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  monthlyRevenue: number
  lastMonthRevenue: number
  growthRate: string
}

const chartColors = {
  lime: '#84cc16',
  limeLight: '#a3e635',
  cyan: '#06b6d4',
  cyanLight: '#22d3ee',
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [salesData, setSalesData] = useState<any[]>([])
  const [productDistribution, setProductDistribution] = useState<any[]>([])
  const [revenueByProduct, setRevenueByProduct] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, salesData, distributionData, revenueData] =
          await Promise.all([
            analyticsAPI.getMetrics(),
            analyticsAPI.getSalesChart(),
            analyticsAPI.getProductDistribution(),
            analyticsAPI.getRevenueByProduct(),
          ])

        setMetrics(metricsData)
        setSalesData(salesData)
        setProductDistribution(distributionData)
        setRevenueByProduct(revenueData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-lime-600 mx-auto" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-2 border-t-lime-500 border-r-transparent border-b-lime-300 border-l-transparent rounded-full"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const metricsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics?.totalRevenue || 0),
      change: `+${metrics?.growthRate || 0}%`,
      isPositive: true,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      title: 'Total Orders',
      value: (metrics?.totalOrders || 0).toLocaleString('id-ID'),
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      title: 'Total Customers',
      value: (metrics?.totalCustomers || 0).toLocaleString('id-ID'),
      change: '+15.3%',
      isPositive: true,
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      title: 'Growth Rate',
      value: `${metrics?.growthRate || 0}%`,
      change: '+5.1%',
      isPositive: true,
      icon: TrendingUp,
      gradient: 'from-lime-500 to-green-600',
      bgGradient: 'from-lime-50 to-green-50',
    },
  ]

  const salesChartConfig = {
    sales: {
      label: 'Revenue',
      color: chartColors.lime,
    },
    orders: {
      label: 'Orders',
      color: chartColors.cyan,
    },
  }

  const revenueChartConfig = {
    dimsum: {
      label: 'Dimsum',
      color: chartColors.lime,
    },
    infusWater: {
      label: 'Infus Water',
      color: chartColors.cyan,
    },
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header - Mobile Only */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:hidden"
      >
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's what's happening with your business.</p>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {metricsCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50/50 overflow-hidden relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4 lg:p-6">
                <CardTitle className="text-xs lg:text-sm font-medium truncate text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 lg:p-2.5 rounded-xl bg-gradient-to-br ${metric.bgGradient}`}>
                  <metric.icon className={`h-4 w-4 lg:h-5 lg:w-5 bg-gradient-to-br ${metric.gradient} bg-clip-text`} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
                <div className="text-lg lg:text-3xl font-bold mb-2">{metric.value}</div>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 bg-lime-100 text-lime-700 border-0 font-medium"
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {metric.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Sales Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-1 lg:col-span-2"
        >
          <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow bg-white">
            <CardHeader className="p-4 lg:p-6 pb-4 lg:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg lg:text-xl">Sales Overview</CardTitle>
                  <CardDescription className="text-xs lg:text-sm mt-1">Monthly revenue and orders performance for 2026</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1 text-lime-600" />
                  +12.5%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <ChartContainer config={salesChartConfig} className="h-[200px] lg:h-[320px] w-full">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.lime} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.lime} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.cyan} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) =>
                      value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke={chartColors.lime}
                    strokeWidth={3}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke={chartColors.cyan}
                    strokeWidth={3}
                    fill="url(#colorOrders)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow bg-white h-full">
            <CardHeader className="p-4 lg:p-6 pb-4 lg:pb-6">
              <CardTitle className="text-lg lg:text-xl">Product Distribution</CardTitle>
              <CardDescription className="text-xs lg:text-sm mt-1">Sales breakdown by product category</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <ChartContainer config={salesChartConfig} className="h-[220px] lg:h-[300px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={productDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={60}
                    strokeWidth={3}
                    stroke="transparent"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {productDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? chartColors.lime : chartColors.cyan}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue by Product */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow bg-white h-full">
            <CardHeader className="p-4 lg:p-6 pb-4 lg:pb-6">
              <CardTitle className="text-lg lg:text-xl">Revenue by Product</CardTitle>
              <CardDescription className="text-xs lg:text-sm mt-1">Monthly revenue comparison</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <ChartContainer config={revenueChartConfig} className="h-[220px] lg:h-[300px] w-full">
                <BarChart data={revenueByProduct}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) =>
                      value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="dimsum"
                    fill={chartColors.lime}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="infusWater"
                    fill={chartColors.cyan}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
