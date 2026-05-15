import type React from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}
