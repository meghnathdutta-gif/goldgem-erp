import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const transactions = await db.posTransaction.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Parse the JSON items string for each transaction
    const parsed = transactions.map((tx) => ({
      ...tx,
      items: JSON.parse(tx.items),
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('POS GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch POS transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, subtotal, tax, discount, total, paymentMethod } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: items (non-empty array)' },
        { status: 400 }
      )
    }

    if (subtotal === undefined || tax === undefined || total === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: subtotal, tax, total' },
        { status: 400 }
      )
    }

    const validPaymentMethods = ['cash', 'card', 'digital']
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: `paymentMethod must be one of: ${validPaymentMethods.join(', ')}` },
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

    // Auto-generate transactionNumber like "POS-2024-001"
    const year = new Date().getFullYear()
    const lastTransaction = await db.posTransaction.findFirst({
      where: { transactionNumber: { startsWith: `POS-${year}-` } },
      orderBy: { transactionNumber: 'desc' },
    })

    let nextSeq = 1
    if (lastTransaction) {
      const parts = lastTransaction.transactionNumber.split('-')
      const lastSeq = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1
      }
    }

    const transactionNumber = `POS-${year}-${String(nextSeq).padStart(3, '0')}`

    // Process transaction atomically
    const transaction = await db.$transaction(async (tx) => {
      // Check stock availability and deduct inventory for each item
      for (const item of items) {
        // Find all inventory entries for this product across all warehouses
        const inventoryItems = await tx.inventoryItem.findMany({
          where: {
            productId: item.productId,
            quantity: { gt: 0 },
          },
          orderBy: { quantity: 'desc' },
          include: { warehouse: { select: { name: true } } },
        })

        const totalAvailable = inventoryItems.reduce((sum, i) => sum + i.quantity, 0)

        if (totalAvailable < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.name}". Available: ${totalAvailable}, Requested: ${item.quantity}`
          )
        }

        // Deduct from warehouses (prioritize the one with most stock first)
        let remaining = item.quantity
        for (const inventoryItem of inventoryItems) {
          if (remaining <= 0) break
          const deduct = Math.min(inventoryItem.quantity, remaining)

          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: { decrement: deduct } },
          })

          // Create inventory movement record
          await tx.inventoryMovement.create({
            data: {
              inventoryItemId: inventoryItem.id,
              type: 'out',
              quantity: deduct,
              reference: transactionNumber,
              notes: `POS sale - ${paymentMethod} (from ${inventoryItem.warehouse.name})`,
            },
          })

          remaining -= deduct
        }
      }

      // Create the POS transaction
      const posTransaction = await tx.posTransaction.create({
        data: {
          transactionNumber,
          items: JSON.stringify(items),
          subtotal,
          tax,
          discount: discount ?? 0,
          total,
          paymentMethod,
          status: 'completed',
        },
      })

      return posTransaction
    })

    return NextResponse.json(
      { ...transaction, items: JSON.parse(transaction.items) },
      { status: 201 }
    )
  } catch (error) {
    console.error('POS POST error:', error)

    if (
      error instanceof Error &&
      (error.message.includes('Insufficient stock') ||
        error.message.includes('not found in'))
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process POS sale' },
      { status: 500 }
    )
  }
}
