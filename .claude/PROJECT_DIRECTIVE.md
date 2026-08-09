# PROJECT DIRECTIVE – Redwan Mart E-Commerce Platform

**STRICT PROJECT SCOPE & REQUIREMENTS**

This document establishes the definitive project scope, authorized repositories, infrastructure, and technical stack for ALL work on the Redwan Mart e-commerce platform. This directive is **binding for all development sessions** and must be referenced before beginning any work.

---

## 🔒 PROJECT BOUNDARIES (STRICT)

### Authorized Repository (ONLY)
- **GitHub Organization**: `redwanmart`
- **Repository Name**: `redwanmart.com`
- **GitHub URL**: https://github.com/redwanmart/redwanmart.com
- **Approved Branches**: `main`, `develop`, `claude/*`
- **Default Branch**: `main` (production)

**RULE**: No work on any other repository. Any requests to work on repositories outside `redwanmart/redwanmart.com` must be explicitly rejected.

### Authorized Cloud Account (ONLY)
- **Cloudflare Account Email**: `redwanmartbd@gmail.com`
- **Cloudflare Account Only**: Redwan Mart production account
- **Domain**: `redwanmart.com` (and subdomains)
- **No Other Accounts**: Do not work with other Cloudflare accounts or domains

**RULE**: All infrastructure, storage, databases, and services must be in the `redwanmartbd@gmail.com` Cloudflare account ONLY.

### Authorized Deployment Targets (ONLY)
- **Production**: https://redwanmart.com (main branch)
- **Staging**: https://staging.redwanmart.com (develop branch)
- **No Other Deployments**: Do not deploy anywhere else

**RULE**: Only deploy to Cloudflare Pages under the `redwanmartbd@gmail.com` account.

---

## 📚 COMPLETE TECHNOLOGY STACK

### Frontend (Layer 1)
```
Framework:          Astro 7.x (Latest)
Language:           TypeScript (strict mode)
UI Framework:       React components (optional, in .astro files)
Styling:            Tailwind CSS v4
CSS Preprocessor:   PostCSS + Autoprefixer
Design System:      Custom tokens (Figma → Tailwind config)
Templating:         Astro syntax (.astro files)
Package Manager:    npm (v10+)
Node.js:            22.x or 24.x (strict)
```

### Backend (Layer 2)
```
Compute:            Cloudflare Pages Functions + Workers
Database:           Cloudflare D1 (SQLite serverless)
Storage:            Cloudflare R2 (S3-compatible object storage)
Cache:              Cloudflare KV (key-value store)
Video:              Cloudflare Stream (HLS adaptive bitrate)
Image Processing:   Cloudflare Image Resizing
Media Generation:   Higgsfield AI (optional integration)
```

### Infrastructure & DevOps
```
Hosting:            Cloudflare Pages (automatic)
DNS & CDN:          Cloudflare (automatic)
SSL/TLS:            Cloudflare automatic (Full Strict)
CI/CD:              GitHub Actions
Deployment Tool:    wrangler-action@v3 (Cloudflare's official)
Configuration:      wrangler.toml + astro.config.mjs
Monitoring:         Cloudflare Analytics + GitHub Actions logs
```

### Development Tools
```
Build Tool:         Vite (via Astro)
Type Checking:      TypeScript (tsc --noEmit)
Linting:            ESLint
Code Formatting:    Prettier
Testing:            Vitest (when configured)
Local Dev:          npm run dev (port 3000)
Preview:            npm run preview (static server)
Database CLI:       wrangler d1
API Testing:        curl / Postman / HTTP client
Git Workflow:       GitHub Flow (main, develop, feature branches)
```

### Dependencies (Key Packages)
```
astro:                  ^7.x
@astrojs/cloudflare:    ^11.x (adapter)
@astrojs/react:         ^4.x (optional)
@astrojs/tailwind:      ^5.x
tailwindcss:            ^4.x
typescript:             ^5.x
@cloudflare/workers-types: latest
wrangler:               ^3.x (local CLI)
sharp:                  (for image processing)
esbuild:                (Astro bundles)
```

### Environment Variables (Complete List)

**Development (.env.local - gitignored)**
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

# KV Namespace (Caching)
CF_KV_NAMESPACE=app-cache

# Higgsfield AI (Media Generation)
HIGGSFIELD_API_KEY=your_api_key
HIGGSFIELD_WORKSPACE_ID=your_workspace_id
HIGGSFIELD_WEBHOOK_SECRET=your_webhook_secret

# Authentication & Security
JWT_SECRET=your_secret_key_min_32_chars
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_ANALYTICS_TOKEN=your_analytics_token

# URLs
APP_URL=http://localhost:3000
ASSETS_URL=https://assets.redwanmart.com
API_URL=http://localhost:3000/api
```

**GitHub Secrets (Actions)**
```
CLOUDFLARE_API_TOKEN        (required for deployment)
CLOUDFLARE_ACCOUNT_ID       (required for deployment)
SLACK_WEBHOOK_URL           (optional, for notifications)
```

**Cloudflare Runtime Secrets (Pages Environment)**
```
JWT_SECRET                  (min 32 characters)
ADMIN_EMAIL                 (admin login email)
ADMIN_PASSWORD              (admin login password)
ADMIN_ANALYTICS_TOKEN       (for analytics tracking)
```

---

## 📁 PROJECT STRUCTURE (CANONICAL)

```
redwanmart.com/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro        (Main template)
│   │   └── DashboardLayout.astro   (Admin template)
│   ├── pages/
│   │   ├── index.astro             (Homepage /)
│   │   ├── products.astro          (Catalog /products)
│   │   ├── products/[id].astro     (Detail /products/[id])
│   │   ├── search.astro            (/search)
│   │   ├── about.astro             (/about)
│   │   ├── 404.astro               (Error page)
│   │   ├── sitemap.xml.ts          (SEO sitemap)
│   │   ├── robots.txt.ts           (Crawling directives)
│   │   ├── admin/
│   │   │   ├── login.astro         (/admin/login)
│   │   │   └── dashboard.astro     (/admin/dashboard)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login.ts        (POST authentication)
│   │       │   └── verifyToken.ts  (GET token validation)
│   │       ├── products.ts         (GET products)
│   │       ├── media-upload.ts     (POST file upload)
│   │       ├── analytics.ts        (POST event tracking)
│   │       ├── health.ts           (GET health check)
│   │       └── webhooks/
│   │           └── higgsfield.ts   (POST media generation webhook)
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── Navigation.astro
│   │   │   └── Footer.astro
│   │   ├── hero/
│   │   │   └── HeroSection.astro
│   │   ├── product-grid/
│   │   │   └── ProductCard.astro
│   │   └── design-system/          (Reusable UI components)
│   ├── data/
│   │   └── products.ts             (SINGLE SOURCE OF TRUTH - Product catalog)
│   ├── lib/
│   │   ├── cloudflare.ts           (D1, R2, KV clients)
│   │   ├── auth.ts                 (JWT & auth helpers)
│   │   ├── higgsfield-mcp.ts       (Media generation API)
│   │   └── utils.ts                (Helper functions)
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tokens.css              (Design system)
│   │   └── tailwind.config.ts      (Tailwind + tokens)
│   └── env.d.ts                    (Type definitions)
├── public/
│   ├── brand/
│   │   ├── mark.png                (Logo)
│   │   ├── lockup-red.png          (Red wordmark)
│   │   └── lockup-white.png        (White wordmark)
│   ├── products/                   (Product images)
│   │   ├── q5047.jpg/.webp
│   │   ├── f3029.jpg/.webp
│   │   ├── f3024.jpg/.webp
│   │   ├── f3022.jpg/.webp
│   │   ├── f3025.jpg/.webp
│   │   └── q5046.jpg/.webp
│   ├── founder.jpg/.webp           (Founder photo)
│   ├── og-image.jpg                (Open Graph)
│   ├── favicon-*.png               (Favicons)
│   ├── robots.txt                  (Auto-generated)
│   └── sitemap.xml                 (Auto-generated)
├── db/
│   ├── migrations/
│   │   └── 001-init-schema.sql     (Database schema)
│   └── seeds/
│       └── 001-seed-products.sql   (Initial data)
├── functions/
│   └── [[path]].ts                 (Cloudflare Pages Functions)
├── .github/
│   └── workflows/
│       ├── ci.yml                  (Tests & lint)
│       ├── deploy.yml              (Production deploy)
│       └── ...other workflows
├── docs/
│   ├── API.md                      (API reference)
│   ├── DEPLOYMENT.md               (Setup guide)
│   └── MEDIA-PIPELINE.md           (Higgsfield integration)
├── .claude/
│   ├── PROJECT_DIRECTIVE.md        (THIS FILE - Strict project scope)
│   └── settings.json               (Claude Code settings)
├── wrangler.toml                   (Cloudflare config)
├── astro.config.mjs                (Astro config)
├── tailwind.config.ts              (Tailwind config)
├── postcss.config.cjs              (PostCSS config)
├── tsconfig.json                   (TypeScript config)
├── package.json                    (Dependencies)
├── package-lock.json               (Lock file - cross-platform)
├── .env.example                    (Documentation)
├── .gitignore                      (Git ignore rules)
├── README.md                       (Project overview)
├── GOING_LIVE.md                   (Deployment guide)
├── BUILD_STATUS.md                 (Completion report)
├── MAINTENANCE.md                  (Dev guide)
├── QUICK_REFERENCE.md              (Cheat sheet)
└── CLAUDE.md                       (Architecture blueprint)
```

---

## 🎯 PRODUCT CATALOG (SINGLE SOURCE OF TRUTH)

**File**: `src/data/products.ts`

All products are defined here. **NO OTHER PRODUCT SOURCES** exist.

```typescript
export const products = [
  {
    id: 'q5047',           // Unique ID
    name: 'Hero Block - Dark Knight Edition',
    series: 'Hero Block',  // Must be 'Hero Block' or 'Spidey Block'
    model: 'Q5047',
    description: 'Full description...',
    tagline: 'Short tagline',
    price: 690,            // BDT (must be updated - placeholder)
    compareAt: 890,        // Original price (must be updated - placeholder)
    imageJpeg: '/products/q5047.jpg',
    imageWebp: '/products/q5047.webp',
    imageThumbnail: '/products/q5047-thumb.jpg',
  },
  // ... 5 more products
];
```

**Products Included** (All 6):
1. Q5047 – Hero Block - Dark Knight Edition
2. F3029 – Spidey Block - Web Edition
3. F3024 – Hero Block - Shadow Symbiote Edition
4. F3022 – Hero Block - Crimson Merc Edition
5. F3025 – Hero Block - Star Captain Edition
6. Q5046 – Spidey Block - Web Edition Micro

**RULE**: To add/edit products, ONLY modify `src/data/products.ts`. No other sources.

---

## 🎨 DESIGN SYSTEM (LOCKED)

### Brand Colors
```
Primary Red:        #CC2028 (brand.600)
Gold Accent:        #F0B850 (gold.400)
Text (Ink):         #0A0A0A (ink)
Surface:            #F5F5F5 (surface)
```

**File**: `tailwind.config.ts`

All colors are defined here. Design tokens flow from Figma → Tailwind config.

### Typography
```
Body:               Inter (system default)
Headings:           Poppins
Font Sizes:         8 scale steps (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
Line Heights:       Tailwind defaults
Letter Spacing:     Tailwind defaults
```

### Spacing & Layout
```
Grid:               sm:2, md:2-3, lg:3
Container:          container-app (custom, Tailwind)
Gap:                6, 8, 12 (Tailwind scale)
Padding:            Tailwind scale (2, 4, 6, 8, 12, 16, 20, 24...)
Breakpoints:        sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px
```

---

## 🔐 SECURITY POLICY (STRICT)

### Authentication
- **Method**: JWT tokens (24-hour expiration)
- **Signing**: HS256 with JWT_SECRET (min 32 characters)
- **Password**: Timing-safe comparison (crypto.timingSafeEqual)
- **Fail-Closed**: All auth endpoints return 503 if secrets missing

### Credentials Management
```
RULE: NO hardcoded credentials in any file
RULE: All secrets load from environment ONLY
RULE: .env.local is gitignored and never committed
RULE: .env.example documents secrets WITHOUT values
RULE: GitHub Secrets only for CI/CD (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
RULE: Cloudflare Runtime Secrets for application (JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD)
```

### Previous Compromised Credentials (DO NOT REUSE)
```
admin123 (was exposed on public /admin/login page)
owner123 (was exposed in API source code)
→ Treat as compromised, rotate immediately if ever used
```

### HTTPS & TLS
- **SSL/TLS**: Cloudflare automatic (Full Strict)
- **Domain**: redwanmart.com with Cloudflare DNS
- **Enforcement**: HTTPS only (HTTP redirects to HTTPS)
- **HSTS**: Enabled via Cloudflare headers

### API Security
- **CORS**: Configured for redwanmart.com origin only
- **CSP**: Content-Security-Policy headers set
- **X-Frame-Options**: DENY (prevent clickjacking)
- **X-Content-Type-Options**: nosniff
- **Rate Limiting**: Available via Cloudflare (not yet configured)

---

## 📊 DATABASE SCHEMA (PREPARED, NOT YET ACTIVE)

**D1 Database**: `app-db-production`

**Tables** (from `db/migrations/001-init-schema.sql`):
1. products – Product catalog
2. categories – Product categories
3. media_metadata – Image/video tracking
4. users – User accounts
5. orders – Order records
6. order_items – Order line items
7. reviews – Product reviews
8. carts – Shopping carts
9. cart_items – Cart line items
10. analytics_events – Event tracking
11. audit_logs – System audit log

**RULE**: Database schema exists but is NOT active in production yet. Products are served from `src/data/products.ts` instead.

---

## 🚀 DEPLOYMENT PIPELINE (STRICT)

### GitHub Actions Workflows

**ci.yml** (Tests & Validation)
- Triggers: Push to any branch, Pull Requests
- Node versions: 22.x, 24.x
- Steps: Checkout → npm ci → npm run build → npm run type-check → npm run lint
- Output: Build logs on GitHub Actions

**deploy.yml** (Production Deployment)
- Triggers: Push to `main` or `develop` branches, manual workflow dispatch
- Environment check: Verifies CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID secrets exist
- Build: `npm run build` (output: dist/client/)
- Deploy: `wrangler pages deploy dist/client` via cloudflare/wrangler-action@v3
- Environments: `main` → production, `develop` → staging
- Duration: 2-3 minutes typical

### Deployment Targets
```
main branch     → https://redwanmart.com        (PRODUCTION)
develop branch  → https://staging.redwanmart.com (STAGING)
```

**RULE**: Only these two branches auto-deploy. Feature branches do not deploy.

### Build Output
```
dist/
├── client/                   ← Cloudflare Pages publishes THIS directory
│   ├── index.html
│   ├── _astro/               (CSS, JS bundles)
│   ├── products/             (13 pages total)
│   ├── brand/, products/     (85 images)
│   └── sitemap.xml, robots.txt
└── server/                   (build-time only, not deployed)
```

**RULE**: Always publish `dist/client`, never `dist/` or `dist/server`.

---

## ✅ BUILD REQUIREMENTS (STRICT)

### Local Builds
```bash
npm run build          # Must complete without errors
npm run type-check     # tsc --noEmit must return 0 errors
npm run lint           # ESLint must pass
npm run preview        # Must render all 13 pages
```

### Production Builds (GitHub Actions)
```
Passes:  ✅ Checkout → npm ci → build → type-check → lint
Fails:   ✗ If CLOUDFLARE_* secrets missing (intentional fail-closed)
```

### TypeScript Strict Mode
```
RULE: tsconfig.json MUST have "strict": true
RULE: All .ts and .astro files must have 0 type errors
RULE: `tsc --noEmit` must report 0 errors before committing
RULE: New code must pass strict type checking
```

---

## 📝 GIT WORKFLOW (STRICT)

### Branch Strategy
```
main         (production, auto-deploys to redwanmart.com)
develop      (staging, auto-deploys to staging.redwanmart.com)
claude/*     (feature branches for Claude Code sessions)
feature/*    (optional manual feature branches)
```

### Commit Message Format
```
Format:  [type]: [description]
Types:   feat, fix, docs, style, refactor, test, chore, security

Examples:
  ✓ "feat: Add product search functionality"
  ✓ "fix: Correct image loading on product pages"
  ✓ "docs: Update deployment guide"
  ✓ "security: Rotate admin credentials"
  ✓ "chore: Update dependencies"
```

### Pull Requests (When Creating)
```
RULE: Check for .github/pull_request_template.md
RULE: Match template structure and sections
RULE: Include detailed description of changes
RULE: Link relevant issues
RULE: Require: Type check passing, build passing, no TypeScript errors
```

### Pushing to GitHub
```bash
# For new commits on existing branch:
git push origin <branch-name>

# For new branch (first time):
git push -u origin <branch-name>

# Network errors: Retry up to 4 times with exponential backoff
# Wait: 2s → 4s → 8s → 16s between attempts
```

---

## 📋 CONTINUOUS DEVELOPMENT AFTER LAUNCH

### Adding Products
1. Edit `src/data/products.ts`
2. Add image files to `public/products/`
3. Commit and push to `main`
4. Site auto-redeploys in 2-3 minutes

### Updating Content
1. Edit `.astro` page files in `src/pages/`
2. Commit and push to `main`
3. Site auto-redeploys in 2-3 minutes

### Changing Prices
1. Edit `price` and `compareAt` in `src/data/products.ts`
2. Commit and push to `main`
3. Site auto-redeploys in 2-3 minutes

### Testing Changes First
1. Push to `develop` branch
2. Test at https://staging.redwanmart.com (2-3 minutes)
3. If good, merge `develop` into `main`
4. Site auto-deploys to production

---

## 🚫 WHAT IS NOT ALLOWED

**STRICTLY PROHIBITED**:
- [ ] Working on other repositories (redwanmart/* only)
- [ ] Deploying to other Cloudflare accounts
- [ ] Hardcoding credentials in source code
- [ ] Committing `.env.local`, `.env.production`, or secrets files
- [ ] Publishing from branches other than `main` and `develop`
- [ ] Modifying domain configuration (already set up)
- [ ] Adding unapproved dependencies without review
- [ ] Removing or disabling TypeScript strict mode
- [ ] Publishing false credentials to GitHub (even for testing)
- [ ] Deleting or renaming existing database tables
- [ ] Disabling security headers or CORS

---

## ✨ QUALITY STANDARDS (REQUIRED)

### Every Commit Must:
- ✅ Pass TypeScript strict type checking (`tsc --noEmit`)
- ✅ Pass linting (`npm run lint`)
- ✅ Pass build (`npm run build`)
- ✅ Have descriptive commit message
- ✅ Not introduce new dependencies without justification
- ✅ Maintain responsive design (mobile-first, 390px+)
- ✅ Maintain performance (Lighthouse 95+)
- ✅ Not break existing functionality

### Code Review Checklist:
- ✅ All imports resolved correctly
- ✅ No console.log or debugger statements in production code
- ✅ No commented-out code blocks
- ✅ Error handling implemented
- ✅ Security best practices followed
- ✅ Accessibility maintained (semantic HTML, ARIA)
- ✅ No TypeScript `any` types (strict types required)

---

## 📞 SUPPORT & REFERENCES

### Documentation Files (In Repo)
- `GOING_LIVE.md` – Deployment guide
- `QUICK_REFERENCE.md` – Common operations
- `BUILD_STATUS.md` – Project completion report
- `MAINTENANCE.md` – Ongoing development
- `docs/API.md` – API reference
- `docs/DEPLOYMENT.md` – Infrastructure setup
- `CLAUDE.md` – Architecture blueprint
- `README.md` – Project overview

### External References
- Astro: https://docs.astro.build
- Cloudflare Pages: https://developers.cloudflare.com/pages
- Cloudflare D1: https://developers.cloudflare.com/d1
- Cloudflare R2: https://developers.cloudflare.com/r2
- Cloudflare KV: https://developers.cloudflare.com/kv
- Tailwind CSS: https://tailwindcss.com
- TypeScript: https://www.typescriptlang.org
- GitHub Actions: https://docs.github.com/en/actions

### Links (Always Use These)
- **Repository**: https://github.com/redwanmart/redwanmart.com
- **Production**: https://redwanmart.com
- **Staging**: https://staging.redwanmart.com
- **Admin Login**: https://redwanmart.com/admin/login
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Actions**: https://github.com/redwanmart/redwanmart.com/actions

---

## 🎯 SUMMARY

This directive establishes **strict, non-negotiable boundaries** for all Redwan Mart development:

1. **ONE repository**: `redwanmart/redwanmart.com` (GitHub only)
2. **ONE account**: `redwanmartbd@gmail.com` (Cloudflare only)
3. **ONE domain**: `redwanmart.com` (no other domains)
4. **ONE tech stack**: Astro 7 + Cloudflare + TypeScript (as documented above)
5. **ONE product source**: `src/data/products.ts` (no alternatives)
6. **ZERO hardcoded secrets**: All from environment variables only
7. **ZERO exceptions**: Follow these rules without deviation

**Any request to deviate from this directive must be explicitly approved by the project owner (redwanmartbd@gmail.com) before proceeding.**

---

## 📌 ACKNOWLEDGMENT

This PROJECT_DIRECTIVE.md is the **authoritative reference** for all Redwan Mart development. Before starting any work session, confirm:

- [ ] You have read and understood this directive
- [ ] You are working on the correct repository (redwanmart/redwanmart.com)
- [ ] You are using the correct Cloudflare account (redwanmartbd@gmail.com)
- [ ] You are following the approved technology stack
- [ ] You have no other competing projects
- [ ] All deployment is to authorized targets only

---

**Version**: 1.0  
**Last Updated**: August 9, 2026  
**Authority**: Project Owner (redwanmartbd@gmail.com)  
**Scope**: Redwan Mart E-Commerce Platform (https://redwanmart.com)  
**Binding**: All development sessions, all developers, no exceptions.
