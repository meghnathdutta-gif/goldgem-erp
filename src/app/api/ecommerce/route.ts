import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const orders = await db.ecommerceOrder.findMany({
      where, include: { customer: true, items: true }, orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, items, ...orderData } = body

    const lastOrder = await db.ecommerceOrder.findFirst({ orderBy: { createdAt: 'desc' } })
    const orderNumber = `ORD-2026-${String((lastOrder ? parseInt(lastOrder.orderNumber.split('-')[2]) : 0) + 1).padStart(5, '0')}`
    const totalAmount = items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0)

    const order = await db.ecommerceOrder.create({
      data: { orderNumber, customerId, ...orderData, totalAmount, taxAmount: totalAmount * 0.18, shippingCost: totalAmount > 5000 ? 0 : 99, items: { create: items } },
      include: { customer: true, items: true },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
