# Goldgem ERP — Local Desktop Installation Guide

## Run Goldgem ERP on your local machine. No internet needed!

### What You Get
- A desktop application with its own window (like any Windows app)
- SQLite database (no PostgreSQL installation needed!)
- All 7 ERP modules work offline
- AI/ML insights built-in
- Double-click to start — just like any normal software

---

## Option A: Quick Local Run (No Installer, Easiest)

### Prerequisites
- Install [Node.js](https://nodejs.org) (LTS version, v18+)

### Steps

**On Windows:**
```cmd
cd goldgem-erp
start-local.bat
```

**On Mac/Linux:**
```bash
cd goldgem-erp
chmod +x start-local.sh
./start-local.sh
```

**Or manually (any OS):**
```bash
cd goldgem-erp

# 1. Switch to SQLite schema
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# 2. Install dependencies
npm install

# 3. Setup database
set DATABASE_URL=file:./goldgem-erp.db   # Windows CMD
# export DATABASE_URL=file:./goldgem-erp.db  # Mac/Linux
npx prisma generate
npx prisma db push --skip-generate

# 4. Start the app
npm run dev
```

5. Open browser: **http://localhost:3000**
6. Visit **http://localhost:3000/api/seed** to load sample data

---

## Option B: Build Windows Installer (.exe)

### Prerequisites
- Install [Node.js](https://nodejs.org) (LTS version, v18+)
- Windows 10/11 (64-bit)

### Steps

```bash
cd goldgem-erp

# 1. Install dependencies (including Electron)
npm install

# 2. Build the Windows installer
npm run electron:build
```

This will:
1. Switch to SQLite schema
2. Generate Prisma client for SQLite
3. Build the Next.js app in standalone mode
4. Package everything into an Electron app
5. Create a Windows installer (.exe)

### Find Your Installer

The installer will be at:
```
dist-electron/Goldgem-ERP-Setup-1.0.0.exe
```

### Install & Run

1. Double-click `Goldgem-ERP-Setup-1.0.0.exe`
2. Follow the installation wizard
3. Goldgem ERP appears on your Desktop & Start Menu
4. Double-click to launch — it opens in its own window!

### First Run

When you launch Goldgem ERP for the first time:
1. The app opens with a loading screen
2. Once loaded, visit the seed endpoint to add sample data:
   - The app runs at http://localhost:3000 internally
   - Click "Seed Database" or visit http://localhost:3000/api/seed

---

## Option C: Electron Development Mode

Run in a desktop window during development:

```bash
cd goldgem-erp

# 1. Setup SQLite database
npm run local:setup

# 2. Start Next.js dev server (in terminal 1)
DATABASE_URL=file:./goldgem-erp.db npm run dev

# 3. Start Electron window (in terminal 2)
npm run electron:dev
```

---

## Database Location

| Mode | Database File Location |
|------|----------------------|
| Quick Run | `goldgem-erp/prisma/goldgem-erp.db` |
| Installed App | `%APPDATA%/goldgem-erp/goldgem-erp.db` (Windows) |
| Installed App | `~/Library/Application Support/goldgem-erp/goldgem-erp.db` (Mac) |

The database is a single `.db` file — you can back it up by copying it!

---

## Architecture

```
Goldgem ERP Desktop
├── Electron (Desktop Window)
│   ├── main.js (Starts Next.js server internally)
│   └── preload.js (Security bridge)
├── Next.js 16 (Web App + API Routes)
│   ├── Dashboard Module
│   ├── Inventory Module
│   ├── Supply Chain Module
│   ├── Manufacturing Module
│   ├── POS Module
│   ├── E-Commerce Module
│   └── AI/ML Insights Module
├── Prisma ORM (Database Layer)
│   └── SQLite (Local file-based database)
└── Data stored in: goldgem-erp.db file
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "prisma generate" fails | Make sure you copied schema.sqlite.prisma to schema.prisma |
| Port 3000 already in use | Close other apps using port 3000, or edit the port in start-local.bat |
| Database error on startup | Delete goldgem-erp.db and restart (it will recreate) |
| Electron build fails on Windows | Make sure Node.js is 64-bit (not 32-bit) |
| Build too slow | First build takes 5-10 min. Subsequent builds are faster |
| "npm install" fails | Delete node_modules and package-lock.json, then try again |

---

## For Cloud Deployment (Vercel + Neon)

If you want to deploy to the cloud instead, the original PostgreSQL schema is preserved in:
```
prisma/schema.sqlite.prisma  → Local SQLite (desktop)
prisma/schema.prisma         → PostgreSQL (cloud/Vercel)
```

To switch back to PostgreSQL for cloud:
1. Change `provider = "sqlite"` to `provider = "postgresql"` in schema.prisma
2. Set `DATABASE_URL` to your Neon/Supabase connection string
3. Run `npx prisma generate && npx prisma db push`
