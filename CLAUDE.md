# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NotionNext is a Next.js-based static blog system that uses Notion as a CMS. It fetches content from Notion databases via the Notion API and renders it as a static website. The project supports multiple themes, internationalization, and various deployment options.

## Project Information

### Repository & Deployment Details
- **Production Website URL**: https://www.freemium.cc/
- **Local Repository Path**: `/Users/lucaslu/Documents/AI_Workspace/freemium/NotionNext`
- **Current Version**: 4.9.0 (upgraded from 4.8.4)
- **Current Theme**: heo (configured via THEME in blog.config.js)

### Git Repository Configuration
- **Origin Repository**: https://github.com/XLLU/NotionNext.git (Your Fork)
- **Upstream Repository**: https://github.com/tangly1024/NotionNext.git (Original)
- **Main Branch**: main
- **Git Remote Configuration**:
  ```bash
  origin	https://github.com/XLLU/NotionNext.git (fetch)
  origin	https://github.com/XLLU/NotionNext.git (push)
  upstream https://github.com/tangly1024/NotionNext.git (fetch)
  upstream https://github.com/tangly1024/NotionNext.git (push)
  ```

### Production Server Connection
- **Server Host**: freemium
- **SSH Connection**: `ssh root@freemium`
- **Deployment Method**: PM2 Process Manager
- **Server Path**: `/data/NotionNext`
- **Process Name**: notionnext
- **Node.js Version**: v20.19.2
- **NPM Version**: 10.8.2

### Deployment Commands
```bash
# Connect to server
ssh root@freemium

# Navigate to project directory
cd /data/NotionNext

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Fix security issues
npm audit fix

# Build production
npm run build

# Restart service
pm2 restart notionnext

# Check service status
pm2 list
```

### Recent Updates (2025-08-31)
- Successfully merged upstream v4.9.0 updates
- Added new features: UMAMI analytics, NotByAI components, performance monitoring
- Added new typography theme
- Enhanced security with middleware and input validation
- Added Jest testing framework and development tools
- Updated all major dependencies
- Maintained all personal configurations

## Common Development Commands

### Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run export` - Export static site with cross-env EXPORT=true
- `npm run bundle-report` - Analyze bundle size with cross-env ANALYZE=true
- `npm run build-all-in-dev` - Build with production environment variables in development

### New Commands (Added in v4.9.0)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest tests
- `npm run health-check` - Run health check scripts
- `npm audit fix` - Fix security vulnerabilities

### Code Quality Commands
The project uses ESLint and Prettier for code formatting:
- Check `.eslintrc.js` for ESLint configuration
- Check `.prettierrc.json` for Prettier configuration
- ESLint is configured to ignore errors during builds (`eslint: { ignoreDuringBuilds: true }`)

### Git Operations for Upstream Updates
```bash
# Add upstream (already configured)
git remote add upstream https://github.com/tangly1024/NotionNext.git

# Fetch upstream updates
git fetch upstream

# Create update branch
git checkout -b update-upstream

# Merge upstream changes
git merge upstream/main

# After testing, merge to main
git checkout main
git merge update-upstream
git push origin main
```

## Architecture Overview

### Core Structure
```
├── blog.config.js          # Main configuration file
├── next.config.js          # Next.js configuration with theme support
├── themes/                 # Multiple theme implementations
├── lib/                    # Core utilities and business logic
├── pages/                  # Next.js pages
├── components/             # Reusable React components
├── conf/                   # Modular configuration files
└── public/                 # Static assets
```

### Key Architecture Components

#### 1. Theme System
- **Dynamic theme loading**: Themes are located in `/themes` directory
- **Theme configuration**: Set via `THEME` in `blog.config.js` (currently: 'heo')
- **Available themes**: commerce, example, fukasawa, game, gitbook, heo, hexo, landing, magzine, matery, medium, movie, nav, next, nobelium, photo, plog, proxio, simple, starter, typography
- **Webpack alias**: `@theme-components` resolves to current theme directory
- **Theme scanning**: `next.config.js` automatically scans `/themes` directory

#### 2. Configuration System
- **Main config**: `blog.config.js` imports modular configs from `/conf` directory
- **Environment variables**: Extensive use of `process.env` for deployment flexibility
- **Modular configs**: Split into separate files (comment, contact, post, analytics, image, font, etc.)
- **Notion integration**: Supports multiple Notion page IDs with language prefixes

#### 3. Notion Integration (`/lib/notion`)
- **API wrapper**: Custom Notion API client in `CustomNotionApi.ts`
- **Data fetching**: Functions for posts, metadata, page properties, table of contents
- **Content processing**: Image mapping, URL conversion, block processing
- **Caching**: Multiple cache strategies (memory, Redis, local file)

#### 4. Internationalization
- **Multi-language support**: Configured via `NOTION_PAGE_ID` with language prefixes
- **Language files**: Located in `/lib/lang/` (zh-CN, zh-TW, zh-HK, en-US, ja-JP, fr-FR, tr-TR)
- **URL rewriting**: Automatic language-based URL rewriting in `next.config.js`
- **Locale detection**: Dynamic locale extraction from page IDs

#### 5. Build System
- **Static export**: Supports both SSR and static export modes
- **Pre-build cleanup**: Automatic sitemap cleanup to prevent conflicts
- **Bundle analysis**: Built-in webpack bundle analyzer
- **Image optimization**: Next.js image optimization with format conversion
- **Pseudo-static**: Optional `.html` suffix for all URLs

### Key Libraries and Dependencies
- **Framework**: Next.js 14.2.30 with React 18.3.1
- **Notion**: notion-client 7.3.0, notion-utils 7.4.3, react-notion-x 7.4.2
- **Styling**: Tailwind CSS 3.4.17
- **Authentication**: Clerk for user management
- **Analytics**: Vercel Analytics, UMAMI support
- **Caching**: ioredis, memory-cache
- **Build tools**: TypeScript, ESLint, Prettier
- **Testing**: Jest with testing-library

### Development Patterns

#### Configuration Pattern
- Use environment variables for all configurable values
- Import modular configs from `/conf` directory
- Provide sensible defaults for all configuration options

#### Theme Development
- Each theme is a self-contained directory in `/themes`
- Themes can override default components and layouts
- Use `@theme-components` alias to import theme-specific components

#### Notion Data Flow
1. Fetch data from Notion API via `/lib/notion` utilities
2. Process and cache data using cache manager
3. Transform data for rendering via utility functions
4. Render using theme components

#### Internationalization Workflow
- Configure multiple Notion page IDs with language prefixes
- Use language files in `/lib/lang` for translations
- Leverage Next.js i18n routing for URL management

### Important Files to Understand
- `blog.config.js:1-71` - Main configuration with environment variable mappings
- `next.config.js:83-238` - Next.js configuration with theme support and URL rewriting
- `lib/notion/getNotionPost.js` - Core data fetching logic
- `lib/cache/cache_manager.js` - Caching strategy implementation
- `themes/theme.js` - Theme selection and loading logic

### Build and Deployment Notes
- Project requires Node.js >= 20
- Supports multiple deployment targets: Vercel, static export, standalone
- Automatic sitemap generation with conflict prevention
- RSS feed generation available
- Bundle analyzer available for optimization

### Cache Management
The project implements a sophisticated caching system:
- **Memory cache**: For fast in-memory storage
- **Redis cache**: For distributed caching
- **Local file cache**: For persistent local storage
- **Cache manager**: Orchestrates between different cache types

### Security and Performance (New in v4.9.0)
- **Security middleware**: Input validation and error handling
- **Performance monitoring**: Built-in performance tracking
- **Accessibility features**: Enhanced accessibility components
- **Testing coverage**: Jest unit tests for critical components

## Important Instructions

### Development Workflow
1. Always test locally with `npm run dev` before deploying
2. Run `npm run build` to ensure production build works
3. Run `npm run lint:fix` and `npm run type-check` before committing
4. Use `npm run test` to run tests when available

### Deployment Checklist
1. Verify all environment variables are configured
2. Test build process: `npm run build`
3. Check for security issues: `npm audit`
4. Verify website functionality at https://www.freemium.cc/
5. Monitor performance after deployment

### Maintenance Tasks
- Regularly sync with upstream repository for updates
- Keep dependencies updated with `npm update`
- Monitor and fix security vulnerabilities with `npm audit fix`
- Review and update personal configurations as needed

# Important Instruction Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.