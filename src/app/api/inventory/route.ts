import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const where: Record<string, unknown> = {}
    if (type) where.type = type

    const movements = await db.inventoryMovement.findMany({
      where,
      include: { inventoryItem: { include: { product: true } }, warehouse: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(movements)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { inventoryItemId, warehouseId, type, quantity, reference, notes, performedBy } = body

    const movement = await db.inventoryMovement.create({ data: { inventoryItemId, warehouseId, type, quantity, reference, notes, performedBy } })

    const item = await db.inventoryItem.findUnique({ where: { id: inventoryItemId } })
    if (item) {
      const newQty = type === 'in' || type === 'return'
        ? item.quantity + quantity
        : type === 'out' || type === 'adjustment'
          ? Math.max(0, item.quantity - quantity)
          : item.quantity
      await db.inventoryItem.update({ where: { id: inventoryItemId }, data: { quantity: newQty } })
    }

    return NextResponse.json(movement, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
