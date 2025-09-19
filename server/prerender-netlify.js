const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

exports.handler = async (event, context) => {
  const { username } = event.queryStringParameters
  
  console.log(`🔍 Netlify prerender for username: ${username}`)
  
  if (!username) {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'text/html'
      },
      body: 'Username required'
    }
  }
  
  try {
    // Load biolink data
    const { data: biolink, error } = await supabase
      .from('app_16a5e1e6b3_biolinks')
      .select('*')
      .eq('slug', username)
      .eq('is_active', true)
      .single()

    if (error || !biolink) {
      console.log(`❌ Biolink not found for username: ${username}`)
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/html'
        },
        body: 'Biolink not found'
      }
    }

    console.log(`✅ Biolink found:`, biolink.title)
    console.log(`📝 SEO data:`, biolink.seo)

    // Generate prerendered HTML with custom SEO
    const html = generatePrerenderHTML(biolink, event)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      },
      body: html
    }
    
  } catch (error) {
    console.error('❌ Prerender error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: 'Server error'
    }
  }
}

function generatePrerenderHTML(biolink, event) {
  const seo = biolink.seo || {}
  const profile = biolink.profile || {}
  
  const title = seo.title || `${biolink.title || profile.name} - BioLink.ID`
  const description = seo.description || biolink.description || profile.bio || 'Professional biolink page'
  const keywords = seo.keywords || 'biolink, profile, social media, links'
  const favicon = seo.favicon || 'https://public-frontend-cos.metadl.com/mgx/img/favicon.png'
  const ampLink = seo.ampLink
  const schemaType = seo.schemaType || 'Person'
  
  const currentUrl = `https://${event.headers.host}/${biolink.slug}`
  const imageUrl = profile.avatar || `https://${event.headers.host}/og-image.jpg`
  
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