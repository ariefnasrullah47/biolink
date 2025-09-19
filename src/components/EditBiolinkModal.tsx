import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2, Globe, Mail, Phone, Instagram, Twitter, Youtube, Github, Linkedin, AlertTriangle, RefreshCw } from 'lucide-react'
import BiolinkPreview from '@/components/BiolinkPreview'
import BackgroundSettings from '@/components/BackgroundSettings'
import SEOSettings from '@/components/SEOSettings'
import ErrorBoundary from '@/components/ErrorBoundary'

interface EditBiolinkModalProps {
  isOpen: boolean
  onClose: () => void
  biolink: any
  onSave: (updatedBiolink: any) => void
}

export default function EditBiolinkModal({ isOpen, onClose, biolink, onSave }: EditBiolinkModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    profile: {
      name: '',
      bio: '',
      avatar: '',
      theme: 'default'
    },
    links: [] as any[],
    social: [] as any[],
    background: {
      type: 'gradient' as 'solid' | 'gradient' | 'rgb' | 'image',
      solidColor: '#667eea',
      gradientColors: ['#667eea', '#764ba2'],
      rgbColor: { r: 102, g: 126, b: 234 },
      imageUrl: ''
    },
    seo: {
      title: '',
      description: '',
      favicon: '',
      keywords: '',
      ampLink: '',
      schemaType: 'WebSite' as 'Organization' | 'LocalBusiness' | 'WebSite' | 'Product'
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [previewError, setPreviewError] = useState(false)

  console.log('EditBiolinkModal: Rendering with formData:', formData)
  console.log('EditBiolinkModal: Background data:', formData.background)

  useEffect(() => {
    console.log('EditBiolinkModal: useEffect triggered, isOpen:', isOpen, 'biolink:', biolink)
    
    if (biolink && isOpen) {
      console.log('EditBiolinkModal: Loading biolink data:', biolink)
      try {
        const newFormData = {
          title: biolink.title || '',
          slug: biolink.slug || '',
          description: biolink.description || '',
          profile: {
            name: biolink.profile?.name || biolink.title || '',
            bio: biolink.profile?.bio || '',
            avatar: biolink.profile?.avatar || '',
            theme: biolink.profile?.theme || 'default'
          },
          links: biolink.links || [],
          social: biolink.social || [],
          background: {
            type: biolink.background?.type || 'gradient',
            solidColor: biolink.background?.solidColor || '#667eea',
            gradientColors: biolink.background?.gradientColors || ['#667eea', '#764ba2'],
            rgbColor: biolink.background?.rgbColor || { r: 102, g: 126, b: 234 },
            imageUrl: biolink.background?.imageUrl || ''
          },
          seo: {
            title: biolink.seo?.title || '',
            description: biolink.seo?.description || '',
            favicon: biolink.seo?.favicon || '',
            keywords: biolink.seo?.keywords || '',
            ampLink: biolink.seo?.ampLink || '',
            schemaType: biolink.seo?.schemaType || 'WebSite'
          }
        }
        
        console.log('EditBiolinkModal: Setting new form data:', newFormData)
        setFormData(newFormData)
        setPreviewError(false)
      } catch (error) {
        console.error('EditBiolinkModal: Error loading biolink data:', error)
        toast.error('Error loading biolink data')
      }
    }
  }, [biolink, isOpen])

  const iconOptions = [
    { value: 'globe', label: 'Website', icon: Globe },
    { value: 'mail', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'twitter', label: 'Twitter', icon: Twitter },
    { value: 'youtube', label: 'YouTube', icon: Youtube },
    { value: 'github', label: 'GitHub', icon: Github },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin }
  ]

  const addLink = () => {
    const newLink = {
      id: `link-${Date.now()}`,
      title: '',
      url: '',
      description: '',
      icon: 'globe',
      clicks: 0
    }
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }))
  }

  const updateLink = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
  }

  const addSocialLink = () => {
    const newSocial = {
      platform: 'instagram',
      url: ''
    }
    setFormData(prev => ({
      ...prev,
      social: [...prev.social, newSocial]
    }))
  }

  const updateSocialLink = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social: prev.social.map((social, i) => 
        i === index ? { ...social, [field]: value } : social
      )
    }))
  }

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      social: prev.social.filter((_, i) => i !== index)
    }))
  }

  const handleBackgroundChange = (background: any) => {
    try {
      console.log('EditBiolinkModal: Background change received:', background)
      
      setFormData(prev => {
        const newFormData = {
          ...prev,
          background
        }
        console.log('EditBiolinkModal: Updated formData with new background:', newFormData)
        return newFormData
      })
      
      setPreviewError(false)
      console.log('EditBiolinkModal: Background change completed successfully')
    } catch (error) {
      console.error('EditBiolinkModal: Error updating background:', error)
      setPreviewError(true)
      toast.error('Error updating background')
    }
  }

  const handleSEOChange = (seo: any) => {
    try {
      console.log('EditBiolinkModal: SEO changed:', seo)
      setFormData(prev => ({
        ...prev,
        seo
      }))
    } catch (error) {
      console.error('EditBiolinkModal: Error updating SEO:', error)
      toast.error('Error updating SEO')
    }
  }

  const resetPreview = () => {
    console.log('EditBiolinkModal: Resetting preview')
    setPreviewError(false)
    // Reset background to default if there's an error
    setFormData(prev => ({
      ...prev,
      background: {
        type: 'gradient',
        solidColor: '#667eea',
        gradientColors: ['#667eea', '#764ba2'],
        rgbColor: { r: 102, g: 126, b: 234 },
        imageUrl: ''
      }
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Judul biolink wajib diisi')
      return false
    }
    if (!formData.slug.trim()) {
      toast.error('Slug biolink wajib diisi')
      return false
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(formData.slug)) {
      toast.error('Slug hanya boleh mengandung huruf, angka, tanda hubung, dan underscore')
      return false
    }
    
    // Validate links
    for (let i = 0; i < formData.links.length; i++) {
      const link = formData.links[i]
      if (!link.title.trim()) {
        toast.error(`Judul link ${i + 1} wajib diisi`)
        return false
      }
      if (!link.url.trim()) {
        toast.error(`URL link ${i + 1} wajib diisi`)
        return false
      }
      try {
        new URL(link.url)
      } catch {
        toast.error(`Format URL link ${i + 1} tidak valid`)
        return false
      }
    }
    
    // Validate social links
    for (let i = 0; i < formData.social.length; i++) {
      const social = formData.social[i]
      if (!social.url.trim()) {
        toast.error(`URL social media ${i + 1} wajib diisi`)
        return false
      }
      try {
        new URL(social.url)
      } catch {
        toast.error(`Format URL social media ${i + 1} tidak valid`)
        return false
      }
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedBiolink = {
        ...biolink,
        ...formData,
        updated_at: new Date().toISOString().split('T')[0]
      }
      
      console.log('EditBiolinkModal: Saving biolink with background and SEO:', {
        background: updatedBiolink.background,
        seo: updatedBiolink.seo
      })
      
      onSave(updatedBiolink)
      toast.success('Biolink berhasil diperbarui!')
      onClose()
    } catch (error) {
      console.error('Error updating biolink:', error)
      toast.error('Gagal memperbarui biolink')
    } finally {
      setIsLoading(false)
    }
  }

  // Create preview data with current form state
  const previewData = {
    ...formData,
    view_count: biolink?.view_count || 0
  }

  console.log('EditBiolinkModal: Preview data:', previewData)

  // Safety check for form data
  if (!formData) {
    console.error('EditBiolinkModal: formData is null/undefined')
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">Loading modal content...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
        <div className="flex h-[90vh]">
          {/* Left Panel - Edit Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle>Edit Biolink</DialogTitle>
                <DialogDescription>
                  Perbarui informasi biolink Anda. Lihat preview real-time di sebelah kanan.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informasi Dasar</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Judul Biolink</Label>
                      <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Contoh: Profil Saya"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-slug">Slug (URL)</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">/</span>
                        <Input
                          id="edit-slug"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))}
                          placeholder="username"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Deskripsi</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deskripsi singkat tentang biolink Anda"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Profil</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Nama Tampilan</Label>
                      <Input
                        id="edit-name"
                        value={formData.profile.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))}
                        placeholder="Nama Anda"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-avatar">URL Avatar</Label>
                      <Input
                        id="edit-avatar"
                        value={formData.profile.avatar}
                        onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, avatar: e.target.value } }))}
                        placeholder="https://example.com/avatar.jpg"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={formData.profile.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, bio: e.target.value } }))}
                      placeholder="Ceritakan tentang diri Anda..."
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Links</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addLink} disabled={isLoading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Link
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.links.map((link, index) => (
                      <Card key={link.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">Link {index + 1}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLink(index)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Judul</Label>
                              <Input
                                value={link.title}
                                onChange={(e) => updateLink(index, 'title', e.target.value)}
                                placeholder="Judul link"
                                disabled={isLoading}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Icon</Label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={link.icon}
                                onChange={(e) => updateLink(index, 'icon', e.target.value)}
                                disabled={isLoading}
                              >
                                {iconOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                              value={link.url}
                              onChange={(e) => updateLink(index, 'url', e.target.value)}
                              placeholder="https://example.com"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Input
                              value={link.description}
                              onChange={(e) => updateLink(index, 'description', e.target.value)}
                              placeholder="Deskripsi link (opsional)"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {formData.links.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Belum ada link. Tambah link pertama!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Social Media</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialLink} disabled={isLoading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Social
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.social.map((social, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">Social {index + 1}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSocialLink(index)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Platform</Label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={social.platform}
                                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                                disabled={isLoading}
                              >
                                <option value="instagram">Instagram</option>
                                <option value="twitter">Twitter</option>
                                <option value="youtube">YouTube</option>
                                <option value="github">GitHub</option>
                                <option value="linkedin">LinkedIn</option>
                              </select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>URL</Label>
                              <Input
                                value={social.url}
                                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                                placeholder="https://instagram.com/username"
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Background Settings with Enhanced Error Boundary */}
                <ErrorBoundary 
                  fallback={
                    <Card>
                      <CardContent className="p-6 text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                        <p className="text-red-600 mb-4">Error loading background settings</p>
                        <Button onClick={resetPreview} size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset Background
                        </Button>
                      </CardContent>
                    </Card>
                  }
                  onReset={resetPreview}
                >
                  <BackgroundSettings
                    background={formData.background}
                    onChange={handleBackgroundChange}
                    disabled={isLoading}
                  />
                </ErrorBoundary>

                {/* SEO Settings with Error Boundary */}
                <ErrorBoundary 
                  fallback={
                    <Card>
                      <CardContent className="p-6 text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                        <p className="text-red-600">Error loading SEO settings</p>
                      </CardContent>
                    </Card>
                  }
                >
                  <SEOSettings
                    seo={formData.seo}
                    onChange={handleSEOChange}
                    disabled={isLoading}
                  />
                </ErrorBoundary>
              </div>
              
              <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview with Enhanced Error Boundary */}
          <div className="w-96 border-l bg-gray-50">
            <ErrorBoundary 
              fallback={
                <div className="h-full flex items-center justify-center p-4">
                  <Card className="w-full max-w-sm">
                    <CardContent className="p-6 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-orange-500" />
                      <p className="text-gray-600 mb-4">Preview temporarily unavailable</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Background uploaded successfully! Preview will update after save.
                      </p>
                      <Button onClick={resetPreview} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Preview
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              }
              onReset={resetPreview}
            >
              <BiolinkPreview biolink={previewData} />
            </ErrorBoundary>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}