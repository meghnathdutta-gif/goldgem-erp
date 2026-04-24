import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const purchaseOrders = await db.purchaseOrder.findMany({
      where, include: { supplier: true, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(purchaseOrders)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { supplierId, items, ...poData } = body

    const lastPO = await db.purchaseOrder.findFirst({ orderBy: { createdAt: 'desc' } })
    const poNumber = `PO-2026-${String((lastPO ? parseInt(lastPO.poNumber.split('-')[2]) : 0) + 1).padStart(4, '0')}`
    const totalAmount = items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0)

    const purchaseOrder = await db.purchaseOrder.create({
      data: { poNumber, supplierId, ...poData, totalAmount, taxAmount: totalAmount * 0.18, items: { create: items } },
      include: { supplier: true, items: { include: { product: true } } },
    })
    return NextResponse.json(purchaseOrder, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
