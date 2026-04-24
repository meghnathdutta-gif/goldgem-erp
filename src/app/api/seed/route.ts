import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db.product.count()
    return NextResponse.json({
      seeded: count > 0,
      count,
    })
  } catch (error) {
    console.error('Seed check error:', error)
    return NextResponse.json(
      { error: 'Failed to check seed status' },
      { status: 500 }
    )
  }
}
