'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Save,
  Upload,
  Mail,
  Phone,
  Globe,
  MapPin,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your admin panel preferences</p>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4 hidden sm:inline" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:inline" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4 hidden sm:inline" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Settings className="h-4 w-4 hidden sm:inline" />
              <span className="hidden sm:inline">System</span>
              <span className="sm:hidden">System</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription className="mt-1">Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user?.name || 'Admin'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-2 bg-lime-100 text-lime-700 border-0">
                      {user?.role || 'Admin'}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Change
                  </Button>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name || 'Admin'} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+62 812-3456-7890" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Jakarta, Indonesia" className="h-10" />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button className="gap-2 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription className="mt-1">Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 space-y-6">
                <div className="space-y-4">
                  {[
                    { title: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
                    { title: 'SMS Notifications', description: 'Receive notifications via SMS', icon: Phone },
                    { title: 'Push Notifications', description: 'Receive browser push notifications', icon: Bell },
                    { title: 'Webhook Notifications', description: 'Send notifications to external services', icon: Globe },
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-lime-100 rounded-lg">
                          <item.icon className="h-5 w-5 text-lime-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle>Security Settings</CardTitle>
                <CardDescription className="mt-1">Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Change Password</h3>
                    <div className="grid gap-3">
                      <Input type="password" placeholder="Current Password" className="h-10" />
                      <Input type="password" placeholder="New Password" className="h-10" />
                      <Input type="password" placeholder="Confirm New Password" className="h-10" />
                      <Button className="w-full bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {[
                      { title: 'Two-Factor Authentication', description: 'Add an extra layer of security', enabled: false },
                      { title: 'Login Alerts', description: 'Get notified of new login attempts', enabled: true },
                      { title: 'Session Management', description: 'Manage active sessions', enabled: true },
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Badge className={item.enabled ? 'bg-lime-100 text-lime-700 border-0' : 'bg-gray-100 text-gray-700 border-0'}>
                          {item.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle>System Configuration</CardTitle>
                <CardDescription className="mt-1">Manage system settings and data</CardDescription>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 space-y-6">
                <div className="space-y-4">
                  {[
                    { title: 'Database Management', description: 'Backup and restore database', icon: Database },
                    { title: 'Appearance', description: 'Customize theme and colors', icon: Palette },
                    { title: 'API Configuration', description: 'Manage API keys and endpoints', icon: Globe },
                    { title: 'System Logs', description: 'View system activity logs', icon: Settings },
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-lime-100 rounded-lg">
                          <item.icon className="h-5 w-5 text-lime-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </motion.div>
                  ))}
                </div>

                <Separator />

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">Danger Zone</h3>
                  <p className="text-xs text-red-700 mb-3">These actions cannot be undone. Please proceed with caution.</p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">Clear Cache</Button>
                    <Button variant="destructive" size="sm">Reset System</Button>
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
