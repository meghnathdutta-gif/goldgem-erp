import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const workOrders = await db.workOrder.findMany({
      where,
      include: { products: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(workOrders)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { products, ...woData } = body

    const lastWO = await db.workOrder.findFirst({ orderBy: { createdAt: 'desc' } })
    const woNumber = `WO-2026-${String((lastWO ? parseInt(lastWO.woNumber.split('-')[2]) : 0) + 1).padStart(4, '0')}`

    const workOrder = await db.workOrder.create({
      data: {
        woNumber,
        ...woData,
        products: { create: products }
      },
      include: { products: { include: { product: true } } }
    })
    return NextResponse.json(workOrder, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
