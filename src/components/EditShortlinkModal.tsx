import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface EditShortlinkModalProps {
  isOpen: boolean
  onClose: () => void
  shortlink: any
  onSave: (updatedShortlink: any) => void
}

export default function EditShortlinkModal({ isOpen, onClose, shortlink, onSave }: EditShortlinkModalProps) {
  const [formData, setFormData] = useState({
    slug: '',
    target_url: '',
    title: '',
    description: '',
    is_active: true
  })
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (shortlink && isOpen) {
      setFormData({
        slug: shortlink.slug || '',
        target_url: shortlink.target_url || '',
        title: shortlink.title || '',
        description: shortlink.description || '',
        is_active: shortlink.is_active !== false
      })
    }
  }, [shortlink, isOpen])

  const validateForm = () => {
    if (!formData.slug.trim()) {
      toast.error('Slug shortlink wajib diisi')
      return false
    }
    if (!formData.target_url.trim()) {
      toast.error('URL target wajib diisi')
      return false
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(formData.slug)) {
      toast.error('Slug hanya boleh mengandung huruf, angka, tanda hubung, dan underscore')
      return false
    }
    
    try {
      new URL(formData.target_url)
    } catch {
      toast.error('Format URL tidak valid')
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedShortlink = {
        ...shortlink,
        ...formData,
        slug: formData.slug.toLowerCase(),
        updated_at: new Date().toISOString().split('T')[0]
      }
      
      onSave(updatedShortlink)
      toast.success('Shortlink berhasil diperbarui!')
      onClose()
    } catch (error) {
      console.error('Error updating shortlink:', error)
      toast.error('Gagal memperbarui shortlink')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Shortlink</DialogTitle>
          <DialogDescription>
            Perbarui informasi shortlink Anda. Perubahan akan tersimpan otomatis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-shortlink-slug">Slug (URL Pendek)</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">/s/</span>
              <Input
                id="edit-shortlink-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))}
                placeholder="my-link"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500">
              URL akan menjadi: {window.location.origin}/s/{formData.slug}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-shortlink-url">URL Target</Label>
            <Input
              id="edit-shortlink-url"
              type="url"
              value={formData.target_url}
              onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
              placeholder="https://example.com/very-long-url"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              URL tujuan yang akan dibuka ketika shortlink diklik
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-shortlink-title">Judul</Label>
            <Input
              id="edit-shortlink-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Judul untuk shortlink ini"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-shortlink-description">Deskripsi (Opsional)</Label>
            <Textarea
              id="edit-shortlink-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi singkat tentang shortlink ini"
              disabled={isLoading}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="edit-shortlink-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              disabled={isLoading}
            />
            <Label htmlFor="edit-shortlink-active">Aktifkan shortlink</Label>
          </div>
          
          {!formData.is_active && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Shortlink yang dinonaktifkan tidak akan bisa diakses dan akan menampilkan halaman error.
              </p>
            </div>
          )}
          
          <div className="pt-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Statistik Shortlink</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Klik:</span>
                  <span className="ml-2 font-medium">{shortlink?.click_count || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Dibuat:</span>
                  <span className="ml-2 font-medium">{shortlink?.created_at}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}