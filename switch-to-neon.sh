#!/bin/bash
# ============================================
# Goldgem ERP — Switch to Neon PostgreSQL
# Run this before deploying to Vercel
# ============================================

set -e

echo "🔧 Switching Prisma schema from SQLite to PostgreSQL (Neon)..."

# Copy Neon schema over the default one
cp prisma/schema.postgres.prisma prisma/schema.prisma

echo "✅ Schema switched to PostgreSQL!"
echo ""
echo "Next steps:"
echo "  1. Set DATABASE_URL and DIRECT_URL in Vercel Environment Variables"
echo "  2. Run: npx prisma migrate dev --name init"
echo "  3. Run: npx prisma migrate deploy (on Vercel)"
echo "  4. Deploy: vercel --prod"
echo ""
echo "To switch back to SQLite for local dev, run: bash switch-to-sqlite.sh"
