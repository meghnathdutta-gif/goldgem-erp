import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const shipments = await db.shipment.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(shipments)
  } catch (error) {
    console.error('Shipments GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { carrier, trackingNumber, origin, destination, items } = body

    // Validate required fields
    if (!carrier || !origin || !destination) {
      return NextResponse.json(
        { error: 'Missing required fields: carrier, origin, destination' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      )
    }

    for (const item of items) {
      if (!item.productId || item.quantity === undefined) {
        return NextResponse.json(
          { error: 'Each item must have productId and quantity' },
          { status: 400 }
        )
      }
    }

    // Auto-generate shipmentNumber like "SHP-2024-001"
    const year = new Date().getFullYear()
    const lastShipment = await db.shipment.findFirst({
      where: { shipmentNumber: { startsWith: `SHP-${year}-` } },
      orderBy: { shipmentNumber: 'desc' },
      select: { shipmentNumber: true },
    })

    let nextSeq = 1
    if (lastShipment) {
      const lastSeq = parseInt(lastShipment.shipmentNumber.split('-')[2], 10)
      nextSeq = lastSeq + 1
    }
    const shipmentNumber = `SHP-${year}-${String(nextSeq).padStart(3, '0')}`

    // Create shipment with items
    const shipment = await db.shipment.create({
      data: {
        shipmentNumber,
        carrier,
        trackingNumber: trackingNumber ?? null,
        origin,
        destination,
        items: {
          create: items.map(
            (item: { productId: string; quantity: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
            })
          ),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(shipment, { status: 201 })
  } catch (error) {
    console.error('Shipments POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    )
  }
}
