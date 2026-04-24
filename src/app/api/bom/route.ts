import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { isManufactured: true },
      include: {
        bomComponents: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const bomList = products.map((product) => ({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      components: product.bomComponents.map((bc) => ({
        componentId: bc.component.id,
        componentName: bc.component.name,
        sku: bc.component.sku,
        quantity: bc.quantity,
      })),
    }))

    return NextResponse.json(bomList)
  } catch (error) {
    console.error('BOM GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Bill of Materials' },
      { status: 500 }
    )
  }
}
