# Redwan Mart - Production 2-Layer Web App Architecture Blueprint

**Project:** E-commerce platform for Redwan Ahmed  
**Stack:** Astro + Cloudflare Edge Architecture + Higgsfield AI Media Generation  
**Deployment:** GitHub → Cloudflare Pages + Workers + D1 + R2  
**Status:** Initial Setup & Architecture Implementation

---

## 🏗️ System Architecture Overview

### Layer 1: Frontend (Presentation)
- **Framework:** Astro (Static/SSR Export)
- **Hosting:** Cloudflare Pages (Git-driven deployments)
- **UI Framework:** React components + Tailwind CSS
- **Design System:** Figma tokens → Tailwind config
- **Asset Loading:** CDN-served from `assets.redwanmart.com` (R2 bucket)

### Layer 2: Backend & Compute (Edge Logic)
- **Compute:** Cloudflare Workers / Pages Functions
- **Database:** Cloudflare D1 (SQLite serverless)
- **Cache:** Cloudflare KV (edge key-value store)
- **Media Storage:** Cloudflare R2 (S3-compatible object storage)
- **Video Streaming:** Cloudflare Stream (HLS adaptive bitrate)

### Media Pipeline
- **Image Generation:** Higgsfield AI → Cloudflare R2
- **Video Generation:** Higgsfield AI → Cloudflare Stream or R2
- **CDN Delivery:** Cloudflare Image Resizing + Optimization
- **Asset Signing:** KV-stored signing keys for temporary URLs

---

## 📁 Project Directory Structure

```
redwanmart.com/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── DashboardLayout.astro
│   ├── pages/
│   │   ├── index.astro              # Homepage
│   │   ├── products/[id].astro      # Product detail
│   │   ├── admin/
│   │   │   ├── dashboard.astro      # Admin dashboard
│   │   │   └── media-upload.astro   # Media management
│   │   └── api/                     # API routes (Astro endpoints)
│   │       ├── products.ts          # Get products from D1
│   │       ├── media-upload.ts      # Handle media uploads to R2
│   │       └── webhooks/
│   │           └── higgsfield.ts    # Higgsfield generation webhooks
│   ├── components/
│   │   ├── navigation/
│   │   ├── hero/
│   │   ├── product-grid/
│   │   └── design-system/           # Figma-derived UI components
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tokens.css               # Design system tokens
│   │   └── tailwind.config.ts
│   ├── lib/
│   │   ├── cloudflare.ts            # CF R2/D1/KV clients
│   │   ├── higgsfield-mcp.ts        # Higgsfield API wrapper
│   │   └── auth.ts                  # JWT validation
│   └── env.d.ts                     # Type definitions for bindings
├── functions/
│   └── [[path]].ts                  # Cloudflare Pages Functions (Layer 2)
├── wrangler.toml                    # Cloudflare Workers config
├── astro.config.mjs                 # Astro configuration
├── tailwind.config.ts               # Tailwind CSS + design tokens
├── package.json
├── tsconfig.json
├── .env.example                     # Required environment variables
├── .env.local                       # Local dev secrets (gitignore)
├── .github/
│   └── workflows/
│       ├── deploy-pages.yml         # Deploy to Cloudflare Pages
│       ├── deploy-workers.yml       # Deploy Workers
│       └── ci.yml                   # Run tests & lint
└── docs/
    ├── API.md                       # Backend API documentation
    ├── MEDIA-PIPELINE.md            # Higgsfield + R2 setup guide
    └── DEPLOYMENT.md                # Cloudflare & DNS setup
```

---

## 🔑 Environment Variables & Cloudflare Bindings

### Required `.env.local` (Development)
```
# Cloudflare Account
CF_ACCOUNT_ID=your_account_id
CF_API_TOKEN=your_api_token
CF_ZONE_ID=your_zone_id

# R2 Bucket (Media Assets)
CF_R2_BUCKET_NAME=app-media-assets
CF_R2_PUBLIC_URL=https://assets.redwanmart.com

# D1 Database
CF_D1_ID=app-db-production

# KV Namespace (Caching & Asset Keys)
CF_KV_NAMESPACE=app-cache

# Higgsfield AI
HIGGSFIELD_API_KEY=your_api_key
HIGGSFIELD_WORKSPACE_ID=your_workspace_id

# GitHub
GITHUB_TOKEN=your_github_token (for automated deployments)

# JWT Secret (for API authentication)
JWT_SECRET=your_jwt_secret_key_min_32_chars
```

### `wrangler.toml` Bindings (Cloudflare Workers)
```toml
[env.production]
name = "redwanmart-api"
account_id = "your_account_id"
workers_dev = false
route = "api.redwanmart.com/*"

[[r2_buckets]]
binding = "ASSETS_BUCKET"
bucket_name = "app-media-assets"
jurisdiction = "eu"

[[d1_databases]]
binding = "DB"
database_name = "app-db-production"
database_id = "app-db-production"

[[kv_namespaces]]
binding = "CACHE"
id = "app-cache-id"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "production-cache-id"
preview_id = "preview-cache-id"
```

---

## 📊 Database Schema (Cloudflare D1)

### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Media Metadata Table
```sql
CREATE TABLE media_metadata (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'image', 'video', 'thumbnail'
  r2_key TEXT UNIQUE NOT NULL,
  r2_url TEXT NOT NULL,
  cdn_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type TEXT,
  generated_by TEXT, -- 'higgsfield', 'user_upload'
  higgsfield_job_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table (for authentication)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'customer', -- 'customer', 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 MCP Connectors & API Integration Points

### 1. **Cloudflare Developer Platform MCP**
- `mcp__cloudflare__r2_bucket_create` - Create/manage R2 buckets
- `mcp__cloudflare__r2_bucket_get` - Retrieve bucket info & presigned URLs
- `mcp__cloudflare__d1_database_create` - Initialize database
- `mcp__cloudflare__d1_database_query` - Execute SQL queries
- `mcp__cloudflare__kv_namespace_*` - Manage KV cache

### 2. **GitHub MCP**
- `mcp__github__create_or_update_file` - Commit code changes
- `mcp__github__push_files` - Push to branch
- `mcp__github__create_pull_request` - Open PR when ready

### 3. **Higgsfield AI MCP**
- `mcp__https_mcp_higgsfield_ai_mcp__generate_image` - Generate product images
- `mcp__https_mcp_higgsfield_ai_mcp__generate_video` - Generate hero/banner videos
- `mcp__https_mcp_higgsfield_ai_mcp__upscale_image` - Enhance generated images
- Store outputs directly in R2 via signed URLs

### 4. **Google Drive MCP** (optional)
- Fetch brand guidelines, asset references, or documentation

---

## 🚀 Execution Roadmap (Step-by-Step)

### ✅ STEP 1: Project Initialization & Dependencies (THIS SESSION)
**Goal:** Set up Node.js project, Astro, Tailwind, TypeScript, and Cloudflare Wrangler

**Deliverables:**
- [ ] `package.json` with all dependencies
- [ ] `astro.config.mjs` configured for Cloudflare Pages deployment
- [ ] `tailwind.config.ts` with design tokens from Figma
- [ ] `tsconfig.json` with strict mode enabled
- [ ] `wrangler.toml` with R2, D1, KV bindings
- [ ] `.env.example` documenting all required variables
- [ ] Initial project structure scaffolding

**Commands:**
```bash
npm create astro@latest . -- --template minimal --typescript strict
npm install -D @astrojs/cloudflare @astrojs/react @astrojs/tailwind
npm install -D wrangler cloudflare-types
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### ⏳ STEP 2: Cloudflare Infrastructure Setup
**Goal:** Create R2 bucket, D1 database, KV namespace, and configure DNS

**Deliverables:**
- [ ] Cloudflare R2 bucket: `app-media-assets`
- [ ] Cloudflare D1 database: `app-db-production`
- [ ] Cloudflare KV namespace: `app-cache`
- [ ] Subdomain routing: `assets.redwanmart.com` → R2 bucket
- [ ] DNS records configured for `api.redwanmart.com`

**Manual Steps (via Cloudflare Dashboard or MCP):**
```bash
wrangler d1 create app-db-production
wrangler kv:namespace create "app-cache"
wrangler r2 bucket create app-media-assets
```

### ⏳ STEP 3: Database Schema & Seeding
**Goal:** Create D1 tables and sample data

**Deliverables:**
- [ ] SQL migrations in `db/migrations/`
- [ ] Schema tables: `products`, `media_metadata`, `users`
- [ ] Initial seed data (sample products)

### ⏳ STEP 4: Layer 1 - Frontend UI Build
**Goal:** Astro pages + React components consuming design tokens

**Deliverables:**
- [ ] Homepage (`src/pages/index.astro`)
- [ ] Product detail page (`src/pages/products/[id].astro`)
- [ ] Product grid component
- [ ] Navigation & footer
- [ ] Responsive design with mobile-first approach
- [ ] 100 Lighthouse score (performance, SEO, accessibility)

### ⏳ STEP 5: Layer 2 - Backend API Development
**Goal:** Cloudflare Workers routes for data & media management

**Deliverables:**
- [ ] API endpoints:
  - `GET /api/products` - Fetch all products from D1
  - `GET /api/products/[id]` - Fetch single product
  - `POST /api/media/upload` - Handle R2 file uploads
  - `POST /api/webhooks/higgsfield` - Handle Higgsfield generation callbacks
- [ ] JWT validation middleware
- [ ] Error handling & logging
- [ ] CORS configuration

### ⏳ STEP 6: Higgsfield Media Pipeline Integration
**Goal:** Generate & manage product images/videos via Higgsfield AI

**Deliverables:**
- [ ] Higgsfield API wrapper in `src/lib/higgsfield-mcp.ts`
- [ ] Media upload handler (`src/pages/api/media-upload.ts`)
- [ ] Webhook handler for generation callbacks
- [ ] R2 storage & CDN URL generation
- [ ] Admin panel for triggering media generation

### ⏳ STEP 7: Authentication & Admin Dashboard
**Goal:** Secure admin access + media management UI

**Deliverables:**
- [ ] JWT-based authentication
- [ ] Admin login page
- [ ] Media upload & management interface
- [ ] Product CRUD operations
- [ ] Role-based access control (customer vs. admin)

### ⏳ STEP 8: CI/CD & Deployment
**Goal:** Automated deployments to Cloudflare on every push to `main`

**Deliverables:**
- [ ] GitHub Actions workflow for Cloudflare Pages deployment
- [ ] GitHub Actions workflow for Cloudflare Workers deployment
- [ ] Automated tests (unit + integration)
- [ ] Pre-deployment checks (lint, build, type check)

### ⏳ STEP 9: Performance Optimization & Monitoring
**Goal:** Ensure production-grade performance

**Deliverables:**
- [ ] Image optimization (Cloudflare Image Resizing)
- [ ] Video streaming (Cloudflare Stream integration)
- [ ] Cache strategy (KV + Cloudflare Cache)
- [ ] Monitoring setup (Cloudflare Analytics + Custom Metrics)
- [ ] Core Web Vitals optimization

---

## 📋 Pre-Implementation Checklist

Before starting code generation, confirm you have:

### ✅ Access & Credentials
- [ ] Cloudflare Account ID
- [ ] Cloudflare API Token (with `d1:edit`, `r2:edit`, `workers_kv:edit`, `workers:edit` permissions)
- [ ] GitHub repository access (redwanmart/redwanmart.com)
- [ ] Higgsfield AI API key & Workspace ID
- [ ] Custom domain (redwanmart.com) already in Cloudflare DNS

### ✅ Design System
- [ ] Figma file with brand colors, typography, spacing tokens (link in docs/DESIGN_TOKENS.md)
- [ ] Export design tokens as JSON for Tailwind config
- [ ] UI component library reference (Shadcn UI / Headless UI)

### ✅ Business Requirements
- [ ] Product catalog structure (categories, attributes, pricing)
- [ ] Expected features (search, filtering, cart, checkout)
- [ ] Admin requirements (media management, analytics)
- [ ] Performance targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)

---

## 🔗 Quick Reference Links

| Resource | URL | Purpose |
|----------|-----|---------|
| Cloudflare Docs | https://developers.cloudflare.com | Workers, R2, D1, Stream API reference |
| Astro Docs | https://astro.build | Framework & deployment guides |
| Higgsfield MCP | https://mcp.higgsfield.ai | Media generation API |
| Tailwind CSS | https://tailwindcss.com | Styling & design tokens |
| GitHub Actions | https://docs.github.com/en/actions | CI/CD workflows |

---

## 📝 Notes for Claude Code Execution

1. **Branch:** Always work on `claude/web-app-architecture-blueprint-pdnaj1`
2. **Commits:** Push after each major step with descriptive messages
3. **Environment:** Use `.env.local` for secrets; `.env.example` for documentation
4. **Testing:** Verify builds locally (`npm run build`, `wrangler deploy --dry-run`)
5. **Verification:** Check Cloudflare Dashboard after each deployment
6. **Documentation:** Keep this CLAUDE.md updated as implementation progresses

---

**Last Updated:** 2026-08-07  
**Next Immediate Action:** STEP 1 - Project Initialization
