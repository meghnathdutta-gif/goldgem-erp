import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const results: Record<string, any> = {}

  // 1. Check environment variable
  const dbUrl = process.env.DATABASE_URL
  results.envCheck = {
    DATABASE_URL_exists: !!dbUrl,
    DATABASE_URL_prefix: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET',
    DATABASE_URL_starts_with_postgresql: dbUrl?.startsWith('postgresql://') || false,
    NODE_ENV: process.env.NODE_ENV,
  }

  // 2. Try Prisma connection
  try {
    const prisma = new PrismaClient()
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    results.dbConnection = {
      status: 'SUCCESS',
      userCount,
      productCount,
    }
    await prisma.$disconnect()
  } catch (error: any) {
    results.dbConnection = {
      status: 'FAILED',
      errorMessage: error?.message || String(error),
      errorCode: error?.code || 'unknown',
      errorMeta: error?.meta || null,
    }
  }

  return NextResponse.json(results, { status: 200 })
}
