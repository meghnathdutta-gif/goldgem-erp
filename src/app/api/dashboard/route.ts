import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // KPIs
    const posTransactions = await db.posTransaction.findMany({
      select: { total: true, createdAt: true },
    })
    const ecommerceOrders = await db.ecommerceOrder.findMany({
      select: { totalAmount: true, createdAt: true },
    })
    const salesOrderCount = await db.salesOrder.count()
    const inventoryItems = await db.inventoryItem.findMany({
      include: { product: { select: { costPrice: true, price: true } } },
    })
    const activeWorkOrders = await db.workOrder.count({
      where: { status: 'in_progress' },
    })
    const pendingShipments = await db.shipment.count({
      where: { status: { in: ['pending', 'shipped'] } },
    })
    const totalDesigns = await db.product.count()
    const totalCustomers = await db.customer.count()

    // Compute KPIs
    const posRevenue = posTransactions.reduce((sum, t) => sum + t.total, 0)
    const ecoRevenue = ecommerceOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalRevenue = posRevenue + ecoRevenue
    const totalOrders = posTransactions.length + ecommerceOrders.length + salesOrderCount
    const vaultValue = inventoryItems.reduce(
      (sum, item) => sum + item.quantity * item.product.costPrice,
      0
    )
    const lowStockAlerts = inventoryItems.filter(
      (item) => item.quantity <= item.reorderPoint
    ).length

    const kpis = {
      totalRevenue,
      totalOrders,
      vaultValue,
      activeWorkOrders,
      pendingShipments,
      lowStockAlerts,
      totalDesigns,
      totalCustomers,
    }

    // Revenue Chart - last 6 months (computed in JS from fetched data)
    const now = new Date()
    const revenueChart = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthLabel = monthStart.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      })
      const posRev = posTransactions
        .filter((t) => t.createdAt >= monthStart && t.createdAt < monthEnd)
        .reduce((sum, t) => sum + t.total, 0)
      const ecoRev = ecommerceOrders
        .filter((o) => o.createdAt >= monthStart && o.createdAt < monthEnd)
        .reduce((sum, o) => sum + o.totalAmount, 0)
      revenueChart.push({ month: monthLabel, revenue: posRev + ecoRev })
    }

    // Sales by Category
    const categories = await db.category.findMany({
      include: { _count: { select: { products: true } } },
    })
    const productsWithCategory = await db.product.findMany({
      select: {
        id: true,
        price: true,
        categoryId: true,
        inventoryItems: { select: { quantity: true } },
      },
    })
    const salesByCategory = categories.map((cat) => {
      const catProducts = productsWithCategory.filter((p) => p.categoryId === cat.id)
      const amount = catProducts.reduce((sum, p) => {
        const qty = p.inventoryItems.reduce((s, i) => s + i.quantity, 0)
        return sum + qty * p.price
      }, 0)
      return { category: cat.name, amount }
    })

    // Warehouse Utilization
    const warehouses = await db.warehouse.findMany({
      include: { inventoryItems: { select: { quantity: true } } },
    })
    const warehouseUtilization = warehouses.map((wh) => ({
      warehouse: wh.name,
      utilized: wh.inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
      capacity: wh.capacity,
    }))

    // Order Status Distribution
    const allSalesOrders = await db.salesOrder.findMany({
      select: { status: true },
    })
    const statusMap = new Map<string, number>()
    for (const so of allSalesOrders) {
      statusMap.set(so.status, (statusMap.get(so.status) ?? 0) + 1)
    }
    const orderStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }))

    // Top Products by inventory value
    const allProducts = await db.product.findMany({
      include: { inventoryItems: { select: { quantity: true } } },
    })
    const productsWithValue = allProducts.map((p) => {
      const totalQty = p.inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
      return { name: p.name, sku: p.sku, quantity: totalQty, value: totalQty * p.price }
    })
    const topProducts = productsWithValue.sort((a, b) => b.value - a.value).slice(0, 5)

    // Recent Activity
    const recentLogs = await db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    })
    const recentActivity = recentLogs.map((log) => ({
      id: log.id,
      user: log.user,
      action: log.action,
      module: log.module,
      details: log.details,
      createdAt: log.createdAt,
    }))

    return NextResponse.json({
      kpis,
      revenueChart,
      salesByCategory,
      warehouseUtilization,
      orderStatus,
      topProducts,
      recentActivity,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
