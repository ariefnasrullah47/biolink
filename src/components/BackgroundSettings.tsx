import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Palette, Rainbow, Hash, Image as ImageIcon, ExternalLink, AlertTriangle } from 'lucide-react'

interface BackgroundSettingsProps {
  background: {
    type: 'solid' | 'gradient' | 'rgb' | 'image'
    solidColor?: string
    gradientColors?: string[]
    rgbColor?: { r: number, g: number, b: number }
    imageUrl?: string
  }
  onChange: (background: any) => void
  disabled?: boolean
}

export default function BackgroundSettings({ background, onChange, disabled }: BackgroundSettingsProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)

  useEffect(() => {
    setImageUrl(background.imageUrl || '')
  }, [background.imageUrl])

  const presetGradients = [
    { name: 'Purple Blue', colors: ['#667eea', '#764ba2'] },
    { name: 'Sunset', colors: ['#ff9a9e', '#fecfef'] },
    { name: 'Ocean', colors: ['#2193b0', '#6dd5ed'] },
    { name: 'Forest', colors: ['#134e5e', '#71b280'] },
    { name: 'Fire', colors: ['#ff416c', '#ff4b2b'] },
    { name: 'Sky', colors: ['#4facfe', '#00f2fe'] },
    { name: 'Pink', colors: ['#f093fb', '#f5576c'] },
    { name: 'Green', colors: ['#43e97b', '#38f9d7'] }
  ]

  const presetSolidColors = [
    '#667eea', '#764ba2', '#ff9a9e', '#fecfef',
    '#2193b0', '#6dd5ed', '#134e5e', '#71b280',
    '#ff416c', '#ff4b2b', '#4facfe', '#00f2fe',
    '#f093fb', '#f5576c', '#43e97b', '#38f9d7',
    '#000000', '#ffffff', '#f3f4f6', '#1f2937'
  ]

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

  const handleTypeChange = (type: string) => {
    try {
      console.log('BackgroundSettings: Changing type to:', type)
      onChange({
        ...background,
        type: type as any
      })
    } catch (error) {
      console.error('BackgroundSettings: Error changing type:', error)
      toast.error('Gagal mengubah tipe background')
    }
  }

  const handleSolidColorChange = (color: string) => {
    try {
      console.log('BackgroundSettings: Changing solid color to:', color)
      onChange({
        ...background,
        type: 'solid',
        solidColor: color
      })
    } catch (error) {
      console.error('BackgroundSettings: Error changing solid color:', error)
      toast.error('Gagal mengubah warna')
    }
  }

  const handleGradientChange = (colors: string[]) => {
    try {
      console.log('BackgroundSettings: Changing gradient to:', colors)
      onChange({
        ...background,
        type: 'gradient',
        gradientColors: colors
      })
    } catch (error) {
      console.error('BackgroundSettings: Error changing gradient:', error)
      toast.error('Gagal mengubah gradient')
    }
  }

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    try {
      const newRgb = {
        ...background.rgbColor,
        [component]: Math.max(0, Math.min(255, value))
      }
      console.log('BackgroundSettings: Changing RGB to:', newRgb)
      onChange({
        ...background,
        type: 'rgb',
        rgbColor: newRgb
      })
    } catch (error) {
      console.error('BackgroundSettings: Error changing RGB:', error)
      toast.error('Gagal mengubah warna RGB')
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    
    const error = validateImageUrl(url)
    setUrlError(error)
    
    // Update background if valid
    if (!error && url.trim()) {
      setImageLoading(true)
      
      // Test if image loads
      const img = new Image()
      img.onload = () => {
        setImageLoading(false)
        onChange({
          ...background,
          type: 'image',
          imageUrl: url
        })
        toast.success('Background image berhasil dimuat!')
      }
      img.onerror = () => {
        setImageLoading(false)
        setUrlError('Gambar tidak dapat dimuat dari URL tersebut')
      }
      img.src = url
    } else if (!url.trim()) {
      // Clear image if URL is empty
      onChange({
        ...background,
        imageUrl: ''
      })
    }
  }

  const getCurrentBackgroundStyle = () => {
    try {
      switch (background.type) {
        case 'solid':
          return { backgroundColor: background.solidColor || '#667eea' }
        case 'gradient':
          const colors = background.gradientColors || ['#667eea', '#764ba2']
          return { background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }
        case 'rgb':
          const rgb = background.rgbColor || { r: 102, g: 126, b: 234 }
          return { backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }
        case 'image':
          return {
            backgroundImage: background.imageUrl ? `url(${background.imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }
        default:
          return { backgroundColor: '#667eea' }
      }
    } catch (error) {
      console.error('BackgroundSettings: Error getting background style:', error)
      return { backgroundColor: '#667eea' }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Background Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div 
            className="w-full h-20 rounded-lg border-2 border-dashed border-gray-300"
            style={getCurrentBackgroundStyle()}
          />
        </div>

        {/* Background Type Tabs */}
        <Tabs value={background.type} onValueChange={handleTypeChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="solid" className="flex items-center space-x-1">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Solid</span>
            </TabsTrigger>
            <TabsTrigger value="gradient" className="flex items-center space-x-1">
              <Rainbow className="h-4 w-4" />
              <span className="hidden sm:inline">Gradient</span>
            </TabsTrigger>
            <TabsTrigger value="rgb" className="flex items-center space-x-1">
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">RGB</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center space-x-1">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
          </TabsList>

          {/* Solid Color */}
          <TabsContent value="solid" className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Warna</Label>
              <div className="grid grid-cols-5 gap-2">
                {presetSolidColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-lg border-2 ${
                      background.solidColor === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleSolidColorChange(color)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-color">Custom Color</Label>
              <Input
                id="custom-color"
                type="color"
                value={background.solidColor || '#667eea'}
                onChange={(e) => handleSolidColorChange(e.target.value)}
                disabled={disabled}
                className="h-10"
              />
            </div>
          </TabsContent>

          {/* Gradient */}
          <TabsContent value="gradient" className="space-y-4">
            <div className="space-y-2">
              <Label>Preset Gradients</Label>
              <div className="grid grid-cols-2 gap-2">
                {presetGradients.map((gradient) => (
                  <button
                    key={gradient.name}
                    type="button"
                    className={`h-12 rounded-lg border-2 ${
                      JSON.stringify(background.gradientColors) === JSON.stringify(gradient.colors)
                        ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})` }}
                    onClick={() => handleGradientChange(gradient.colors)}
                    disabled={disabled}
                  >
                    <span className="text-white text-xs font-medium drop-shadow">
                      {gradient.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Start Color</Label>
                <Input
                  type="color"
                  value={background.gradientColors?.[0] || '#667eea'}
                  onChange={(e) => {
                    const colors = [...(background.gradientColors || ['#667eea', '#764ba2'])]
                    colors[0] = e.target.value
                    handleGradientChange(colors)
                  }}
                  disabled={disabled}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>End Color</Label>
                <Input
                  type="color"
                  value={background.gradientColors?.[1] || '#764ba2'}
                  onChange={(e) => {
                    const colors = [...(background.gradientColors || ['#667eea', '#764ba2'])]
                    colors[1] = e.target.value
                    handleGradientChange(colors)
                  }}
                  disabled={disabled}
                  className="h-10"
                />
              </div>
            </div>
          </TabsContent>

          {/* RGB */}
          <TabsContent value="rgb" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="rgb-r">Red (0-255)</Label>
                <Input
                  id="rgb-r"
                  type="number"
                  min="0"
                  max="255"
                  value={background.rgbColor?.r || 102}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rgb-g">Green (0-255)</Label>
                <Input
                  id="rgb-g"
                  type="number"
                  min="0"
                  max="255"
                  value={background.rgbColor?.g || 126}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rgb-b">Blue (0-255)</Label>
                <Input
                  id="rgb-b"
                  type="number"
                  min="0"
                  max="255"
                  value={background.rgbColor?.b || 234}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>RGB Preview</Label>
              <div className="p-2 bg-gray-100 rounded-md">
                <code className="text-sm">
                  rgb({background.rgbColor?.r || 102}, {background.rgbColor?.g || 126}, {background.rgbColor?.b || 234})
                </code>
              </div>
            </div>
          </TabsContent>

          {/* Image URL Input */}
          <TabsContent value="image" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Background Image URL</Label>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <Input
                  id="image-url"
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  disabled={disabled || imageLoading}
                  className={urlError ? "border-red-500" : ""}
                />
              </div>
              
              {/* URL Requirements */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• URL harus berakhiran .png, .jpg, atau .webp</p>
                <p>• Maksimal 50 karakter</p>
                <p>• Contoh: https://i.imgur.com/image.jpg</p>
              </div>
              
              {/* Error Display */}
              {urlError && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{urlError}</span>
                </div>
              )}
              
              {/* Loading State */}
              {imageLoading && (
                <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-700">Memuat gambar...</span>
                </div>
              )}
            </div>
            
            {/* Image Preview */}
            {background.imageUrl && !urlError && (
              <div className="space-y-2">
                <Label>Current Background</Label>
                <div 
                  className="w-full h-32 rounded-lg border"
                  style={{
                    backgroundImage: `url(${background.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      setImageUrl('')
                      onChange({ ...background, imageUrl: '' })
                      toast.success('Background image dihapus')
                    } catch (error) {
                      console.error('Error removing image:', error)
                      toast.error('Gagal menghapus gambar')
                    }
                  }}
                  disabled={disabled}
                >
                  Remove Image
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}