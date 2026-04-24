import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const transactions = await db.posTransaction.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(transactions)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, customerName, paymentMethod, discount, userId } = body

    const subtotal = items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0)
    const taxAmount = Math.round(subtotal * 0.03)
    const totalAmount = subtotal + taxAmount - (discount || 0)

    const lastTrx = await db.posTransaction.findFirst({ orderBy: { createdAt: 'desc' } })
    const lastNum = lastTrx ? parseInt(lastTrx.transactionNumber.split('-').pop() || '0') : 0
    const transactionNumber = `TRX-2026-${String(lastNum + 1).padStart(5, '0')}`

    const transaction = await db.posTransaction.create({
      data: { transactionNumber, userId: userId || null, customerName: customerName || null, subtotal, taxAmount, discount: discount || 0, totalAmount, paymentMethod: paymentMethod || 'cash', items: { create: items } },
      include: { items: true },
    })

    // Deduct inventory for each sold item
    for (const item of items) {
      const invItem = await db.inventoryItem.findFirst({
        where: { productId: item.productId, quantity: { gt: 0 } },
        orderBy: { quantity: 'desc' },
      })
      if (invItem) {
        await db.inventoryItem.update({ where: { id: invItem.id }, data: { quantity: Math.max(0, invItem.quantity - item.quantity) } })
        await db.inventoryMovement.create({
          data: { inventoryItemId: invItem.id, warehouseId: invItem.warehouseId, type: 'out', quantity: item.quantity, reference: transactionNumber, notes: 'POS Sale', performedBy: 'System' },
        })
      }
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
