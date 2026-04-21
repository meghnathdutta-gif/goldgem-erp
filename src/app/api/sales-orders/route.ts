import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const salesOrders = await db.salesOrder.findMany({
      where,
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(salesOrders)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, items, ...soData } = body

    const lastSO = await db.salesOrder.findFirst({ orderBy: { createdAt: 'desc' } })
    const soNumber = `SO-2026-${String((lastSO ? parseInt(lastSO.soNumber.split('-')[2]) : 0) + 1).padStart(4, '0')}`

    const totalAmount = items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0)

    const salesOrder = await db.salesOrder.create({
      data: {
        soNumber,
        customerId,
        ...soData,
        totalAmount,
        taxAmount: totalAmount * 0.18,
        items: { create: items }
      },
      include: { customer: true, items: { include: { product: true } } }
    })
    return NextResponse.json(salesOrder, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
