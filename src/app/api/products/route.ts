import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') ?? ''
    const category = searchParams.get('category') ?? ''

    const where: Record<string, unknown> = {}

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({ products, total })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      sku,
      description,
      categoryId,
      price,
      costPrice,
      weight,
      purity,
      isManufactured,
      minStockLevel,
    } = body

    // Validate required fields
    if (!name || !sku || !categoryId || price === undefined || costPrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, categoryId, price, costPrice' },
        { status: 400 }
      )
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a non-negative number' },
        { status: 400 }
      )
    }

    if (typeof costPrice !== 'number' || costPrice < 0) {
      return NextResponse.json(
        { error: 'Cost price must be a non-negative number' },
        { status: 400 }
      )
    }

    // Check for duplicate SKU
    const existing = await db.product.findUnique({ where: { sku } })
    if (existing) {
      return NextResponse.json(
        { error: 'A product with this SKU already exists' },
        { status: 409 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        sku,
        description: description ?? null,
        categoryId,
        price,
        costPrice,
        weight: weight ?? null,
        purity: purity ?? null,
        isManufactured: isManufactured ?? false,
        minStockLevel: minStockLevel ?? 10,
      },
      include: { category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
