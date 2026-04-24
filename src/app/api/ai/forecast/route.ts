import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const forecasts = await db.demandForecast.findMany({ include: { product: true }, orderBy: [{ productId: 'asc' }, { period: 'asc' }] })

    const forecastByProduct: Record<string, { period: string; predictedDemand: number; confidence: number; model: string; productName: string }[]> = {}
    for (const f of forecasts) {
      if (!forecastByProduct[f.productId]) forecastByProduct[f.productId] = []
      forecastByProduct[f.productId].push({ period: f.period, predictedDemand: f.predictedDemand, confidence: f.confidence, model: f.model, productName: f.product.name })
    }

    // Inventory Optimization
    const inventoryItems = await db.inventoryItem.findMany({ include: { product: true, warehouse: true }, where: { quantity: { lte: 50 } } })
    const optimizationSuggestions = inventoryItems.map(item => {
      const avgDemand = 15 + Math.floor(Math.random() * 20)
      const leadTime = 7
      const safetyStock = Math.ceil(avgDemand * leadTime * 0.5)
      const reorderPoint = Math.ceil(avgDemand * leadTime + safetyStock)
      const suggestedOrderQty = Math.max(0, reorderPoint * 3 - item.quantity)
      return {
        product: item.product.name, warehouse: item.warehouse.name, currentStock: item.quantity,
        avgDailyDemand: avgDemand, leadTimeDays: leadTime, safetyStock, reorderPoint, suggestedOrderQty,
        status: item.quantity <= item.reorderPoint ? 'critical' : item.quantity <= item.reorderPoint * 1.5 ? 'warning' : 'ok',
      }
    })

    // Sales Trend
    const recentTrx = await db.posTransaction.findMany({ where: { status: 'completed' }, orderBy: { createdAt: 'desc' }, take: 100, include: { items: true } })
    const revenueByDay: Record<string, number> = {}
    for (const trx of recentTrx) {
      const day = new Date(trx.createdAt).toISOString().split('T')[0]
      revenueByDay[day] = (revenueByDay[day] || 0) + trx.totalAmount
    }
    const salesTrend = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue: Math.round(revenue) })).sort((a, b) => a.date.localeCompare(b.date))

    // Anomalies
    const allProducts = await db.product.findMany({ include: { inventoryItems: true } })
    const anomalies: { type: string; product: string; severity: string; message: string }[] = []
    for (const product of allProducts) {
      const totalStock = product.inventoryItems.reduce((sum, i) => sum + i.quantity, 0)
      if (totalStock === 0) anomalies.push({ type: 'out_of_stock', product: product.name, severity: 'critical', message: `${product.name} is completely out of stock` })
      else if (totalStock < product.minStockLevel) anomalies.push({ type: 'low_stock', product: product.name, severity: 'warning', message: `${product.name} is below minimum stock level (${totalStock} < ${product.minStockLevel})` })
    }

    return NextResponse.json({ forecastByProduct, optimizationSuggestions, salesTrend, anomalies })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId } = body

    await db.demandForecast.deleteMany({ where: { productId } })

    const posItems = await db.posTransactionItem.findMany({ where: { productId }, include: { posTransaction: true } })

    for (let m = 0; m < 3; m++) {
      const period = `2026-${String(m + 5).padStart(2, '0')}`
      const historicalDemand = posItems.reduce((sum, item) => sum + item.quantity, 0)
      const avgMonthlyDemand = Math.max(10, Math.floor(historicalDemand / 3))
      const predictedDemand = Math.floor(avgMonthlyDemand * (1 + (Math.random() * 0.3 - 0.1)))
      const confidence = Math.min(0.95, 0.5 + posItems.length * 0.05)

      await db.demandForecast.create({ data: { productId, period, predictedDemand, confidence, model: 'moving_avg' } })
    }

    const forecasts = await db.demandForecast.findMany({ where: { productId }, include: { product: true } })
    return NextResponse.json(forecasts, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
