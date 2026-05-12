# GoldGem ERP — Railway Deployment Guide

## Architecture Overview

```
Railway Project
├── Service 1: goldgem-web (Next.js)     → Port 3000
├── Service 2: goldgem-ai   (Python)      → Port 3031
└── Service 3: PostgreSQL   (Database)    → Port 5432
```

## Prerequisites

1. A [Railway](https://railway.app) account (free tier available)
2. GitHub account (for repo connection)
3. Git installed locally

---

## Step-by-Step Deployment

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
cd /path/to/goldgem-erp
git init
git add .
git commit -m "GoldGem ERP - initial commit for Railway"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/goldgem-erp.git
git branch -M main
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `goldgem-erp` repository

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New Service"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for the database to provision (~30 seconds)
4. Click on the PostgreSQL service → **"Variables"** tab
5. Copy the `DATABASE_URL` value (you'll need it)

### Step 4: Deploy the Main Web App

1. Click **"+ New Service"** → **"GitHub Repo"** → select `goldgem-erp`
2. This creates your first service from the repo root
3. Rename it to **"goldgem-web"**
4. Go to **"Variables"** tab and add:
   ```
   DATABASE_URL=<paste the PostgreSQL DATABASE_URL from Step 3>
   AI_SERVICE_URL=http://goldgem-ai.railway.internal:3031
   NODE_ENV=production
   ```
5. Railway will auto-detect the Dockerfile and build
6. Wait for deployment to complete (~3-5 minutes)

### Step 5: Deploy the AI Microservice

1. Click **"+ New Service"** → **"GitHub Repo"** → select `goldgem-erp`
2. Rename it to **"goldgem-ai"**
3. Go to **"Settings"** → **"Root Directory"** → set to `mini-services/ai-service`
4. Go to **"Variables"** tab and add:
   ```
   PORT=3031
   ```
5. Railway will auto-detect the Dockerfile in `mini-services/ai-service/`
6. Wait for deployment (~2-3 minutes)

### Step 6: Run Database Migrations & Seed

1. Go to the **"goldgem-web"** service
2. Click **"Deployments"** → latest deployment → **"Custom Deploy"** → **"Run Command"**
3. Run:
   ```
   npx prisma migrate deploy
   ```
4. Wait for migrations to complete
5. Then run the seed:
   ```
   bunx tsx prisma/seed.ts
   ```
   (or `npx tsx prisma/seed.ts` if bun is not available)

### Step 7: Generate Your Website URL

1. Go to **"goldgem-web"** → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Railway will give you a URL like: `goldgem-web-production-xxxx.up.railway.app`
4. Your GoldGem ERP is now live! 🎉

---

## Environment Variables Reference

### goldgem-web (Next.js)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `AI_SERVICE_URL` | URL of the AI microservice | ✅ Yes |
| `NODE_ENV` | Set to `production` | ✅ Yes |
| `PORT` | Port (Railway sets automatically) | No |

### goldgem-ai (Python FastAPI)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Set to `3031` | ✅ Yes |

---

## Railway Free Tier Limits

- **$5 credit/month** (enough for a demo project)
- **512 MB RAM** per service
- **1 GB disk** per service
- **Execution time limit**: 500 hours/month
- **Sleep after inactivity**: Services may sleep after inactivity

---

## Troubleshooting

### Build fails with Prisma errors
- Make sure `DATABASE_URL` is set before the first build
- Check that PostgreSQL service is running

### AI Service health check fails
- Verify the service is running on port 3031
- Check logs in Railway dashboard

### Database connection errors
- Ensure `DATABASE_URL` uses the internal Railway URL format
- Both services must be in the same Railway project

### App returns 500 error
- Check Railway deployment logs
- Make sure `prisma migrate deploy` ran successfully
- Verify seed data was inserted

---

## Local Development

```bash
# Install dependencies
bun install

# Set up local PostgreSQL or use Docker:
docker run -d --name goldgem-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=goldgem -p 5432:5432 postgres:16

# Set environment variables
cp .env.example .env
# Edit .env with your local database URL

# Run migrations
bunx prisma migrate dev --name init

# Seed database
bunx tsx prisma/seed.ts

# Start development server
bun run dev

# Start AI service (separate terminal)
cd mini-services/ai-service
pip install -r requirements.txt
python main.py
```

---

## Alternative: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# Run migrations
railway run --service goldgem-web npx prisma migrate deploy

# Seed database
railway run --service goldgem-web npx tsx prisma/seed.ts
```
