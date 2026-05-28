# 🌱 Green Earth - Deployment Guide

## Status: ✅ Ready for Production

This application is fully configured and tested for production deployment.

## Build & Deployment Architecture

### Build Process
```bash
npm run build
```

1. **Vite Build** (`vite build`):
   - Bundles React application
   - Optimizes CSS with Tailwind
   - Minifies JavaScript
   - Compresses images and assets
   - Output: `dist/index.html` + `dist/assets/`

2. **Post-Build Script** (`scripts/postbuild.js`):
   - Copies `pages/` directory → `dist/pages/`
   - Copies `public/` directory → `dist/public/`
   - Ensures all static files are included in deployment

### Production Output

```
dist/
├── index.html              (21.74 kB / 4.69 kB gzipped)
├── assets/
│   ├── index-C8PJKySP.js   (2.90 kB / 1.36 kB gzipped)
│   ├── index-BoQiAfkJ.css  (106.80 kB / 16.29 kB gzipped)
│   ├── manifest-Be_YeE9B.json
│   ├── hero-leaf1-BeOfR5Ig.png (183.81 kB)
│   └── hero-leaf2-DYb-47HQ.png (183.65 kB)
├── pages/
│   ├── about.html
│   ├── gallery.html
│   ├── contact.html
│   └── developer.html
└── public/
    └── manifest.json
```

## Deployment Options

### 🚀 Option 1: Vercel (Recommended)

**Pros**: Auto-deployment, serverless, free tier, GitHub integration  
**Best for**: Production with minimal configuration

#### Setup
1. Push to GitHub:
   ```bash
   git push origin main
   ```

2. Visit https://vercel.com/dashboard

3. Click "Add New" → "Project" → Select GitHub repo

4. Configure Environment:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   DOMAIN=https://yourdomain.com
   ```

5. Deploy! Vercel handles everything via `vercel.json`

#### Why It Works
- `vercel.json` configured with:
  - Build: `npm run build`
  - Output: `dist`
  - Rewrites for SPA routing
  - Security headers included

### 🖥️ Option 2: Node.js Server (Self-Hosted)

**Pros**: Full control, custom backend, WebSocket support  
**Best for**: DigitalOcean, AWS, Heroku, Railway

#### Setup
1. Build application:
   ```bash
   npm run build
   ```

2. Install production dependencies:
   ```bash
   npm install --production
   ```

3. Create `.env`:
   ```
   PORT=3000
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   DOMAIN=https://yourdomain.com
   ```

4. Start server:
   ```bash
   npm start
   ```
   - Runs `prod-server.js` on configured PORT
   - Serves static files from `dist/`
   - Serves pages from `dist/pages/`
   - Includes health check at `/health`

#### PM2 (Recommended Process Manager)
```bash
npm install -g pm2

# Start
pm2 start prod-server.js --name "green-earth"

# Monitor
pm2 monit

# View logs
pm2 logs green-earth

# Auto-restart on reboot
pm2 startup
pm2 save
```

### 💾 Option 3: Static Hosting

For static-only deployment (GitHub Pages, Netlify, etc.):

```bash
npm run build
# Deploy dist/ directory to static hosting service
```

**Note**: Payment features require a separate backend API.

## Pre-Deployment Checklist

### Code Quality
- ✅ All ESLint errors fixed
- ✅ TypeScript configuration updated
- ✅ No unused imports
- ✅ Console statements properly managed

### Build Verification
- ✅ Production build succeeds
- ✅ dist/ directory created with all files
- ✅ No build warnings or errors
- ✅ All pages included in dist/pages/

### Features Tested
- ✅ All 4 pages load correctly
- ✅ Responsive design verified
- ✅ Stripe integration configured
- ✅ Health check endpoint working

### Security
- ✅ Security headers configured
- ✅ HTTPS ready
- ✅ CORS properly configured
- ✅ Environment variables protected
- ✅ No hardcoded API keys
- ✅ Environment variables documented in .env.example

## Deployment Steps

### Step 1: Prepare Build

```bash
# Ensure clean state
git status

# Build for production
npm run build

# Verify dist/ directory
ls -la dist/
```

### Step 2: Frontend Deployment

#### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Connect in Vercel dashboard
# Vercel automatically deploys on push
```

#### Alternative: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Alternative: Self-Hosted
```bash
# Copy dist/ to your server
# Point web server to dist/index.html
# Configure rewrites for SPA routing
```

### Step 3: Configure Environment Variables

**Production** (.env in server environment):
```
PORT=3000
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DOMAIN=https://yourdomain.com
```

### Step 4: Stripe Configuration

1. Get production keys from https://dashboard.stripe.com/apikeys
2. Add to environment variables
3. Configure webhook:
   - Endpoint: `https://yourdomain.com/webhook`
   - Events: `checkout.session.completed`
4. Copy webhook secret to STRIPE_WEBHOOK_SECRET

### Step 5: Test Deployment

```bash
# Test health endpoint
curl https://yourdomain.com/health

# Verify pages load
# - Home: https://yourdomain.com/
# - About: https://yourdomain.com/pages/about.html
# - Gallery: https://yourdomain.com/pages/gallery.html
# - Contact: https://yourdomain.com/pages/contact.html
# - Developer: https://yourdomain.com/pages/developer.html

# Test payment flow
# Use Stripe test card: 4242 4242 4242 4242
```

## Performance Metrics

Production build optimization:

| Component | Size | Gzipped | Performance |
|-----------|------|---------|-------------|
| CSS | 106.80 kB | 16.29 kB | ✅ Optimized |
| JS | 2.90 kB | 1.36 kB | ✅ Minimal |
| Images | 367 kB | — | ✅ Optimized |
| Total | 498.44 kB | ~22 kB | ✅ Fast |

## Troubleshooting

### Pages return 404
- Check `dist/pages/` exists and contains HTML files
- Verify Vercel rewrites or server routes are configured
- Test locally: `npm start`

### Build fails
- Clear cache: `npm install`
- Check Node.js version: `node --version`
- Review error logs carefully

### Payment not working
- Verify STRIPE_SECRET_KEY is correct
- Check webhook is configured
- Test with Stripe test mode first

### HTTPS issues
- Force redirect in production
- Update DOMAIN environment variable
- Generate SSL certificate if self-hosted

## Monitoring

### Health Check
```bash
curl https://yourdomain.com/health
```

### Logs
- **Vercel**: Dashboard → Deployments → Logs
- **Self-Hosted**: `pm2 logs green-earth`

### Analytics
- Monitor user traffic
- Track payment conversions
- Set up error reporting

## Support

- **Vite**: https://vitejs.dev/guide/
- **React**: https://react.dev/
- **Stripe**: https://stripe.com/docs/
- **Vercel**: https://vercel.com/docs/

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready


### Step 5: Test Production

- [ ] Frontend loads without errors
- [ ] API calls work
- [ ] Payment flow works with test card: `4242 4242 4242 4242`
- [ ] Webhook receives payment events
- [ ] Donation records saved
- [ ] Thank-you emails send (if SMTP configured)

### Step 6: Post-Deployment

```bash
# Tag release
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Create release notes
# Document any breaking changes
# Update version in package.json
```

## Monitoring

### Set Up Monitoring

- [ ] Enable error tracking (Sentry, Rollbar, etc.)
- [ ] Monitor API response times
- [ ] Track Stripe webhook failures
- [ ] Monitor disk usage
- [ ] Set up uptime monitoring
- [ ] Configure alerts

### Logs to Monitor

- Application error logs
- API request logs
- Stripe webhook logs
- SMTP logs
- Build logs

## Rollback Procedure

If issues occur after deployment:

```bash
# Quick rollback to previous version
git revert HEAD
npm run build
# Redeploy

# Or restore from backup
# Check your hosting provider's restore options
```

## Performance Optimization

After deployment, verify:

- [ ] Lighthouse score > 80
- [ ] Core Web Vitals optimal
- [ ] Images optimized and served via CDN
- [ ] CSS/JS minified and compressed
- [ ] Caching headers configured

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers set:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Content-Security-Policy: configured
- [ ] Environment variables not exposed
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL injection protection (if database)
- [ ] XSS protection verified

## Maintenance

### Regular Tasks

- **Weekly**: Check error logs, monitor performance
- **Monthly**: Review security updates, update dependencies
- **Quarterly**: Performance optimization, security audit
- **Yearly**: Full backup, disaster recovery test

### Update Procedure

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Or update specific package
npm install package-name@latest

# Test thoroughly
npm test
npm run build
npm run preview

# Commit and deploy
git commit -m "chore: update dependencies"
git push
```

## Support Contacts

- **Stripe Support**: https://support.stripe.com
- **Hosting Support**: [Your hosting provider]
- **Domain/DNS Issues**: Contact your domain registrar

## Emergency Contacts

- Primary: [Add contact]
- Secondary: [Add contact]
- Escalation: [Add contact]

---

**Last Updated**: 2026-05-24
**Next Review**: 2026-08-24
