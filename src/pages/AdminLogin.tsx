import { useState, useEffect } from 'react'
import { AdminAuth } from '@/lib/admin-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff } from 'lucide-react'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@biolink.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    if (AdminAuth.isAuthenticated()) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await AdminAuth.login(email, password)
      setIsAuthenticated(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    AdminAuth.logout()
    setIsAuthenticated(false)
  }

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>
            Masuk ke dashboard administrator BioLink.ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Admin</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@biolink.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password admin"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Kredensial Demo:</h4>
            <p className="text-xs text-gray-600">Email: admin@biolink.com</p>
            <p className="text-xs text-gray-600">Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}