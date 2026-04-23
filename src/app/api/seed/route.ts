import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Guard: check if already seeded
    const userCount = await db.user.count()
    if (userCount > 0) {
      return NextResponse.json({ success: true, message: 'Database already seeded', count: userCount })
    }

    // If empty, redirect to the CLI seed script
    return NextResponse.json({ 
      success: false, 
      message: 'Database is empty. Run: npx prisma db seed (or bun run db:seed) to populate data.' 
    }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const counts = {
      users: await db.user.count(),
      products: await db.product.count(),
      categories: await db.category.count(),
      warehouses: await db.warehouse.count(),
      suppliers: await db.supplier.count(),
      purchaseOrders: await db.purchaseOrder.count(),
      workOrders: await db.workOrder.count(),
      customers: await db.customer.count(),
      salesOrders: await db.salesOrder.count(),
      posTransactions: await db.posTransaction.count(),
      ecommerceOrders: await db.ecommerceOrder.count(),
      shipments: await db.shipment.count(),
      forecasts: await db.demandForecast.count(),
    }
    return NextResponse.json({ seeded: Object.values(counts).some(c => c > 0), counts })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
