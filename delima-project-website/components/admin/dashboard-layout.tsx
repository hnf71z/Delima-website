'use client'

import type React from 'react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  ChevronRight,
  Bell,
  Search,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
]

// Bottom Navigation untuk Mobile
function BottomNav() {
  const pathname = usePathname()

  const bottomNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  ]

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border lg:hidden"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center py-2 px-3 min-w-[64px]"
            >
              <div
                className={cn(
                  'flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all',
                  isActive
                    ? 'text-lime-600'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 transition-transform',
                  isActive && 'scale-110'
                )} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-lime-500 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

// Sidebar untuk Desktop
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col h-full bg-background">
      {/* User Info - At top */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-accent/50 rounded-lg">
          <Avatar className="h-9 w-9 ring-2 ring-lime-500/20">
            <AvatarFallback className="bg-gradient-to-br from-lime-400 to-green-500 text-white font-medium text-sm">
              {user?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-lime-100 text-lime-700 shadow-sm'
                  : 'text-foreground/70 hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            onClose?.()
            logout()
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}

// Header untuk Desktop
function DesktopHeader() {
  const { user } = useAuth()
  const pathname = usePathname()

  const getPageTitle = () => {
    const currentNav = navigation.find(n => n.href === pathname)
    return currentNav?.name || 'Dashboard'
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {user?.name || 'Admin'}!</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 h-10 bg-accent/50 border-border focus:bg-background transition-colors"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center bg-lime-500 text-white text-xs">
              3
            </Badge>
          </Button>

          <Avatar className="h-10 w-10 ring-2 ring-lime-500/20 cursor-pointer">
            <AvatarFallback className="bg-gradient-to-br from-lime-400 to-green-500 text-white font-medium">
              {user?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col border-r border-border bg-background z-40">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-4 lg:px-8 lg:py-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
