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

    const salesOrders = await db.salesOrder.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(salesOrders)
  } catch (error) {
    console.error('SalesOrders GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, totalAmount, discount, taxAmount, notes } = body

    // Validate required fields
    if (!customerId || totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, totalAmount' },
        { status: 400 }
      )
    }

    if (typeof totalAmount !== 'number' || totalAmount < 0) {
      return NextResponse.json(
        { error: 'Total amount must be a non-negative number' },
        { status: 400 }
      )
    }

    // Verify customer exists
    const customer = await db.customer.findUnique({ where: { id: customerId } })
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Auto-generate soNumber like "SO-2024-001"
    const year = new Date().getFullYear()
    const lastSO = await db.salesOrder.findFirst({
      where: { soNumber: { startsWith: `SO-${year}-` } },
      orderBy: { soNumber: 'desc' },
      select: { soNumber: true },
    })

    let nextSeq = 1
    if (lastSO) {
      const lastSeq = parseInt(lastSO.soNumber.split('-')[2], 10)
      nextSeq = lastSeq + 1
    }
    const soNumber = `SO-${year}-${String(nextSeq).padStart(3, '0')}`

    const salesOrder = await db.salesOrder.create({
      data: {
        soNumber,
        customerId,
        totalAmount,
        discount: discount !== undefined ? discount : 0,
        taxAmount: taxAmount !== undefined ? taxAmount : 0,
        notes: notes ?? null,
      },
      include: {
        customer: true,
      },
    })

    return NextResponse.json(salesOrder, { status: 201 })
  } catch (error) {
    console.error('SalesOrders POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create sales order' },
      { status: 500 }
    )
  }
}
