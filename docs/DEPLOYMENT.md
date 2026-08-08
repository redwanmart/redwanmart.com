# Deployment Guide

This document covers setting up and deploying Redwan Mart to Cloudflare infrastructure.

---

## Start here: what is currently blocking deployment

The build pipeline works end to end. On a push to `main`, `.github/workflows/deploy.yml`
checks out, runs `npm ci`, builds, and then stops at the **Check Cloudflare
credentials** step because two repository secrets are missing.

### 1. Two GitHub secrets (required to deploy at all)

Add under **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com/profile/api-tokens — needs *Cloudflare Pages: Edit* |
| `CLOUDFLARE_ACCOUNT_ID` | dash.cloudflare.com — shown in the sidebar |

Once both exist, every push to `main` deploys on its own. Nothing else is needed
for the public storefront: it is fully static and reads its catalogue from
`src/data/products.ts`, so it does not depend on D1, R2 or KV to render.

To deploy without waiting for a push, run the workflow manually from the
**Actions** tab (it accepts `workflow_dispatch`).

### 2. Four runtime secrets (required before the admin area works)

The auth endpoints **fail closed**: until these are set, `/api/auth/login`
returns 503 and no one can sign in. That is deliberate — the previous fallbacks
were fixed strings committed to this repository.

```bash
wrangler pages secret put JWT_SECRET           --project-name=redwanmart  # openssl rand -base64 48
wrangler pages secret put ADMIN_EMAIL          --project-name=redwanmart
wrangler pages secret put ADMIN_PASSWORD       --project-name=redwanmart
wrangler pages secret put ADMIN_ANALYTICS_TOKEN --project-name=redwanmart
```

> **Rotate first.** `admin123` and `owner123` were printed on the public
> `/admin/login` page and committed in source. Treat them as compromised and do
> not reuse them anywhere.

### 3. Publish directory

If you configure Pages through the dashboard rather than this workflow, the
build output directory is **`dist/client`**, not `dist`. The Astro Cloudflare
adapter puts the site there; `dist/server` is build-time output only, so
publishing `dist` yields a site with no `index.html` at its root.

### Before taking real orders

Prices in `src/data/products.ts` are placeholders and are marked as such in the
file. Confirm every `price` and `compareAt` value before the store accepts
money.

---

## Prerequisites

- Cloudflare account with billing enabled
- GitHub repository access
- Domain registered with Cloudflare DNS
- Cloudflare API token with appropriate permissions

## Infrastructure Setup

### 1. Cloudflare Account Configuration

#### API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create a custom token with permissions:
   - Account > Cloudflare Pages > Edit
   - Account > D1 > Edit
   - Account > R2 > Edit
   - Account > Workers KV > Edit
   - Account > Workers Routes > Edit
   - Zone > Zone > Read (for your domain)

3. Save the token - you'll need it for GitHub Actions

#### Account ID
1. Go to https://dash.cloudflare.com
2. Find your Account ID in the sidebar
3. Save it for GitHub Actions secrets

### 2. Cloudflare Pages Setup

#### Create Pages Project
```bash
# Using Wrangler CLI
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Create Pages project (via Dashboard is easier)
# 1. Go to https://dash.cloudflare.com
# 2. Navigate to Pages
# 3. Click "Create a project"
# 4. Connect GitHub repository
# 5. Select production branch (main)
# 6. Configure build settings:
#    - Framework: Astro
#    - Build command: npm run build
#    - Build output directory: dist
```

### 3. Cloudflare D1 Database Setup

#### Create D1 Database
```bash
# Create database
wrangler d1 create app-db-production

# Or via Dashboard:
# 1. Go to https://dash.cloudflare.com
# 2. Navigate to Storage > D1
# 3. Click "Create database"
# 4. Name it "app-db-production"
```

#### Initialize Schema
```bash
# Run migrations
wrangler d1 execute app-db-production --file=./db/migrations/001-init-schema.sql

# Seed data
wrangler d1 execute app-db-production --file=./db/seeds/001-seed-products.sql

# Or manually:
# 1. Go to D1 database in Dashboard
# 2. Click "Console"
# 3. Paste SQL from migration files
# 4. Execute queries
```

### 4. Cloudflare R2 Storage Setup

#### Create R2 Bucket
```bash
# Create bucket
wrangler r2 bucket create app-media-assets

# Or via Dashboard:
# 1. Go to https://dash.cloudflare.com
# 2. Navigate to Storage > R2
# 3. Click "Create bucket"
# 4. Name it "app-media-assets"
# 5. Choose appropriate region
```

#### Configure Custom Domain
1. Go to R2 bucket settings
2. Click "Settings"
3. Configure custom domain: assets.redwanmart.com
4. Update your DNS:
   - CNAME: assets.redwanmart.com → your-account.r2.cloudflarestorage.com

### 5. Cloudflare KV Namespace Setup

#### Create KV Namespace
```bash
# Create namespace
wrangler kv:namespace create "app-cache"

# Or via Dashboard:
# 1. Go to https://dash.cloudflare.com
# 2. Navigate to Storage > KV
# 3. Click "Create namespace"
# 4. Name it "app-cache"
```

### 6. DNS Configuration

Add these records to your Cloudflare DNS:

```
Type    Name                TTL    Value
A       @                   Auto   1.2.3.4 (your server IP if self-hosted)
CNAME   www                 Auto   redwanmart.com
CNAME   api                 Auto   redwanmart.com
CNAME   assets              Auto   your-account.r2.cloudflarestorage.com
CNAME   cdn                 Auto   redwanmart.com
```

## Environment Variables

### GitHub Secrets Configuration

Add these secrets to your GitHub repository settings:

```
CLOUDFLARE_API_TOKEN      = your_api_token
CLOUDFLARE_ACCOUNT_ID     = your_account_id
SLACK_WEBHOOK_URL         = your_slack_webhook (optional)
```

### Local Environment Variables (.env.local)

```bash
# Cloudflare Account
CF_ACCOUNT_ID=your_account_id
CF_API_TOKEN=your_api_token
CF_ZONE_ID=your_zone_id

# R2 Bucket
CF_R2_BUCKET_NAME=app-media-assets
CF_R2_PUBLIC_URL=https://assets.redwanmart.com

# D1 Database
CF_D1_ID=app-db-production

# KV Namespace
CF_KV_NAMESPACE=app-cache

# Higgsfield AI
HIGGSFIELD_API_KEY=your_api_key
HIGGSFIELD_WORKSPACE_ID=your_workspace_id
HIGGSFIELD_WEBHOOK_SECRET=your_webhook_secret

# Authentication
JWT_SECRET=your_secret_key_min_32_chars

# Admin Analytics
ADMIN_ANALYTICS_TOKEN=admin_token_for_analytics

# URLs
APP_URL=http://localhost:3000
ASSETS_URL=https://assets.redwanmart.com
API_URL=http://localhost:3000/api
```

## Local Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/redwanmart/redwanmart.com.git
cd redwanmart.com

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# Note: For local development, you can use mock data without real Cloudflare credentials

# Start development server
npm run dev

# Access at http://localhost:3000
```

### Using Wrangler for Local Testing

```bash
# Test with Cloudflare environment locally
wrangler dev

# This simulates D1, KV, R2, and other Cloudflare services
```

## Production Deployment

### Automated Deployment (GitHub Actions)

1. Push code to main branch
2. GitHub Actions automatically:
   - Runs tests and linting
   - Builds the project
   - Deploys to Cloudflare Pages
   - Notifies team on Slack (if configured)

### Manual Deployment

```bash
# Build locally
npm run build

# Deploy to Cloudflare Pages via Wrangler
wrangler pages publish dist --project-name redwanmart

# Or through GitHub by pushing to main branch
```

### Staging Deployment

1. Code pushed to `develop` branch automatically deploys to staging
2. Staging URL: `https://staging.redwanmart.com` (or staging branch subdomain)

## Database Migrations

### Running New Migrations

```bash
# Create new migration
cat > db/migrations/002-add-new-table.sql << 'EOF'
CREATE TABLE IF NOT EXISTS new_table (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
EOF

# Test locally first
wrangler d1 execute app-db-production --file=./db/migrations/002-add-new-table.sql

# Commit and push - deployment will apply new migrations
```

### Backup Strategy

```bash
# Export database backup
wrangler d1 export app-db-production --output ./backup.sql

# Store backups in secure location (GitHub, cloud storage, etc.)
```

## Performance Optimization

### Enable Caching

1. **Page Caching**
   - Go to Cloudflare dashboard
   - Navigate to Caching > Page Rules
   - Create rule: `redwanmart.com/*` → Cache Level: Cache Everything
   - Set appropriate TTL

2. **Image Optimization**
   - Enable Image Resizing in Cloudflare
   - CDN URLs automatically compress images
   - Example: `https://assets.redwanmart.com/image.jpg?width=800&quality=80`

3. **API Caching**
   - Cache control headers already implemented in API responses
   - GET endpoints cache for 5-60 minutes
   - POST/PUT/DELETE requests not cached

### Monitor Performance

1. Go to Analytics dashboard
2. Review Core Web Vitals
3. Check error rates and latency
4. Optimize based on metrics

## Security

### SSL/TLS Configuration

Cloudflare automatically handles SSL/TLS:
- Always On - HTTPS enforced
- SSL/TLS Encryption Mode: Full (strict) for Pages
- HSTS enabled - all connections encrypted

### Security Headers

Already configured in `_headers` file generated by Astro Cloudflare adapter:
- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

### Rate Limiting

Configure in Cloudflare dashboard:
1. Security > Rate limiting
2. Set rules for API endpoints
3. Limit by IP, fingerprint, or user

### Bot Management

1. Go to Security > Bot Management
2. Enable bot protection
3. Review bot traffic in analytics

## Monitoring & Logging

### Cloudflare Analytics

- Access via https://dash.cloudflare.com/analytics/d/...
- Monitor:
  - Requests per second
  - Error rates
  - Cache hit ratio
  - Bandwidth usage

### Application Logging

Logs are available in:
1. Cloudflare Pages - Build logs
2. Cloudflare D1 - Query logs
3. Cloudflare R2 - Access logs

### Custom Metrics

Send custom metrics from application:
```javascript
// In your API routes or pages
fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify({
    eventType: 'custom_event',
    eventData: { custom: 'data' }
  })
});
```

## Troubleshooting

### Build Failures

```bash
# Check Node version
node --version  # Should be 18.x or 20.x

# Clear build cache
rm -rf dist node_modules/.cache

# Reinstall dependencies
rm package-lock.json
npm install

# Try building locally first
npm run build
```

### Database Connection Issues

```bash
# Test D1 connection
wrangler d1 execute app-db-production --command "SELECT 1"

# Check binding configuration
wrangler pages project list
```

### Deployment Stuck

1. Check GitHub Actions logs
2. Verify Cloudflare API token permissions
3. Check storage quota limits
4. Review Cloudflare status page

## Support

- **Documentation**: https://developers.cloudflare.com
- **GitHub Issues**: https://github.com/redwanmart/redwanmart.com/issues
- **Cloudflare Support**: https://support.cloudflare.com
- **Community Discord**: Join Cloudflare Discord for support
