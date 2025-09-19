# Biolink + Shortlink Platform MVP - Todo List

## Core Files to Create (Max 8 files limit)

### 1. Database Schema & Types
- `src/lib/database.types.ts` - TypeScript types for Supabase tables
- `src/lib/supabase.ts` - Supabase client configuration

### 2. Core Components
- `src/components/BiolinkRenderer.tsx` - Dynamic block renderer for public biolink pages
- `src/components/Dashboard.tsx` - Main dashboard with auth, biolink manager, shortlink manager, analytics
- `src/components/DirectoryPage.tsx` - Public directory listing with search/filter

### 3. Pages
- `src/pages/Index.tsx` - Landing page with auth
- `src/pages/BiolinkPage.tsx` - Public biolink page (/u/[username])
- `src/pages/ShortlinkRedirect.tsx` - Shortlink redirect handler (/s/[slug])

## MVP Features Implementation Priority

### Phase 1: Core Infrastructure
1. ✅ Supabase setup with environment variables
2. ✅ Authentication (email/password + magic link)
3. ✅ Basic routing structure
4. ✅ Database schema creation via SQL

### Phase 2: Biolink System
1. ✅ Dynamic block renderer with 8 core block types:
   - Avatar, Heading, Button/Link, Social Icons
   - YouTube embed, Email signup, Image, CTA button
2. ✅ Basic biolink page display (/u/[username])
3. ✅ Simple biolink manager in dashboard

### Phase 3: Shortlink System
1. ✅ Shortlink creation and management
2. ✅ Redirect functionality (/s/[slug])
3. ✅ Basic click analytics logging

### Phase 4: Directory & Analytics
1. ✅ Public directory page with basic listing
2. ✅ Simple analytics dashboard
3. ✅ Demo data seeding

## Simplified Architecture Decisions
- Use localStorage for non-critical data, Supabase for persistent data
- Implement basic analytics (no complex geo/device detection)
- Simple block system without drag-drop (just CRUD)
- Basic styling with Tailwind, focus on functionality
- Indonesian language for UI text
- Minimal SEO (basic meta tags only)

## Database Tables (Simplified)
1. `profiles` - User profiles with username
2. `biolink_pages` - User biolink pages
3. `blocks` - Content blocks (JSONB properties)
4. `shortlinks` - Short URLs with basic config
5. `analytics_events` - Click tracking
6. `directory_items` - Public directory listings

## Demo Data
- /u/demo with sample blocks
- 2 demo shortlinks
- 10 directory items