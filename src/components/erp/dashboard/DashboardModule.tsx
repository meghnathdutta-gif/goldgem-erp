'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Factory, Truck, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

interface DashboardData {
  kpis: {
    totalRevenue: number
    totalOrders: number
    inventoryValue: number
    activeWorkOrders: number
    pendingShipments: number
    lowStockAlerts: number
  }
  monthlyRevenue: Record<string, number>
  salesByCategory: { name: string; total: number; color: string }[]
  statusDistribution: Record<string, number>
  inventoryByWarehouse: { name: string; totalItems: number; categories: { name: string; count: number }[] }[]
  lowStockItems: { id: string; quantity: number; product: { name: string; sku: string; minStockLevel: number }; warehouse: { name: string } }[]
  recentActivity: { id: string; action: string; module: string; details: string; user: string; createdAt: string }[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  delivered: '#10b981',
  active: '#10b981',
  received: '#10b981',
  pending: '#f59e0b',
  draft: '#f59e0b',
  in_progress: '#f59e0b',
  confirmed: '#8b5cf6',
  processing: '#8b5cf6',
  shipped: '#3b82f6',
  in_transit: '#3b82f6',
  cancelled: '#ef4444',
  urgent: '#ef4444',
  low_stock: '#ef4444',
  partial: '#f97316',
}

export function DashboardModule() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-6 text-muted-foreground">Failed to load dashboard data</div>

  const kpis = data.kpis

  // Format monthly revenue for chart
  const revenueData = Object.entries(data.monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: Math.round(revenue),
    }))

  const salesByCategoryData = data.salesByCategory
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const statusData = Object.entries(data.statusDistribution).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    color: STATUS_COLORS[name] || '#94a3b8',
  }))

  const warehouseData = data.inventoryByWarehouse.map(wh => ({
    name: wh.name.replace(' Warehouse', '').replace(' Depot', ''),
    total: wh.totalItems,
    Electronics: wh.categories.find(c => c.name === 'Electronics')?.count || 0,
    Clothing: wh.categories.find(c => c.name === 'Clothing')?.count || 0,
    Food: wh.categories.find(c => c.name === 'Food & Beverages')?.count || 0,
    Furniture: wh.categories.find(c => c.name === 'Furniture')?.count || 0,
    Raw: wh.categories.find(c => c.name === 'Raw Materials')?.count || 0,
  }))

  const kpiCards = [
    { title: 'Total Revenue', value: `₹${(kpis.totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, trend: '+12.5%', up: true, color: 'text-emerald-600' },
    { title: 'Total Orders', value: kpis.totalOrders.toString(), icon: ShoppingCart, trend: '+8.2%', up: true, color: 'text-blue-600' },
    { title: 'Inventory Value', value: `₹${(kpis.inventoryValue / 100000).toFixed(1)}L`, icon: Package, trend: '+3.1%', up: true, color: 'text-amber-600' },
    { title: 'Active Work Orders', value: kpis.activeWorkOrders.toString(), icon: Factory, trend: '-2', up: false, color: 'text-purple-600' },
    { title: 'Pending Shipments', value: kpis.pendingShipments.toString(), icon: Truck, trend: '+5', up: true, color: 'text-cyan-600' },
    { title: 'Low Stock Alerts', value: kpis.lowStockAlerts.toString(), icon: AlertTriangle, trend: 'Critical', up: false, color: 'text-red-600' },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 space-y-6"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.title} variants={item}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  <Badge variant={kpi.up ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                    {kpi.up ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {kpi.trend}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue across all channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <RechartsTooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales by Category */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sales by Category</CardTitle>
              <CardDescription>Revenue distribution across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <RechartsTooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {salesByCategoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color || '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Status</CardTitle>
              <CardDescription>Distribution of order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory by Warehouse */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Inventory by Warehouse</CardTitle>
              <CardDescription>Stock levels across warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={warehouseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <RechartsTooltip />
                  <Bar dataKey="Electronics" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Clothing" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Food" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Furniture" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="Raw" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                {data.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 mt-0.5 ${
                        activity.action === 'CREATE' ? 'border-emerald-300 text-emerald-700' :
                        activity.action === 'UPDATE' ? 'border-amber-300 text-amber-700' :
                        'border-red-300 text-red-700'
                      }`}
                    >
                      {activity.action}
                    </Badge>
                    <div className="min-w-0">
                      <p className="truncate">{activity.details}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {activity.module} · {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {data.lowStockItems.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Items that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.lowStockItems.slice(0, 9).map((lsi, i) => (
                  <div key={i} className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-lg border border-red-100 dark:border-red-900">
                    <div>
                      <p className="text-sm font-medium">{lsi.product.name}</p>
                      <p className="text-[11px] text-muted-foreground">{lsi.warehouse.name}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {lsi.quantity} / {lsi.product.minStockLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
