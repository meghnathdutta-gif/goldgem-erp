'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Package, BarChart3, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts'

interface AIInsightData {
  forecasts: { id: string; productId: string; period: string; predictedDemand: number; confidence: number; model: string; product: { name: string; category: { name: string } } }[]
  insights: { productId: string; movingAvg: number; trend: number; predictions: { period: string; predictedDemand: number; confidence: number }[]; totalSold: number }[]
  anomalies: { productId: string; type: string; trend: number; avgSales: number }[]
  optimizations: { productId: string; productName: string; currentStock: number; avgMonthlyDemand: number; reorderPoint: number; reorderQty: number; monthsOfStock: number; needsReorder: boolean; status: string }[]
  salesByProduct: Record<string, { monthly: Record<string, number>; total: number }>
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function AiInsightsModule() {
  const { data, isLoading } = useQuery<AIInsightData>({
    queryKey: ['ai-forecast'],
    queryFn: () => fetch('/api/ai/forecast').then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-6 text-muted-foreground">Failed to load AI insights</div>

  // Prepare forecast chart data
  const forecastChartData = data.insights.slice(0, 8).map(insight => {
    const months = Object.entries(data.salesByProduct[insight.productId]?.monthly || {}).sort(([a], [b]) => a.localeCompare(b))
    const historical = months.map(([month, qty]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      actual: qty,
    }))
    const predicted = insight.predictions.map(p => ({
      month: new Date(p.period + '-01').toLocaleDateString('en-US', { month: 'short' }),
      forecast: p.predictedDemand,
    }))
    return { productId: insight.productId, historical, predicted }
  })

  // Prepare trend analysis data
  const trendData = data.insights
    .filter(i => i.totalSold > 0)
    .sort((a, b) => Math.abs(b.trend) - Math.abs(a.trend))
    .slice(0, 10)
    .map(i => ({
      name: i.productId.slice(0, 8),
      trend: i.trend,
      avgSales: i.movingAvg,
    }))

  // Optimization summary
  const optSummary = {
    optimal: data.optimizations.filter(o => o.status === 'optimal').length,
    lowStock: data.optimizations.filter(o => o.status === 'low_stock').length,
    overstocked: data.optimizations.filter(o => o.status === 'overstocked').length,
    outOfStock: data.optimizations.filter(o => o.status === 'out_of_stock').length,
    needsReorder: data.optimizations.filter(o => o.needsReorder).length,
  }

  // Anomaly data
  const anomalyChartData = data.insights.slice(0, 10).map(i => {
    const months = Object.entries(data.salesByProduct[i.productId]?.monthly || {}).sort(([a], [b]) => a.localeCompare(b))
    return {
      name: i.productId.slice(0, 8),
      values: months.map(([, v]) => v),
      avg: i.movingAvg,
    }
  }).filter(d => d.values.length > 0).map(d => {
    const max = Math.max(...d.values, d.avg)
    const result: Record<string, number> = { name: parseInt(d.name.replace(/\D/g, '')) || 0, avg: d.avg }
    d.values.forEach((v, i) => { result[`m${i + 1}`] = v })
    return result
  })

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 space-y-6">
      {/* AI Header */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-200 dark:border-emerald-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI/ML Insights Engine</h2>
                <p className="text-sm text-muted-foreground">Powered by statistical analysis · Moving Average · Trend Extrapolation · Anomaly Detection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Optimization Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{optSummary.optimal}</p>
            <p className="text-xs text-muted-foreground">Optimal</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{optSummary.lowStock + optSummary.outOfStock}</p>
            <p className="text-xs text-muted-foreground">Low/Out of Stock</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{optSummary.overstocked}</p>
            <p className="text-xs text-muted-foreground">Overstocked</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{optSummary.needsReorder}</p>
            <p className="text-xs text-muted-foreground">Needs Reorder</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-900">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{data.anomalies.length}</p>
            <p className="text-xs text-muted-foreground">Anomalies</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Forecast Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" />Demand Forecasting</CardTitle>
              <CardDescription>Historical sales with predicted demand (next 3 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={(() => {
                  // Combine all forecast data into one chart
                  const allMonths = new Set<string>()
                  for (const fc of forecastChartData) {
                    for (const h of fc.historical) allMonths.add(h.month)
                    for (const p of fc.predicted) allMonths.add(p.month)
                  }
                  const sorted = Array.from(allMonths).sort()
                  return sorted.map(month => {
                    const row: Record<string, unknown> = { month }
                    for (let i = 0; i < Math.min(forecastChartData.length, 3); i++) {
                      const fc = forecastChartData[i]
                      const histVal = fc.historical.find(h => h.month === month)?.actual
                      const predVal = fc.predicted.find(p => p.month === month)?.forecast
                      row[`actual_${i}`] = histVal || null
                      row[`forecast_${i}`] = predVal || null
                    }
                    return row
                  })
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="actual_0" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Product 1 (Actual)" />
                  <Area type="monotone" dataKey="forecast_0" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeDasharray="5 5" name="Product 1 (Forecast)" />
                  <Area type="monotone" dataKey="actual_1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} name="Product 2 (Actual)" />
                  <Area type="monotone" dataKey="forecast_1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} strokeDasharray="5 5" name="Product 2 (Forecast)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales Trend Analysis */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-teal-500" />Sales Trend Analysis</CardTitle>
              <CardDescription>Products with strongest upward/downward trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <RechartsTooltip />
                  <Bar dataKey="trend" radius={[4, 4, 0, 0]}>
                    {trendData.map((entry, index) => (
                      <Cell key={index} fill={entry.trend >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Anomaly Detection & Inventory Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Detection */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Anomaly Detection</CardTitle>
              <CardDescription>Unusual patterns flagged by AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {data.anomalies.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No anomalies detected</p>}
                {data.anomalies.map((anomaly, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      anomaly.type === 'spike' ? 'bg-emerald-100 text-emerald-700' :
                      anomaly.type === 'decline' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {anomaly.type === 'spike' ? <TrendingUp className="w-4 h-4" /> :
                       anomaly.type === 'decline' ? <TrendingDown className="w-4 h-4" /> :
                       <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">{anomaly.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">Trend: {anomaly.trend > 0 ? '+' : ''}{anomaly.trend} · Avg: {anomaly.avgSales} units/month</p>
                    </div>
                    <Badge variant={anomaly.type === 'spike' ? 'default' : anomaly.type === 'decline' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {anomaly.type === 'spike' ? 'Spike' : anomaly.type === 'decline' ? 'Decline' : 'No Sales'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Optimization */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" />Inventory Optimization</CardTitle>
              <CardDescription>AI-suggested reorder points and quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {data.optimizations
                  .sort((a, b) => {
                    const order = { out_of_stock: 0, low_stock: 1, overstocked: 2, optimal: 3 }
                    return (order[a.status as keyof typeof order] || 4) - (order[b.status as keyof typeof order] || 4)
                  })
                  .slice(0, 15)
                  .map((opt, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{opt.productName}</p>
                        <Badge
                          variant={opt.status === 'optimal' ? 'default' : opt.status === 'low_stock' || opt.status === 'out_of_stock' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {opt.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Stock</p>
                          <p className="font-semibold">{opt.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Demand</p>
                          <p className="font-semibold">{opt.avgMonthlyDemand}/mo</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reorder Pt</p>
                          <p className="font-semibold">{opt.reorderPoint}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Months</p>
                          <p className="font-semibold">{opt.monthsOfStock === Infinity ? '∞' : opt.monthsOfStock}</p>
                        </div>
                      </div>
                      {opt.needsReorder && (
                        <div className="flex items-center gap-1 text-[11px] text-orange-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Suggest ordering {opt.reorderQty} units</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
