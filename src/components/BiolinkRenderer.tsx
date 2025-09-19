import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Linkedin, 
  Github,
  Mail,
  ExternalLink,
  Play
} from 'lucide-react'

interface Block {
  id: string
  block_type: string
  properties: any
  display_order: number
  is_visible: boolean
}

interface BiolinkRendererProps {
  username: string
}

export default function BiolinkRenderer({ username }: BiolinkRendererProps) {
  const [page, setPage] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBiolinkPage()
  }, [username])

  const loadBiolinkPage = async () => {
    try {
      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) throw new Error('Halaman tidak ditemukan')
      setProfile(profileData)

      // Get biolink page
      const { data: pageData, error: pageError } = await supabase
        .from('biolink_pages')
        .select('*')
        .eq('user_id', profileData.user_id)
        .eq('is_public', true)
        .single()

      if (pageError) throw new Error('Halaman tidak tersedia')
      setPage(pageData)

      // Get blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('blocks')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('is_visible', true)
        .order('display_order')

      if (blocksError) throw blocksError
      setBlocks(blocksData || [])

      // Log page view
      await supabase
        .from('analytics_events')
        .insert({
          page_id: pageData.id,
          event_type: 'page_view',
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          user_agent: navigator.userAgent
        })

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockClick = async (block: Block) => {
    // Log block interaction
    await supabase
      .from('analytics_events')
      .insert({
        page_id: page.id,
        event_type: 'block_click',
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        user_agent: navigator.userAgent
      })
  }

  const renderBlock = (block: Block) => {
    const { block_type, properties } = block

    switch (block_type) {
      case 'avatar':
        return (
          <div className="flex justify-center mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={properties.image_url || profile?.avatar_url} alt={properties.alt_text} />
              <AvatarFallback className="text-2xl">
                {profile?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        )

      case 'heading':
        const HeadingTag = properties.level || 'h2'
        return (
          <div className="text-center mb-6">
            <HeadingTag className={`font-bold ${
              HeadingTag === 'h1' ? 'text-3xl' : 
              HeadingTag === 'h2' ? 'text-2xl' : 'text-xl'
            }`}>
              {properties.text || profile?.display_name || 'Nama Pengguna'}
            </HeadingTag>
            {profile?.bio && (
              <p className="text-gray-600 mt-2">{profile.bio}</p>
            )}
          </div>
        )

      case 'button':
        return (
          <Button
            className="w-full mb-4"
            variant={properties.style === 'secondary' ? 'secondary' : 'default'}
            onClick={() => {
              handleBlockClick(block)
              window.open(properties.url, '_blank')
            }}
          >
            {properties.text || 'Klik Disini'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )

      case 'social':
        const socialIcons = {
          instagram: Instagram,
          twitter: Twitter,
          facebook: Facebook,
          youtube: Youtube,
          linkedin: Linkedin,
          github: Github,
          email: Mail
        }

        return (
          <div className="flex justify-center space-x-4 mb-6">
            {properties.platforms?.map((platform: any, index: number) => {
              const IconComponent = socialIcons[platform.name as keyof typeof socialIcons]
              if (!IconComponent) return null

              return (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    handleBlockClick(block)
                    window.open(platform.url, '_blank')
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              )
            })}
          </div>
        )

      case 'youtube':
        return (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${properties.video_id}/maxresdefault.jpg`}
                  alt={properties.title || 'YouTube Video'}
                  className="w-full h-full object-cover"
                />
                <Button
                  className="absolute inset-0 bg-black/50 hover:bg-black/60"
                  variant="ghost"
                  onClick={() => {
                    handleBlockClick(block)
                    window.open(`https://youtube.com/watch?v=${properties.video_id}`, '_blank')
                  }}
                >
                  <Play className="h-12 w-12 text-white" />
                </Button>
              </div>
              {properties.title && (
                <div className="p-4">
                  <h3 className="font-semibold">{properties.title}</h3>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'email':
        return (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  {properties.title || 'Berlangganan Newsletter'}
                </h3>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder={properties.placeholder || 'Masukkan email Anda'}
                    className="flex-1"
                  />
                  <Button onClick={() => handleBlockClick(block)}>
                    {properties.button_text || 'Berlangganan'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'image':
        return (
          <Card className="mb-6">
            <CardContent className="p-0">
              <img
                src={properties.image_url}
                alt={properties.alt_text || 'Gambar'}
                className="w-full rounded-lg"
                onClick={() => handleBlockClick(block)}
              />
              {properties.caption && (
                <div className="p-4">
                  <p className="text-sm text-gray-600">{properties.caption}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'cta':
        return (
          <Button
            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => {
              handleBlockClick(block)
              window.open(properties.url, '_blank')
            }}
          >
            {properties.text || 'Call to Action'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Halaman Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/'}>
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ 
        backgroundColor: page?.theme_color ? `${page.theme_color}10` : '#f9fafb',
        fontFamily: page?.font_family || 'Inter'
      }}
    >
      <div className="max-w-md mx-auto">
        {blocks.map((block) => (
          <div key={block.id}>
            {renderBlock(block)}
          </div>
        ))}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-sm text-gray-500">
            Dibuat dengan{' '}
            <a href="/" className="text-blue-600 hover:underline">
              BioLink.ID
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}