# Deployment Guide for Green Earth

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests pass: `npm test`
- [ ] No ESLint errors: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] No console errors/warnings in dev
- [ ] No unused imports or variables

### Build Verification

- [ ] Production build succeeds: `npm run build`
- [ ] dist/ directory created with all files
- [ ] File sizes reasonable
- [ ] No build warnings
- [ ] Production preview works: `npm run preview`

### Security

- [ ] No sensitive data in code
- [ ] Environment variables in .env.example (not .env)
- [ ] No hardcoded API keys
- [ ] CORS configured properly
- [ ] HTTPS enabled for production
- [ ] CSP headers configured

### Testing

- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile responsive testing
- [ ] Accessibility testing (keyboard, screen reader)
- [ ] Payment flow tested (use Stripe test cards)

### Documentation

- [ ] README.md up to date
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment steps documented
- [ ] Known issues documented

## Deployment Steps

### Step 1: Prepare Build

```bash
# Ensure clean state
git status  # Should be clean

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

### Step 2: Frontend Deployment (Choose One)

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - VITE_SERVER_BASE=https://your-api-domain.com
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Configure environment variables in Netlify dashboard
```

#### Option C: Manual (Any Static Host)

1. Build: `npm run build`
2. Upload `dist/` folder to your web server
3. Configure base path if needed (edit vite.config.js)
4. Set environment variables

### Step 3: Backend/Server Deployment

#### Option A: Railway.app

```bash
1. Push code to GitHub
2. Create account on railway.app
3. Connect GitHub repository
4. Add environment variables:
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - DOMAIN
   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
5. Deploy
```

#### Option B: Render.com

```bash
1. Push code to GitHub
2. Create account on render.com
3. New "Web Service"
4. Connect GitHub repo
5. Build command: npm install
6. Start command: npm run start-server
7. Add environment variables
8. Deploy
```

#### Option C: Heroku

```bash
heroku login
heroku create your-app-name
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
git push heroku main
```

### Step 4: Configure Stripe

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Get production API keys
3. Update environment variables with live keys
4. Configure webhook endpoint:
   - URL: `https://your-backend.com/webhook`
   - Events: `checkout.session.completed`
   - Add webhook secret to .env

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
