import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xkteplovhaigcotrxmiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdGVwbG92aGFpZ2NvdHJ4bWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTYyMjcsImV4cCI6MjA3MzU5MjIyN30.paObNOxiPYeGgd6sb-sOnDt1W0KT5BrSvGKHFrQrFv0'

// FORCE REAL SUPABASE CLIENT - NO DEMO MODE
console.log('🔧 FORCING REAL SUPABASE CLIENT - NO DEMO MODE')
console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 Supabase Key exists:', !!supabaseKey)

// Always use real Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

console.log('✅ Real Supabase client created successfully')

// Export functions
export { supabase }
export default supabase

// Helper function - ALWAYS return false (no demo mode)
export const isDemoMode = () => {
  console.log('🔍 isDemoMode called - returning FALSE (real database mode)')
  return false
}

// Helper function to show demo notice - NEVER show
export const showDemoNotice = () => {
  console.log('🔍 showDemoNotice called - returning FALSE (real database mode)')
  return false
}

// Database helper functions
export const ensureAuthentication = async () => {
  console.log('🔧 Ensuring user authentication...')
  
  try {
    // Check current user
    let { data: user, error } = await supabase.auth.getUser()
    console.log('🔍 Current user check:', { user: user?.user, error })
    
    if (user?.user) {
      console.log('✅ User already authenticated:', user.user.id)
      return user.user
    }
    
    // If no user, create anonymous user for cross-browser persistence
    console.log('🔧 No user found, creating anonymous user...')
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
    
    if (anonError) {
      console.error('❌ Anonymous auth failed:', anonError)
      throw anonError
    }
    
    console.log('✅ Anonymous user created:', anonData.user?.id)
    return anonData.user
    
  } catch (error) {
    console.error('❌ Authentication failed:', error)
    throw error
  }
}

export const saveBiolinkToDatabase = async (biolinkData: any) => {
  console.log('💾 Saving biolink to database...')
  console.log('🔍 Biolink data:', biolinkData)
  
  try {
    // Ensure user is authenticated
    const user = await ensureAuthentication()
    
    // Prepare data with only existing columns to avoid schema errors
    const dataToSave = {
      user_id: user.id,
      slug: biolinkData.slug,
      title: biolinkData.title,
      description: biolinkData.description || null,
      // Only include columns that exist in the database
      ...(biolinkData.profile && { profile: biolinkData.profile }),
      ...(biolinkData.links && { links: biolinkData.links }),
      ...(biolinkData.social && { social: biolinkData.social }),
      ...(biolinkData.background && { background: biolinkData.background }),
      ...(biolinkData.seo && { seo: biolinkData.seo }),
      ...(typeof biolinkData.is_public !== 'undefined' && { is_public: biolinkData.is_public }),
      ...(typeof biolinkData.is_active !== 'undefined' && { is_active: biolinkData.is_active }),
      ...(typeof biolinkData.view_count !== 'undefined' && { view_count: biolinkData.view_count })
    }
    
    console.log('🔍 Data to save (filtered for existing columns):', dataToSave)
    
    const { data, error } = await supabase
      .from('app_16a5e1e6b3_biolinks')
      .insert([dataToSave])
      .select()
    
    if (error) {
      console.error('❌ Database save failed:', error)
      throw error
    }
    
    console.log('✅ Biolink saved to database:', data[0])
    return data[0]
    
  } catch (error) {
    console.error('❌ Failed to save biolink:', error)
    throw error
  }
}

export const loadBiolinksFromDatabase = async () => {
  console.log('📥 Loading biolinks from database...')
  
  try {
    // Ensure user is authenticated
    const user = await ensureAuthentication()
    
    const { data, error } = await supabase
      .from('app_16a5e1e6b3_biolinks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Database load failed:', error)
      throw error
    }
    
    console.log('✅ Biolinks loaded from database:', data?.length || 0, 'items')
    return data || []
    
  } catch (error) {
    console.error('❌ Failed to load biolinks:', error)
    return []
  }
}

export const saveShortlinkToDatabase = async (shortlinkData: any) => {
  console.log('💾 Saving shortlink to database...')
  console.log('🔍 Shortlink data:', shortlinkData)
  
  try {
    // Ensure user is authenticated
    const user = await ensureAuthentication()
    
    // Map to existing database columns based on the schema we saw
    const dataToSave = {
      user_id: user.id,
      title: shortlinkData.title || shortlinkData.slug,
      short_code: shortlinkData.slug, // Map slug to short_code
      original_url: shortlinkData.target_url, // Map target_url to original_url
      clicks: shortlinkData.click_count || 0,
      is_active: shortlinkData.is_active !== false,
      // Add click_count if it exists in the table
      ...(typeof shortlinkData.click_count !== 'undefined' && { click_count: shortlinkData.click_count })
    }
    
    console.log('🔍 Data to save (mapped to existing columns):', dataToSave)
    
    const { data, error } = await supabase
      .from('app_16a5e1e6b3_shortlinks')
      .insert([dataToSave])
      .select()
    
    if (error) {
      console.error('❌ Database save failed:', error)
      throw error
    }
    
    console.log('✅ Shortlink saved to database:', data[0])
    
    // Map back to expected format
    const mappedData = {
      ...data[0],
      slug: data[0].short_code,
      target_url: data[0].original_url,
      click_count: data[0].clicks || data[0].click_count || 0
    }
    
    return mappedData
    
  } catch (error) {
    console.error('❌ Failed to save shortlink:', error)
    throw error
  }
}

export const loadShortlinksFromDatabase = async () => {
  console.log('📥 Loading shortlinks from database...')
  
  try {
    // Ensure user is authenticated
    const user = await ensureAuthentication()
    
    const { data, error } = await supabase
      .from('app_16a5e1e6b3_shortlinks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Database load failed:', error)
      throw error
    }
    
    console.log('✅ Shortlinks loaded from database:', data?.length || 0, 'items')
    
    // Map database columns to expected format
    const mappedData = (data || []).map(item => ({
      ...item,
      slug: item.short_code,
      target_url: item.original_url,
      click_count: item.clicks || item.click_count || 0
    }))
    
    return mappedData
    
  } catch (error) {
    console.error('❌ Failed to load shortlinks:', error)
    return []
  }
}

// Auth helper functions
export const signUp = async (email: string, password: string, userData: { username: string; display_name: string }) => {
  try {
    console.log('Starting signup process for:', email)
    
    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          display_name: userData.display_name
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('No user data returned from signup')
    }

    console.log('Auth signup successful:', authData.user.id)
    return { data: authData, error: null }
  } catch (error: any) {
    console.error('Signup process error:', error)
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Starting signin process for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Signin error:', error)
      throw error
    }

    console.log('Signin successful')
    return { data, error: null }
  } catch (error: any) {
    console.error('Signin process error:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Signout error:', error)
      throw error
    }
    return { error: null }
  } catch (error: any) {
    console.error('Signout process error:', error)
    return { error }
  }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getSession = () => {
  return supabase.auth.getSession()
}