# Production Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] PostgreSQL database provisioned (Azure Database for PostgreSQL or managed service)
- [ ] DATABASE_URL configured with SSL mode: `?sslmode=require`
- [ ] Database firewall rules configured to allow Azure App Service access
- [ ] Database backup schedule configured

### Environment Variables - Azure App Service
Ensure all environment variables are set in Azure Portal → App Service → Configuration:

**Critical Variables:**
- [ ] `DATABASE_URL=postgresql://[user]:[password]@[host].postgres.database.azure.com:5432/[database]?sslmode=require`
- [ ] `JWT_SECRET=[64-char-hex-string]` (Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] `SESSION_SECRET=[64-char-hex-string]`
- [ ] `NODE_ENV=production`
- [ ] `PORT=8080`
- [ ] `FRONTEND_URL=https://thecollabify.tech`

**Authentication & OAuth:**
- [ ] `GOOGLE_CLIENT_ID=[your-google-client-id]`
- [ ] `GOOGLE_CLIENT_SECRET=[your-google-client-secret]`
- [ ] `GOOGLE_CALLBACK_URL=https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net/api/oauth/google/callback`

**Payment Integration:**
- [ ] `STRIPE_SECRET_KEY=[your-stripe-secret-key]`
- [ ] `STRIPE_WEBHOOK_SECRET=[your-stripe-webhook-secret]`
- [ ] `RAZORPAY_KEY_ID=[optional-razorpay-key]`
- [ ] `RAZORPAY_KEY_SECRET=[optional-razorpay-secret]`

**Email Service (Brevo/Sendinblue):**
- [ ] `BREVO_API_KEY=[your-brevo-api-key]`
- [ ] `EMAIL_HOST=smtp-relay.brevo.com` (or Gmail SMTP)
- [ ] `EMAIL_PORT=587`
- [ ] `EMAIL_USER=[your-email]`
- [ ] `EMAIL_PASS=[your-email-app-password]`

**Monitoring & Security:**
- [ ] `SENTRY_DSN=[your-sentry-dsn]`
- [ ] `ADMIN_ALLOWED_IPS=[comma-separated-ips]` (Optional)

### GitHub Secrets
Verify secrets are set in GitHub → Settings → Secrets and variables → Actions:
- [ ] `DATABASE_URL` (for migrations in CI/CD)
- [ ] `AZUREAPPSERVICE_CLIENTID_*`
- [ ] `AZUREAPPSERVICE_TENANTID_*`
- [ ] `AZUREAPPSERVICE_SUBSCRIPTIONID_*`

### Frontend - Cloudflare Pages
Set environment variables in Cloudflare Pages dashboard:
- [ ] `VITE_API_URL=https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net`
- [ ] `VITE_SOCKET_URL=https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net`
- [ ] `VITE_GOOGLE_CLIENT_ID=[your-google-client-id]`
- [ ] `VITE_SENTRY_DSN=[your-frontend-sentry-dsn]` (Optional)

## Database Migration

### Step 1: Validate Prisma Schema
```bash
cd backend
npx prisma validate
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Deploy Migrations (Automated via GitHub Actions)
GitHub Actions workflow automatically runs:
```bash
npx prisma migrate deploy
```

### Step 4: Manual Migration (If needed)
If GitHub Actions fails, manually run from local machine:
```bash
cd backend
export DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[database]?sslmode=require"
npx prisma migrate deploy
```

### Step 5: Seed Database (Optional)
If seed file exists:
```bash
npx prisma db seed
```

## Post-Deployment Verification

### Backend Health Checks
- [ ] Test health endpoint: `https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net/health`
  - Expected response: `{"status": "ok", "early": true, "port": 8080}`
- [ ] Test ping endpoint: `https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net/api/ping`
  - Expected response: `{"success": true, "message": "pong", ...}`

### Database Connection
- [ ] Verify database connection via API (e.g., fetch users endpoint)
- [ ] Check Prisma migrations table exists: `_prisma_migrations`
- [ ] Verify all tables created successfully

### Functionality Tests
- [ ] Test user registration flow
- [ ] Test user login flow (local authentication)
- [ ] Test Google OAuth login flow
- [ ] Test JWT token generation and validation
- [ ] Test creator profile creation
- [ ] Test seller campaign creation
- [ ] Test real-time features (Socket.io)
- [ ] Test payment webhooks (Stripe)
- [ ] Test email notifications (password reset, etc.)

### Security Verification
- [ ] Verify CORS configuration (only whitelisted origins allowed)
- [ ] Test rate limiting on authentication endpoints
- [ ] Verify JWT secrets are strong (64+ characters)
- [ ] Check Helmet.js security headers are active
- [ ] Verify Sentry error tracking is capturing errors
- [ ] Test HTTPS/SSL certificates are valid

### Frontend Verification
- [ ] Access production frontend: `https://thecollabify.tech`
- [ ] Test frontend → backend API communication
- [ ] Test Socket.io real-time updates
- [ ] Verify Google OAuth login redirects correctly
- [ ] Test responsive design on mobile devices
- [ ] Check browser console for errors

## Monitoring Setup

### Azure Application Insights
- [ ] Enable Application Insights for Azure App Service
- [ ] Configure custom metrics for critical endpoints
- [ ] Set up availability tests (ping tests)
- [ ] Configure alert rules for:
  - High error rates (>5% in 5 minutes)
  - High response times (>2s average)
  - Failed database connections

### Sentry Configuration
- [ ] Verify Sentry projects created (backend + frontend)
- [ ] Configure alert rules for:
  - New error types
  - Error frequency spikes
  - Performance issues
- [ ] Set up Slack/Email notifications
- [ ] Configure release tracking

### Uptime Monitoring
- [ ] Set up external uptime monitoring (UptimeRobot, Pingdom, or Datadog)
- [ ] Monitor endpoints:
  - Backend health: `/health`
  - Frontend availability: `https://thecollabify.tech`
- [ ] Configure alert notifications (email, SMS, Slack)

### Database Monitoring
- [ ] Enable Azure Database for PostgreSQL monitoring
- [ ] Set up alerts for:
  - High CPU usage (>80%)
  - High memory usage (>80%)
  - Storage usage (>70%)
  - Connection pool exhaustion
- [ ] Configure automated backup retention (7-30 days)

## Rollback Plan

### If Deployment Fails:
1. **Check GitHub Actions logs** for build/deployment errors
2. **Review Azure App Service logs**: Portal → Monitoring → Log Stream
3. **Check database connection**: Verify DATABASE_URL format and credentials
4. **Rollback strategy**:
   - Azure App Service → Deployment Center → Deployment History → Redeploy previous version
   - Or trigger rollback via GitHub Actions (revert commit)

### If Database Migration Fails:
1. **Review migration logs** in GitHub Actions output
2. **Check database connectivity**: Test from local machine with same DATABASE_URL
3. **Manual migration**: Run `npx prisma migrate deploy` locally with correct DATABASE_URL
4. **Database restore**: If corrupted, restore from latest backup

## Performance Optimization (Post-Launch)

- [ ] Enable Redis caching for session storage (optional)
- [ ] Configure Azure CDN for static assets
- [ ] Enable Cloudflare caching for frontend
- [ ] Optimize database queries (add indexes for frequently queried fields)
- [ ] Enable gzip compression (already enabled via `compression` middleware)
- [ ] Monitor and optimize API response times
- [ ] Set up load testing (k6, Artillery, or Azure Load Testing)

## Documentation

- [ ] Update README.md with production deployment instructions
- [ ] Document all environment variables
- [ ] Add troubleshooting guide
- [ ] Create runbook for common issues
- [ ] Document API endpoints (consider Swagger/OpenAPI)

## Sign-off

### Development Team
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Security scan completed (CodeQL)
- [ ] Documentation updated

### DevOps Team
- [ ] Infrastructure provisioned
- [ ] CI/CD pipeline tested
- [ ] Monitoring configured
- [ ] Backup strategy confirmed

### Product Team
- [ ] Feature functionality verified
- [ ] User acceptance testing completed
- [ ] Analytics/tracking configured

---

## Quick Reference Commands

### Generate Strong Secrets
```bash
# JWT_SECRET and SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test Database Connection
```bash
cd backend
npx prisma db pull --preview-feature  # Should connect to PostgreSQL
```

### Check for MongoDB References (Should return none)
```bash
grep -r "mongodb\|MONGODB" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" -i
```

### View Azure App Service Logs
```bash
az webapp log tail --name thecollabify-api --resource-group [your-resource-group]
```

### Test Production API
```bash
curl https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net/health
curl https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net/api/ping
```

---

**Last Updated:** 2026-02-13
**Maintained By:** TheCollabify DevOps Team
