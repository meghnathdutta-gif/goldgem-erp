# ============================================
# GoldGem ERP - Next.js Production Dockerfile
# Optimized for Railway deployment
# ============================================

FROM node:20-slim AS base

# Install OpenSSL (required by Prisma) and other deps
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN npm install -g bun

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM base AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# ============================================
# Stage 2: Build the application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV OUTPUT=standalone

# Run Prisma generate again (ensures client is built)
RUN bunx prisma generate

# Build the Next.js application
RUN bun run build

# ============================================
# Stage 3: Production image
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files for runtime migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy node_modules for Prisma runtime
COPY --from=builder /app/node_modules ./node_modules

# Create a startup script that runs migrations then starts the server
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
echo "Starting GoldGem ERP..."\n\
exec node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]
