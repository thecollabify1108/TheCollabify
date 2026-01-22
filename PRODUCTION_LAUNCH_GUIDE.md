# 🚀 TheCollabify - Production Launch Guide

## 📋 Pre-Launch Checklist

### 1. Payment Gateway Integration ✅

#### Razorpay Setup (Recommended for India)

**Step 1: Create Razorpay Account**
1. Sign up at https://razorpay.com
2. Complete KYC verification
3. Get API keys from Dashboard

**Step 2: Install Dependencies**
```bash
cd backend
npm install razorpay
```

**Step 3: Environment Variables**
Add to `.env`:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Step 4: Backend Integration**
File: `backend/services/paymentService.js` (already created)

**Step 5: Frontend Integration**
Add Razorpay script to `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

#### Stripe (International Alternative)
```bash
npm install stripe
```
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

### 2. Email SMTP Configuration ✅

#### Gmail SMTP (Free Tier)

**Step 1: Enable 2FA on Gmail**
1. Go to Google Account → Security
2. Enable 2-Step Verification

**Step 2: Generate App Password**
1. Security → App passwords
2. Select "Mail" and "Other"
3. Name it "TheCollabify"
4. Copy 16-character password

**Step 3: Environment Variables**
Add to `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=TheCollabify
EMAIL_FROM_ADDRESS=noreply@thecollabify.com
```

#### SendGrid (Production Recommended)
Higher reliability and better analytics:

```bash
npm install @sendgrid/mail
```

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@thecollabify.com
SENDGRID_FROM_NAME=TheCollabify
```

**Limits:**
- Gmail: 500 emails/day (free)
- SendGrid: 100 emails/day (free), 40,000/month (Essentials $15)

---

### 3. Environment Variables Setup ✅

Create `.env` file in root:

```env
# Application
NODE_ENV=production
PORT=5000
CLIENT_URL=https://thecollabify.vercel.app
FRONTEND_URL=https://thecollabify.vercel.app

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
JWT_EXPIRE=7d

# Email (Choose one)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment (Razorpay)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Optional: AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=thecollabify-uploads

# Optional: Redis (for caching)
REDIS_URL=redis://localhost:6379

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Social Auth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

### 4. Database Setup ✅

#### MongoDB Atlas (Recommended)

**Step 1: Create Cluster**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 - 512MB free)
3. Choose region: Mumbai (ap-south-1)

**Step 2: Database User**
1. Database Access → Add New User
2. Username: `thecollabify`
3. Password: Generate secure password
4. Database User Privileges: Read and write to any database

**Step 3: Network Access**
1. Network Access → Add IP Address
2. Allow access from anywhere: `0.0.0.0/0` (for Vercel)
3. Or specific IPs for better security

**Step 4: Get Connection String**
1. Clusters → Connect → Connect your application
2. Copy connection string
3. Replace `<password>` with your password
4. Add database name: `/thecollabify`

Example:
```
mongodb+srv://thecollabify:<password>@cluster0.xxxxx.mongodb.net/thecollabify?retryWrites=true&w=majority
```

---

### 5. Deployment Configuration ✅

#### Backend (Railway/Render/Heroku)

**Recommended: Railway.app**

**Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
```

**Step 2: Login & Initialize**
```bash
railway login
railway init
```

**Step 3: Deploy**
```bash
cd backend
railway up
```

**Step 4: Add Environment Variables**
```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_connection_string
railway variables set JWT_SECRET=your_secret
# Add all other env variables
```

**Step 5: Custom Domain** (Optional)
```bash
railway domain
```

---

#### Frontend (Vercel)

Already deployed! Just add environment variables:

**Step 1: Go to Vercel Dashboard**
1. Select your project
2. Settings → Environment Variables

**Step 2: Add Variables**
```
VITE_API_URL=https://your-backend.railway.app
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
VITE_GA_ID=G-XXXXXXXXXX
```

**Step 3: Redeploy**
```bash
git push origin main
```

---

### 6. Security Checklist ✅

- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable MongoDB authentication
- [ ] Use secure cookies (httpOnly, secure, sameSite)
- [ ] Implement CSP headers
- [ ] Regular dependency updates

#### CORS Configuration
```javascript
// backend/server.js
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

---

### 7. Monitoring & Analytics ✅

#### Google Analytics
1. Create GA4 property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to frontend `.env`:
```env
VITE_GA_ID=G-XXXXXXXXXX
```

#### Error Tracking (Sentry)
```bash
npm install @sentry/node @sentry/react
```

```env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

#### Uptime Monitoring
- Use UptimeRobot (free): https://uptimerobot.com
- Monitor both frontend and backend
- Get alerts via email/SMS

---

### 8. Performance Optimization ✅

#### Frontend
- [ ] Enable Vite build optimization
- [ ] Lazy load components
- [ ] Image optimization (WebP format)
- [ ] Code splitting
- [ ] CDN for static assets

#### Backend
- [ ] Enable compression middleware
- [ ] Database indexing
- [ ] Redis caching for frequent queries
- [ ] Connection pooling
- [ ] API response caching

---

### 9. Backup Strategy ✅

#### Database Backups
**MongoDB Atlas:**
- Enable automated backups (Settings → Backup)
- Retention: 7 days (free tier)

**Manual Backups:**
```bash
mongodump --uri="your_connection_string" --out=./backup-$(date +%Y%m%d)
```

#### Code Backups
- GitHub (already set up) ✅
- Secondary: GitLab mirror

---

### 10. Legal & Compliance ✅

#### Required Pages
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Refund Policy
- [ ] Cookie Policy
- [ ] GDPR Compliance (if EU users)

#### Payment Compliance
- [ ] PCI DSS compliance (Razorpay/Stripe handles this)
- [ ] GST registration (if revenue > ₹20 lakhs)
- [ ] Invoice generation system

---

### 11. Testing Checklist ✅

#### Functionality Tests
- [ ] User registration & login
- [ ] Email verification
- [ ] Campaign creation
- [ ] Creator application
- [ ] Chat functionality
- [ ] Payment processing (test mode)
- [ ] Notifications
- [ ] File uploads
- [ ] Multi-platform support

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)  
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

#### Performance Tests
- [ ] Load time < 3 seconds
- [ ] API response time < 200ms
- [ ] Lighthouse score > 90
- [ ] Mobile performance

---

### 12. Launch Day Checklist ✅

**1 Week Before:**
- [ ] Complete all testing
- [ ] Set up customer support email
- [ ] Prepare social media accounts
- [ ] Create launch announcement
- [ ] Brief team on launch procedures

**1 Day Before:**
- [ ] Final security audit
- [ ] Database backup
- [ ] Monitor setup verification
- [ ] Support team ready
- [ ] Payment gateway in live mode

**Launch Day:**
- [ ] Switch to production environment
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Respond to user feedback
- [ ] Post launch announcement
- [ ] Monitor server performance

**Post-Launch:**
- [ ] Daily monitoring for first week
- [ ] Collect user feedback
- [ ] Address critical bugs immediately
- [ ] Plan first update

---

## 🎯 Quick Start Production Deployment

```bash
# 1. Backend
cd backend
railway login
railway init
railway up
railway open

# 2. Add all environment variables in Railway dashboard

# 3. Frontend (already on Vercel)
# Just push to main branch
git push origin main

# 4. Test everything!
```

---

## 📞 Support Resources

**Email:** support@thecollabify.com  
**Documentation:** https://docs.thecollabify.com  
**Status Page:** https://status.thecollabify.com  

---

## 🎉 You're Ready to Launch!

All systems configured. Time to **GO LIVE**! 🚀

Good luck! 🍀
