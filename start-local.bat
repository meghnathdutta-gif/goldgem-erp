@echo off
REM ============================================================
REM Goldgem ERP - Local Desktop Start Script (Windows)
REM Uses SQLite - No PostgreSQL or internet required!
REM ============================================================

echo.
echo ============================================
echo    Goldgem ERP - Jewellery Business System
echo ============================================
echo.

REM Step 1: Switch to SQLite schema
echo [1/4] Switching to SQLite database...
copy /Y prisma\schema.sqlite.prisma prisma\schema.prisma

REM Step 2: Install dependencies if needed
if not exist "node_modules\" (
  echo [2/4] Installing dependencies...
  npm install
) else (
  echo [2/4] Dependencies already installed.
)

REM Step 3: Generate Prisma client and push schema
echo [3/4] Setting up database...
set DATABASE_URL=file:./goldgem-erp.db
call npx prisma generate
call npx prisma db push --skip-generate

REM Step 4: Start the app
echo [4/4] Starting Goldgem ERP...
echo.
echo Database: SQLite (local file)
echo URL: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

npm run dev
