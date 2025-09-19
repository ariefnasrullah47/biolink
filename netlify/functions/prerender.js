const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

exports.handler = async (event, context) => {
  const username = event.path.replace('/', '') || event.queryStringParameters?.username
  
  console.log('🔍 Prerender request for username:', username)
  console.log('🔍 User-Agent:', event.headers['user-agent'])
  console.log('🔍 Event path:', event.path)
  
  if (!username) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/html' },
      body: 'Username required'
    }
  }
  
  try {
    // Load biolink data with SEO settings
    console.log('📝 Loading biolink data from Supabase...')
    const { data: biolink, error } = await supabase
      .from('app_16a5e1e6b3_biolinks')
      .select('*')
      .eq('slug', username)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/html' },
        body: `<!DOCTYPE html><html><head><title>Biolink Not Found</title></head><body><h1>Biolink Not Found</h1><p>The biolink "${username}" does not exist.</p></body></html>`
      }
    }

    if (!biolink) {
      console.log('❌ No biolink found for username:', username)
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/html' },
        body: `<!DOCTYPE html><html><head><title>Biolink Not Found</title></head><body><h1>Biolink Not Found</h1><p>The biolink "${username}" does not exist.</p></body></html>`
      }
    }

    console.log('✅ Biolink found:', biolink.title || biolink.slug)
    console.log('📝 SEO data:', biolink.seo)

    // Generate prerendered HTML with custom SEO
    const html = generatePrerenderHTML(biolink, event)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300'
      },
      body: html
    }
    
  } catch (error) {
    console.error('❌ Prerender error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<!DOCTYPE html><html><head><title>Server Error</title></head><body><h1>Server Error</h1><p>An error occurred while loading the biolink.</p></body></html>`
    }
  }
}

function generatePrerenderHTML(biolink, event) {
  const seo = biolink.seo || {}
  const profile = biolink.profile || {}
  
  // Use custom SEO settings or fallback to defaults
  const title = seo.title || `${biolink.title || profile.name || biolink.slug} - BioLink.ID`
  const description = seo.description || biolink.description || profile.bio || 'Professional biolink page'
  const keywords = seo.keywords || 'biolink, profile, social media, links'
  const favicon = seo.favicon || 'https://public-frontend-cos.metadl.com/mgx/img/favicon.png'
  const ampLink = seo.ampLink
  const schemaType = seo.schemaType || 'Person'
  
  const currentUrl = `https://${event.headers.host}/${biolink.slug}`
  const imageUrl = profile.avatar || `https://${event.headers.host}/og-image.jpg`
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": biolink.title || profile.name || biolink.slug,
    "description": description,
    "url": currentUrl
  }
  
  // Add schema-specific fields
  if (schemaType === 'LocalBusiness' || schemaType === 'Local Business') {
    structuredData.address = {
      "@type": "PostalAddress",
      "addressCountry": "ID"
    }
    structuredData.telephone = "+62-xxx-xxxx-xxxx"
    structuredData.priceRange = "$$"
  }
  
  if (schemaType === 'Organization') {
    structuredData.logo = profile.avatar || ""
  }
  
  if (schemaType === 'Person') {
    structuredData.jobTitle = profile.bio || ""
  }
  
  if (profile.avatar) {
    structuredData.image = profile.avatar
  }
  
  if (biolink.social && biolink.social.length > 0) {
    structuredData.sameAs = biolink.social.map(s => s.url)
  }

  console.log('🔧 Generated SEO HTML for:', biolink.slug)
  console.log('📝 Title:', title)
  console.log('📝 Description:', description.substring(0, 100) + '...')
  console.log('📝 Keywords:', keywords)
  console.log('📝 Schema Type:', schemaType)
  console.log('📝 AMP Link:', ampLink || 'None')

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="${favicon}" type="image/png">
  
  <!-- CUSTOM SEO META TAGS -->
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${keywords}" />
  <meta name="author" content="${biolink.title || profile.name || 'BioLink.ID'}" />
  
  <!-- OPEN GRAPH TAGS -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${currentUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:site_name" content="BioLink.ID" />
  
  <!-- TWITTER CARD TAGS -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:site" content="@BioLinkID" />
  
  <!-- CANONICAL LINK -->
  <link rel="canonical" href="${currentUrl}" />
  
  ${ampLink ? `<!-- AMP LINK -->\n  <link rel="amphtml" href="${ampLink}" />` : ''}
  
  <!-- STRUCTURED DATA -->
  <script type="application/ld+json">
${JSON.stringify(structuredData, null, 4)}
  </script>
  
  <!-- APP ASSETS -->
  <script type="module" crossorigin src="/assets/index-CAMr070M.js"></script>
  <link rel="stylesheet" crossorigin href="/assets/index-CHRneP1e.css">
</head>
<body>
  <div id="root"></div>
  <script src="https://public-frontend-cos.metadl.com/commonfile/appPlugins-prod-1757257819217.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</body>
</html>`
}