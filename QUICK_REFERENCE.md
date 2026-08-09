# Quick Reference – Most Common Operations

## 🚀 Deploy Your Changes

```bash
git add .
git commit -m "Your change description"
git push origin main
# Site auto-deploys in 2-3 minutes ✅
```

---

## 📦 Add a New Product

1. Edit `src/data/products.ts`:
```typescript
{
  id: 'q5048',
  name: 'Product Name',
  series: 'Hero Block',
  price: 690,
  compareAt: 890,
  imageJpeg: '/products/q5048.jpg',
  imageWebp: '/products/q5048.webp',
}
```

2. Add images to `public/products/q5048.jpg` and `.webp`

3. Push:
```bash
git add src/data/products.ts public/products/q5048.*
git commit -m "Add: q5048 - Product Name"
git push origin main
```

---

## 💰 Update Product Prices

Edit `src/data/products.ts` and update `price` and `compareAt`:

```bash
git add src/data/products.ts
git commit -m "Update prices"
git push origin main
```

---

## 📝 Update Homepage Content

Edit `src/pages/index.astro` and push:

```bash
git add src/pages/index.astro
git commit -m "Update homepage"
git push origin main
```

---

## 🎨 Change Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  brand: {
    600: '#NEW_COLOR',  // Main red
  },
  gold: {
    400: '#NEW_GOLD',   // Accent gold
  },
}
```

Push → auto-redeploys.

---

## 🔐 Admin Login Credentials

**Access**: https://redwanmart.com/admin/login  
**Email**: Check Cloudflare Pages environment variables  
**Password**: Check Cloudflare Pages environment variables

To change password:
1. Update in Cloudflare Pages → Settings → Environment variables
2. Redeploy site
3. Use new credentials at login page

---

## 📊 Check Site Status

**Is it live?** → https://redwanmart.com  
**Staging?** → https://staging.redwanmart.com  
**Health check?** → https://redwanmart.com/api/health  

**Deployment status?**
- GitHub Actions: https://github.com/redwanmart/redwanmart.com/actions
- Cloudflare: https://dash.cloudflare.com → Pages → redwanmart

---

## 🐛 Quick Fixes

### Site shows old content
```bash
# Clear Cloudflare cache
# Visit: https://dash.cloudflare.com → Caching → Cache Purge → Purge Everything

# Or hard-refresh browser
# Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### Build fails
```bash
npm install  # Reinstall dependencies
npm run build  # Retry build
```

### Deployment stuck
1. Check GitHub Actions logs (Actions tab)
2. Check Cloudflare status: https://www.cloudflarestatus.com
3. Manually trigger: Actions tab → "Deploy to Cloudflare Pages" → "Run workflow"

---

## 👨‍💻 Development Commands

```bash
npm run dev          # Local dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run type-check   # Check TypeScript errors
npm run lint         # Check code style
npm run format       # Auto-format code
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/data/products.ts` | Product catalog (single source of truth) |
| `src/pages/index.astro` | Homepage |
| `src/pages/products.astro` | Product catalog page |
| `src/pages/about.astro` | About page |
| `tailwind.config.ts` | Colors, fonts, spacing |
| `.env.example` | Environment variables documentation |
| `.github/workflows/deploy.yml` | Auto-deployment config |

---

## 🔗 Important Links

| Link | Purpose |
|------|---------|
| https://redwanmart.com | Live site |
| https://staging.redwanmart.com | Staging/test site |
| https://github.com/redwanmart/redwanmart.com | GitHub repo |
| https://github.com/redwanmart/redwanmart.com/actions | Deployment status |
| https://dash.cloudflare.com | Cloudflare dashboard |

---

## 📖 Full Documentation

- **Going Live**: [GOING_LIVE.md](GOING_LIVE.md) ← Start here
- **Build Status**: [BUILD_STATUS.md](BUILD_STATUS.md)
- **Maintenance**: [MAINTENANCE.md](MAINTENANCE.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Deployment**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Architecture**: [CLAUDE.md](CLAUDE.md)

---

## ✅ Pre-Launch Checklist

- [ ] GitHub secrets added (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- [ ] Site deployed and live at redwanmart.com
- [ ] Cloudflare runtime secrets configured
- [ ] Product prices updated from placeholders
- [ ] Admin login tested
- [ ] All 6 products showing correctly
- [ ] Search working
- [ ] 404 page working
- [ ] Mobile responsive verified
- [ ] Sitemap accessible at /sitemap.xml

---

## 🎯 Most Common Next Steps

```bash
# 1. Test changes locally
npm run dev
# Visit http://localhost:3000
# Test your changes

# 2. Commit and push
git add .
git commit -m "Descriptive message"
git push origin main

# 3. Monitor deployment
# Watch: https://github.com/redwanmart/redwanmart.com/actions
# Go live: https://redwanmart.com (2-3 min delay)
```

---

**Questions?** See [MAINTENANCE.md](MAINTENANCE.md) or check docs/ folder.

**Last Updated**: August 9, 2026
