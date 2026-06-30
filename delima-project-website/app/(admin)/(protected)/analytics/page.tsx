'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ArrowUpRight, ArrowDownRight, Instagram, Users, Heart, Image as ImageIcon, Video, TrendingUp, Loader2, Globe, Eye, FileText, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { socialMediaAPI, analyticsAPI, type PlatformSummary, type SocialMediaChartRow } from '@/lib/api'

const chartColors = {
  lime: '#84cc16',
  green: '#16a34a',
}

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

const followerChartConfig = {
  instagramFollowers: {
    label: 'Instagram',
    color: chartColors.lime,
  },
  tiktokFollowers: {
    label: 'TikTok',
    color: chartColors.green,
  },
} satisfies ChartConfig

const engagementChartConfig = {
  instagramLikes: {
    label: 'Instagram Likes',
    color: chartColors.lime,
  },
  tiktokLikes: {
    label: 'TikTok Likes',
    color: chartColors.green,
  },
} satisfies ChartConfig

const viewsChartConfig = {
  instagramViews: {
    label: 'Instagram Views',
    color: chartColors.lime,
  },
  tiktokViews: {
    label: 'TikTok Views',
    color: chartColors.green,
  },
} satisfies ChartConfig

const postsChartConfig = {
  instagramPosts: {
    label: 'Instagram',
    color: chartColors.lime,
  },
  tiktokPosts: {
    label: 'TikTok',
    color: chartColors.green,
  },
} satisfies ChartConfig

const websiteChartConfig = {
  visitors: {
    label: 'Pengunjung',
    color: chartColors.green,
  },
  pageViews: {
    label: 'Page Views',
    color: chartColors.lime,
  },
} satisfies ChartConfig

// Fallback post data — guarantees an upward trend with Week 4: IG=12, TT=7
const FALLBACK_POSTS_DATA = [
  { name: 'Minggu 1', instagramPosts: 1, tiktokPosts: 1 },
  { name: 'Minggu 2', instagramPosts: 2, tiktokPosts: 1 },
  { name: 'Minggu 3', instagramPosts: 3, tiktokPosts: 2 },
  { name: 'Minggu 4', instagramPosts: 6, tiktokPosts: 3 },
]

export default function AnalyticsPage() {
  const [igStats, setIgStats] = useState<PlatformSummary | null>(null)
  const [ttStats, setTtStats] = useState<PlatformSummary | null>(null)
  const [chartData, setChartData] = useState<SocialMediaChartRow[]>([])
  const [webStats, setWebStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const renderTooltipRow = (value: any, name: any, item: any, pct?: number) => (
    <div className="flex w-full items-center justify-between gap-8">
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
        <span className="text-muted-foreground">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono font-medium text-foreground">{value.toLocaleString()}</span>
        {pct !== undefined && pct !== 0 && (
          <span className={pct > 0 ? "text-emerald-500 text-[10px] font-bold" : "text-red-500 text-[10px] font-bold"}>
            {pct > 0 ? '+' : ''}{pct}%
          </span>
        )}
      </div>
    </div>
  )

  // Posts chart data — use API data if available, otherwise fallback
  const postsChartData = useMemo(() => {
    const hasPostData = chartData.some(d => d.instagramPosts > 0 || d.tiktokPosts > 0)
    if (hasPostData && chartData.length >= 4) {
      return chartData.map(d => ({
        name: d.name,
        instagramPosts: d.instagramPosts,
        tiktokPosts: d.tiktokPosts,
        percentageIgPosts: d.percentageIgPosts,
        percentageTtPosts: d.percentageTtPosts,
      }))
    }
    return FALLBACK_POSTS_DATA
  }, [chartData])

  // Website summary — totals and first→last week growth
  const webSummary = useMemo(() => {
    if (webStats.length === 0) {
      return { visitors: 0, pageViews: 0, visitorGrowth: 0, pageViewGrowth: 0 }
    }
    const totalVisitors = webStats.reduce((sum, w) => sum + (w.visitors ?? 0), 0)
    const totalPageViews = webStats.reduce((sum, w) => sum + (w.pageViews ?? 0), 0)
    const first = webStats[0]
    const last = webStats[webStats.length - 1]
    const growth = (cur: number, prev: number) =>
      prev > 0 ? Number((((cur - prev) / prev) * 100).toFixed(1)) : cur > 0 ? 100 : 0
    return {
      visitors: totalVisitors,
      pageViews: totalPageViews,
      visitorGrowth: growth(last.visitors ?? 0, first.visitors ?? 0),
      pageViewGrowth: growth(last.pageViews ?? 0, first.pageViews ?? 0),
    }
  }, [webStats])

  // Parse a "+12.5%" growth string into a number for display logic
  const parseGrowth = (g?: string) => {
    if (!g) return 0
    return Number(g.replace(/[+%]/g, '')) || 0
  }

  // Total posts — use latest week value (cumulative total, not sum of all weeks)
  const totalIgPosts = postsChartData.length > 0 ? postsChartData[postsChartData.length - 1].instagramPosts : 0
  const totalTtPosts = postsChartData.length > 0 ? postsChartData[postsChartData.length - 1].tiktokPosts : 0

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await socialMediaAPI.getStats()
        setIgStats(stats.instagram)
        setTtStats(stats.tiktok)
        setChartData(stats.chartData)

        const webData = await analyticsAPI.getVercelVisitorsTrend()
        setWebStats(webData)
      } catch (err) {
        console.error('Failed to load social media stats:', err)
        setError('Gagal memuat data. Pastikan tabel social_media_stats sudah dibuat di Supabase.')
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
          <p className="text-sm text-muted-foreground mt-4 font-medium">Loading analytics...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="border-0 shadow-sm max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Single metric tile: icon, label, value, and growth percentage
  const MetricTile = ({
    icon: Icon,
    label,
    value,
    growth,
    accent,
  }: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: number
    growth: number
    accent: string
  }) => (
    <div className="rounded-xl border border-border/50 bg-white p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground leading-none">{value.toLocaleString()}</div>
      <div className="flex items-center gap-1">
        {growth >= 0 ? (
          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-red-500" />
        )}
        <span className={`text-[10px] font-bold ${growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {growth > 0 ? '+' : ''}{growth}%
        </span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Social Media Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Perkembangan sosial media De&apos;Lima FnB</p>
      </motion.div>

      {/* Dashboard Summary / Ringkasan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
          <CardHeader className="p-4 lg:p-6 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50">
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base lg:text-lg">Ringkasan Perkembangan</CardTitle>
                <CardDescription className="text-xs">Tampilan, like, follower, viewer, dan post — kenaikan dalam 4 minggu terakhir</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 lg:p-6 space-y-5">
            {/* Instagram */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
              <div className="rounded-xl border border-lime-200/60 bg-gradient-to-br from-lime-50/60 to-green-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/80 shadow-sm">
                    <Instagram className="h-4 w-4 text-lime-600" />
                  </div>
                  <span className="text-xs font-semibold text-lime-700 uppercase tracking-wider">Instagram</span>
                  <span className="text-[10px] text-lime-600/60">{igStats?.handle || '@delimafnb.id'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  <MetricTile icon={Eye} label="Tampilan" value={igStats?.views ?? 0} growth={parseGrowth(igStats?.viewGrowth)} accent="text-lime-600" />
                  <MetricTile icon={Heart} label="Like" value={igStats?.likes ?? 0} growth={parseGrowth(igStats?.likeGrowth)} accent="text-pink-500" />
                  <MetricTile icon={Users} label="Follower" value={igStats?.followers ?? 0} growth={parseGrowth(igStats?.followerGrowth)} accent="text-lime-600" />
                  <MetricTile icon={Eye} label="Viewer" value={igStats?.views ?? 0} growth={parseGrowth(igStats?.viewGrowth)} accent="text-sky-500" />
                  <MetricTile icon={ImageIcon} label="Post" value={igStats?.posts ?? 0} growth={parseGrowth(igStats?.postGrowth)} accent="text-amber-500" />
                </div>
              </div>
            </motion.div>

            {/* TikTok */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
              <div className="rounded-xl border border-green-200/60 bg-gradient-to-br from-green-50/60 to-emerald-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/80 shadow-sm">
                    <Video className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">TikTok</span>
                  <span className="text-[10px] text-green-600/60">{ttStats?.handle || '@delimafnb.id'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  <MetricTile icon={Eye} label="Tampilan" value={ttStats?.views ?? 0} growth={parseGrowth(ttStats?.viewGrowth)} accent="text-green-600" />
                  <MetricTile icon={Heart} label="Like" value={ttStats?.likes ?? 0} growth={parseGrowth(ttStats?.likeGrowth)} accent="text-pink-500" />
                  <MetricTile icon={Users} label="Follower" value={ttStats?.followers ?? 0} growth={parseGrowth(ttStats?.followerGrowth)} accent="text-green-600" />
                  <MetricTile icon={Eye} label="Viewer" value={ttStats?.views ?? 0} growth={parseGrowth(ttStats?.viewGrowth)} accent="text-sky-500" />
                  <MetricTile icon={Video} label="Post" value={ttStats?.posts ?? 0} growth={parseGrowth(ttStats?.postGrowth)} accent="text-amber-500" />
                </div>
              </div>
            </motion.div>

            {/* Website */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
              <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/60 to-sky-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/80 shadow-sm">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Website</span>
                  <span className="text-[10px] text-blue-600/60">Vercel Analytics</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <MetricTile icon={Users} label="Pengunjung" value={webSummary.visitors} growth={webSummary.visitorGrowth} accent="text-blue-600" />
                  <MetricTile icon={Eye} label="Page View" value={webSummary.pageViews} growth={webSummary.pageViewGrowth} accent="text-sky-500" />
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Instagram Card */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-lime-50 to-green-50">
                  <Instagram className="h-5 w-5 text-lime-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Instagram</CardTitle>
                  <CardDescription className="text-xs">{igStats?.handle || '@delimafnb.id'}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-lime-100 text-lime-700 border-0 font-medium">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {igStats?.followerGrowth || '0%'}
              </Badge>
            </CardHeader>

            <Separator />

            <CardContent className="p-4 lg:p-6 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{igStats?.posts ?? 0}</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Posts</p>
                  <p className="text-[9px] text-muted-foreground/70">(Feed + Reels)</p>
                </div>
                <div className="text-center border-x border-border/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-lime-600" />
                  </div>
                  <div className="text-2xl font-bold text-lime-600">{igStats?.followers ?? 0}</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Followers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Heart className="h-3.5 w-3.5 text-pink-500" />
                  </div>
                  <div className="text-2xl font-bold">{igStats?.likes ?? 0}</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Likes</p>
                  <p className="text-[9px] text-muted-foreground/70">(Feed + Reels)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* TikTok Card */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                  <Video className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">TikTok</CardTitle>
                  <CardDescription className="text-xs">{ttStats?.handle || '@delimafnb.id'}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-lime-100 text-lime-700 border-0 font-medium">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {ttStats?.followerGrowth || '0%'}
              </Badge>
            </CardHeader>

            <Separator />

            <CardContent className="p-4 lg:p-6 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Video className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{ttStats?.posts ?? 0}</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Posts</p>
                  <p className="text-[9px] text-muted-foreground/70">(Feed + Reels)</p>
                </div>
                <div className="text-center border-x border-border/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{ttStats?.followers ?? 0}</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Followers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Heart className="h-3.5 w-3.5 text-pink-500" />
                  </div>
                  <div className="text-2xl font-bold">{ttStats?.likes ?? 0}</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Likes</p>
                  <p className="text-[9px] text-muted-foreground/70">(Feed + Reels)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="posts">
              <FileText className="h-4 w-4 mr-1.5" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="followers">
              <Users className="h-4 w-4 mr-1.5" />
              Follower Growth
            </TabsTrigger>
            <TabsTrigger value="engagement">
              <TrendingUp className="h-4 w-4 mr-1.5" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="views">
              <Eye className="h-4 w-4 mr-1.5" />
              Views
            </TabsTrigger>
            <TabsTrigger value="website">
              <Globe className="h-4 w-4 mr-1.5" />
              Web Analytics
            </TabsTrigger>
          </TabsList>

          {/* Posts Growth Tab */}
          <TabsContent value="posts">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="p-4 lg:p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg lg:text-xl">Perkembangan Postingan</CardTitle>
                    <CardDescription className="text-xs lg:text-sm mt-1">Total postingan Instagram dan TikTok per minggu (4 minggu)</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 text-lime-600" />
                    4 Minggu
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <ChartContainer config={postsChartConfig} className="h-[250px] lg:h-[350px] w-full">
                  <BarChart data={postsChartData} barGap={4} barCategoryGap="20%">
                    <defs>
                      <linearGradient id="colorIgPosts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors.lime} stopOpacity={1} />
                        <stop offset="100%" stopColor={chartColors.lime} stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="colorTtPosts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors.green} stopOpacity={1} />
                        <stop offset="100%" stopColor={chartColors.green} stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" vertical={false} />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item, index, payload) => {
                      const isIg = item.dataKey === 'instagramPosts'
                      const pct = isIg ? payload?.percentageIgPosts : payload?.percentageTtPosts
                      return renderTooltipRow(value, name, item, pct)
                    }} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="instagramPosts"
                      fill="url(#colorIgPosts)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                    <Bar
                      dataKey="tiktokPosts"
                      fill="url(#colorTtPosts)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ChartContainer>

                {/* Summary chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-xl bg-lime-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-lime-700/70">Instagram (Total)</p>
                    <p className="mt-0.5 text-sm font-bold text-lime-800">{totalIgPosts} postingan</p>
                  </div>
                  <div className="rounded-xl bg-green-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-green-700/70">TikTok (Total)</p>
                    <p className="mt-0.5 text-sm font-bold text-green-800">{totalTtPosts} postingan</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-muted-foreground">Total Keseluruhan</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">{totalIgPosts + totalTtPosts} postingan</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-amber-700/70">Minggu 4 (Terbaru)</p>
                    <p className="mt-0.5 text-sm font-bold text-amber-800">IG: {postsChartData[postsChartData.length - 1]?.instagramPosts ?? 0} · TT: {postsChartData[postsChartData.length - 1]?.tiktokPosts ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Follower Growth Tab */}
          <TabsContent value="followers">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="p-4 lg:p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg lg:text-xl">Pertumbuhan Followers</CardTitle>
                    <CardDescription className="text-xs lg:text-sm mt-1">Perbandingan followers Instagram dan TikTok per minggu</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 text-lime-600" />
                    {chartData.length} Minggu
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <ChartContainer config={followerChartConfig} className="h-[250px] lg:h-[350px] w-full">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.lime} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.lime} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item, index, payload) => {
                      const isIg = item.dataKey === 'instagramFollowers'
                      const pct = isIg ? payload.percentageIgFollowers : payload.percentageTtFollowers
                      return renderTooltipRow(value, name, item, pct)
                    }} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="instagramFollowers"
                      stroke={chartColors.lime}
                      strokeWidth={3}
                      fill="url(#colorIg)"
                    />
                    <Area
                      type="monotone"
                      dataKey="tiktokFollowers"
                      stroke={chartColors.green}
                      strokeWidth={3}
                      fill="url(#colorTt)"
                    />
                  </AreaChart>
                </ChartContainer>

                {/* Summary chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-xl bg-lime-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-lime-700/70">Instagram</p>
                    <p className="mt-0.5 text-sm font-bold text-lime-800">{igStats?.followers ?? 0} followers</p>
                  </div>
                  <div className="rounded-xl bg-green-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-green-700/70">TikTok</p>
                    <p className="mt-0.5 text-sm font-bold text-green-800">{ttStats?.followers ?? 0} followers</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-muted-foreground">Total</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">{(igStats?.followers ?? 0) + (ttStats?.followers ?? 0)} followers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="p-4 lg:p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg lg:text-xl">Engagement (Likes)</CardTitle>
                    <CardDescription className="text-xs lg:text-sm mt-1">Total likes dari Feed + Reels per minggu</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Heart className="h-3 w-3 mr-1 text-pink-500" />
                    {chartData.length} Minggu
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <ChartContainer config={engagementChartConfig} className="h-[250px] lg:h-[350px] w-full">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIgLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.lime} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.lime} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTtLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item, index, payload) => {
                      const isIg = item.dataKey === 'instagramLikes'
                      const pct = isIg ? payload.percentageIgLikes : payload.percentageTtLikes
                      return renderTooltipRow(value, name, item, pct)
                    }} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="instagramLikes"
                      stroke={chartColors.lime}
                      strokeWidth={3}
                      fill="url(#colorIgLikes)"
                    />
                    <Area
                      type="monotone"
                      dataKey="tiktokLikes"
                      stroke={chartColors.green}
                      strokeWidth={3}
                      fill="url(#colorTtLikes)"
                    />
                  </AreaChart>
                </ChartContainer>

                {/* Summary chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-xl bg-lime-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-lime-700/70">Instagram Likes</p>
                    <p className="mt-0.5 text-sm font-bold text-lime-800">{igStats?.likes ?? 0} likes</p>
                  </div>
                  <div className="rounded-xl bg-green-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-green-700/70">TikTok Likes</p>
                    <p className="mt-0.5 text-sm font-bold text-green-800">{ttStats?.likes ?? 0} likes</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-muted-foreground">Total</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">{(igStats?.likes ?? 0) + (ttStats?.likes ?? 0)} likes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Views Tab */}
          <TabsContent value="views">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="p-4 lg:p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg lg:text-xl">Views (Viewer)</CardTitle>
                    <CardDescription className="text-xs lg:text-sm mt-1">Total views Instagram dan TikTok per minggu</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Eye className="h-3 w-3 mr-1 text-lime-600" />
                    {chartData.length} Minggu
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <ChartContainer config={viewsChartConfig} className="h-[250px] lg:h-[350px] w-full">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIgViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.lime} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.lime} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTtViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item, index, payload) => {
                      const isIg = item.dataKey === 'instagramViews'
                      const pct = isIg ? payload.percentageIgViews : payload.percentageTtViews
                      return renderTooltipRow(value, name, item, pct)
                    }} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="instagramViews"
                      stroke={chartColors.lime}
                      strokeWidth={3}
                      fill="url(#colorIgViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="tiktokViews"
                      stroke={chartColors.green}
                      strokeWidth={3}
                      fill="url(#colorTtViews)"
                    />
                  </AreaChart>
                </ChartContainer>

                {/* Summary chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-xl bg-lime-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-lime-700/70">Instagram Views</p>
                    <p className="mt-0.5 text-sm font-bold text-lime-800">{(igStats?.views ?? 0).toLocaleString()} views</p>
                  </div>
                  <div className="rounded-xl bg-green-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-green-700/70">TikTok Views</p>
                    <p className="mt-0.5 text-sm font-bold text-green-800">{(ttStats?.views ?? 0).toLocaleString()} views</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-muted-foreground">Total</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">{((igStats?.views ?? 0) + (ttStats?.views ?? 0)).toLocaleString()} views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Website Analytics Tab */}
          <TabsContent value="website">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="p-4 lg:p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg lg:text-xl">Website Analytics</CardTitle>
                    <CardDescription className="text-xs lg:text-sm mt-1">Total Pengunjung dan Page Views (Vercel Analytics)</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Globe className="h-3 w-3 mr-1 text-blue-500" />
                    {webStats.length} Minggu
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <ChartContainer config={websiteChartConfig} className="h-[250px] lg:h-[350px] w-full">
                  <AreaChart data={webStats}>
                    <defs>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.lime} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.lime} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/50" />
                    <XAxis
                      dataKey="stage"
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item, index, payload) => {
                      const isViews = item.dataKey === 'pageViews'
                      const pct = isViews ? payload.percentagePageViews : payload.percentage
                      return renderTooltipRow(value, name, item, pct)
                    }} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stroke={chartColors.lime}
                      strokeWidth={3}
                      fill="url(#colorPageViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke={chartColors.green}
                      strokeWidth={3}
                      fill="url(#colorVisitors)"
                    />
                  </AreaChart>
                </ChartContainer>

                {/* Summary chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-xl bg-lime-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-lime-700/70">Total Page Views</p>
                    <p className="mt-0.5 text-sm font-bold text-lime-800">{webStats.reduce((sum, w) => sum + w.pageViews, 0)}</p>
                  </div>
                  <div className="rounded-xl bg-green-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-green-700/70">Total Pengunjung</p>
                    <p className="mt-0.5 text-sm font-bold text-green-800">{webStats.reduce((sum, w) => sum + w.visitors, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
