# GoldGem ERP — Easy Deployment Guide

## Just 2 Free Services. Super Simple.

| What | Platform | Cost |
|------|----------|------|
| **App Hosting** | [Vercel](https://vercel.com) | Free |
| **Database** | [Neon](https://neon.tech) | Free (512MB) |

That's it. No Render. No Supabase. No Python service.
AI/ML is built into the Next.js API routes already.

---

## Step 1: Get Free Database from Neon (2 min)

1. Go to **[neon.tech](https://neon.tech)** → **Sign Up** (use GitHub login)
2. Click **"Create Project"**
3. Fill in:
   - **Project name**: `goldgem-erp`
   - **Region**: Choose closest to you
4. Click **"Create Project"**
5. On the dashboard, you'll see a **Connection string** like:
   ```
   postgresql://neondb:AbCdEf123@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. **Copy this connection string** — you need it for Step 2!

---

## Step 2: Deploy on Vercel (2 min)

1. Go to **[vercel.com](https://vercel.com)** → **Sign up with GitHub**
2. Click **"Add New..."** → **"Project"**
3. Import your `goldgem-erp` GitHub repository
4. Leave all settings as default (Next.js auto-detected)
5. **Add ONE environment variable** (click "Environment Variables"):

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Paste your Neon connection string from Step 1 |

6. Click **"Deploy"** — wait 2-3 minutes
7. Your app URL: `https://goldgem-erp.vercel.app`

---

## Step 3: Seed Database (1 click)

Visit this URL in your browser:
```
https://your-app-name.vercel.app/api/seed
```

This automatically:
- Creates all 18 database tables
- Seeds with jewellery industry data (32 products, 5 suppliers, 20 customers, 50 POS transactions, orders, shipments, BOMs, work orders, forecasts, etc.)

You should see: `{"success":true,"message":"GoldGem database seeded with jewellery industry data"}`

---

## DONE! Your ERP is Live!

Visit `https://your-app-name.vercel.app` — Goldgem ERP is running with all 7 modules!

---

## What You Get for FREE

| Feature | Details |
|---------|---------|
| **Vercel Hosting** | Unlimited deploys, auto-SSL, global CDN |
| **Neon Database** | 512MB PostgreSQL, auto-scaling, always available |
| **AI/ML** | Built into the app — forecasting, optimization, anomaly detection |
| **Total cost** | **$0/month** |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Vercel | Make sure `DATABASE_URL` is set in Settings → Environment Variables |
| "Accelerate" error in Prisma | Add `?sslmode=require` at the end of your Neon connection string |
| Database tables missing | Visit `/api/seed` again — it creates tables + seeds data |
| Page shows loading forever | Database might be empty — visit `/api/seed` |
| Neon database paused | Neon free tier auto-resumes on first query (just refresh the page) |
| Password special chars not working | URL-encode them: `@` → `%40`, `#` → `%23`, `%` → `%25` |

---

## Updating Your App

Just push code to GitHub — Vercel auto-deploys!

```bash
git add .
git commit -m "Updated feature"
git push
```

---

## For Your Project Report

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL (Neon Serverless Postgres) |
| ORM | Prisma |
| AI/ML | Built-in statistical analysis (Moving Average, Exponential Smoothing, Linear Regression, Anomaly Detection, EOQ Optimization) |
| Hosting | Vercel (serverless, edge-optimized) |
| Data Fetching | TanStack Query (React Query) |
| Charts | Recharts |
| State | Zustand |

---

## Free Tier Limits (Plenty for Demo)

**Vercel:**
- 100GB bandwidth/month
- Serverless function execution: 10 seconds
- Auto-deploys on every push

**Neon:**
- 512MB storage
- 100 compute hours/month
- Auto-scales to zero when idle (resumes in <1 second)
