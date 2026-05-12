#!/bin/bash
# ============================================================
# Goldgem ERP - Local Desktop Start Script
# Uses SQLite - No PostgreSQL or internet required!
# ============================================================

set -e

echo ""
echo "============================================"
echo "   Goldgem ERP - Jewellery Business System"
echo "============================================"
echo ""

# Step 1: Switch to SQLite schema
echo "[1/4] Switching to SQLite database..."
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Step 2: Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "[2/4] Installing dependencies..."
  npm install
else
  echo "[2/4] Dependencies already installed."
fi

# Step 3: Generate Prisma client & push schema
echo "[3/4] Setting up database..."
export DATABASE_URL="file:./goldgem-erp.db"
npx prisma generate
npx prisma db push --skip-generate

# Step 4: Seed if database is empty
echo "[4/4] Checking if database needs seeding..."
SEED_CHECK=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
if echo "$SEED_CHECK" | grep -q "0"; then
  echo "Seeding database with jewellery data..."
  curl -s http://localhost:3000/api/seed > /dev/null 2>&1 || true
fi

echo ""
echo "Starting Goldgem ERP..."
echo "Database: SQLite (local file)"
echo "URL: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the app
npm run dev
