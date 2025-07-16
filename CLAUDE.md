# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **full-stack Next.js 15 blog** that uses:
- **Notion as CMS** for content management
- **Supabase** for authentication, comments, likes, and analytics
- **Cloudinary** for image hosting and optimization
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with increased memory at http://localhost:3000
- `npm run dev:clean` - Clean .next folder and start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server (after build)
- `npm run lint` - Run Next.js linting

### Testing Commands
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:api` - Run API integration tests
- `npm run test:notion` - Test Notion connection
- `npm run test:supabase` - Test Supabase connection

### Database & Utility Commands
- `npm run db:init` - Initialize Supabase database
- `npm run db:migrate:*` - Various database migrations
- `npm run update:book-covers` - Update book covers
- `npm run analyze` - Analyze bundle size

### Environment Setup
```bash
# Required environment variables in .env.local

# Notion API (REQUIRED for basic functionality)
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id

# Supabase (REQUIRED for interactive features like comments/likes)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional Notion databases for additional content
NOTION_PROJECTS_DB=projects_database_id
NOTION_BOOKS_DB=books_database_id
NOTION_TOOLS_DB=tools_database_id

# Optional configurations
CACHE_TTL=3600000  # Cache duration in milliseconds (default: 1 hour)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Architecture Overview

This is a **full-stack Next.js 15 blog** that evolved from a static export site to include dynamic features. It uses **Notion as a CMS** with **Supabase** for user interactions, authentication, and real-time features.

### Core Components

1. **Content Management**:
   - Primary content (posts, projects, books, tools) stored in Notion databases
   - Comprehensive fallback system ensures the site works when Notion is unavailable
   - In-memory caching with configurable TTL reduces API calls
   - Content flow: Notion → API → Markdown → HTML

2. **Key Directories**:
   - `app/` - Next.js App Router pages and API routes
   - `components/` - Reusable React components organized by feature
   - `lib/` - Core utilities and service integrations
   - `lib/notion/` - Notion API client and content fetching
   - `lib/supabase/` - Supabase client configuration
   - `lib/analytics/` - Analytics tracking implementation
   - `lib/fallback-*.ts` - Fallback data when APIs fail
   - `types/` - TypeScript type definitions
   - `hooks/` - Custom React hooks
   - `contexts/` - React contexts (Authentication)

3. **Features**:
   - **Authentication**: Supabase Auth with protected routes
   - **Comments System**: Nested comments with moderation
   - **Analytics**: Page views, reading time, engagement metrics
   - **Real-time**: Live interactions and presence
   - **Search**: Client-side fuzzy search with Fuse.js
   - **Admin Dashboard**: Content and user management
   - **Personalization**: Reading history and recommendations
   - **Image Optimization**: All images hosted on Cloudinary CDN

### Development Patterns

1. **Error Handling**:
   - Always implement fallback content for external API failures
   - Use `lib/fallback-*.ts` files for static fallback data
   - Comprehensive error boundaries for graceful degradation

2. **Type Safety**:
   - Use TypeScript types from `types/` directory
   - Notion types in `types/notion.ts`
   - Database types in `types/database.ts`

3. **Testing**:
   - Jest with React Testing Library for components
   - API route testing in `__tests__/api/`
   - Test utilities in `__tests__/setup.ts`

4. **Performance**:
   - Image optimization with Next.js Image component
   - Code splitting and dynamic imports
   - Debounced operations for search and filters
   - Lazy loading for components and images

5. **Localization**:
   - Primary UI language is Chinese
   - Support for English content
   - Date formatting uses Chinese locale

### Current State & Important Notes

1. **Build Configuration**:
   - TypeScript and ESLint errors are temporarily ignored in `next.config.js`
   - This allows quick deployment but should be addressed

2. **Mixed Architecture**:
   - Originally designed for static export
   - Now includes server-side features (API routes, real-time)
   - Cannot use `output: 'export'` with current features

3. **Database Schema**:
   - Supabase tables for comments, likes, analytics, users
   - Migration scripts in `scripts/db/`
   - RLS (Row Level Security) policies implemented

4. **Notion Content Structure**:
   ```
   Posts Database:
   - Title (required)
   - Author (required)
   - Date (required)
   - Tags (multi-select)
   - Summary (rich text)
   - Content (page content)
   
   Additional databases follow similar patterns
   ```

5. **API Routes Structure**:
   - `/api/auth/*` - Authentication endpoints
   - `/api/comments/*` - Comment CRUD operations
   - `/api/analytics/*` - Analytics endpoints
   - `/api/revalidate` - ISR revalidation
   - `/api/admin/*` - Admin-only endpoints

### Security Considerations

- All sensitive operations require authentication
- API routes implement proper validation and sanitization
- Environment variables store all secrets
- CORS and rate limiting configured for production
- Admin routes have additional authorization checks

### Recent Updates (Jan 2025)

1. **Cloudinary Integration**:
   - All images now hosted on Cloudinary CDN
   - Automatic image optimization and responsive formats
   - Book covers, project thumbnails, and tool icons migrated
   - Configuration in `next.config.js` includes Cloudinary domain

2. **File Organization**:
   - Utility scripts moved to `scripts/` directory
   - Documentation organized in `docs/` folder
   - Temporary files and migration scripts cleaned up
   - Project structure simplified and organized

3. **Notion Content**:
   - All content fields properly filled
   - Book covers using Cloudinary URLs
   - Project images and tool icons updated
   - Fallback data available for all content types

### Important Scripts

Located in `scripts/` directory:
- `update-to-cloudinary-covers.js` - Update book covers to Cloudinary
- `update-notion-*.js` - Various Notion update scripts
- `fill-notion-content.js` - Fill missing Notion fields
- Database migration scripts in `scripts/`