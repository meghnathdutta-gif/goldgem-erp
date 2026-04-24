import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const warehouses = await db.warehouse.findMany({
      include: {
        _count: {
          select: { inventoryItems: true },
        },
        inventoryItems: {
          select: { quantity: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = warehouses.map((w) => ({
      ...w,
      totalQuantity: w.inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Warehouses GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, city, capacity } = body

    // Validate required fields
    if (!name || !code || !city || capacity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, code, city, capacity' },
        { status: 400 }
      )
    }

    if (typeof capacity !== 'number' || capacity < 0) {
      return NextResponse.json(
        { error: 'Capacity must be a non-negative number' },
        { status: 400 }
      )
    }

    // Check for duplicate code
    const existing = await db.warehouse.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { error: 'A warehouse with this code already exists' },
        { status: 409 }
      )
    }

    const warehouse = await db.warehouse.create({
      data: {
        name,
        code,
        city,
        capacity,
      },
      include: {
        _count: {
          select: { inventoryItems: true },
        },
      },
    })

    return NextResponse.json({ ...warehouse, totalQuantity: 0 }, { status: 201 })
  } catch (error) {
    console.error('Warehouses POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create warehouse' },
      { status: 500 }
    )
  }
}
