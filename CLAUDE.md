# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev        # Start development server at http://localhost:3000
npm run build      # Build the static site for production
npm run start      # Start production server
npm run lint       # Run Next.js linting

# After any changes, run build to ensure the static export works correctly
npm run build && npm run start
```

## Project Architecture

This is a Chinese personal blog built with Next.js 15, using static export for deployment. The blog follows a simple, file-based content management system.

### Key Architecture Decisions

- **Static Export**: Uses `output: 'export'` in next.config.js for static site generation
- **In-Code Content Management**: Articles are stored directly in React components rather than external files
- **Tailwind CSS**: Uses Tailwind with custom design system and typography plugin
- **Chinese Localization**: All UI and content are in Chinese, with the site title "无题之墨" (Untitled Ink)

### File Structure

```
app/
├── layout.tsx          # Root layout with navigation and footer
├── page.tsx            # Homepage with article listing
├── globals.css         # Global styles and design tokens
├── posts/[id]/
│   └── page.tsx        # Dynamic post pages with all content
└── about/
    └── page.tsx        # About page
```

### Content Management System

Articles are now managed through **Notion CMS integration** with fallback support:

1. **Primary Source**: Notion database containing all article metadata and content
2. **Fallback Source** (`lib/fallback-posts.ts`): Static content for when Notion API is unavailable
3. **API Integration** (`lib/notion.ts`): Handles Notion API calls with caching and error handling

#### Adding New Articles

To add a new article:
1. Create a new page in your Notion database
2. Fill in all required properties (Title, Slug, Category, etc.)
3. Write content using Notion's rich text editor
4. Set Published checkbox to true
5. The article will automatically appear on the blog (with caching)

### Design System

The project uses a custom design system with CSS custom properties:
- Primary color: `--color-primary: #ec1e73` (pink theme)
- Typography: System fonts with custom `.prose-blog` styling
- Layout: `.container-narrow` for consistent content width
- Components: Custom button styles (`.btn-subscribe`) and author avatars

### Static Generation

Uses Next.js static export to generate a fully static site:
- All routes are pre-generated at build time
- Images are unoptimized for static hosting
- No server-side functionality - purely static HTML/CSS/JS

### Styling Approach

- Tailwind CSS for utility-first styling
- Custom CSS classes for reusable components
- Typography plugin for prose content styling
- Responsive design with mobile-first approach

## Environment Setup

Required environment variables (copy `.env.local.example` to `.env.local`):
```env
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
CACHE_TTL=300000
```

## Notion Integration

The blog now uses Notion as a headless CMS:
- **Setup Guide**: See `NOTION_SETUP.md` for complete configuration instructions
- **Migration Guide**: See `MIGRATION.md` for migrating existing content
- **API Layer**: `lib/notion.ts` handles all Notion interactions with caching
- **Fallback System**: Graceful degradation when Notion API is unavailable

## Development Notes

- All text content should be in Chinese
- The blog focuses on technology, productivity, and design topics
- Content is managed through Notion for easy editing and publishing
- Static export with environment variables for Notion API access
- Robust error handling and fallback mechanisms ensure reliability
- Slug-based routing for SEO-friendly URLs