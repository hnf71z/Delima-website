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
  totalProfit?: number
  totalProductsSold?: number
  averageMargin?: number
}

interface WeeklyProductData {
  name: string
  quantity: number
  price: number
  revenue: number
}

interface WeeklyRevenueData {
  id: string
  week: string
  revenue: number
  hpp: number
  netProfit: number
  marginPercentage: number
  customers: number
  productsSold: number
  orders: number
  percentage: number
  products: WeeklyProductData[]
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
  const [weeklyRevenueData, setWeeklyRevenueData] = useState<WeeklyRevenueData[]>([])
  const [productDistribution, setProductDistribution] = useState<Record<string, unknown>[]>([])
  const [revenueByProduct, setRevenueByProduct] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [
          metricsData,
          weeklyRevenueTrend,
          distributionData,
          revenueData,
        ] = await Promise.all([
          analyticsAPI.getMetrics(),
          analyticsAPI.getWeeklyRevenueTrend(),
          analyticsAPI.getProductDistribution(),
          analyticsAPI.getRevenueByProduct(),
        ])

        setMetrics(metricsData)
        setWeeklyRevenueData(weeklyRevenueTrend)
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

  const formatCompactCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }

  const renderTooltipRow = (value: any, name: any, item: any, pct?: number, isCurrency = true) => (
    <div className="flex w-full items-center justify-between gap-8">
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
        <span className="text-muted-foreground">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono font-medium text-foreground">{isCurrency ? formatCurrency(value as number) : value.toLocaleString()}</span>
        {pct !== undefined && pct !== 0 && (
          <span className={pct > 0 ? "text-emerald-500 text-[10px] font-bold" : "text-red-500 text-[10px] font-bold"}>
            {pct > 0 ? '+' : ''}{pct}%
          </span>
        )}
      </div>
    </div>
  )

  // Totals across all weeks
  const totalRevenue = weeklyRevenueData.reduce((sum, w) => sum + w.revenue, 0)
  const totalHpp = weeklyRevenueData.reduce((sum, w) => sum + w.hpp, 0)
  const totalNetProfit = weeklyRevenueData.reduce((sum, w) => sum + w.netProfit, 0)
  const totalProductsSold = weeklyRevenueData.reduce((sum, w) => sum + w.productsSold, 0)
  const avgMargin = weeklyRevenueData.length > 0
    ? (weeklyRevenueData.reduce((sum, w) => sum + w.marginPercentage, 0) / weeklyRevenueData.length).toFixed(1)
    : '0'

  const bestWeek = weeklyRevenueData.length > 0
    ? [...weeklyRevenueData].sort((a, b) => b.revenue - a.revenue)[0]
    : null

  const metricsCards = [
    {
      title: 'Total Omzet',
      value: formatCurrency(metrics?.totalRevenue || 0),
      change: `${metrics?.growthRate || 0}%`,
      isPositive: Number(metrics?.growthRate || 0) >= 0,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      title: 'Laba Bersih',
      value: formatCurrency(metrics?.totalProfit || 0),
      change: `${metrics?.averageMargin || 0}% margin`,
      isPositive: true,
      icon: TrendingUp,
      gradient: 'from-lime-500 to-green-600',
      bgGradient: 'from-lime-50 to-green-50',
    },
    {
      title: 'Total Customers',
      value: (metrics?.totalCustomers || 0).toLocaleString('id-ID'),
      change: 'customers',
      isPositive: true,
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      title: 'Produk Terjual',
      value: (metrics?.totalProductsSold || metrics?.totalOrders || 0).toLocaleString('id-ID'),
      change: 'produk',
      isPositive: true,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
  ]

  const weeklyRevenueChartConfig = {
    revenue: {
      label: 'Omzet',
      color: chartColors.lime,
    },
  }

  const profitChartConfig = {
    hpp: {
      label: 'HPP',
      color: chartColors.cyan,
    },
    netProfit: {
      label: 'Laba Bersih',
      color: chartColors.lime,
    },
  }

  const revenueChartConfig = {
    revenue: {
      label: 'Revenue Produk',
      color: chartColors.lime,
    },
  }

  const bestSeller = productDistribution.length > 0 
    ? productDistribution.reduce((max, p) => (p.value as number) > (max.value as number) ? p : max, productDistribution[0]) as { name: string, value: number }
    : { name: '-', value: 0 }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header - Mobile Only */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:hidden"
      >
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
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

      {/* Weekly sales report — Line Charts showing all weeks */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="h-full border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="p-5 pb-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Omzet Penjualan</CardTitle>
                  <CardDescription className="text-xs mt-1">Perkembangan omzet 4 minggu terakhir</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1 text-lime-600" />
                  {weeklyRevenueData.length} Minggu
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <ChartContainer config={weeklyRevenueChartConfig} className="h-[190px] lg:h-[240px] w-full">
                <AreaChart data={weeklyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.lime} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.lime} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                  <XAxis
                    dataKey="week"
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => formatCompactCurrency(value)}
                  />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item, index, payload) => 
                    renderTooltipRow(value, name, item, payload.percentage)
                  } />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={chartColors.lime}
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ChartContainer>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="rounded-xl bg-lime-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-lime-700/70">Total Omzet</p>
                  <p className="mt-0.5 text-sm font-bold text-lime-800">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-muted-foreground">Terjual</p>
                  <p className="mt-0.5 text-sm font-bold text-foreground">{totalProductsSold} produk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="h-full border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="p-5 pb-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">HPP & Laba Bersih</CardTitle>
                  <CardDescription className="text-xs mt-1">Perbandingan biaya dan profit 4 minggu</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs whitespace-nowrap bg-lime-100 text-lime-700 border-0">
                  {avgMargin}% avg margin
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <ChartContainer config={profitChartConfig} className="h-[190px] lg:h-[240px] w-full">
                <AreaChart data={weeklyRevenueData}>
                  <defs>
                    <linearGradient id="colorHpp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.cyan} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.cyan} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.lime} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.lime} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                  <XAxis
                    dataKey="week"
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => formatCompactCurrency(value)}
                  />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item, index, payload) => {
                    const isHpp = name === profitChartConfig.hpp.label || item.dataKey === 'hpp'
                    const pct = isHpp ? payload.percentageHpp : payload.percentageNetProfit
                    return renderTooltipRow(value, name, item, pct)
                  }} />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="hpp"
                    stroke={chartColors.cyan}
                    strokeWidth={3}
                    fill="url(#colorHpp)"
                  />
                  <Area
                    type="monotone"
                    dataKey="netProfit"
                    stroke={chartColors.lime}
                    strokeWidth={3}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ChartContainer>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="rounded-xl bg-cyan-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-cyan-700/70">Total HPP</p>
                  <p className="mt-0.5 text-sm font-bold text-cyan-800">{formatCurrency(totalHpp)}</p>
                </div>
                <div className="rounded-xl bg-lime-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-lime-700/70">Total Laba Bersih</p>
                  <p className="mt-0.5 text-sm font-bold text-lime-800">{formatCurrency(totalNetProfit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">


        {/* Product Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow bg-white h-full">
            <CardHeader className="p-4 lg:p-6 pb-4 lg:pb-6">
              <CardTitle className="text-lg lg:text-xl">Distribusi Produk Terjual</CardTitle>
              <CardDescription className="text-xs lg:text-sm mt-1">Jumlah produk terjual dari weekly_product_sales</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <ChartContainer 
                config={productDistribution.reduce((acc, item, index) => {
                  const colors = ['#84cc16', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f97316', '#14b8a6']
                  acc[item.name as string] = {
                    label: item.name as string,
                    color: colors[index % colors.length]
                  }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)} 
                className="h-[220px] lg:h-[300px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend 
                    className="flex-wrap gap-2 text-xs" 
                    content={<ChartLegendContent />} 
                  />
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
                    label={({ percent }) =>
                      percent > 0.02 ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {productDistribution.map((item, index) => {
                      const colors = ['#84cc16', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f97316', '#14b8a6']
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      )
                    })}
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
              <CardDescription className="text-xs lg:text-sm mt-1">Total revenue per produk 4 minggu terakhir</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <ChartContainer config={revenueChartConfig} className="h-[220px] lg:h-[300px] w-full">
                <BarChart data={revenueByProduct}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                  <XAxis
                    dataKey="product"
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) =>
                      value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="revenue"
                    radius={[6, 6, 0, 0]}
                  >
                    {revenueByProduct.map((entry, index) => {
                      const colors = ['#84cc16', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f97316', '#14b8a6']
                      return (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 lg:mt-6"
      >
        <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow bg-white">
          <CardHeader className="p-4 lg:p-6 pb-4">
            <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-lime-600" />
              Ringkasan Eksekutif
            </CardTitle>
            <CardDescription className="text-xs lg:text-sm mt-1">Kesimpulan dari performa penjualan berdasarkan data terbaru</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="bg-lime-50/50 rounded-xl p-4 lg:p-6 border border-lime-100">
              <ul className="space-y-3 text-sm lg:text-base text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>Total Omzet penjualan mencapai <strong className="text-gray-900">{formatCurrency(metrics?.totalRevenue || 0)}</strong> dengan Laba Bersih sebesar <strong className="text-gray-900">{formatCurrency(metrics?.totalProfit || 0)}</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>Produk terlaris adalah <strong className="text-gray-900">{bestSeller.name}</strong> dengan total penjualan sebanyak <strong className="text-gray-900">{bestSeller.value} porsi</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>Secara keseluruhan, margin rata-rata yang didapatkan adalah sebesar <strong className="text-gray-900">{metrics?.averageMargin || 0}%</strong> dari total <strong className="text-gray-900">{metrics?.totalProductsSold || 0} produk</strong> yang terjual ke {metrics?.totalCustomers || 0} pelanggan.</span>
                </li>
                {bestWeek && (
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold mt-0.5">•</span>
                    <span>Performa paling maksimal terjadi pada <strong className="text-gray-900">{bestWeek.week}</strong> dengan pencapaian omzet tertinggi sebesar <strong className="text-gray-900">{formatCurrency(bestWeek.revenue)}</strong>.</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
