'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  XCircle, 
  Copy, 
  ExternalLink, 
  Database, 
  Table2, 
  Users,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SetupPage() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isConfigured = !!(supabaseUrl && supabaseKey && !supabaseUrl.includes('dummy'))

  const steps = [
    {
      step: 1,
      title: 'Buat Supabase Account',
      description: 'Daftar dan buat project baru di Supabase',
      action: 'Buka https://supabase.com → Sign Up → New Project',
      link: 'https://supabase.com',
      icon: Users,
    },
    {
      step: 2,
      title: 'Copy Credentials',
      description: 'Ambil Project URL dan Anon Key dari Settings → API',
      action: 'Project Settings → API → Copy Project URL dan anon/public key',
      icon: Database,
    },
    {
      step: 3,
      title: 'Update .env.local',
      description: 'Paste credentials ke file .env.local',
      action: `NEXT_PUBLIC_SUPABASE_URL=your-url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-key`,
      icon: Table2,
    },
    {
      step: 4,
      title: 'Run SQL Schema',
      description: 'Jalankan file supabase-schema.sql di SQL Editor',
      action: 'SQL Editor → New Query → Paste isi supabase-schema.sql → Run',
      icon: Table2,
    },
    {
      step: 5,
      title: 'Create Admin User',
      description: 'Buat user admin di Authentication → Users',
      action: 'Email: admin@delima.com, Password: admin123',
      icon: Users,
    },
    {
      step: 6,
      title: 'Seed Data',
      description: 'Jalankan file supabase-seed.sql untuk data awal',
      action: 'SQL Editor → New Query → Paste isi supabase-seed.sql → Run',
      icon: Database,
    },
  ]

  const copyToClipboard = async (text: string, fileName: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedFile(fileName)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  const testConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const { error } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true })
      
      if (error) throw error
      setTestResult('success')
    } catch (error) {
      console.error('Connection test failed:', error)
      setTestResult('error')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Setup De&apos;Lima Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Ikuti 6 langkah berikut untuk menghubungkan ke Supabase
          </p>
        </div>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Status Koneksi
              <Badge variant={isConfigured ? 'default' : 'destructive'}>
                {isConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isConfigured 
                ? 'Supabase sudah dikonfigurasi. Test koneksi untuk memastikan semuanya berfungsi.'
                : 'Anda perlu setup Supabase terlebih dahulu.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConfigured ? (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project URL:</span>
                    <span className="font-mono text-xs">{supabaseUrl?.slice(0, 30)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anon Key:</span>
                    <span className="font-mono text-xs">{supabaseKey?.slice(0, 20)}...</span>
                  </div>
                </div>
                <Button onClick={testConnection} disabled={isTesting}>
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
                {testResult === 'success' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Berhasil!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Koneksi ke Supabase berhasil. Anda bisa lanjut ke langkah berikutnya.
                    </AlertDescription>
                  </Alert>
                )}
                {testResult === 'error' && (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Gagal</AlertTitle>
                    <AlertDescription className="text-red-700">
                      Pastikan schema sudah di-run di Supabase SQL Editor.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <Alert>
                <AlertDescription>
                  File <code className="font-mono bg-muted px-1 py-0.5 rounded">.env.local</code> belum diisi dengan Supabase credentials yang benar.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Setup Steps</h2>
          {steps.map((step) => (
            <Card key={step.step}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <step.icon className="h-5 w-5 text-lime-600" />
                  {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                  {step.action}
                </pre>
                {step.link && (
                  <a 
                    href={step.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-lime-600 hover:underline mt-2"
                  >
                    Buka {step.link}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start Commands */}
        <Card>
          <CardHeader>
            <CardTitle>Files to Use</CardTitle>
            <CardDescription>Copy dan paste SQL files ini ke Supabase SQL Editor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">1. supabase-schema.sql</p>
                <p className="text-sm text-muted-foreground">Tables, RLS policies, triggers</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const text = `Run this file: delima-backend/supabase-schema.sql`
                  copyToClipboard(text, 'schema')
                }}
              >
                {copiedFile === 'schema' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">2. supabase-seed.sql</p>
                <p className="text-sm text-muted-foreground">Products, orders, order_items</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const text = `Run this file: delima-backend/supabase-seed.sql`
                  copyToClipboard(text, 'seed')
                }}
              >
                {copiedFile === 'seed' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
