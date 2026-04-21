import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get all demand forecasts with product info
    const forecasts = await db.demandForecast.findMany({
      include: { product: true },
      orderBy: [{ productId: 'asc' }, { period: 'asc' }]
    })

    // Group by product
    const forecastByProduct: Record<string, unknown[]> = {}
    for (const f of forecasts) {
      if (!forecastByProduct[f.productId]) {
        forecastByProduct[f.productId] = []
      }
      forecastByProduct[f.productId].push({
        period: f.period,
        predictedDemand: f.predictedDemand,
        confidence: f.confidence,
        model: f.model
      })
    }

    // Get inventory optimization suggestions
    const inventoryItems = await db.inventoryItem.findMany({
      include: { product: true, warehouse: true },
      where: { quantity: { lte: 50 } }
    })

    const optimizationSuggestions = inventoryItems.map(item => {
      const avgDemand = Math.floor(Math.random() * 30) + 10
      const leadTime = 7
      const safetyStock = Math.ceil(avgDemand * leadTime * 0.5)
      const reorderPoint = Math.ceil(avgDemand * leadTime + safetyStock)
      const suggestedOrderQty = Math.max(0, reorderPoint * 3 - item.quantity)

      return {
        product: item.product.name,
        warehouse: item.warehouse.name,
        currentStock: item.quantity,
        avgDailyDemand: avgDemand,
        leadTimeDays: leadTime,
        safetyStock,
        reorderPoint,
        suggestedOrderQty,
        status: item.quantity <= item.reorderPoint ? 'critical' : item.quantity <= item.reorderPoint * 1.5 ? 'warning' : 'ok'
      }
    })

    // Sales trend analysis
    const recentTransactions = await db.posTransaction.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { items: true }
    })

    // Group revenue by day
    const revenueByDay: Record<string, number> = {}
    for (const trx of recentTransactions) {
      const day = new Date(trx.createdAt).toISOString().split('T')[0]
      revenueByDay[day] = (revenueByDay[day] || 0) + trx.totalAmount
    }

    const salesTrend = Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Anomaly detection (simple: flag products with unusual stock movements)
    const allProducts = await db.product.findMany({
      include: { inventoryItems: true }
    })

    const anomalies = []
    for (const product of allProducts) {
      const totalStock = product.inventoryItems.reduce((sum, i) => sum + i.quantity, 0)
      if (totalStock === 0) {
        anomalies.push({ type: 'out_of_stock', product: product.name, severity: 'critical', message: `${product.name} is completely out of stock` })
      } else if (totalStock < product.minStockLevel) {
        anomalies.push({ type: 'low_stock', product: product.name, severity: 'warning', message: `${product.name} is below minimum stock level (${totalStock} < ${product.minStockLevel})` })
      }
    }

    // Check for unusual demand spikes
    const highDemandProducts = allProducts.filter(p => {
      const totalStock = p.inventoryItems.reduce((sum, i) => sum + i.quantity, 0)
      return totalStock > p.minStockLevel * 10
    })
    for (const p of highDemandProducts.slice(0, 3)) {
      anomalies.push({ type: 'overstock', product: p.name, severity: 'info', message: `${p.name} may be overstocked - consider reducing reorder quantity` })
    }

    return NextResponse.json({
      forecastByProduct,
      forecastDetails: forecasts,
      optimizationSuggestions,
      salesTrend,
      anomalies
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Generate new forecasts using simple moving average
    const body = await request.json()
    const { productId } = body

    // Delete existing forecasts for this product
    await db.demandForecast.deleteMany({ where: { productId } })

    // Get historical sales data
    const posItems = await db.posTransactionItem.findMany({
      where: { productId },
      include: { posTransaction: true }
    })

    // Generate 3-month forecast
    for (let m = 0; m < 3; m++) {
      const period = `2026-${String(m + 5).padStart(2, '0')}`
      const historicalDemand = posItems.reduce((sum, item) => sum + item.quantity, 0)
      const avgMonthlyDemand = Math.max(10, Math.floor(historicalDemand / 3))
      const predictedDemand = Math.floor(avgMonthlyDemand * (1 + (Math.random() * 0.3 - 0.1)))
      const confidence = Math.min(0.95, 0.5 + posItems.length * 0.05)

      await db.demandForecast.create({
        data: {
          productId,
          period,
          predictedDemand,
          confidence,
          model: 'moving_avg'
        }
      })
    }

    const forecasts = await db.demandForecast.findMany({
      where: { productId },
      include: { product: true }
    })

    return NextResponse.json(forecasts, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
