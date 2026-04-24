'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Zap,
  Package,
  RefreshCw,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ForecastEntry {
  id: string
  period: string
  predictedDemand: number
  confidence: number
  model: string
  createdAt: string
}

interface ProductForecast {
  productId: string
  productName: string
  sku: string
  forecasts: ForecastEntry[]
}

interface InventoryOptItem {
  productId: string
  productName: string
  currentStock: number
  reorderPoint: number
  suggestedQty: number
}

interface AnomalyItem {
  inventoryItemId: string
  productId: string
  productName: string
  warehouseName: string
  quantity: number
  severity: 'out_of_stock' | 'critical_low'
  reorderPoint: number
}

interface ForecastData {
  demandForecasts: ProductForecast[]
  inventoryOptimization: InventoryOptItem[]
  anomalyDetection: AnomalyItem[]
}

interface Product {
  id: string
  name: string
  sku: string
}

// ─── Chart Config ────────────────────────────────────────────────────────────

const CHART_COLORS = [
  'oklch(0.45 0.18 35)',   // chart-1 amber/gold
  'oklch(0.6 0.15 45)',   // chart-2 lighter gold
  'oklch(0.55 0.12 75)',  // chart-3 muted tone
]

const demandChartConfig = {
  period: { label: 'Period' },
} satisfies ChartConfig

// ─── Badge Helpers ───────────────────────────────────────────────────────────

function getUrgencyBadge(currentStock: number, reorderPoint: number): {
  label: string
  class: string
} {
  if (currentStock === 0) return { label: 'Critical', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  const ratio = currentStock / reorderPoint
  if (ratio < 0.3) return { label: 'Critical', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  if (ratio < 0.6) return { label: 'High', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  if (ratio < 0.85) return { label: 'Medium', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
  return { label: 'Low', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
}

function getSeverityBadge(severity: string): {
  label: string
  class: string
  icon: React.ReactNode
} {
  if (severity === 'out_of_stock') {
    return {
      label: 'Out of Stock',
      class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    }
  }
  return {
    label: 'Critical Low',
    class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
  }
}

// ─── Loading Skeletons ───────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-64" />
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

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Generate Forecast Dialog ────────────────────────────────────────────────

function GenerateForecastDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [selectedProductId, setSelectedProductId] = useState('')

  const { data: productsData } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  const generateForecast = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to generate forecast' }))
        throw new Error(err.error || 'Failed to generate forecast')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Forecast generated successfully!')
      queryClient.invalidateQueries({ queryKey: ['ai-forecast'] })
      onOpenChange(false)
      setSelectedProductId('')
    },
    onError: (err: Error) => {
      toast.error('Failed to generate forecast', { description: err.message })
    },
  })

  const products = productsData?.products ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <Brain className="h-5 w-5" />
            Generate Forecast
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="product-select">Select Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product-select">
                <SelectValue placeholder="Choose a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedProductId) {
                  toast.error('Please select a product')
                  return
                }
                generateForecast.mutate(selectedProductId)
              }}
              disabled={generateForecast.isPending || !selectedProductId}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {generateForecast.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Generate
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AiInsightsModule() {
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery<ForecastData>({
    queryKey: ['ai-forecast'],
    queryFn: async () => {
      const res = await fetch('/api/ai/forecast')
      if (!res.ok) throw new Error('Failed to fetch AI insights')
      return res.json()
    },
    refetchInterval: 60000,
  })

  // ─── Transform forecast data for the chart ───────────────────────────────

  const chartData = (() => {
    if (!data?.demandForecasts || data.demandForecasts.length === 0) return []

    // Collect all unique periods across all products
    const periodSet = new Set<string>()
    for (const pf of data.demandForecasts) {
      for (const f of pf.forecasts) {
        periodSet.add(f.period)
      }
    }
    const periods = Array.from(periodSet).sort()

    // Build chart data points: one object per period with each product's demand
    return periods.map((period) => {
      const point: Record<string, unknown> = { period }
      for (const pf of data.demandForecasts) {
        const forecast = pf.forecasts.find((f) => f.period === period)
        if (forecast) {
          point[pf.productName] = forecast.predictedDemand
          point[`${pf.productName}_upper`] = forecast.predictedDemand * (1 + (1 - forecast.confidence) / 2)
          point[`${pf.productName}_lower`] = Math.max(0, forecast.predictedDemand * (1 - (1 - forecast.confidence) / 2))
        }
      }
      return point
    })
  })()

  // Build dynamic chart config from forecast data
  const dynamicChartConfig = (() => {
    const config: ChartConfig = { ...demandChartConfig }
    data?.demandForecasts.forEach((pf, i) => {
      config[pf.productName] = {
        label: pf.productName,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }
    })
    return config
  })()

  // ─── Loading State ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ChartSkeleton />
        <TableSkeleton />
        <CardsSkeleton />
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
            Failed to Load AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred while fetching AI insights.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['ai-forecast'] })}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const demandForecasts = data?.demandForecasts ?? []
  const inventoryOptimization = data?.inventoryOptimization ?? []
  const anomalyDetection = data?.anomalyDetection ?? []

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── Header with Generate Forecast Button ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Brain className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
            AI Insights
          </h2>
        </div>
        <Button
          onClick={() => setForecastDialogOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Forecast
        </Button>
      </div>

      {/* ─── 1. Demand Forecast ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            Demand Forecast
          </CardTitle>
          <CardDescription>
            Predicted demand over the next 3 months with confidence bands
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No forecast data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a forecast to see demand predictions
              </p>
            </div>
          ) : (
            <ChartContainer config={dynamicChartConfig} className="h-[320px] w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="period"
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
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => {
                    // Hide confidence band entries from legend
                    if (value.endsWith('_upper') || value.endsWith('_lower')) return null
                    const config = dynamicChartConfig[value]
                    return (
                      <span className="text-xs text-muted-foreground">
                        {config?.label ?? value}
                        {demandForecasts.find((pf) => pf.productName === value)?.forecasts[0]
                          ? ` (${demandForecasts.find((pf) => pf.productName === value)!.forecasts[0].model})`
                          : ''}
                      </span>
                    )
                  }}
                />
                {demandForecasts.map((pf, i) => (
                  <g key={pf.productId}>
                    {/* Confidence band lower */}
                    <Line
                      type="monotone"
                      dataKey={`${pf.productName}_lower`}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={0}
                      dot={false}
                      strokeOpacity={0}
                    />
                    {/* Confidence band upper */}
                    <Line
                      type="monotone"
                      dataKey={`${pf.productName}_upper`}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={0}
                      dot={false}
                      strokeOpacity={0}
                      fill={`url(#fillConfidence${i})`}
                    />
                    {/* Main line */}
                    <Line
                      type="monotone"
                      dataKey={pf.productName}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                      activeDot={{ r: 6 }}
                    />
                    <defs>
                      <linearGradient id={`fillConfidence${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                  </g>
                ))}
              </LineChart>
            </ChartContainer>
          )}

          {/* Legend with model info */}
          {demandForecasts.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
              {demandForecasts.map((pf, i) => (
                <div key={pf.productId} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {pf.productName} <span className="text-[10px]">({pf.forecasts[0]?.model ?? 'N/A'})</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── 2. Inventory Optimization ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-amber-600" />
            Inventory Optimization
          </CardTitle>
          <CardDescription>
            Products at or below reorder point with suggested replenishment quantities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventoryOptimization.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">All inventory levels are healthy</p>
              <p className="text-xs text-muted-foreground mt-1">No reorder suggestions at this time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                    <TableHead className="text-right">Suggested Order</TableHead>
                    <TableHead className="text-center">Urgency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryOptimization.map((item) => {
                    const urgency = getUrgencyBadge(item.currentStock, item.reorderPoint)
                    return (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className={item.currentStock === 0 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                            {item.currentStock.toLocaleString('en-US')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {item.reorderPoint.toLocaleString('en-US')}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-amber-700 dark:text-amber-400">
                          {item.suggestedQty.toLocaleString('en-US')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className={`text-xs ${urgency.class}`}>
                            {urgency.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── 3. Anomaly Detection ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Anomaly Detection
          </CardTitle>
          <CardDescription>
            Critical stock alerts requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {anomalyDetection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No anomalies detected</p>
              <p className="text-xs text-muted-foreground mt-1">All stock levels are within normal range</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {anomalyDetection.map((anomaly) => {
                const severity = getSeverityBadge(anomaly.severity)
                return (
                  <Card
                    key={anomaly.inventoryItemId}
                    className={`border-2 transition-shadow hover:shadow-md ${severity.class}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          {severity.icon}
                          <Badge variant="secondary" className={`text-[10px] ${severity.class}`}>
                            {severity.label}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm mb-2">{anomaly.productName}</h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Warehouse</span>
                          <span className="font-medium">{anomaly.warehouseName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Qty</span>
                          <span className={`font-bold ${anomaly.quantity === 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {anomaly.quantity.toLocaleString('en-US')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reorder Point</span>
                          <span className="font-medium">{anomaly.reorderPoint.toLocaleString('en-US')}</span>
                        </div>
                      </div>
                      {anomaly.severity === 'out_of_stock' && (
                        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-[11px] text-red-700 dark:text-red-300 font-medium">
                          Out of stock — immediate restocking required
                        </div>
                      )}
                      {anomaly.severity === 'critical_low' && (
                        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                          Stock critically low — restock soon to avoid outage
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Generate Forecast Dialog ─────────────────────────────────────── */}
      <GenerateForecastDialog open={forecastDialogOpen} onOpenChange={setForecastDialogOpen} />
    </div>
  )
}

export default AiInsightsModule
