# GoldGem ERP — Free Deployment Guide

## 🏆 Best Free Hosting Combo (No Credit Card Needed)

| Component | Platform | Free Tier | Why Best? |
|-----------|----------|-----------|-----------|
| **Next.js App** | [Vercel](https://vercel.com) | Unlimited bandwidth | Built for Next.js, zero cold starts, instant deploys |
| **PostgreSQL DB** | [Supabase](https://supabase.com) | 500MB, 2 projects | No credit card, built-in dashboard, auto-backups |
| **Python AI Service** | [Render](https://render.com) | 750 hrs/month | Easy Python deploy, free SSL |

**Total cost: $0/month** ✅

---

## Step-by-Step Deployment

### ═══════════════════════════════════════
### STEP 1: Push Code to GitHub
### ═══════════════════════════════════════

```bash
cd /path/to/goldgem-erp
git init
git add .
git commit -m "GoldGem ERP - ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/goldgem-erp.git
git push -u origin main
```

---

### ═══════════════════════════════════════
### STEP 2: Set Up Supabase (Database)
### ═══════════════════════════════════════

1. Go to [supabase.com](https://supabase.com) → **Start your project** → Sign in with GitHub
2. Click **"New Project"**
3. Fill in:
   - **Name**: `goldgem-erp`
   - **Database Password**: Set a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"** — wait ~2 minutes
5. Go to **Settings** → **Database** → scroll to **Connection string**
6. Copy the **URI** format, it looks like:
   ```
   postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual password
8. **Save this URL** — you'll need it for Vercel and Render!

---

### ═══════════════════════════════════════
### STEP 3: Deploy Next.js on Vercel
### ═══════════════════════════════════════

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Click **"Add New..."** → **"Project"**
3. Import your `goldgem-erp` GitHub repository
4. **Configure:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (leave as is)
   - **Build Command**: leave default (`prisma generate && prisma migrate deploy && next build`)
   - **Output Directory**: leave default
5. **Add Environment Variables** (click "Environment Variables"):
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Supabase PostgreSQL URL from Step 2 |
   | `AI_SERVICE_URL` | `https://goldgem-ai.onrender.com` (will set after Step 4) |
6. Click **"Deploy"** — wait 2-3 minutes
7. 🎉 Your app URL will be like: `goldgem-erp.vercel.app`

**After first deploy, seed the database:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run seed on production
vercel env pull .env.production.local
npx prisma db seed
```

Or use the **seed API endpoint**:
Visit `https://goldgem-erp.vercel.app/api/seed` in your browser — this will seed the database!

---

### ═══════════════════════════════════════
### STEP 4: Deploy Python AI Service on Render
### ═══════════════════════════════════════

1. Go to [render.com](https://render.com) → **Get Started** → Sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your `goldgem-erp` GitHub repository
4. **Configure:**
   - **Name**: `goldgem-ai`
   - **Root Directory**: `mini-services/ai-service`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2`
   - **Plan**: Free
5. **Add Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `PORT` | `10000` |
6. Click **"Create Web Service"** — wait 3-5 minutes
7. Your AI service URL will be: `https://goldgem-ai.onrender.com`
8. Test it: visit `https://goldgem-ai.onrender.com/health`

**Now go back to Vercel** and update `AI_SERVICE_URL`:
- Vercel Dashboard → your project → Settings → Environment Variables
- Set `AI_SERVICE_URL` = `https://goldgem-ai.onrender.com`
- Redeploy (Deployments → latest → "Redeploy")

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created with DATABASE_URL
- [ ] Vercel project deployed with DATABASE_URL set
- [ ] Database seeded (visit /api/seed endpoint)
- [ ] Render AI service deployed
- [ ] AI_SERVICE_URL updated in Vercel
- [ ] Visit your Vercel URL — GoldGem ERP is live! 🎉

---

## 🔗 Your URLs After Deployment

| Service | URL |
|---------|-----|
| GoldGem ERP App | `https://goldgem-erp.vercel.app` |
| AI Service | `https://goldgem-ai.onrender.com` |
| Supabase Dashboard | `https://supabase.com/dashboard/project/xxxx` |

---

## ⚠️ Free Tier Limitations & Tips

### Vercel (Next.js)
- ✅ Unlimited bandwidth for hobby projects
- ✅ Zero cold starts (always fast)
- ✅ Auto-deploys on every git push
- ✅ Free SSL/HTTPS
- ⚠️ 100GB bandwidth/month (more than enough for demo)

### Supabase (PostgreSQL)
- ✅ 500MB database storage
- ✅ Built-in dashboard to view/edit data
- ✅ Auto-paused after 1 week inactivity (wake on request)
- ⚠️ 2 free projects per account

### Render (Python AI)
- ✅ 750 hours/month free
- ⚠️ **Service sleeps after 15 min inactivity** (~50 seconds cold start)
- ⚠️ First request after sleep takes ~30-60 seconds
- 💡 **Tip**: Use a free cron job service like [cron-job.org](https://cron-job.org) to ping `/health` every 14 minutes to keep it awake!

---

## 🔄 Keeping Render AI Service Awake (Optional)

1. Go to [cron-job.org](https://cron-job.org) → Create free account
2. Create a new job:
   - **URL**: `https://goldgem-ai.onrender.com/health`
   - **Schedule**: Every 14 minutes
   - **Method**: GET
3. This keeps the Render service from sleeping!

---

## 🛠 Local Development

```bash
# Install dependencies
bun install

# Set up local .env
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL

# Run migrations
bunx prisma migrate dev --name init

# Seed database
npx tsx prisma/seed.ts

# Start dev server
bun run dev

# Start AI service (separate terminal)
cd mini-services/ai-service
pip install -r requirements.txt
python main.py
```

---

## 🆘 Troubleshooting

**Vercel build fails with Prisma error:**
→ Make sure `DATABASE_URL` is set in Vercel environment variables
→ The `postinstall` script runs `prisma generate` automatically

**Database connection fails:**
→ Check Supabase project is not paused (visit dashboard to wake it)
→ Verify DATABASE_URL password is correct (special chars need URL encoding)

**AI service returns 502/503:**
→ Render free tier sleeps after 15 min — wait 60 seconds and retry
→ Check Render logs for errors

**Vercel deployment is slow:**
→ First deploy takes 3-5 min (building all deps)
→ Subsequent deploys are faster (cached)

---

## 📱 Quick Deploy Commands (All at Once)

```bash
# 1. GitHub
git init && git add . && git commit -m "GoldGem ERP"
gh repo create goldgem-erp --public --push

# 2. Vercel (if you have CLI)
vercel --prod

# 3. Seed after deploy
curl https://your-app.vercel.app/api/seed
```
