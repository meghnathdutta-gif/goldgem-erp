import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({ include: { _count: { select: { purchaseOrders: true } } }, orderBy: { name: 'asc' } })
    return NextResponse.json(suppliers)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supplier = await db.supplier.create({ data: body })
    return NextResponse.json(supplier, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
