# Deployment Guide - Job Platform Monorepo

## 🎯 Quick Overview

- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Node.js/Express)
- **Database**: Neon Postgres (or any Postgres provider)

---

## 📦 Pre-Deployment Checklist

- [ ] Push all code to GitHub
- [ ] Ensure `.env` files are NOT committed (they're in `.gitignore`)
- [ ] Package-lock.json IS committed (we fixed this)
- [ ] Test locally: `npm run dev` works

---

## 🚀 Deploy Backend (Render)

### Option 1: Using render.yaml (Recommended)

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repo
   - Render will auto-detect `render.yaml`

2. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://user:pass@host/dbname
   FRONTEND_URL=https://your-app.vercel.app
   ```
   *(JWT secrets will be auto-generated)*

3. **Deploy** - Click "Apply"

### Option 2: Manual Setup

1. **Create New Web Service**
   - Go to Render Dashboard → "New" → "Web Service"
   - Connect GitHub repo

2. **Configure Build**
   ```
   Name: job-platform-api
   Root Directory: (leave empty)
   Build Command: npm install && npm run db:generate && npm run build:api
   Start Command: npm run start:api
   ```

3. **Environment Variables**
   ```env
   DATABASE_URL=postgresql://user:pass@host/dbname
   JWT_ACCESS_SECRET=your-super-secret-key-min-32-chars
   JWT_REFRESH_SECRET=different-super-secret-key-min-32-chars
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

4. **Advanced Settings**
   - Health Check Path: `/api/health` (optional)
   - Auto-Deploy: Yes

---

## 🌐 Deploy Frontend (Vercel)

### Step 1: Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository

### Step 2: Configure Build Settings

**Framework Preset**: Next.js  
**Root Directory**: `apps/web`  

**Build Command**: 
```bash
npm install && npm run build:web
```

**Output Directory**: `apps/web/.next` (auto-detected)

**Install Command**:
```bash
npm install
```

### Step 3: Environment Variables

Add in Vercel dashboard:
```env
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
```

### Step 4: Deploy

Click "Deploy" - Vercel will build and deploy automatically

---

## 🗄️ Database Setup (Neon)

### Option 1: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create project: `job-platform`
3. Copy connection string:
   ```
   postgresql://user:pass@ep-xxx.region.neon.tech/job_platform?sslmode=require
   ```
4. Add to Render environment variables

### Option 2: Supabase

1. Create project on [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy "Connection string" (Transaction mode)
4. Add to Render

---

## 🔄 Run Database Migrations

### After Backend Deploys:

**Option 1: Render Shell**
```bash
# In Render dashboard → Shell tab
npx prisma migrate deploy
npx ts-node apps/api/prisma/seed.ts
```

**Option 2: Build Command** (automatic)

Update Render build command:
```bash
npm install && npm run db:generate && npx prisma migrate deploy && npm run build:api
```

---

## ✅ Post-Deployment Verification

### 1. Check Backend Health
```bash
curl https://your-backend.onrender.com/api/health
# Should return: {"status":"ok"}
```

### 2. Check Frontend
- Visit: `https://your-app.vercel.app`
- Open browser console - check for API connection errors

### 3. Test Registration
- Register a new account
- Check if profile creation works
- Verify database has new records

### 4. Test Admin
- Login with seeded admin:
  ```
  Email: admin@jobdiscover.com
  Password: admin123
  ```
- Create a test opportunity

---

## 🔧 Common Issues & Fixes

### ❌ Issue: "Cannot find module '@job-platform/types'"

**Cause**: Build not running from monorepo root

**Fix (Vercel)**:
```json
// apps/web/vercel.json
{
  "buildCommand": "cd ../.. && npm install && npm run build:web"
}
```

**Fix (Render)**:
Build command must be:
```bash
npm install && npm run build:api
# NOT: cd apps/api && npm install
```

---

### ❌ Issue: CORS Errors

**Symptom**: Frontend can't call backend API

**Fix**: Check backend `FRONTEND_URL` matches Vercel URL exactly:
```env
# ❌ Wrong
FRONTEND_URL=https://your-app.vercel.app/

# ✅ Correct
FRONTEND_URL=https://your-app.vercel.app
```

---

### ❌ Issue: Prisma Client Not Generated

**Symptom**: `@prisma/client` module not found

**Fix**: Add to Render build command:
```bash
npm install && npm run db:generate && npm run build:api
```

---

### ❌ Issue: Database Connection Failed

**Check**:
1. Database is running and accessible
2. Connection string has `?sslmode=require` for Neon
3. Check Render logs: Dashboard → Logs

---

## 🔐 Security Checklist

Before going live:

- [ ] Change admin password (in database or via API)
- [ ] Use strong JWT secrets (min 32 characters, random)
- [ ] Enable CORS only for your frontend domain
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] Never commit `.env` files
- [ ] Review Render/Vercel access logs

---

## 📊 Monitoring

### Vercel
- Dashboard → Analytics (page views, errors)
- Logs show build and runtime errors

### Render
- Dashboard → Metrics (CPU, memory, requests)
- Logs tab for real-time logs

### Database (Neon)
- Queries tab shows active queries
- Monitoring for connection count

---

## 🚀 Deployment Commands (Quick Reference)

```bash
# Local development
npm run dev

# Build both apps
npm run build

# Deploy to production (via Git push)
git add .
git commit -m "Deploy updates"
git push origin main
# Vercel & Render auto-deploy on push

# Manual database operations (via Render shell)
npx prisma migrate deploy
npx prisma db push
npm run db:seed
```

---

## 📞 Support Resources

- [Vercel Docs: Monorepos](https://vercel.com/docs/monorepos)
- [Render Docs: Node.js](https://render.com/docs/deploy-node-express-app)
- [Prisma Docs: Deploy](https://www.prisma.io/docs/guides/deployment)
- [Neon Docs: Connection](https://neon.tech/docs/connect/connect-from-any-app)

---

## 🎉 You're Live!

Once deployed:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.onrender.com`
- Database: Managed by Neon/Supabase

**Next Steps**: Monitor logs, set up custom domain, enable analytics
