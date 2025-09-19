import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Globe, 
  Mail, 
  Phone, 
  Instagram, 
  Twitter, 
  Youtube, 
  Github,
  Linkedin,
  ExternalLink,
  Eye,
  AlertTriangle
} from 'lucide-react'

interface BiolinkPreviewProps {
  biolink: any
}

export default function BiolinkPreview({ biolink }: BiolinkPreviewProps) {
  console.log('BiolinkPreview: Rendering with biolink:', biolink)
  
  // Safety check for biolink data
  if (!biolink) {
    console.log('BiolinkPreview: No biolink data provided')
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 text-sm">No preview data</p>
        </div>
      </div>
    )
  }

  const getIcon = (iconName: string) => {
    const icons: any = {
      globe: Globe,
      mail: Mail,
      phone: Phone,
      instagram: Instagram,
      twitter: Twitter,
      youtube: Youtube,
      github: Github,
      linkedin: Linkedin
    }
    return icons[iconName] || ExternalLink
  }

  const getSocialIcon = (platform: string) => {
    const icons: any = {
      instagram: Instagram,
      twitter: Twitter,
      youtube: Youtube,
      github: Github,
      linkedin: Linkedin
    }
    return icons[platform] || Globe
  }

  const getBackgroundStyle = () => {
    try {
      console.log('BiolinkPreview: Processing background:', biolink.background)
      
      if (!biolink.background) {
        console.log('BiolinkPreview: No background data, using default')
        return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
      }

      switch (biolink.background.type) {
        case 'solid':
          const solidColor = biolink.background.solidColor || '#667eea'
          console.log('BiolinkPreview: Using solid color:', solidColor)
          return { backgroundColor: solidColor }
          
        case 'gradient':
          const colors = biolink.background.gradientColors || ['#667eea', '#764ba2']
          const gradientStyle = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
          console.log('BiolinkPreview: Using gradient:', gradientStyle)
          return { background: gradientStyle }
          
        case 'rgb':
          const rgb = biolink.background.rgbColor || { r: 102, g: 126, b: 234 }
          const rgbColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
          console.log('BiolinkPreview: Using RGB color:', rgbColor)
          return { backgroundColor: rgbColor }
          
        case 'image':
          if (biolink.background.imageUrl) {
            console.log('BiolinkPreview: Using background image, URL length:', biolink.background.imageUrl.length)
            
            // Validate base64 image URL
            if (!biolink.background.imageUrl.startsWith('data:image/')) {
              console.error('BiolinkPreview: Invalid image URL format')
              return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
            }
            
            // Safe background image rendering with fallback
            return {
              backgroundImage: `url("${biolink.background.imageUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#667eea' // Fallback color
            }
          } else {
            console.log('BiolinkPreview: No image URL, using default')
            return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
          }
          
        default:
          console.log('BiolinkPreview: Unknown background type, using default')
          return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
      }
    } catch (error) {
      console.error('BiolinkPreview: Error processing background style:', error)
      return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    }
  }

  let backgroundStyle
  try {
    backgroundStyle = getBackgroundStyle()
    console.log('BiolinkPreview: Final background style:', backgroundStyle)
  } catch (error) {
    console.error('BiolinkPreview: Failed to get background style:', error)
    backgroundStyle = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  }

  return (
    <div className="h-full bg-gray-100 p-4">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
          <p className="text-sm text-gray-600">Preview biolink Anda</p>
        </div>
        
        {/* Mobile Frame */}
        <div className="bg-black rounded-[2.5rem] p-2 shadow-2xl">
          <div className="bg-white rounded-[2rem] overflow-hidden h-[600px]">
            {/* Biolink Content */}
            <div 
              className="min-h-full"
              style={backgroundStyle}
            >
              {/* Header */}
              <div className="bg-white/80 backdrop-blur-sm border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-purple-600">BioLink.ID</div>
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Eye className="h-3 w-3" />
                    <span>{biolink.view_count || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Profile Section */}
                <Card className="mb-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-6">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={biolink.profile?.avatar} />
                      <AvatarFallback className="text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                        {(biolink.profile?.name || biolink.title || 'U').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h1 className="text-lg font-bold text-gray-900 mb-2">
                      {biolink.profile?.name || biolink.title || 'Your Name'}
                    </h1>
                    
                    {biolink.profile?.bio && (
                      <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                        {biolink.profile.bio.length > 100 
                          ? `${biolink.profile.bio.substring(0, 100)}...` 
                          : biolink.profile.bio
                        }
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Links Section */}
                <div className="space-y-2 mb-4">
                  {biolink.links && biolink.links.length > 0 ? (
                    biolink.links.slice(0, 3).map((link: any, index: number) => {
                      const IconComponent = getIcon(link.icon)
                      return (
                        <Card 
                          key={link.id || index} 
                          className="bg-white/90 backdrop-blur-sm border-0 shadow-md"
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {link.title || 'Link Title'}
                                </h3>
                                {link.description && (
                                  <p className="text-xs text-gray-600 truncate">
                                    {link.description}
                                  </p>
                                )}
                              </div>
                              <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
                      <CardContent className="p-6 text-center">
                        <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs text-gray-500">Belum ada link</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {biolink.links && biolink.links.length > 3 && (
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-gray-600">
                          +{biolink.links.length - 3} link lainnya
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Social Media Section */}
                {biolink.social && biolink.social.length > 0 && (
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-4">
                    <CardContent className="py-4">
                      <h3 className="text-center text-sm font-semibold text-gray-900 mb-3">Follow Me</h3>
                      <div className="flex justify-center space-x-2">
                        {biolink.social.slice(0, 4).map((social: any, index: number) => {
                          const IconComponent = getSocialIcon(social.platform)
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="rounded-full w-8 h-8 p-0"
                            >
                              <IconComponent className="h-3 w-3" />
                            </Button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-white/80">
                  <p>Powered by <span className="font-semibold">BioLink.ID</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}