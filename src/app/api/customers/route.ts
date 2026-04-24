import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (type) {
      where.type = type
    }

    const customers = await db.customer.findMany({
      where,
      include: {
        _count: {
          select: { salesOrders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Customers GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, type, gstNumber } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const customer = await db.customer.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        address: address ?? null,
        type: type ?? 'retail',
        gstNumber: gstNumber ?? null,
      },
      include: {
        _count: {
          select: { salesOrders: true },
        },
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Customers POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
