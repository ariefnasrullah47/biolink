# 🚀 Netlify Deployment Guide for Custom SEO

This guide will help you deploy the BioLink platform to Netlify with server-side prerendering for custom SEO meta tags.

## 📋 Prerequisites

1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository** - Push your code to GitHub
3. **Supabase Project** - Get your Supabase URL and API key

## 🔧 Deployment Steps

### 1. Connect GitHub Repository to Netlify

1. **Login to Netlify** and click "New site from Git"
2. **Choose GitHub** and select your repository
3. **Configure build settings:**
   - Build command: `pnpm run build && cd netlify/functions && npm install`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### 2. Set Environment Variables

In Netlify dashboard, go to **Site settings > Environment variables** and add:

```
VITE_SUPABASE_URL = https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
```

### 3. Deploy Site

1. **Click "Deploy site"** - Netlify will build and deploy automatically
2. **Wait for deployment** to complete (usually 2-3 minutes)
3. **Get your Netlify URL** (e.g., `https://amazing-site-123456.netlify.app`)

## 🧪 Testing Custom SEO

### Test with Social Media Crawlers

```bash
# Test Facebook crawler
curl -H "User-Agent: facebookexternalhit/1.1" https://your-site.netlify.app/namasaya

# Test Twitter crawler  
curl -H "User-Agent: twitterbot/1.0" https://your-site.netlify.app/namasaya

# Test Google crawler
curl -H "User-Agent: googlebot" https://your-site.netlify.app/namasaya
```

### Verify View-Source

1. **Visit your biolink:** `https://your-site.netlify.app/namasaya`
2. **Right-click → View Page Source**
3. **Look for custom SEO tags:**
   - Custom title: "Buat biolinkmu disini dan gratis seumur hidup - Biolinks.ID"
   - Custom description: Your configured description
   - Custom keywords: "bio, biolinks, link bio"
   - AMP link: `<link rel="amphtml" href="..."/>`
   - Schema markup: Local Business structured data

## 🎯 Expected Results

**For Social Media Bots (view-source will show):**
```html
<title>Buat biolinkmu disini dan gratis seumur hidup - Biolinks.ID</title>
<meta name="description" content="Buat biolinkmu disini dan dapatkan penawaran gratis seumur hidup dan cukup daftar disini saja." />
<meta name="keywords" content="bio, biolinks, link bio" />
<link rel="amphtml" href="https://example.com/amp/page" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Local Business",
  "name": "Biolinks",
  "description": "Buat biolinkmu disini dan dapatkan penawaran gratis seumur hidup..."
}
</script>
```

**For Regular Users:**
- React app loads normally with client-side routing
- All biolink functionality works as expected

## 🔧 Custom Domain (Optional)

1. **Go to Site settings > Domain management**
2. **Add custom domain** (e.g., `biolinks.yourdomain.com`)
3. **Configure DNS** as instructed by Netlify
4. **Enable HTTPS** (automatic with Netlify)

## 🐛 Troubleshooting

### Function Logs
- Check **Functions > prerender** in Netlify dashboard for logs
- Look for console.log outputs to debug issues

### Common Issues
- **Environment variables not set** - Check Site settings > Environment variables
- **Supabase connection failed** - Verify URL and API key
- **Build failed** - Check build logs in Netlify dashboard

### Debug Commands
```bash
# Test function locally with Netlify CLI
netlify dev

# Check function logs
netlify functions:log prerender
```

## ✅ Success Checklist

- [ ] Site deploys successfully to Netlify
- [ ] Environment variables configured
- [ ] Prerender function works for bot user-agents
- [ ] Custom SEO meta tags appear in view-source
- [ ] Regular users see React app normally
- [ ] Social media sharing shows custom title/description

## 🚀 Go Live!

Once everything is working:
1. **Share your Netlify URL** with custom SEO
2. **Test social media sharing** on Facebook, Twitter, LinkedIn
3. **Submit to search engines** for indexing
4. **Monitor performance** in Netlify analytics

Your custom SEO settings will now be visible in view-source! 🎉