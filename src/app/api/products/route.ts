import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const lowStock = searchParams.get('lowStock')

    const where: Record<string, unknown> = {}
    if (category) where.categoryId = category
    if (search) where.name = { contains: search }
    if (lowStock === 'true') {
      where.inventoryItems = { some: { quantity: { lte: 10 } } }
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        inventoryItems: { include: { warehouse: true } },
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.create({ data: body })
    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
