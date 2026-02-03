# FresherFlow Deployment Guide

## 🚀 Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Setup database on Neon
- [ ] Verify both apps are running

---

## 🗄️ Database (Neon Postgres)

### 1. Create Database
1. Visit [neon.tech](https://neon.tech)
2. Create project: **fresherflow**
3. Copy connection string

### 2. Get Connection String
```
postgresql://user:pass@ep-xxx.region.neon.tech/fresherflow?sslmode=require
```

---

## 🔧 Backend (Render)

### Deploy Using Blueprint

1. **Push render.yaml to GitHub**
   - Already configured as `fresherflow-api`

2. **Create Blueprint on Render**
   - Dashboard → New → Blueprint
   - Connect your GitHub repo
   - Render auto-detects `render.yaml`

3. **Add Environment Variables**
   ```env
   DATABASE_URL=<neon-connection-string>
   FRONTEND_URL=https://your-app.vercel.app
   ```
   *JWT secrets auto-generate*

4. **Deploy**
   - Click "Apply"
   - Wait for build (~2 minutes)

### Manual Deploy (Alternative)

1. **New Web Service**
   - Name: `fresherflow-api`
   - Build: `npm install && npm run db:generate && npm run build:api`  
   - Start: `npm run start:api`

2. **Environment Variables**
   ```env
   DATABASE_URL=<postgres-url>
   JWT_ACCESS_SECRET=<generate-strong-secret>
   JWT_REFRESH_SECRET=<generate-different-secret>
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

---

## 🌐 Frontend (Vercel)

### 1. Import Project
- Go to [vercel.com](https://vercel.com)
- New Project → Import from GitHub

### 2. Configure Settings
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `apps/web`
- **Build Command**: Auto (Vercel uses turbo.json)
- **Install Command**: `npm install`

### 3 Add Environment Variable
```env
NEXT_PUBLIC_API_URL=https://fresherflow-api.onrender.com
```

### 4. Deploy
- Click "Deploy"
- First build: ~2 minutes (Turbo caching for next time!)

---

## 🔄 Run Migrations

After backend deploys, run migrations:

**Option 1: Render Shell**
```bash
npx prisma migrate deploy
npm run db:seed
```

**Option 2: Auto-migrate on Build**

Update Render build command:
```bash
npm install && npm run db:generate && npx prisma migrate deploy && npm run build:api
```

---

## ✅ Verification

### 1. Test Backend
```bash
curl https://fresherflow-api.onrender.com/api/health
# Should return: {"status":"ok"}
```

### 2. Test Frontend
- Visit: `https://your-app.vercel.app`
- Check browser console for errors
- Try registering an account

### 3. Test Admin
- Email: `admin@jobdiscover.com`
- Password: `admin123`

---

## 🎯 Post-Deployment

### Update Admin Password
```sql
-- In database (Neon console)
UPDATE "Admin"
SET "passwordHash" = <new-bcrypt-hash>
WHERE email = 'admin@jobdiscover.com';
```

### Monitor Logs
- **Render**: Dashboard → Logs (real-time)
- **Vercel**: Dashboard → Deployments → View Logs

### Custom Domains
- **Vercel**: Settings → Domains
- **Render**: Settings → Custom Domain

---

## 🔥 Common Issues

### CORS Errors
**Fix**: Ensure `FRONTEND_URL` in Render exactly matches Vercel URL (no trailing slash)

### Prisma Client Not Found
**Fix**: Add `npm run db:generate` to Render build command

### 500 Errors
**Check**: Render logs for database connection issues

### Vercel Build Fails
**Fix**: Ensure root `package.json` has `"packageManager": "npm@9.8.0"`

---

## 📊 URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://fresherflow-api.onrender.com`
- **Database**: Managed on Neon

**Next**: Set up analytics, monitoring, and backups!
