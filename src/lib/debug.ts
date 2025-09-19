import { supabase } from './supabase'

export const debugSupabaseConnection = async () => {
  console.log('🔍 =========================')
  console.log('🔍 SUPABASE CONNECTION DEBUG')
  console.log('🔍 =========================')
  
  try {
    // Test Supabase client
    console.log('🔍 Supabase client:', supabase)
    console.log('🔍 Supabase URL:', supabase.supabaseUrl)
    console.log('🔍 Supabase Key:', supabase.supabaseKey?.substring(0, 20) + '...')
    
    // Test authentication
    console.log('🔍 Testing authentication...')
    const { data: user, error: authError } = await supabase.auth.getUser()
    console.log('🔍 Current user:', user)
    console.log('🔍 Auth error:', authError)
    
    // Test database connection
    console.log('🔍 Testing database connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('app_16a5e1e6b3_biolinks')
      .select('count', { count: 'exact' })
      .limit(1)
    
    console.log('🔍 Connection test result:', connectionTest)
    console.log('🔍 Connection error:', connectionError)
    
    // Test table structure
    console.log('🔍 Testing table access...')
    const { data: tableTest, error: tableError } = await supabase
      .from('app_16a5e1e6b3_biolinks')
      .select('*')
      .limit(1)
    
    console.log('🔍 Table test result:', tableTest)
    console.log('🔍 Table error:', tableError)
    
    // Test insert permission (will fail if no auth, but that's expected)
    console.log('🔍 Testing insert permission...')
    const { data: insertTest, error: insertError } = await supabase
      .from('app_16a5e1e6b3_biolinks')
      .insert([{
        title: 'Debug Test',
        slug: `debug-${Date.now()}`,
        description: 'Debug test biolink',
        profile: {},
        links: [],
        social: [],
        background: {},
        seo: {}
      }])
      .select()
    
    console.log('🔍 Insert test result:', insertTest)
    console.log('🔍 Insert error:', insertError)
    
    return {
      client: !!supabase,
      auth: { user, error: authError },
      connection: { data: connectionTest, error: connectionError },
      table: { data: tableTest, error: tableError },
      insert: { data: insertTest, error: insertError }
    }
    
  } catch (error) {
    console.error('🔍 Supabase debug failed:', error)
    return { error }
  }
}

export const debugSEOImplementation = (biolink: any) => {
  console.log('🔍 =========================')
  console.log('🔍 SEO IMPLEMENTATION DEBUG')
  console.log('🔍 =========================')
  
  console.log('🔍 Biolink data:', biolink)
  console.log('🔍 SEO data:', biolink?.seo)
  
  if (!biolink?.seo) {
    console.log('❌ No SEO data found!')
    return { success: false, reason: 'No SEO data' }
  }
  
  const results = {
    title: { attempted: false, success: false, value: null },
    description: { attempted: false, success: false, value: null },
    keywords: { attempted: false, success: false, value: null },
    metaTags: []
  }
  
  try {
    // Test title update
    if (biolink.seo.title) {
      results.title.attempted = true
      const newTitle = `BioLink.ID | ${biolink.seo.title}`
      console.log('🔍 Attempting to set title:', newTitle)
      
      const originalTitle = document.title
      document.title = newTitle
      
      setTimeout(() => {
        const currentTitle = document.title
        results.title.success = currentTitle === newTitle
        results.title.value = currentTitle
        console.log('🔍 Title update result:', {
          original: originalTitle,
          attempted: newTitle,
          current: currentTitle,
          success: results.title.success
        })
      }, 100)
    }
    
    // Test meta description
    if (biolink.seo.description) {
      results.description.attempted = true
      const descContent = `BioLink.ID | ${biolink.seo.description}`
      console.log('🔍 Attempting to set description:', descContent)
      
      // Remove existing
      const existingDesc = document.querySelector('meta[name="description"]')
      if (existingDesc) {
        existingDesc.remove()
        console.log('🔍 Removed existing description meta')
      }
      
      // Create new
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = descContent
      document.head.appendChild(meta)
      
      // Verify
      setTimeout(() => {
        const verification = document.querySelector('meta[name="description"]')
        results.description.success = verification?.getAttribute('content') === descContent
        results.description.value = verification?.getAttribute('content')
        console.log('🔍 Description update result:', {
          attempted: descContent,
          current: verification?.getAttribute('content'),
          success: results.description.success
        })
      }, 100)
    }
    
    // Test keywords
    if (biolink.seo.keywords) {
      results.keywords.attempted = true
      console.log('🔍 Attempting to set keywords:', biolink.seo.keywords)
      
      // Remove existing
      const existingKeywords = document.querySelector('meta[name="keywords"]')
      if (existingKeywords) {
        existingKeywords.remove()
        console.log('🔍 Removed existing keywords meta')
      }
      
      // Create new
      const meta = document.createElement('meta')
      meta.name = 'keywords'
      meta.content = biolink.seo.keywords
      document.head.appendChild(meta)
      
      // Verify
      setTimeout(() => {
        const verification = document.querySelector('meta[name="keywords"]')
        results.keywords.success = verification?.getAttribute('content') === biolink.seo.keywords
        results.keywords.value = verification?.getAttribute('content')
        console.log('🔍 Keywords update result:', {
          attempted: biolink.seo.keywords,
          current: verification?.getAttribute('content'),
          success: results.keywords.success
        })
      }, 100)
    }
    
    // Log all meta tags
    setTimeout(() => {
      const allMetas = document.querySelectorAll('meta')
      results.metaTags = Array.from(allMetas).map(meta => ({
        name: meta.name || meta.getAttribute('property'),
        content: meta.content,
        attribute: meta.getAttribute('property') ? 'property' : 'name'
      }))
      
      console.log('🔍 All meta tags in head:', results.metaTags)
      console.log('🔍 SEO debug results:', results)
    }, 200)
    
    return results
    
  } catch (error) {
    console.error('🔍 SEO debug failed:', error)
    return { error }
  }
}

export const debugLocalStorage = () => {
  console.log('🔍 =========================')
  console.log('🔍 LOCALSTORAGE DEBUG')
  console.log('🔍 =========================')
  
  try {
    const biolinks = localStorage.getItem('biolinks')
    const shortlinks = localStorage.getItem('shortlinks')
    
    console.log('🔍 localStorage biolinks:', biolinks ? JSON.parse(biolinks) : null)
    console.log('🔍 localStorage shortlinks:', shortlinks ? JSON.parse(shortlinks) : null)
    
    return {
      biolinks: biolinks ? JSON.parse(biolinks) : null,
      shortlinks: shortlinks ? JSON.parse(shortlinks) : null
    }
  } catch (error) {
    console.error('🔍 localStorage debug failed:', error)
    return { error }
  }
}