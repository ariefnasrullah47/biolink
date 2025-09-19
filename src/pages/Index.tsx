import { useState, useEffect } from 'react'
import { supabase, isDemoMode, showDemoNotice } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Link as LinkIcon, 
  Globe, 
  Zap, 
  Shield, 
  BarChart3, 
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Info
} from 'lucide-react'
import Dashboard from '@/components/Dashboard'

export default function Index() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    // Show demo notice if in demo mode
    if (showDemoNotice()) {
      toast.info('Demo Mode: Gunakan email/password apapun untuk testing')
    }

    // Check for existing session
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (authMode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Password tidak cocok')
          setLoading(false)
          return
        }

        if (formData.password.length < 6) {
          toast.error('Password minimal 6 karakter')
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          throw error
        }

        if (isDemoMode()) {
          toast.success('Registrasi berhasil! (Demo Mode)')
          setUser(data.user)
        } else {
          toast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.')
        }

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          throw error
        }

        toast.success('Login berhasil!')
        setUser(data.user)
      }

      // Reset form
      setFormData({ email: '', password: '', confirmPassword: '' })

    } catch (error: any) {
      console.error('Auth error:', error)
      
      // Provide user-friendly error messages
      let errorMessage = 'Terjadi kesalahan'
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Silakan verifikasi email Anda terlebih dahulu'
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Email sudah terdaftar, silakan login'
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = isDemoMode() 
          ? 'Demo mode aktif - coba lagi'
          : 'Gagal terhubung ke server. Periksa koneksi internet Anda.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      toast.success('Logout berhasil')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Gagal logout')
    }
  }

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <LinkIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                BioLink.ID
              </h1>
              <p className="text-xs text-gray-600">Platform Biolink & Shortlink Indonesia</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => window.open('/directory', '_blank')}>
              Jelajahi
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.open('/admin', '_blank')}>
              Admin
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Demo Mode Notice */}
        {isDemoMode() && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Mode Demo Aktif:</strong> Gunakan email dan password apapun untuk testing. 
              Data tidak akan disimpan secara permanen.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                🚀 Platform Terdepan di Indonesia
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Satu Link untuk
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {" "}Semua Konten
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Buat halaman biolink yang menarik dan kelola semua link Anda dalam satu tempat. 
                Dilengkapi dengan analytics dan shortlink yang powerful.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg border">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Biolink Pages</p>
                  <p className="text-sm text-gray-600">Halaman personal</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg border">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Short Links</p>
                  <p className="text-sm text-gray-600">URL pendek</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg border">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Analytics</p>
                  <p className="text-sm text-gray-600">Statistik lengkap</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg border">
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold">Secure</p>
                  <p className="text-sm text-gray-600">Aman & terpercaya</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">1000+</p>
                <p className="text-sm text-gray-600">Pengguna Aktif</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">5000+</p>
                <p className="text-sm text-gray-600">Links Dibuat</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">50K+</p>
                <p className="text-sm text-gray-600">Total Klik</p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {authMode === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang'}
                </CardTitle>
                <CardDescription>
                  {authMode === 'login' 
                    ? 'Kelola biolink dan shortlink Anda' 
                    : 'Buat akun gratis dan mulai berbagi'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  
                  {authMode === 'register' && (
                    <div>
                      <Input
                        type="password"
                        placeholder="Konfirmasi Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{authMode === 'login' ? 'Masuk' : 'Daftar'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login')
                      setFormData({ email: '', password: '', confirmPassword: '' })
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    disabled={loading}
                  >
                    {authMode === 'login' 
                      ? 'Belum punya akun? Daftar di sini' 
                      : 'Sudah punya akun? Masuk di sini'}
                  </button>
                </div>

                {/* Demo Credentials */}
                {isDemoMode() && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 text-center">
                      <strong>Demo:</strong> Gunakan email/password apapun
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Fitur Unggulan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform lengkap untuk mengelola semua link dan konten digital Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/60 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Biolink Pages</CardTitle>
                <CardDescription>
                  Buat halaman personal yang menarik dengan berbagai jenis konten dan link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Customizable themes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Multiple content blocks</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>SEO optimized</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/60 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <LinkIcon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Smart Shortlinks</CardTitle>
                <CardDescription>
                  URL shortener dengan fitur advanced dan tracking yang detail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Custom slugs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Password protection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Expiration dates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/60 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Pantau performa link dengan analytics yang komprehensif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Click tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Geographic data</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Device insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">BioLink.ID</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 BioLink.ID. Platform biolink terbaik di Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}