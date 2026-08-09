# Maintenance & Ongoing Development Guide

This document provides guidance for maintaining and extending the Redwan Mart platform after deployment.

---

## 📝 Common Tasks

### Add a New Product

1. **Edit the product catalog**:
   ```bash
   vim src/data/products.ts
   ```

2. **Add entry to the products array**:
   ```typescript
   {
     id: 'q5048',  // Unique ID
     name: 'Your Product Name',
     series: 'Hero Block',  // or 'Spidey Block'
     model: 'Model Number',
     description: 'Full product description...',
     tagline: 'Short tagline for listings',
     price: 690,  // BDT
     compareAt: 890,  // Original price
     imageJpeg: '/products/q5048.jpg',
     imageWebp: '/products/q5048.webp',
     imageThumbnail: '/products/q5048-thumb.jpg',
   }
   ```

3. **Add product images**:
   - Place `q5048.jpg` and `q5048.webp` in `public/products/`
   - Images should be 1200×1200px (JPEG & WebP)
   - Use ImageMagick or Sharp to optimize:
     ```bash
     convert input.jpg -quality 85 -strip public/products/q5048.jpg
     cwebp -q 85 input.jpg -o public/products/q5048.webp
     ```

4. **Commit and push**:
   ```bash
   git add src/data/products.ts public/products/q5048.*
   git commit -m "Add new product: q5048 - Product Name"
   git push origin main
   ```

5. **Site auto-deploys** (2-3 minutes via GitHub Actions)

✅ **New product is now live** – automatically appears in catalog, search, and sitemap.

---

### Update a Product

Edit the product in `src/data/products.ts` and push:
```bash
git add src/data/products.ts
git commit -m "Update product: q5047 - Hero Block [price/description/images]"
git push origin main
```

The site redeploys automatically. No manual rebuild needed.

---

### Update Prices

Edit `src/data/products.ts` and update `price` and `compareAt` fields:
```typescript
{
  id: 'q5047',
  price: 750,  // New price
  compareAt: 950,  // New original price
  // ...
}
```

Commit and push – redeploys in 2-3 minutes.

---

### Update Static Content

All pages are in `src/pages/`:

- **Homepage**: `src/pages/index.astro`
- **Products**: `src/pages/products.astro`
- **About**: `src/pages/about.astro`
- **Search**: `src/pages/search.astro`

Edit any `.astro` file and push to auto-deploy.

---

### Update Navigation / Header / Footer

Edit these components:
- **Navigation**: `src/components/navigation/Navigation.astro`
- **Footer**: `src/components/navigation/Footer.astro`

Push changes → auto-deploy in 2-3 minutes.

---

### Change Brand Colors

Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      brand: {
        600: '#NEW_COLOR',  // Change this
      },
      gold: {
        400: '#NEW_GOLD',  // Or this
      },
    },
  },
}
```

Commit → auto-redeploy.

---

### Deploy to Staging First (Optional)

To test changes before production:

1. Push to `develop` branch:
   ```bash
   git checkout develop
   git add .
   git commit -m "Test feature: [description]"
   git push origin develop
   ```

2. Site auto-deploys to https://staging.redwanmart.com (2-3 minutes)

3. Test thoroughly, then merge to main:
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

4. Production auto-deploys.

---

## 🔧 Local Development

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3000. Hot-reload on file changes.

### Build Locally

```bash
npm run build
npm run preview  # Preview the production build
```

### Type Checking

```bash
npm run type-check  # Check for TypeScript errors
```

### Code Quality

```bash
npm run lint      # Check code style
npm run format    # Auto-format code
```

---

## 🛠️ Advanced Tasks

### Add a New Page

Create `src/pages/page-name.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const title = "Page Title";
const description = "Page description for SEO";
---

<BaseLayout {title} {description}>
  <section class="container-app py-20">
    <h1 class="text-title">Page Title</h1>
    <p>Your content here...</p>
  </section>
</BaseLayout>
```

Astro auto-creates `/page-name/` route. No config needed.

### Add a New Component

Create `src/components/MyComponent.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<div class="card">
  <h2 class="text-lg font-bold">{title}</h2>
  <p>{description}</p>
</div>

<style>
  .card {
    @apply rounded-lg border border-surface-line p-4;
  }
</style>
```

Import and use it in pages:

```astro
import MyComponent from '../components/MyComponent.astro';

<MyComponent title="Hello" description="World" />
```

### Modify API Endpoints

API routes are in `src/pages/api/`:

```typescript
// src/pages/api/custom.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
  // Access Cloudflare bindings via locals.runtime
  const db = locals.runtime.env.DB;
  
  // Your logic here...
  
  return new Response(JSON.stringify({ data: 'value' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

Route auto-creates at `/api/custom`.

### Add Environment Variables

1. Update `.env.local` (local only):
   ```bash
   NEW_VAR=value
   ```

2. Update `.env.example` (documentation):
   ```bash
   NEW_VAR=your_value_here
   ```

3. Access in code:
   ```typescript
   const value = import.meta.env.NEW_VAR;
   ```

4. For Cloudflare secrets, add via dashboard:
   - Cloudflare Pages → Settings → Environment variables

---

## 📊 Database & Backend

### Query the Database

Use the `CloudflareClient` from `src/lib/cloudflare.ts`:

```typescript
import { CloudflareClient } from '../lib/cloudflare';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime.env.DB;
  const client = new CloudflareClient(db);
  
  const results = await client.queryDB(
    'SELECT * FROM products WHERE id = ?',
    [productId]
  );
  
  return new Response(JSON.stringify(results));
};
```

### Run Database Migrations

1. Create migration in `db/migrations/002-your-migration.sql`
2. Execute locally:
   ```bash
   wrangler d1 execute app-db-production --file=./db/migrations/002-your-migration.sql
   ```
3. Commit and push – deployment applies migrations

### Upload Media to R2

Use the media upload endpoint:

```bash
curl -X POST https://redwanmart.com/api/media-upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@product.jpg" \
  -F "productId=q5047"
```

Returns R2 URL and metadata.

---

## 🚀 Deployment & Monitoring

### Monitor Deployments

1. **GitHub Actions**: https://github.com/redwanmart/redwanmart.com/actions
2. **Cloudflare Pages**: https://dash.cloudflare.com → Pages → redwanmart

### Check Site Status

```bash
# Health check endpoint
curl https://redwanmart.com/api/health

# Response example:
# {"status":"ok","timestamp":"2026-08-09T20:32:00Z"}
```

### View Build Logs

1. Go to GitHub Actions tab
2. Click latest "Deploy to Cloudflare Pages" run
3. Expand steps to see logs

### Rollback a Deployment

1. Go to Cloudflare Pages dashboard
2. Click "Deployments"
3. Find previous successful deployment
4. Click "Rollback" button

Or in GitHub:
```bash
git revert <commit_hash>
git push origin main  # Redeploys
```

---

## 🔐 Security Best Practices

### Update Secrets Regularly

Every 90 days:
1. Generate new JWT_SECRET:
   ```bash
   openssl rand -base64 48
   ```
2. Update in Cloudflare Pages environment variables
3. Restart admin session

### Audit Access

1. Check Cloudflare audit logs: https://dash.cloudflare.com → Account → Audit Log
2. Review GitHub Actions history: Actions tab
3. Monitor D1 query logs (if enabled)

### Rotate Credentials

If credentials are compromised:

1. **GitHub Secrets**:
   - Settings → Secrets and variables → Actions
   - Delete and recreate compromised secret
   - Previous deployments unaffected

2. **Cloudflare Secrets**:
   - Pages → redwanmart → Settings → Environment variables
   - Delete and recreate secret
   - Takes effect on next deploy

3. **Admin Password**:
   - Only stored in environment (not in code)
   - Update via Cloudflare dashboard
   - Users must re-login

---

## 📈 Performance Optimization

### Image Optimization

Always upload optimized images:

```bash
# Convert to WebP
cwebp -q 85 input.jpg -o output.webp

# Resize large images
convert input.jpg -resize 1200x1200 -quality 85 -strip output.jpg

# Batch convert
for f in products/*.jpg; do
  cwebp -q 85 "$f" -o "${f%.jpg}.webp"
done
```

### Cache Strategy

All responses include cache headers:

```
// Static assets (_astro/*, images/)
Cache-Control: public, max-age=31536000, immutable

// HTML pages
Cache-Control: public, max-age=3600

// API endpoints
Cache-Control: public, max-age=300
```

To bypass cache during development:
```bash
curl -H "Cache-Control: no-cache" https://redwanmart.com
```

### Monitor Core Web Vitals

1. Check Cloudflare Analytics: https://dash.cloudflare.com → Analytics
2. Run Lighthouse:
   ```bash
   npm run lighthouse  # If configured
   ```
3. Google Search Console: https://search.google.com/search-console

---

## 🐛 Troubleshooting

### Build Fails Locally

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Stuck

1. Check GitHub Actions logs
2. Verify Cloudflare API token has correct permissions
3. Check Cloudflare status page: https://www.cloudflarestatus.com
4. Manually trigger workflow in Actions tab

### Pages Show Old Content

1. Clear Cloudflare cache:
   - Cloudflare Dashboard → Caching → Cache Purge → Purge Everything
2. Hard refresh in browser (Ctrl+Shift+R)
3. Check deployment status in Cloudflare Pages dashboard

### Admin Login Returns 503

1. Verify Cloudflare environment variables are set
2. Check JWT_SECRET is ≥32 characters
3. Restart: redeploy the site from GitHub

### Database Errors

1. Check D1 is properly bound in `wrangler.toml`
2. Verify database exists: https://dash.cloudflare.com → Storage → D1
3. Test locally: `wrangler d1 execute app-db-production --command "SELECT 1"`

---

## 📚 References

- **Astro Docs**: https://docs.astro.build
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Tailwind CSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org
- **GitHub Actions**: https://docs.github.com/en/actions

---

## ✅ Maintenance Checklist

Every month:
- [ ] Review GitHub Actions for failed builds
- [ ] Check Cloudflare Analytics for errors
- [ ] Update npm dependencies: `npm update`
- [ ] Run type check: `npm run type-check`
- [ ] Test all product pages
- [ ] Test search functionality
- [ ] Test admin login

Every quarter:
- [ ] Review and update prices
- [ ] Add/remove expired products
- [ ] Rotate admin credentials
- [ ] Audit access logs
- [ ] Update brand assets if needed
- [ ] Performance optimization review

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run type-check    # Check TypeScript
npm run lint          # Lint code
npm run format        # Format code

# Deployment
git push origin main  # Deploy to production
git push origin develop  # Deploy to staging

# Database (requires Wrangler)
wrangler d1 execute app-db-production --command "SELECT * FROM products"

# Cloudflare
wrangler pages publish dist/client  # Manual deployment
wrangler pages list  # View deployments
```

---

## 📞 Support

For issues:
1. Check this guide (MAINTENANCE.md)
2. Check build logs: GitHub Actions
3. Check status: https://www.cloudflarestatus.com
4. Contact: redwanmartbd@gmail.com

---

**Last Updated**: August 9, 2026  
**Prepared by**: Claude Code (Development Agent)
