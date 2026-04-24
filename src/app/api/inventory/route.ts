import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lowStock = searchParams.get('lowStock') === 'true'

    const where: Record<string, unknown> = {}

    if (lowStock) {
      where.quantity = { lte: db.inventoryItem.fields.reorderPoint }
    }

    const items = await db.inventoryItem.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Inventory GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, warehouseId, type, quantity, reference, notes } = body

    // Validate required fields
    if (!productId || !warehouseId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, warehouseId, type, quantity' },
        { status: 400 }
      )
    }

    const validTypes = ['in', 'out', 'return', 'adjustment']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Verify warehouse exists
    const warehouse = await db.warehouse.findUnique({ where: { id: warehouseId } })
    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      )
    }

    // Calculate quantity change
    let qtyChange = 0
    switch (type) {
      case 'in':
        qtyChange = quantity
        break
      case 'out':
        qtyChange = -quantity
        break
      case 'return':
        qtyChange = quantity
        break
      case 'adjustment':
        // For adjustment, quantity represents the new absolute value
        // We need to calculate the delta
        const existingItem = await db.inventoryItem.findUnique({
          where: { productId_warehouseId: { productId, warehouseId } },
        })
        if (existingItem) {
          qtyChange = quantity - existingItem.quantity
        } else {
          qtyChange = quantity
        }
        break
    }

    // Upsert inventory item and create movement in a transaction
    const result = await db.$transaction(async (tx) => {
      const inventoryItem = await tx.inventoryItem.upsert({
        where: { productId_warehouseId: { productId, warehouseId } },
        create: {
          productId,
          warehouseId,
          quantity: Math.max(0, qtyChange),
          reorderPoint: product.minStockLevel,
        },
        update: {
          quantity: { increment: qtyChange },
        },
        include: { product: true, warehouse: true },
      })

      // Ensure quantity doesn't go negative
      if (inventoryItem.quantity < 0) {
        throw new Error('Insufficient stock for this operation')
      }

      // Create movement record
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          type,
          quantity,
          reference: reference ?? null,
          notes: notes ?? null,
        },
      })

      return inventoryItem
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Inventory POST error:', error)

    if (error instanceof Error && error.message === 'Insufficient stock for this operation') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create inventory movement' },
      { status: 500 }
    )
  }
}
