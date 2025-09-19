import React, { useState, useEffect } from 'react'
import { Plus, ExternalLink, Edit, Trash2, Copy, Eye, BarChart3, Settings, Users, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import EditBiolinkModal from './EditBiolinkModal'
import EditShortlinkModal from './EditShortlinkModal'
import { supabase, saveBiolinkToDatabase, loadBiolinksFromDatabase, saveShortlinkToDatabase, loadShortlinksFromDatabase, isDemoMode, showDemoNotice } from '@/lib/supabase'

export default function Dashboard() {
  const [biolinks, setBiolinks] = useState([])
  const [shortlinks, setShortlinks] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isShortlinkModalOpen, setIsShortlinkModalOpen] = useState(false)
  const [editingBiolink, setEditingBiolink] = useState(null)
  const [editingShortlink, setEditingShortlink] = useState(null)
  const [loading, setLoading] = useState(true)

  // Helper function to get biolink URL with hash routing
  const getBiolinkUrl = (slug) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/#/${slug}`
  }

  // Helper function to get shortlink URL
  const getShortlinkUrl = (slug) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/#/s/${slug}`
  }

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    console.log('🔄 Loading dashboard data...')
    setLoading(true)
    
    try {
      // Load biolinks and shortlinks from database
      const [loadedBiolinks, loadedShortlinks] = await Promise.all([
        loadBiolinksFromDatabase(),
        loadShortlinksFromDatabase()
      ])
      
      console.log('✅ Data loaded:', { 
        biolinks: loadedBiolinks?.length || 0, 
        shortlinks: loadedShortlinks?.length || 0 
      })
      
      setBiolinks(loadedBiolinks || [])
      setShortlinks(loadedShortlinks || [])
      
    } catch (error) {
      console.error('❌ Failed to load data:', error)
      toast.error('Failed to load data from database')
      setBiolinks([])
      setShortlinks([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBiolink = () => {
    console.log('🔧 Creating new biolink...')
    setEditingBiolink(null)
    setIsEditModalOpen(true)
  }

  const handleEditBiolink = (biolink) => {
    console.log('✏️ Editing biolink:', biolink.slug)
    setEditingBiolink(biolink)
    setIsEditModalOpen(true)
  }

  const handleSaveBiolink = async (biolinkData) => {
    console.log('💾 Saving biolink...', biolinkData)
    
    try {
      if (editingBiolink) {
        // CRITICAL FIX: Handle existing biolink update properly
        console.log('🔧 Updating existing biolink:', editingBiolink.id)
        
        const currentBiolink = biolinks.find(b => b.id === editingBiolink.id)
        const updateData = { ...biolinkData }
        
        // CRITICAL: Remove slug from update if it's the same as current
        if (currentBiolink && currentBiolink.slug === biolinkData.slug) {
          console.log('🔍 Slug unchanged, removing from update data to avoid constraint violation')
          delete updateData.slug
        } else {
          // Check if new slug conflicts with other biolinks
          const slugConflict = biolinks.find(b => 
            b.slug.toLowerCase() === biolinkData.slug.toLowerCase() && b.id !== editingBiolink.id
          )
          if (slugConflict) {
            toast.error('Slug sudah digunakan oleh biolink lain, pilih slug yang berbeda')
            return
          }
        }
        
        // CRITICAL FIX: Remove updated_at - column doesn't exist in database
        delete updateData.updated_at
        
        // Remove any undefined or null values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined || updateData[key] === null) {
            delete updateData[key]
          }
        })
        
        console.log('🔍 Final update data (cleaned, no updated_at):', updateData)
        
        // Update in database without updated_at
        const { data, error } = await supabase
          .from('app_16a5e1e6b3_biolinks')
          .update(updateData)
          .eq('id', editingBiolink.id)
          .select()
        
        if (error) {
          console.error('❌ Failed to update biolink in database:', error)
          
          // Handle specific constraint errors
          if (error.code === '23505' && error.constraint?.includes('slug')) {
            toast.error('Slug sudah digunakan. Pilih slug yang berbeda.')
          } else {
            toast.error('Gagal mengupdate biolink: ' + error.message)
          }
          return
        }
        
        console.log('✅ Biolink updated in database:', data[0])
        
        // Update local state with merged data
        const updatedBiolink = { ...currentBiolink, ...biolinkData }
        setBiolinks(prev => prev.map(b => 
          b.id === editingBiolink.id ? updatedBiolink : b
        ))
        
        toast.success('Biolink berhasil diupdate!')
        
      } else {
        // Create new biolink
        const savedBiolink = await saveBiolinkToDatabase(biolinkData)
        console.log('✅ New biolink saved:', savedBiolink)
        
        setBiolinks(prev => [savedBiolink, ...prev])
        toast.success('Biolink berhasil dibuat!')
      }
      
      setIsEditModalOpen(false)
      setEditingBiolink(null)
      
    } catch (error) {
      console.error('❌ Failed to save biolink:', error)
      
      // Handle constraint errors
      if (error.message?.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('slug')) {
          toast.error('Slug sudah digunakan. Pilih slug yang berbeda.')
        } else {
          toast.error('Data sudah ada. Periksa nilai yang dimasukkan.')
        }
      } else {
        toast.error('Gagal menyimpan biolink: ' + error.message)
      }
    }
  }

  const handleDeleteBiolink = async (biolink) => {
    if (!confirm('Are you sure you want to delete this biolink?')) return
    
    console.log('🗑️ Deleting biolink:', biolink.slug)
    
    try {
      const { error } = await supabase
        .from('app_16a5e1e6b3_biolinks')
        .delete()
        .eq('id', biolink.id)
      
      if (error) throw error
      
      setBiolinks(prev => prev.filter(b => b.id !== biolink.id))
      toast.success('Biolink deleted successfully!')
      
    } catch (error) {
      console.error('❌ Failed to delete biolink:', error)
      toast.error('Failed to delete biolink: ' + error.message)
    }
  }

  const handleCreateShortlink = () => {
    console.log('🔧 Creating new shortlink...')
    setEditingShortlink(null)
    setIsShortlinkModalOpen(true)
  }

  const handleEditShortlink = (shortlink) => {
    console.log('✏️ Editing shortlink:', shortlink.slug)
    setEditingShortlink(shortlink)
    setIsShortlinkModalOpen(true)
  }

  const handleSaveShortlink = async (shortlinkData) => {
    console.log('💾 Saving shortlink...', shortlinkData)
    
    try {
      if (editingShortlink) {
        // Update existing shortlink
        console.log('🔧 Updating existing shortlink:', editingShortlink.id)
        
        const currentShortlink = shortlinks.find(s => s.id === editingShortlink.id)
        const updateData = { ...shortlinkData }
        
        // Handle slug conflicts for shortlinks too
        if (currentShortlink && currentShortlink.slug === shortlinkData.slug) {
          console.log('🔍 Shortlink slug unchanged, removing from update data')
          delete updateData.slug
        } else {
          // Check for slug conflicts
          const slugConflict = shortlinks.find(s => 
            s.slug.toLowerCase() === shortlinkData.slug.toLowerCase() && s.id !== editingShortlink.id
          )
          if (slugConflict) {
            toast.error('Slug sudah digunakan oleh shortlink lain, pilih slug yang berbeda')
            return
          }
        }
        
        // Map to database column names and remove updated_at
        const dbUpdateData = {
          title: updateData.title || updateData.slug,
          short_code: updateData.slug,
          original_url: updateData.target_url,
          is_active: updateData.is_active !== false
          // CRITICAL FIX: Remove updated_at completely
        }
        
        // Remove slug from database update if unchanged
        if (!updateData.slug) {
          delete dbUpdateData.short_code
        }
        
        // Remove any undefined values
        Object.keys(dbUpdateData).forEach(key => {
          if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
            delete dbUpdateData[key]
          }
        })
        
        const { data, error } = await supabase
          .from('app_16a5e1e6b3_shortlinks')
          .update(dbUpdateData)
          .eq('id', editingShortlink.id)
          .select()
        
        if (error) {
          console.error('❌ Failed to update shortlink in database:', error)
          
          if (error.code === '23505' && error.constraint?.includes('short_code')) {
            toast.error('Slug sudah digunakan. Pilih slug yang berbeda.')
          } else {
            toast.error('Gagal mengupdate shortlink: ' + error.message)
          }
          return
        }
        
        console.log('✅ Shortlink updated in database:', data[0])
        
        // Update local state
        const updatedShortlink = {
          ...currentShortlink,
          ...shortlinkData,
          slug: data[0].short_code,
          target_url: data[0].original_url,
          click_count: data[0].clicks || data[0].click_count || 0
        }
        
        setShortlinks(prev => prev.map(s => 
          s.id === editingShortlink.id ? updatedShortlink : s
        ))
        
        toast.success('Shortlink berhasil diupdate!')
        
      } else {
        // Create new shortlink
        const savedShortlink = await saveShortlinkToDatabase(shortlinkData)
        console.log('✅ New shortlink saved:', savedShortlink)
        
        setShortlinks(prev => [savedShortlink, ...prev])
        toast.success('Shortlink berhasil dibuat!')
      }
      
      setIsShortlinkModalOpen(false)
      setEditingShortlink(null)
      
    } catch (error) {
      console.error('❌ Failed to save shortlink:', error)
      
      if (error.message?.includes('duplicate key value violates unique constraint')) {
        toast.error('Slug sudah digunakan. Pilih slug yang berbeda.')
      } else {
        toast.error('Gagal menyimpan shortlink: ' + error.message)
      }
    }
  }

  const handleDeleteShortlink = async (shortlink) => {
    if (!confirm('Are you sure you want to delete this shortlink?')) return
    
    console.log('🗑️ Deleting shortlink:', shortlink.slug)
    
    try {
      const { error } = await supabase
        .from('app_16a5e1e6b3_shortlinks')
        .delete()
        .eq('id', shortlink.id)
      
      if (error) throw error
      
      setShortlinks(prev => prev.filter(s => s.id !== shortlink.id))
      toast.success('Shortlink deleted successfully!')
      
    } catch (error) {
      console.error('❌ Failed to delete shortlink:', error)
      toast.error('Failed to delete shortlink: ' + error.message)
    }
  }

  const copyToClipboard = (text, type = 'URL') => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your biolinks and shortlinks</p>
          
          {/* Show demo notice if in demo mode */}
          {showDemoNotice() && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Demo Mode:</strong> You're using demo mode. Data is stored locally and won't persist across browsers or devices.
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Biolinks</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{biolinks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shortlinks</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shortlinks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {biolinks.reduce((sum, b) => sum + (b.view_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {shortlinks.reduce((sum, s) => sum + (s.click_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="biolinks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="biolinks">Biolinks</TabsTrigger>
            <TabsTrigger value="shortlinks">Shortlinks</TabsTrigger>
          </TabsList>

          {/* Biolinks Tab */}
          <TabsContent value="biolinks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Biolinks</h2>
                <p className="text-gray-600">Create and manage your biolink pages</p>
              </div>
              <Button onClick={handleCreateBiolink}>
                <Plus className="h-4 w-4 mr-2" />
                Create Biolink
              </Button>
            </div>

            {biolinks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No biolinks yet</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Create your first biolink to get started with sharing all your links in one place.
                  </p>
                  <Button onClick={handleCreateBiolink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Biolink
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biolinks.map((biolink) => (
                  <Card key={biolink.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{biolink.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {biolink.description || 'No description'}
                          </CardDescription>
                        </div>
                        <Badge variant={biolink.is_active ? 'default' : 'secondary'}>
                          {biolink.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* URL Display with Hash Routing */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                            {getBiolinkUrl(biolink.slug)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(getBiolinkUrl(biolink.slug), 'Biolink URL')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between text-sm text-gray-600">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {biolink.view_count || 0} views
                          </span>
                          <span className="flex items-center">
                            <LinkIcon className="h-4 w-4 mr-1" />
                            {biolink.links?.length || 0} links
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getBiolinkUrl(biolink.slug), '_blank')}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBiolink(biolink)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBiolink(biolink)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Shortlinks Tab */}
          <TabsContent value="shortlinks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Shortlinks</h2>
                <p className="text-gray-600">Create and manage your short URLs</p>
              </div>
              <Button onClick={handleCreateShortlink}>
                <Plus className="h-4 w-4 mr-2" />
                Create Shortlink
              </Button>
            </div>

            {shortlinks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LinkIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No shortlinks yet</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Create your first shortlink to start shortening and tracking your URLs.
                  </p>
                  <Button onClick={handleCreateShortlink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Shortlink
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {shortlinks.map((shortlink) => (
                  <Card key={shortlink.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {shortlink.title}
                              </h3>
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">Short URL:</span>
                                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                    {getShortlinkUrl(shortlink.slug)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(getShortlinkUrl(shortlink.slug), 'Short URL')}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">Target:</span>
                                  <span className="text-sm text-gray-700 truncate">
                                    {shortlink.target_url}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                  {shortlink.click_count || 0}
                                </div>
                                <div className="text-sm text-gray-500">clicks</div>
                              </div>
                              <Badge variant={shortlink.is_active ? 'default' : 'secondary'}>
                                {shortlink.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getShortlinkUrl(shortlink.slug), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditShortlink(shortlink)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteShortlink(shortlink)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <EditBiolinkModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingBiolink(null)
        }}
        onSave={handleSaveBiolink}
        biolink={editingBiolink}
      />

      <EditShortlinkModal
        isOpen={isShortlinkModalOpen}
        onClose={() => {
          setIsShortlinkModalOpen(false)
          setEditingShortlink(null)
        }}
        onSave={handleSaveShortlink}
        shortlink={editingShortlink}
      />
    </div>
  )
}