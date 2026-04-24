import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Suppliers GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      code,
      contactPerson,
      phone,
      email,
      address,
      rating,
      leadTimeDays,
      paymentTerms,
    } = body

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: name, code' },
        { status: 400 }
      )
    }

    // Check for duplicate code
    const existing = await db.supplier.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { error: 'A supplier with this code already exists' },
        { status: 409 }
      )
    }

    const supplier = await db.supplier.create({
      data: {
        name,
        code,
        contactPerson: contactPerson ?? null,
        phone: phone ?? null,
        email: email ?? null,
        address: address ?? null,
        rating: rating !== undefined ? rating : 0,
        leadTimeDays: leadTimeDays !== undefined ? leadTimeDays : 7,
        paymentTerms: paymentTerms ?? null,
      },
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Suppliers POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}
