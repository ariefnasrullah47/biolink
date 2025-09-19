const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3001

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'
)

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Prerender biolink pages with custom SEO
app.get('/:username', async (req, res) => {
  const { username } = req.params
  
  console.log(`🔍 Prerendering biolink for username: ${username}`)
  
  try {
    // Load biolink data with SEO settings
    const { data: biolink, error } = await supabase
      .from('app_16a5e1e6b3_biolinks')
      .select('*')
      .eq('slug', username)
      .eq('is_active', true)
      .single()

    if (error || !biolink) {
      console.log(`❌ Biolink not found for username: ${username}`)
      return res.status(404).send('Biolink not found')
    }

    console.log(`✅ Biolink found:`, biolink.title)
    console.log(`📝 SEO data:`, biolink.seo)

    // Read the base HTML template
    const htmlPath = path.join(__dirname, '../dist/index.html')
    const htmlTemplate = fs.readFileSync(htmlPath, 'utf8')
    
    // Generate custom SEO HTML
    const customSEO = generateCustomSEOHTML(biolink, req)
    
    // Replace the head section with custom SEO
    const prerenderedHTML = htmlTemplate.replace(
      /<head>[\s\S]*?<\/head>/,
      customSEO
    )
    
    console.log(`✅ Prerendered HTML generated for ${username}`)
    
    res.setHeader('Content-Type', 'text/html')
    res.send(prerenderedHTML)
    
  } catch (error) {
    console.error('❌ Prerender error:', error)
    res.status(500).send('Server error')
  }
})

// Function to generate custom SEO HTML
function generateCustomSEOHTML(biolink, req) {
  const seo = biolink.seo || {}
  const profile = biolink.profile || {}
  
  // Custom SEO values from user settings
  const title = seo.title || `${biolink.title || profile.name} - BioLink.ID`
  const description = seo.description || biolink.description || profile.bio || 'Professional biolink page'
  const keywords = seo.keywords || 'biolink, profile, social media, links'
  const favicon = seo.favicon || 'https://public-frontend-cos.metadl.com/mgx/img/favicon.png'
  const ampLink = seo.ampLink
  const schemaType = seo.schemaType || 'Person'
  
  const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  const imageUrl = profile.avatar || `${req.protocol}://${req.get('host')}/og-image.jpg`
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": biolink.title || profile.name,
    "description": description,
    "url": currentUrl
  }
  
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

  console.log(`🔧 Generated SEO for ${biolink.slug}:`)
  console.log(`📝 Title: ${title}`)
  console.log(`📝 Description: ${description}`)
  console.log(`📝 Keywords: ${keywords}`)
  console.log(`📝 Schema Type: ${schemaType}`)
  console.log(`📝 AMP Link: ${ampLink || 'None'}`)

  return `<head>
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
</head>`
}

// Fallback to serve React app for other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(port, () => {
  console.log(`🚀 Prerender server running on port ${port}`)
  console.log(`📝 Supabase URL: ${process.env.VITE_SUPABASE_URL ? 'Configured' : 'Not configured'}`)
})

module.exports = app