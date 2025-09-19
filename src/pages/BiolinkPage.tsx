import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ExternalLink, Instagram, Twitter, Facebook, Youtube, Linkedin, Github, Globe, Mail, Phone } from 'lucide-react'

interface BiolinkData {
  id: string
  slug: string
  title: string
  description?: string
  profile?: {
    name: string
    bio: string
    avatar: string
    theme: string
  }
  links?: Array<{
    id: string
    title: string
    url: string
    description?: string
    is_active: boolean
    order: number
  }>
  social?: Array<{
    platform: string
    url: string
    username: string
  }>
  background?: {
    type: string
    color?: string
    gradientColors?: string[]
    imageUrl?: string
  }
  seo?: {
    title: string
    description: string
    keywords?: string
    schemaType?: string
    favicon?: string
    ampLink?: string
  }
  is_active: boolean
  view_count: number
}

const socialIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
  email: Mail,
  phone: Phone
}

export default function BiolinkPage() {
  const { username } = useParams<{ username: string }>()
  const [biolink, setBiolink] = useState<BiolinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seoApplied, setSeoApplied] = useState(false)

  useEffect(() => {
    console.log('🔍 =========================')
    console.log('🔍 BIOLINK PAGE SEO LOADING')
    console.log('🔍 =========================')
    console.log('🔍 Username:', username)
    
    const loadBiolinkWithSEO = async () => {
      if (!username) {
        setError('Username not provided')
        setLoading(false)
        return
      }

      try {
        console.log('🔍 Loading biolink from database...')
        const { data, error } = await supabase
          .from('app_16a5e1e6b3_biolinks')
          .select('*')
          .eq('slug', username)
          .eq('is_active', true)
          .single()

        if (error) {
          console.error('❌ Failed to load biolink:', error)
          setError('Biolink not found')
          setLoading(false)
          return
        }

        console.log('✅ Biolink loaded:', data)
        console.log('📝 SEO data found:', data.seo)
        setBiolink(data)

        // CRITICAL: Apply SEO immediately after loading
        if (data.seo) {
          console.log('🔧 Applying custom SEO settings...')
          await applyCustomSEO(data.seo, data)
          setSeoApplied(true)
        } else {
          console.log('❌ No SEO data found, using defaults')
          await applyDefaultSEO(data)
        }

        // Increment view count
        try {
          await supabase
            .from('app_16a5e1e6b3_biolinks')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id)
          console.log('✅ View count incremented')
        } catch (viewError) {
          console.error('❌ Failed to increment view count:', viewError)
        }

      } catch (error) {
        console.error('❌ Error loading biolink:', error)
        setError('Failed to load biolink')
      } finally {
        setLoading(false)
      }
    }

    loadBiolinkWithSEO()
  }, [username])

  // CRITICAL: Function to apply custom SEO tags
  const applyCustomSEO = async (seoData: any, biolinkData: any) => {
    console.log('🔧 =========================')
    console.log('🔧 APPLYING CUSTOM SEO TAGS')
    console.log('🔧 =========================')
    console.log('📝 SEO Data:', seoData)
    
    try {
      // 1. Update document title immediately
      if (seoData.title) {
        document.title = seoData.title
        console.log('✅ Document title updated:', seoData.title)
      }
      
      // 2. Update meta description
      if (seoData.description) {
        updateOrCreateMetaTag('name', 'description', seoData.description)
        console.log('✅ Meta description updated:', seoData.description)
      }
      
      // 3. Update meta keywords
      if (seoData.keywords) {
        updateOrCreateMetaTag('name', 'keywords', seoData.keywords)
        console.log('✅ Meta keywords updated:', seoData.keywords)
      }
      
      // 4. Update author
      updateOrCreateMetaTag('name', 'author', 'BioLink.ID')
      
      // 5. Update Open Graph tags
      if (seoData.title) {
        updateOrCreateMetaTag('property', 'og:title', seoData.title)
      }
      if (seoData.description) {
        updateOrCreateMetaTag('property', 'og:description', seoData.description)
      }
      updateOrCreateMetaTag('property', 'og:type', 'profile')
      updateOrCreateMetaTag('property', 'og:url', window.location.href)
      
      if (biolinkData.profile?.avatar) {
        updateOrCreateMetaTag('property', 'og:image', biolinkData.profile.avatar)
      }
      
      // 6. Update Twitter Card tags
      updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image')
      if (seoData.title) {
        updateOrCreateMetaTag('name', 'twitter:title', seoData.title)
      }
      if (seoData.description) {
        updateOrCreateMetaTag('name', 'twitter:description', seoData.description)
      }
      if (biolinkData.profile?.avatar) {
        updateOrCreateMetaTag('name', 'twitter:image', biolinkData.profile.avatar)
      }
      
      // 7. Add favicon if provided
      if (seoData.favicon) {
        updateFavicon(seoData.favicon)
        console.log('✅ Favicon updated:', seoData.favicon)
      }
      
      // 8. Add canonical link
      updateCanonicalLink(window.location.href)
      
      // 9. Add AMP link if provided
      if (seoData.ampLink) {
        updateAMPLink(seoData.ampLink)
        console.log('✅ AMP link added:', seoData.ampLink)
      }
      
      // 10. Add structured data schema
      if (seoData.schemaType) {
        addStructuredData(seoData, biolinkData)
        console.log('✅ Structured data added:', seoData.schemaType)
      }
      
      // 11. Verify SEO application
      setTimeout(() => {
        verifySEOApplication(seoData)
      }, 1000)
      
    } catch (error) {
      console.error('❌ Error applying custom SEO:', error)
    }
  }

  const applyDefaultSEO = async (biolinkData: any) => {
    const defaultTitle = `${biolinkData.title || biolinkData.profile?.name} - BioLink.ID`
    const defaultDescription = biolinkData.description || biolinkData.profile?.bio || 'Professional biolink page'
    
    document.title = defaultTitle
    updateOrCreateMetaTag('name', 'description', defaultDescription)
    updateOrCreateMetaTag('name', 'keywords', 'biolink, profile, social media, links')
  }
  
  // Helper function to update or create meta tags
  const updateOrCreateMetaTag = (attribute: string, name: string, content: string) => {
    // Remove existing meta tag
    const existing = document.querySelector(`meta[${attribute}="${name}"]`)
    if (existing) {
      existing.remove()
    }
    
    // Create new meta tag
    const meta = document.createElement('meta')
    meta.setAttribute(attribute, name)
    meta.content = content
    document.head.appendChild(meta)
    
    console.log(`✅ Meta tag updated: ${attribute}="${name}" content="${content}"`)
  }
  
  // Helper function to update favicon
  const updateFavicon = (faviconUrl: string) => {
    const existing = document.querySelector('link[rel="icon"]')
    if (existing) {
      existing.remove()
    }
    
    const favicon = document.createElement('link')
    favicon.rel = 'icon'
    favicon.href = faviconUrl
    favicon.type = 'image/png'
    document.head.appendChild(favicon)
  }
  
  // Helper function to update canonical link
  const updateCanonicalLink = (url: string) => {
    const existing = document.querySelector('link[rel="canonical"]')
    if (existing) {
      existing.remove()
    }
    
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = url
    document.head.appendChild(canonical)
  }
  
  // Helper function to add AMP link
  const updateAMPLink = (ampUrl: string) => {
    const existing = document.querySelector('link[rel="amphtml"]')
    if (existing) {
      existing.remove()
    }
    
    const ampLink = document.createElement('link')
    ampLink.rel = 'amphtml'
    ampLink.href = ampUrl
    document.head.appendChild(ampLink)
  }
  
  // Helper function to add structured data
  const addStructuredData = (seoData: any, biolinkData: any) => {
    const existing = document.querySelector('script[type="application/ld+json"]')
    if (existing) {
      existing.remove()
    }
    
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    
    const structuredData: any = {
      "@context": "https://schema.org",
      "@type": seoData.schemaType,
      "name": biolinkData.title || biolinkData.profile?.name,
      "description": seoData.description,
      "url": window.location.href
    }
    
    // Add additional fields based on schema type
    if (seoData.schemaType === 'LocalBusiness' || seoData.schemaType === 'Local Business') {
      structuredData.address = {
        "@type": "PostalAddress",
        "addressCountry": "ID"
      }
      structuredData.telephone = "+62-xxx-xxxx-xxxx"
      structuredData.priceRange = "$$"
    }
    
    if (seoData.schemaType === 'Organization') {
      structuredData.logo = biolinkData.profile?.avatar || ""
    }
    
    if (seoData.schemaType === 'Person') {
      structuredData.jobTitle = biolinkData.profile?.bio || ""
    }
    
    if (biolinkData.profile?.avatar) {
      structuredData.image = biolinkData.profile.avatar
    }
    
    if (biolinkData.social && biolinkData.social.length > 0) {
      structuredData.sameAs = biolinkData.social.map((s: any) => s.url)
    }
    
    script.textContent = JSON.stringify(structuredData, null, 2)
    document.head.appendChild(script)
  }
  
  // Function to verify SEO application
  const verifySEOApplication = (seoData: any) => {
    console.log('🔍 =========================')
    console.log('🔍 SEO VERIFICATION')
    console.log('🔍 =========================')
    
    const currentTitle = document.title
    const currentDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')
    const currentKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content')
    const ampLink = document.querySelector('link[rel="amphtml"]')?.getAttribute('href')
    const structuredData = document.querySelector('script[type="application/ld+json"]')?.textContent
    
    console.log('📝 Current title:', currentTitle)
    console.log('📝 Expected title:', seoData.title)
    console.log('📝 Title match:', currentTitle === seoData.title ? '✅' : '❌')
    
    console.log('📝 Current description:', currentDescription)
    console.log('📝 Expected description:', seoData.description)
    console.log('📝 Description match:', currentDescription === seoData.description ? '✅' : '❌')
    
    console.log('📝 Current keywords:', currentKeywords)
    console.log('📝 Expected keywords:', seoData.keywords)
    console.log('📝 Keywords match:', currentKeywords === seoData.keywords ? '✅' : '❌')
    
    console.log('📝 AMP link:', ampLink)
    console.log('📝 Expected AMP:', seoData.ampLink)
    console.log('📝 AMP match:', ampLink === seoData.ampLink ? '✅' : '❌')
    
    console.log('📝 Structured data:', structuredData ? 'Present' : 'Missing')
    
    // Check if all SEO elements are applied
    const seoSuccess = 
      currentTitle === seoData.title &&
      currentDescription === seoData.description &&
      currentKeywords === seoData.keywords &&
      ampLink === seoData.ampLink
    
    if (seoSuccess) {
      console.log('🎉 SEO APPLICATION SUCCESSFUL!')
    } else {
      console.log('❌ SEO APPLICATION FAILED!')
    }
  }

  // Generate background styles
  const getBackgroundStyle = () => {
    if (!biolink?.background) {
      return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    }

    const bg = biolink.background
    switch (bg.type) {
      case 'color':
        return { backgroundColor: bg.color || '#667eea' }
      case 'gradient':
        if (bg.gradientColors && bg.gradientColors.length >= 2) {
          return { background: `linear-gradient(135deg, ${bg.gradientColors[0]} 0%, ${bg.gradientColors[1]} 100%)` }
        }
        return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
      case 'image':
        return bg.imageUrl ? {
          backgroundImage: `url(${bg.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
      default:
        return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    }
  }

  const handleLinkClick = async (linkId: string, url: string) => {
    // Track link click (optional)
    try {
      console.log('🔗 Link clicked:', linkId, url)
    } catch (error) {
      console.error('❌ Failed to track link click:', error)
    }

    // Open link
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Generate SEO data for Helmet (backup)
  const generateHelmetSEO = () => {
    if (!biolink) return {
      title: 'Loading... - BioLink.ID',
      description: 'Loading biolink page...',
      keywords: 'biolink, profile'
    }
    
    if (biolink.seo) {
      return {
        title: biolink.seo.title,
        description: biolink.seo.description,
        keywords: biolink.seo.keywords || 'biolink, profile, social media, links',
        favicon: biolink.seo.favicon,
        ampLink: biolink.seo.ampLink
      }
    }
    
    return {
      title: `${biolink.title || biolink.profile?.name} - BioLink.ID`,
      description: biolink.description || biolink.profile?.bio || 'Professional biolink page',
      keywords: 'biolink, profile, social media, links'
    }
  }

  const helmetSEO = generateHelmetSEO()
  const currentUrl = `${window.location.origin}/#/${username}`

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... - BioLink.ID</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading biolink...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !biolink) {
    return (
      <>
        <Helmet>
          <title>Biolink Not Found - BioLink.ID</title>
          <meta name="description" content="The requested biolink page could not be found." />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Biolink Not Found</h1>
            <p className="text-gray-600">The biolink "{username}" does not exist or is not active.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* CRITICAL: Helmet as backup for SEO */}
      <Helmet>
        <title>{helmetSEO.title}</title>
        <meta name="description" content={helmetSEO.description} />
        <meta name="keywords" content={helmetSEO.keywords} />
        <meta name="author" content="BioLink.ID" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={helmetSEO.title} />
        <meta property="og:description" content={helmetSEO.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        {biolink.profile?.avatar && <meta property="og:image" content={biolink.profile.avatar} />}
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={helmetSEO.title} />
        <meta name="twitter:description" content={helmetSEO.description} />
        {biolink.profile?.avatar && <meta name="twitter:image" content={biolink.profile.avatar} />}
        
        {/* Favicon */}
        {helmetSEO.favicon && <link rel="icon" href={helmetSEO.favicon} type="image/png" />}
        
        {/* Canonical URL */}
        <link rel="canonical" href={currentUrl} />
        
        {/* AMP Link if provided */}
        {helmetSEO.ampLink && <link rel="amphtml" href={helmetSEO.ampLink} />}
      </Helmet>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '300px'
        }}>
          <div>SEO Debug:</div>
          <div>Applied: {seoApplied ? '✅' : '❌'}</div>
          <div>Title: {document.title}</div>
          <div>SEO Data: {biolink.seo ? 'Present' : 'Missing'}</div>
          {biolink.seo && (
            <div>
              <div>Custom Title: {biolink.seo.title}</div>
              <div>Custom Desc: {biolink.seo.description?.substring(0, 30)}...</div>
              <div>Keywords: {biolink.seo.keywords}</div>
              <div>Schema: {biolink.seo.schemaType}</div>
              <div>AMP: {biolink.seo.ampLink ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>
      )}

      {/* Biolink Page Content */}
      <div className="min-h-screen" style={getBackgroundStyle()}>
        <div className="container mx-auto px-4 py-8 max-w-md">
          {/* Profile Section */}
          <div className="text-center mb-8">
            {biolink.profile?.avatar && (
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                <AvatarImage src={biolink.profile.avatar} alt={biolink.profile.name || biolink.title} />
                <AvatarFallback className="text-2xl font-bold bg-white text-purple-600">
                  {(biolink.profile.name || biolink.title).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              {biolink.profile?.name || biolink.title}
            </h1>
            
            {biolink.profile?.bio && (
              <p className="text-white/90 text-sm mb-4 drop-shadow">
                {biolink.profile.bio}
              </p>
            )}
          </div>

          {/* Social Media Links */}
          {biolink.social && biolink.social.length > 0 && (
            <div className="flex justify-center space-x-4 mb-8">
              {biolink.social.map((social, index) => {
                const IconComponent = socialIcons[social.platform as keyof typeof socialIcons] || Globe
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    onClick={() => window.open(social.url, '_blank', 'noopener,noreferrer')}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                )
              })}
            </div>
          )}

          {/* Links Section */}
          <div className="space-y-4">
            {biolink.links && biolink.links.length > 0 ? (
              biolink.links
                .filter(link => link.is_active)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((link) => (
                  <Card
                    key={link.id}
                    className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
                    onClick={() => handleLinkClick(link.id, link.url)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="text-sm text-gray-600">
                              {link.description}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400 ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">No links available yet.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4">
            <p className="text-white/70 text-xs drop-shadow">
              Created with BioLink.ID
            </p>
          </div>
        </div>
      </div>
    </>
  )
}