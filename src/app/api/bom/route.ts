import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      const components = await db.bomComponent.findMany({ where: { productId }, include: { component: true, product: true } })
      return NextResponse.json(components)
    }

    const manufacturedProducts = await db.product.findMany({
      where: { isManufactured: true },
      include: { bomComponents: { include: { component: true } }, category: true },
    })
    return NextResponse.json(manufacturedProducts)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
