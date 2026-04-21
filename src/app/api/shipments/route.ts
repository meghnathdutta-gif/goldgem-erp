import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const shipments = await db.shipment.findMany({
      where,
      include: { items: { include: { product: true } }, purchaseOrder: { include: { supplier: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(shipments)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, ...shipmentData } = body

    const lastShipment = await db.shipment.findFirst({ orderBy: { createdAt: 'desc' } })
    const shipmentNumber = `SHP-2026-${String((lastShipment ? parseInt(lastShipment.shipmentNumber.split('-')[2]) : 0) + 1).padStart(4, '0')}`

    const shipment = await db.shipment.create({
      data: {
        shipmentNumber,
        ...shipmentData,
        items: { create: items || [] }
      },
      include: { items: { include: { product: true } } }
    })
    return NextResponse.json(shipment, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
