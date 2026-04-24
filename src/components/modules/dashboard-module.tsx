'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  ShoppingCart,
  Vault,
  Hammer,
  Truck,
  AlertTriangle,
  Gem,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { formatINR } from '@/lib/utils'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

// ─── Types ───────────────────────────────────────────────────────────────────

interface KPIs {
  totalRevenue: number
  totalOrders: number
  vaultValue: number
  activeWorkOrders: number
  pendingShipments: number
  lowStockAlerts: number
  totalDesigns: number
  totalCustomers: number
}

interface RevenueDataPoint {
  month: string
  revenue: number
}

interface CategoryDataPoint {
  category: string
  amount: number
}

interface WarehouseDataPoint {
  warehouse: string
  utilized: number
  capacity: number
}

interface OrderStatusPoint {
  status: string
  count: number
}

interface TopProduct {
  name: string
  sku: string
  quantity: number
  value: number
}

interface RecentActivity {
  id: string
  user: string
  action: string
  module: string
  details: string | null
  createdAt: string
}

interface DashboardData {
  kpis: KPIs
  revenueChart: RevenueDataPoint[]
  salesByCategory: CategoryDataPoint[]
  warehouseUtilization: WarehouseDataPoint[]
  orderStatus: OrderStatusPoint[]
  topProducts: TopProduct[]
  recentActivity: RecentActivity[]
}

// ─── Chart Configs ───────────────────────────────────────────────────────────

const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'oklch(0.45 0.18 35)',
  },
} satisfies ChartConfig

const PIE_COLORS = [
  'oklch(0.45 0.18 35)',
  'oklch(0.6 0.15 45)',
  'oklch(0.55 0.12 75)',
  'oklch(0.65 0.1 150)',
  'oklch(0.7 0.1 280)',
  'oklch(0.55 0.2 25)',
]

const salesByCategoryConfig = {
  amount: {
    label: 'Sales',
  },
} satisfies ChartConfig

const warehouseChartConfig = {
  utilized: {
    label: 'Utilized',
    color: 'oklch(0.45 0.18 35)',
  },
  capacity: {
    label: 'Capacity',
    color: 'oklch(0.75 0.06 75)',
  },
} satisfies ChartConfig

const orderStatusChartConfig = {
  count: {
    label: 'Orders',
    color: 'oklch(0.45 0.18 35)',
  },
} satisfies ChartConfig

// ─── Helper: relative time ───────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

// ─── Custom Tooltip for INR ──────────────────────────────────────────────────

function INRTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono font-medium tabular-nums text-foreground">
          {entry.name}: {formatINR(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Loading Skeletons ───────────────────────────────────────────────────────

function KPICardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-28 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KPICardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | null
  iconBgClass?: string
  valueClass?: string
}

function KPICard({ title, value, description, icon, trend, iconBgClass = 'bg-muted', valueClass = 'text-foreground' }: KPICardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${iconBgClass}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-bold tracking-tight ${valueClass}`}>{value}</p>
          {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
          {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DashboardModule() {
  const { data, isLoading, isError, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      return res.json()
    },
    refetchInterval: 30000,
  })

  // ─── Loading State ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* KPI skeletons */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
        {/* Chart skeletons */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
        {/* Bottom skeletons */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TableSkeleton />
          <TableSkeleton />
        </div>
      </div>
    )
  }

  // ─── Error State ─────────────────────────────────────────────────────────

  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Failed to Load Dashboard
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'An unexpected error occurred while fetching dashboard data.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { kpis, revenueChart, salesByCategory, warehouseUtilization, orderStatus, topProducts, recentActivity } = data

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatINR(kpis.totalRevenue)}
          description="Across all channels"
          icon={<TrendingUp className="h-4 w-4 text-amber-700" />}
          iconBgClass="bg-amber-100 dark:bg-amber-900/30"
          valueClass="text-amber-700 dark:text-amber-400"
          trend="up"
        />
        <KPICard
          title="Total Orders"
          value={kpis.totalOrders.toLocaleString('en-IN')}
          description="POS, e-com & wholesale"
          icon={<ShoppingCart className="h-4 w-4 text-foreground" />}
        />
        <KPICard
          title="Vault Value"
          value={formatINR(kpis.vaultValue)}
          description="Current inventory value"
          icon={<Vault className="h-4 w-4 text-yellow-600" />}
          iconBgClass="bg-yellow-100 dark:bg-yellow-900/30"
          valueClass="text-yellow-700 dark:text-yellow-400"
        />
        <KPICard
          title="Active Work Orders"
          value={kpis.activeWorkOrders.toLocaleString('en-IN')}
          description="Currently in progress"
          icon={<Hammer className="h-4 w-4 text-foreground" />}
        />
        <KPICard
          title="Pending Shipments"
          value={kpis.pendingShipments.toLocaleString('en-IN')}
          description="Awaiting delivery"
          icon={<Truck className="h-4 w-4 text-foreground" />}
        />
        <KPICard
          title="Low Stock Alerts"
          value={kpis.lowStockAlerts.toLocaleString('en-IN')}
          description="Below reorder point"
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          iconBgClass={kpis.lowStockAlerts > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}
          valueClass={kpis.lowStockAlerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}
        />
        <KPICard
          title="Total Designs"
          value={kpis.totalDesigns.toLocaleString('en-IN')}
          description="Active product catalog"
          icon={<Gem className="h-4 w-4 text-foreground" />}
        />
        <KPICard
          title="Total Customers"
          value={kpis.totalCustomers.toLocaleString('en-IN')}
          description="Registered accounts"
          icon={<Users className="h-4 w-4 text-foreground" />}
        />
      </div>

      {/* ─── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
              <AreaChart data={revenueChart} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.45 0.18 35)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.45 0.18 35)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  tickFormatter={(val: number) => `${(val / 100000).toFixed(0)}L`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatINR(value as number)}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.45 0.18 35)"
                  strokeWidth={2}
                  fill="url(#fillRevenue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sales by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesByCategoryConfig} className="h-[280px] w-full">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                  strokeWidth={1}
                  stroke="oklch(1 0 0)"
                >
                  {salesByCategory.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatINR(value)}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Warehouse Utilization Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Warehouse Utilization</CardTitle>
            <CardDescription>Current stock vs. total capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={warehouseChartConfig} className="h-[280px] w-full">
              <BarChart data={warehouseUtilization} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="warehouse"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="utilized"
                  fill="oklch(0.45 0.18 35)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="capacity"
                  fill="oklch(0.75 0.06 75)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Order Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status</CardTitle>
            <CardDescription>Distribution of orders by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={orderStatusChartConfig} className="h-[280px] w-full">
              <BarChart data={orderStatus} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  tickFormatter={(val: string) => val.replace(/_/g, ' ')}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="count"
                  fill="oklch(0.45 0.18 35)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── Bottom Section ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
            <CardDescription>Highest value products in inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-12 text-center text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="text-right">{product.quantity.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-medium">{formatINR(product.value)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest actions across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-0 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b py-3 last:border-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        {activity.user.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {activity.module}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardModule
