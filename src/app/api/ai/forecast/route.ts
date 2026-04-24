import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // --- Demand Forecasts ---
    const forecasts = await db.demandForecast.findMany({
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group forecasts by product
    const forecastMap = new Map<
      string,
      {
        productId: string
        productName: string
        sku: string
        forecasts: {
          id: string
          period: string
          predictedDemand: number
          confidence: number
          model: string
          createdAt: string
        }[]
      }
    >()

    for (const f of forecasts) {
      if (!forecastMap.has(f.productId)) {
        forecastMap.set(f.productId, {
          productId: f.productId,
          productName: f.product.name,
          sku: f.product.sku,
          forecasts: [],
        })
      }
      forecastMap.get(f.productId)!.forecasts.push({
        id: f.id,
        period: f.period,
        predictedDemand: f.predictedDemand,
        confidence: f.confidence,
        model: f.model,
        createdAt: f.createdAt.toISOString(),
      })
    }

    const demandForecasts = Array.from(forecastMap.values())

    // --- Inventory Optimization ---
    // Find inventory items where quantity <= reorderPoint
    const lowStockItems = await db.inventoryItem.findMany({
      where: {
        quantity: { lte: db.inventoryItem.fields.reorderPoint },
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
    })

    const inventoryOptimization = lowStockItems.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      currentStock: item.quantity,
      reorderPoint: item.reorderPoint,
      suggestedQty: Math.max(0, item.reorderPoint * 2 - item.quantity),
    }))

    // --- Anomaly Detection ---
    // Find items with quantity = 0 (out of stock) or quantity <= reorderPoint * 0.5 (critical low)
    const allInventoryItems = await db.inventoryItem.findMany({
      include: {
        product: {
          select: { id: true, name: true },
        },
        warehouse: {
          select: { id: true, name: true },
        },
      },
    })

    const anomalyDetection = allInventoryItems
      .filter((item) => item.quantity === 0 || item.quantity <= item.reorderPoint * 0.5)
      .map((item) => ({
        inventoryItemId: item.id,
        productId: item.productId,
        productName: item.product.name,
        warehouseName: item.warehouse.name,
        quantity: item.quantity,
        severity: item.quantity === 0 ? 'out_of_stock' as const : 'critical_low' as const,
        reorderPoint: item.reorderPoint,
      }))

    return NextResponse.json({
      demandForecasts,
      inventoryOptimization,
      anomalyDetection,
    })
  } catch (error) {
    console.error('AI Forecast GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required field: productId' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Find recent POS transactions that include this product
    // Since items is stored as a JSON string, we need to fetch and filter in memory
    const recentTransactions = await db.posTransaction.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Extract sales quantities for this product from POS transactions
    let totalDemand = 0
    let transactionCount = 0

    for (const tx of recentTransactions) {
      try {
        const txItems = JSON.parse(tx.items) as Array<{
          productId: string
          quantity: number
        }>
        const matchingItem = txItems.find((item) => item.productId === productId)
        if (matchingItem) {
          totalDemand += matchingItem.quantity
          transactionCount++
        }
      } catch {
        // Skip malformed JSON
        continue
      }
    }

    // Compute average monthly demand
    // Use number of months with data, or 1 to avoid division by zero
    const monthsWithData = Math.max(1, Math.min(transactionCount, 6))
    const avgMonthlyDemand = totalDemand / monthsWithData

    // Generate 3 monthly forecasts with decreasing confidence
    const confidenceLevels = [0.85, 0.75, 0.65]
    const now = new Date()
    const forecastData = confidenceLevels.map((confidence, index) => {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + index + 1, 1)
      const period = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`
      return {
        productId,
        period,
        predictedDemand: Math.round(avgMonthlyDemand * 100) / 100,
        confidence,
        model: 'MovingAverage',
      }
    })

    const createdForecasts = await db.demandForecast.createMany({
      data: forecastData,
    })

    // Fetch the newly created forecasts to return
    const newForecasts = await db.demandForecast.findMany({
      where: {
        productId,
        model: 'MovingAverage',
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Return only the ones we just created (last 3)
    const latestForecasts = newForecasts.slice(0, 3)

    return NextResponse.json(
      {
        product: { id: product.id, name: product.name, sku: product.sku },
        averageMonthlyDemand: Math.round(avgMonthlyDemand * 100) / 100,
        transactionsAnalyzed: transactionCount,
        forecasts: latestForecasts,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('AI Forecast POST error:', error)
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    )
  }
}
