import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ExternalLink, TrendingUp, Clock, Users, Link as LinkIcon } from 'lucide-react'

export default function DirectoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')

  useEffect(() => {
    loadDirectoryItems()
  }, [])

  useEffect(() => {
    filterAndSortItems()
  }, [items, searchQuery, selectedCategory, sortBy])

  const loadDirectoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('directory_items')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('click_count', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error loading directory:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortItems = () => {
    let filtered = [...items]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Sort items
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => b.click_count - a.click_count)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredItems(filtered)
  }

  const handleItemClick = async (item: any) => {
    // Update click count
    await supabase
      .from('directory_items')
      .update({ click_count: item.click_count + 1 })
      .eq('id', item.id)

    // Open link
    window.open(item.url, '_blank')
  }

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'creator', label: 'Creator' },
    { value: 'business', label: 'Bisnis' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'blog', label: 'Blog' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'other', label: 'Lainnya' }
  ]

  const sortOptions = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'newest', label: 'Terbaru', icon: Clock },
    { value: 'alphabetical', label: 'A-Z', icon: Users }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Direktori Publik</h1>
              <p className="text-gray-600 mt-2">
                Temukan biolink dan shortlink trending dari creator Indonesia
              </p>
            </div>
            <Button onClick={() => window.location.href = '/'}>
              Buat Biolink
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari biolink, creator, atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-sm text-gray-600">Total Link</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {items.reduce((sum, item) => sum + item.click_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Klik</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(items.map(item => item.user_id)).size}
              </div>
              <div className="text-sm text-gray-600">Creator Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Items */}
      <section className="container mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada hasil</h3>
            <p className="text-gray-600">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        oleh {item.profiles?.display_name || 'Creator'}
                      </CardDescription>
                    </div>
                    {item.is_featured && (
                      <Badge variant="secondary" className="ml-2">
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {item.click_count} klik
                      </div>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {categories.find(c => c.value === item.category)?.label}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">
            Ingin tampil di direktori?{' '}
            <a href="/" className="text-blue-600 hover:underline">
              Buat biolink Anda sekarang
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}