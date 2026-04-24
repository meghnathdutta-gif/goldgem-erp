# GoldGem ERP - Free Cloud Deployment Guide

## Quick Deploy to Vercel + Neon PostgreSQL (FREE)

### Step 1: Create Neon PostgreSQL Database (Free Tier)
1. Go to https://neon.tech and sign up
2. Create a new project named "goldgem-erp"
3. Select region closest to you (e.g., Mumbai for India)
4. Copy the connection string (looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/goldgem?sslmode=require`)

### Step 2: Deploy to Vercel (Free Tier)
1. Push your code to GitHub
2. Go to https://vercel.com and sign up
3. Click "New Project" → Import your GitHub repo
4. Configure:
   - Framework: Next.js (auto-detected)
   - Build Command: `prisma generate && next build`
   - Install Command: `bun install`
5. Add Environment Variables:
   - `DATABASE_URL` = your Neon connection string from Step 1
6. Click Deploy

### Step 3: Switch to PostgreSQL Schema
Before deploying, update prisma/schema.prisma:
- Change `provider = "sqlite"` to `provider = "postgresql"`
- Or use: `cp prisma/schema.postgres.prisma prisma/schema.prisma`

### Step 4: Seed the Database
After deployment, run the seed command:
```bash
# Using Vercel CLI
vercel env pull .env.production.local
npx prisma db push
bun run db:seed
```

Or use the Neon SQL editor to run the seed data.

### Alternative: Railway (Free Tier)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set DATABASE_URL environment variable
5. Railway auto-detects Next.js and deploys

### Alternative: Render (Free Tier)
1. Go to https://render.com
2. New → Web Service → Connect GitHub
3. Build Command: `prisma generate && next build`
4. Start Command: `next start`
5. Add DATABASE_URL env variable from external PostgreSQL

## Important Notes
- Neon free tier: 0.5 GB storage, 100 compute hours/month
- Vercel free tier: 100 GB bandwidth, serverless functions
- SQLite is for development only; PostgreSQL is required for production
- The prisma/schema.postgres.prisma file has the PostgreSQL schema ready
