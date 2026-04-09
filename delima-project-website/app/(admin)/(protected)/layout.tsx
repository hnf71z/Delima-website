'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import DashboardLayout from '@/components/admin/dashboard-layout'
import { Loader2 } from 'lucide-react'

function ProtectedLayoutInner({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
}
