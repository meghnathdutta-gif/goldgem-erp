import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const customers = await db.customer.findMany({ include: { _count: { select: { salesOrders: true, ecommerceOrders: true } } }, orderBy: { name: 'asc' } })
    return NextResponse.json(customers)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customer = await db.customer.create({ data: body })
    return NextResponse.json(customer, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
