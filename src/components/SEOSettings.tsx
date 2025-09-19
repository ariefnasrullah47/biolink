import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ExternalLink, AlertTriangle } from 'lucide-react'

interface SEOSettingsProps {
  seo: {
    title: string
    description: string
    favicon: string
    keywords: string
    ampLink: string
    schemaType: 'Organization' | 'LocalBusiness' | 'WebSite' | 'Product'
  }
  onChange: (seo: any) => void
  disabled?: boolean
}

export default function SEOSettings({ seo, onChange, disabled }: SEOSettingsProps) {
  const [faviconUrl, setFaviconUrl] = useState('')
  const [faviconError, setFaviconError] = useState<string | null>(null)
  const [faviconLoading, setFaviconLoading] = useState(false)

  useEffect(() => {
    setFaviconUrl(seo.favicon || '')
  }, [seo.favicon])

  const validateImageUrl = (url: string): string | null => {
    // Check if empty
    if (!url.trim()) return null
    
    // Check length limit
    if (url.length > 50) {
      return "URL terlalu panjang (maksimal 50 karakter)"
    }
    
    // Check valid URL format
    try {
      new URL(url)
    } catch {
      return "Format URL tidak valid"
    }
    
    // Check image extension
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp']
    const lowerUrl = url.toLowerCase()
    const hasValidExtension = validExtensions.some(ext => lowerUrl.endsWith(ext))
    
    if (!hasValidExtension) {
      return "URL harus berakhiran .png, .jpg, atau .webp"
    }
    
    return null // Valid URL
  }

  const handleFaviconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFaviconUrl(url)
    
    const error = validateImageUrl(url)
    setFaviconError(error)
    
    // Update favicon if valid
    if (!error && url.trim()) {
      setFaviconLoading(true)
      
      // Test if image loads
      const img = new Image()
      img.onload = () => {
        setFaviconLoading(false)
        onChange({
          ...seo,
          favicon: url
        })
      }
      img.onerror = () => {
        setFaviconLoading(false)
        setFaviconError('Gambar tidak dapat dimuat dari URL tersebut')
      }
      img.src = url
    } else if (!url.trim()) {
      // Clear favicon if URL is empty
      onChange({
        ...seo,
        favicon: ''
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...seo,
      [field]: value
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>SEO Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SEO Title */}
        <div className="space-y-2">
          <Label htmlFor="seo-title">SEO Title</Label>
          <Input
            id="seo-title"
            value={seo.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Judul untuk mesin pencari"
            disabled={disabled}
            maxLength={60}
          />
          <p className="text-xs text-gray-500">
            {seo.title.length}/60 karakter (optimal: 50-60)
          </p>
        </div>

        {/* SEO Description */}
        <div className="space-y-2">
          <Label htmlFor="seo-description">SEO Description</Label>
          <Textarea
            id="seo-description"
            value={seo.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Deskripsi untuk mesin pencari dan social media"
            disabled={disabled}
            maxLength={160}
            rows={3}
          />
          <p className="text-xs text-gray-500">
            {seo.description.length}/160 karakter (optimal: 150-160)
          </p>
        </div>

        {/* Favicon URL */}
        <div className="space-y-2">
          <Label htmlFor="favicon-url">Favicon URL</Label>
          <div className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4 text-gray-400" />
            <Input
              id="favicon-url"
              type="text"
              placeholder="https://example.com/favicon.png"
              value={faviconUrl}
              onChange={handleFaviconUrlChange}
              disabled={disabled || faviconLoading}
              className={faviconError ? "border-red-500" : ""}
            />
          </div>
          
          {/* URL Requirements */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• URL harus berakhiran .png, .jpg, atau .webp</p>
            <p>• Maksimal 50 karakter</p>
            <p>• Ukuran optimal: 32x32 atau 16x16 pixels</p>
          </div>
          
          {/* Error Display */}
          {faviconError && (
            <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{faviconError}</span>
            </div>
          )}
          
          {/* Loading State */}
          {faviconLoading && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-700">Memuat favicon...</span>
            </div>
          )}
          
          {/* Favicon Preview */}
          {seo.favicon && !faviconError && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 border rounded-md">
              <img src={seo.favicon} alt="Favicon preview" className="w-4 h-4" />
              <span className="text-sm text-gray-600">Favicon preview</span>
            </div>
          )}
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label htmlFor="seo-keywords">Keywords</Label>
          <Input
            id="seo-keywords"
            value={seo.keywords}
            onChange={(e) => handleInputChange('keywords', e.target.value)}
            placeholder="biolink, profil, link, social media"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500">
            Pisahkan dengan koma. Contoh: biolink, profil, social media
          </p>
        </div>

        {/* Schema Type */}
        <div className="space-y-2">
          <Label htmlFor="schema-type">Schema Type</Label>
          <Select
            value={seo.schemaType}
            onValueChange={(value) => handleInputChange('schemaType', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tipe schema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WebSite">Website</SelectItem>
              <SelectItem value="Organization">Organization</SelectItem>
              <SelectItem value="LocalBusiness">Local Business</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Tipe schema untuk structured data (JSON-LD)
          </p>
        </div>

        {/* AMP Link */}
        <div className="space-y-2">
          <Label htmlFor="amp-link">AMP Link (Optional)</Label>
          <Input
            id="amp-link"
            value={seo.ampLink}
            onChange={(e) => handleInputChange('ampLink', e.target.value)}
            placeholder="https://example.com/amp/page"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500">
            Link ke versi AMP dari halaman ini (jika ada)
          </p>
        </div>

        {/* SEO Preview */}
        <div className="space-y-2">
          <Label>Preview di Google</Label>
          <div className="p-4 bg-gray-50 border rounded-md">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
              {seo.title || 'Judul SEO akan muncul di sini'}
            </div>
            <div className="text-green-700 text-sm">
              {typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}/biolink
            </div>
            <div className="text-gray-600 text-sm mt-1">
              {seo.description || 'Deskripsi SEO akan muncul di sini untuk memberikan gambaran tentang halaman biolink Anda.'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}