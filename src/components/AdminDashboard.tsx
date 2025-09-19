import { useState, useEffect } from 'react'
import { AdminAuth } from '@/lib/admin-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { 
  Shield, 
  Users, 
  Link, 
  Flag, 
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  TrendingUp,
  Globe,
  LogOut,
  Trash2,
  Download,
  AlertTriangle
} from 'lucide-react'

interface AdminDashboardProps {
  onLogout: () => void
}

interface User {
  id: string
  username: string
  display_name: string
  email: string
  is_suspended: boolean
  suspension_reason?: string
  created_at: string
  biolinks_count: number
  shortlinks_count: number
}

interface Biolink {
  id: string
  slug: string
  title: string
  username: string
  is_public: boolean
  is_featured: boolean
  view_count: number
  created_at: string
}

interface Shortlink {
  id: string
  slug: string
  target_url: string
  username: string
  is_active: boolean
  password: string | null
  click_count: number
  created_at: string
}

interface Report {
  id: string
  type: string
  content: string
  reporter: string
  status: string
  created_at: string
  target_user?: string
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // Initial data seeded to match exact statistics
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'demo', display_name: 'Demo User', email: 'demo@example.com', is_suspended: false, created_at: '2024-01-15', biolinks_count: 1, shortlinks_count: 2 },
    { id: '2', username: 'creator1', display_name: 'Creative Studio', email: 'creator1@example.com', is_suspended: false, created_at: '2024-01-16', biolinks_count: 1, shortlinks_count: 1 },
    { id: '3', username: 'business1', display_name: 'Bisnis Online', email: 'business1@example.com', is_suspended: false, created_at: '2024-01-17', biolinks_count: 1, shortlinks_count: 1 },
    { id: '4', username: 'portfolio1', display_name: 'Portfolio Designer', email: 'portfolio1@example.com', is_suspended: false, created_at: '2024-01-18', biolinks_count: 1, shortlinks_count: 0 },
    { id: '5', username: 'blog1', display_name: 'Blog Teknologi', email: 'blog1@example.com', is_suspended: false, created_at: '2024-01-19', biolinks_count: 1, shortlinks_count: 0 },
    { id: '6', username: 'shop1', display_name: 'Toko Fashion', email: 'shop1@example.com', is_suspended: true, suspension_reason: 'Pelanggaran kebijakan konten', created_at: '2024-01-20', biolinks_count: 0, shortlinks_count: 0 }
  ])

  const [biolinks, setBiolinks] = useState<Biolink[]>([
    { id: '1', slug: 'demo', title: 'Demo Biolink', username: 'demo', is_public: true, is_featured: true, view_count: 150, created_at: '2024-01-15' },
    { id: '2', slug: 'creator1', title: 'Creative Studio Portfolio', username: 'creator1', is_public: true, is_featured: false, view_count: 89, created_at: '2024-01-16' },
    { id: '3', slug: 'business1', title: 'Bisnis Online Hub', username: 'business1', is_public: true, is_featured: true, view_count: 156, created_at: '2024-01-17' },
    { id: '4', slug: 'portfolio1', title: 'Designer Portfolio', username: 'portfolio1', is_public: true, is_featured: true, view_count: 203, created_at: '2024-01-18' },
    { id: '5', slug: 'blog1', title: 'Tech Blog Central', username: 'blog1', is_public: false, is_featured: false, view_count: 78, created_at: '2024-01-19' }
  ])

  const [shortlinks, setShortlinks] = useState<Shortlink[]>([
    { id: '1', slug: 'demo1', target_url: 'https://example.com/page1', username: 'demo', is_active: true, password: null, click_count: 125, created_at: '2024-01-15' },
    { id: '2', slug: 'demo2', target_url: 'https://example.com/page2', username: 'demo', is_active: true, password: 'demo123', click_count: 98, created_at: '2024-01-16' },
    { id: '3', slug: 'creative', target_url: 'https://creativestudio.com', username: 'creator1', is_active: true, password: null, click_count: 87, created_at: '2024-01-17' },
    { id: '4', slug: 'bisnis', target_url: 'https://bisnisonline.com', username: 'business1', is_active: false, password: null, click_count: 88, created_at: '2024-01-18' }
  ])

  const [reports, setReports] = useState<Report[]>([
    { id: '1', type: 'spam', content: 'Biolink berisi konten spam dan tidak relevan', reporter: 'reporter1@example.com', status: 'pending', created_at: '2024-01-20', target_user: 'demo' },
    { id: '2', type: 'inappropriate', content: 'Konten tidak sesuai dengan pedoman komunitas', reporter: 'reporter2@example.com', status: 'pending', created_at: '2024-01-21', target_user: 'creator1' },
    { id: '3', type: 'copyright', content: 'Menggunakan gambar tanpa izin', reporter: 'reporter3@example.com', status: 'resolved', created_at: '2024-01-19', target_user: 'business1' }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{type: 'biolink' | 'shortlink', id: string, title: string} | null>(null)

  const admin = AdminAuth.getCurrentAdmin()

  // Calculate real-time statistics
  const stats = {
    totalUsers: users.length,
    totalBiolinks: biolinks.length,
    totalShortlinks: shortlinks.length,
    totalClicks: shortlinks.reduce((sum, link) => sum + link.click_count, 0),
    pendingReports: reports.filter(r => r.status === 'pending').length
  }

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const suspendUser = async (user: User, reason: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, is_suspended: true, suspension_reason: reason }
          : u
      ))
      
      toast({
        title: "Pengguna Disuspend",
        description: `@${user.username} berhasil disuspend. Alasan: ${reason}`,
      })
      
      setShowSuspendDialog(false)
      setSuspendReason('')
      setSelectedUser(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal suspend pengguna. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const unsuspendUser = async (user: User) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, is_suspended: false, suspension_reason: undefined }
          : u
      ))
      
      toast({
        title: "Pengguna Direaktivasi",
        description: `@${user.username} berhasil direaktivasi`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal reaktivasi pengguna. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteBiolink = async (id: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setBiolinks(prev => prev.filter(b => b.id !== id))
      
      toast({
        title: "Biolink Dihapus",
        description: `Biolink "${deleteTarget?.title}" berhasil dihapus`,
      })
      
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal hapus biolink. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteShortlink = async (id: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setShortlinks(prev => prev.filter(s => s.id !== id))
      
      toast({
        title: "Shortlink Dihapus",
        description: `Shortlink "${deleteTarget?.title}" berhasil dihapus`,
      })
      
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal hapus shortlink. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, status }
          : r
      ))
      
      toast({
        title: "Laporan Diperbarui",
        description: `Laporan berhasil ${status === 'resolved' ? 'diselesaikan' : 'ditolak'}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal update laporan. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportData = (type: 'users' | 'biolinks' | 'shortlinks') => {
    let data: any[] = []
    let filename = ''
    
    switch (type) {
      case 'users':
        data = users
        filename = 'users-export.json'
        break
      case 'biolinks':
        data = biolinks
        filename = 'biolinks-export.json'
        break
      case 'shortlinks':
        data = shortlinks
        filename = 'shortlinks-export.json'
        break
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Data Diekspor",
      description: `Data ${type} berhasil diekspor ke ${filename}`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">BioLink.ID Management Panel</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              {admin?.full_name} ({admin?.role})
            </Badge>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Total Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.is_suspended).length} disuspend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Globe className="h-4 w-4 mr-2 text-green-600" />
                Biolinks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBiolinks}</div>
              <p className="text-xs text-muted-foreground">
                {biolinks.filter(b => b.is_featured).length} featured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Link className="h-4 w-4 mr-2 text-purple-600" />
                Shortlinks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShortlinks}</div>
              <p className="text-xs text-muted-foreground">
                {shortlinks.filter(s => s.is_active).length} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-orange-600" />
                Total Klik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                rata-rata {Math.round(stats.totalClicks / stats.totalShortlinks)} per link
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Flag className="h-4 w-4 mr-2 text-red-600" />
                Laporan Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">
                {reports.length} total laporan
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Pengguna ({stats.totalUsers})</TabsTrigger>
            <TabsTrigger value="biolinks">Biolinks ({stats.totalBiolinks})</TabsTrigger>
            <TabsTrigger value="shortlinks">Shortlinks ({stats.totalShortlinks})</TabsTrigger>
            <TabsTrigger value="reports">Moderasi ({stats.pendingReports})</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manajemen Pengguna</CardTitle>
                    <CardDescription>Kelola akun pengguna platform</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => exportData('users')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari pengguna..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{user.display_name}</p>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              {user.biolinks_count} biolinks • {user.shortlinks_count} shortlinks
                            </p>
                          </div>
                          {user.is_suspended && (
                            <Badge variant="destructive">Suspended</Badge>
                          )}
                        </div>
                        {user.suspension_reason && (
                          <p className="text-xs text-red-600 mt-1">
                            Alasan: {user.suspension_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/u/${user.username}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.is_suspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unsuspendUser(user)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowSuspendDialog(true)
                            }}
                            disabled={loading}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Biolinks Management */}
          <TabsContent value="biolinks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Biolinks Platform</CardTitle>
                    <CardDescription>Semua halaman biolink yang dibuat pengguna</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportData('biolinks')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biolinks.map((biolink) => (
                    <div key={biolink.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{biolink.title}</p>
                            <p className="text-sm text-gray-600">/u/{biolink.slug}</p>
                            <p className="text-xs text-gray-500">
                              oleh @{biolink.username} • {biolink.view_count} views
                            </p>
                          </div>
                          {biolink.is_featured && (
                            <Badge>Featured</Badge>
                          )}
                          {!biolink.is_public && (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/u/${biolink.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget({type: 'biolink', id: biolink.id, title: biolink.title})
                            setShowDeleteDialog(true)
                          }}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shortlinks Management */}
          <TabsContent value="shortlinks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shortlinks Platform</CardTitle>
                    <CardDescription>Semua shortlink yang dibuat pengguna</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportData('shortlinks')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shortlinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">/s/{link.slug}</p>
                            <p className="text-sm text-gray-600">{link.target_url}</p>
                            <p className="text-xs text-gray-500">
                              oleh @{link.username} • {link.click_count} klik
                            </p>
                          </div>
                          {!link.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {link.password && (
                            <Badge variant="outline">Protected</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/s/${link.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget({type: 'shortlink', id: link.id, title: `/s/${link.slug}`})
                            setShowDeleteDialog(true)
                          }}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Moderasi Konten</CardTitle>
                <CardDescription>Laporan pelanggaran dari pengguna</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.filter(r => r.status === 'pending').map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{report.type}</Badge>
                            <Badge variant="destructive">{report.status}</Badge>
                          </div>
                          <p className="text-sm mb-2">{report.content}</p>
                          <p className="text-xs text-gray-500">
                            Dilaporkan oleh: {report.reporter} • Target: @{report.target_user} • {report.created_at}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveReport(report.id, 'resolved')}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Selesaikan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveReport(report.id, 'dismissed')}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reports.filter(r => r.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>Tidak ada laporan yang pending</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Pengguna</DialogTitle>
            <DialogDescription>
              Suspend akun @{selectedUser?.username}. Berikan alasan yang jelas untuk tindakan ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Alasan Suspend</Label>
              <Textarea
                id="reason"
                placeholder="Masukkan alasan suspend pengguna..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                Batal
              </Button>
              <Button 
                onClick={() => selectedUser && suspendUser(selectedUser, suspendReason)}
                disabled={!suspendReason.trim() || loading}
              >
                {loading ? 'Memproses...' : 'Suspend Pengguna'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {deleteTarget?.type} "{deleteTarget?.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (deleteTarget?.type === 'biolink') {
                  deleteBiolink(deleteTarget.id)
                } else if (deleteTarget?.type === 'shortlink') {
                  deleteShortlink(deleteTarget.id)
                }
              }}
              disabled={loading}
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}