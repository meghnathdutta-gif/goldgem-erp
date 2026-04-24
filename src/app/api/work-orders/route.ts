import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const workOrders = await db.workOrder.findMany({
      where,
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(workOrders)
  } catch (error) {
    console.error('Work Orders GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { priority, plannedStart, plannedEnd, notes, products } = body

    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: products (non-empty array)' },
        { status: 400 }
      )
    }

    for (const item of products) {
      if (!item.productId || item.targetQty === undefined || item.targetQty === null) {
        return NextResponse.json(
          { error: 'Each product must have productId and targetQty' },
          { status: 400 }
        )
      }
      if (typeof item.targetQty !== 'number' || item.targetQty <= 0) {
        return NextResponse.json(
          { error: 'targetQty must be a positive number' },
          { status: 400 }
        )
      }
    }

    // Validate product IDs exist
    const productIds = products.map((p: { productId: string }) => p.productId)
    const existingProducts = await db.product.findMany({
      where: { id: { in: productIds } },
    })
    if (existingProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more product IDs not found' },
        { status: 404 }
      )
    }

    // Auto-generate woNumber like "WO-2024-001"
    const year = new Date().getFullYear()
    const lastWorkOrder = await db.workOrder.findFirst({
      where: { woNumber: { startsWith: `WO-${year}-` } },
      orderBy: { woNumber: 'desc' },
    })

    let nextSeq = 1
    if (lastWorkOrder) {
      const parts = lastWorkOrder.woNumber.split('-')
      const lastSeq = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1
      }
    }

    const woNumber = `WO-${year}-${String(nextSeq).padStart(3, '0')}`

    const validPriorities = ['low', 'medium', 'high', 'critical']
    const assignedPriority = priority && validPriorities.includes(priority) ? priority : 'medium'

    const workOrder = await db.workOrder.create({
      data: {
        woNumber,
        status: 'planned',
        priority: assignedPriority,
        plannedStart: plannedStart ? new Date(plannedStart) : null,
        plannedEnd: plannedEnd ? new Date(plannedEnd) : null,
        notes: notes ?? null,
        products: {
          create: products.map(
            (p: { productId: string; targetQty: number }) => ({
              productId: p.productId,
              targetQty: p.targetQty,
            })
          ),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(workOrder, { status: 201 })
  } catch (error) {
    console.error('Work Orders POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create work order' },
      { status: 500 }
    )
  }
}
