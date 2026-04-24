import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) {
      where.orderStatus = status
    }

    const orders = await db.ecommerceOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Parse the JSON items string for each order
    const parsed = orders.map((order) => ({
      ...order,
      items: JSON.parse(order.items),
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Ecommerce GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ecommerce orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, customerEmail, items, totalAmount, shippingAddress } = body

    // Validate required fields
    if (!customerName) {
      return NextResponse.json(
        { error: 'Missing required field: customerName' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: items (non-empty array)' },
        { status: 400 }
      )
    }

    if (totalAmount === undefined || typeof totalAmount !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid field: totalAmount' },
        { status: 400 }
      )
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required field: shippingAddress' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.name || item.price === undefined || item.quantity === undefined) {
        return NextResponse.json(
          { error: 'Each item must have productId, name, price, quantity' },
          { status: 400 }
        )
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Item quantity must be a positive number' },
          { status: 400 }
        )
      }
    }

    // Auto-generate orderNumber like "ORD-2024-001"
    const year = new Date().getFullYear()
    const lastOrder = await db.ecommerceOrder.findFirst({
      where: { orderNumber: { startsWith: `ORD-${year}-` } },
      orderBy: { orderNumber: 'desc' },
    })

    let nextSeq = 1
    if (lastOrder) {
      const parts = lastOrder.orderNumber.split('-')
      const lastSeq = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1
      }
    }

    const orderNumber = `ORD-${year}-${String(nextSeq).padStart(3, '0')}`

    const order = await db.ecommerceOrder.create({
      data: {
        orderNumber,
        customerName,
        customerEmail: customerEmail ?? null,
        items: JSON.stringify(items),
        totalAmount,
        shippingAddress,
        paymentStatus: 'pending',
        orderStatus: 'pending',
      },
    })

    return NextResponse.json(
      { ...order, items: JSON.parse(order.items) },
      { status: 201 }
    )
  } catch (error) {
    console.error('Ecommerce POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create ecommerce order' },
      { status: 500 }
    )
  }
}
