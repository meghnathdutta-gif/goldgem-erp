#!/bin/bash
# Switch back to SQLite for local development
set -e
echo "🔧 Switching Prisma schema back to SQLite..."
# Restore the SQLite-compatible schema
cp prisma/schema.sqlite.prisma prisma/schema.prisma
echo "✅ Schema switched to SQLite!"
