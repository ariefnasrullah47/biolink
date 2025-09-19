import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export default function ShortlinkRedirect() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [shortlink, setShortlink] = useState<any>(null)
  const [countdown, setCountdown] = useState(3)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    console.log('ShortlinkRedirect: Loading shortlink for slug:', slug)
    
    const fetchShortlink = async () => {
      try {
        // Get shortlinks from localStorage
        const storedShortlinks = localStorage.getItem('shortlinks')
        let shortlinks = []
        
        if (storedShortlinks) {
          shortlinks = JSON.parse(storedShortlinks)
          console.log('ShortlinkRedirect: Found stored shortlinks:', shortlinks)
        }
        
        // Add default demo shortlinks
        const defaultShortlinks = [
          {
            id: '1',
            slug: 'testredirect',
            target_url: 'https://www.theguardian.com/',
            title: 'Test Redirect',
            click_count: 2,
            is_active: true,
            created_at: '2024-01-15'
          },
          {
            id: '2',
            slug: 'profile',
            target_url: 'https://github.com/profile',
            title: 'GitHub Profile',
            click_count: 1,
            is_active: true,
            created_at: '2024-01-16'
          }
        ]
        
        // Merge stored and default shortlinks
        const allShortlinks = [...defaultShortlinks, ...shortlinks]
        console.log('ShortlinkRedirect: All shortlinks:', allShortlinks)
        
        // Find shortlink by slug
        const foundShortlink = allShortlinks.find(s => s.slug === slug && s.is_active)
        console.log('ShortlinkRedirect: Looking for slug:', slug, 'Found:', foundShortlink)
        
        if (foundShortlink) {
          setShortlink(foundShortlink)
          
          // Increment click count
          foundShortlink.click_count = (foundShortlink.click_count || 0) + 1
          
          // Update localStorage if this is a user-created shortlink
          if (shortlinks.find(s => s.slug === slug)) {
            localStorage.setItem('shortlinks', JSON.stringify(shortlinks))
          }
          
          console.log('ShortlinkRedirect: Shortlink loaded successfully:', foundShortlink)
        } else {
          console.log('ShortlinkRedirect: Shortlink not found or inactive for slug:', slug)
          setNotFound(true)
        }
      } catch (error) {
        console.error('ShortlinkRedirect: Error fetching shortlink:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchShortlink()
  }, [slug])

  useEffect(() => {
    if (shortlink && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (shortlink && countdown === 0) {
      // Auto redirect after countdown
      window.location.href = shortlink.target_url
    }
  }, [shortlink, countdown])

  const handleRedirectNow = () => {
    if (shortlink) {
      console.log('ShortlinkRedirect: Manual redirect to:', shortlink.target_url)
      window.location.href = shortlink.target_url
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Memuat...</span>
        </div>
      </div>
    )
  }

  if (notFound || !shortlink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">Link yang Anda cari tidak ditemukan atau sudah tidak aktif.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mengalihkan...</h1>
            <p className="text-gray-600 mb-4">Anda akan diarahkan ke {shortlink.title || 'tujuan'} dalam</p>
          </div>
          
          <div className="mb-8">
            <div className="text-6xl font-bold text-purple-600 mb-2">{countdown}</div>
            <p className="text-gray-500">detik</p>
          </div>
          
          <div className="space-y-3">
            <Button onClick={handleRedirectNow} className="w-full" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              Lanjutkan Sekarang
            </Button>
            
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}