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

    const purchaseOrders = await db.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(purchaseOrders)
  } catch (error) {
    console.error('PurchaseOrders GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplierId, items, notes } = body

    // Validate required fields
    if (!supplierId) {
      return NextResponse.json(
        { error: 'Missing required field: supplierId' },
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
      if (!item.productId || item.quantity === undefined || item.unitPrice === undefined) {
        return NextResponse.json(
          { error: 'Each item must have productId, quantity, and unitPrice' },
          { status: 400 }
        )
      }
    }

    // Verify supplier exists
    const supplier = await db.supplier.findUnique({ where: { id: supplierId } })
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Auto-generate poNumber like "PO-2024-001"
    const year = new Date().getFullYear()
    const lastPO = await db.purchaseOrder.findFirst({
      where: { poNumber: { startsWith: `PO-${year}-` } },
      orderBy: { poNumber: 'desc' },
      select: { poNumber: true },
    })

    let nextSeq = 1
    if (lastPO) {
      const lastSeq = parseInt(lastPO.poNumber.split('-')[2], 10)
      nextSeq = lastSeq + 1
    }
    const poNumber = `PO-${year}-${String(nextSeq).padStart(3, '0')}`

    // Calculate totalAmount and taxAmount (3% GST)
    const totalAmount = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    )
    const taxAmount = Math.round(totalAmount * 0.03 * 100) / 100

    // Create PO with items
    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        totalAmount,
        taxAmount,
        notes: notes ?? null,
        items: {
          create: items.map(
            (item: { productId: string; quantity: number; unitPrice: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })
          ),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(purchaseOrder, { status: 201 })
  } catch (error) {
    console.error('PurchaseOrders POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    )
  }
}
