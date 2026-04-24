'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Hammer, Wrench, Plus, Minus, Calendar, Layers } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatINR } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  sku: string
  costPrice: number
  isManufactured: boolean
}

interface WorkOrderProduct {
  id: string
  productId: string
  targetQty: number
  completedQty: number
  wastageQty: number
  product: {
    id: string
    name: string
    sku: string
    price: number
    costPrice: number
  }
}

interface WorkOrder {
  id: string
  woNumber: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  plannedStart: string | null
  plannedEnd: string | null
  actualStart: string | null
  actualEnd: string | null
  notes: string | null
  products: WorkOrderProduct[]
  createdAt: string
  updatedAt: string
}

interface BomComponent {
  componentId: string
  componentName: string
  sku: string
  quantity: number
}

interface BomItem {
  productId: string
  productName: string
  sku: string
  components: BomComponent[]
}

// ─── Form State ──────────────────────────────────────────────────────────────

interface ProductRowForm {
  productId: string
  targetQty: string
}

interface WorkOrderForm {
  priority: string
  plannedStart: string
  plannedEnd: string
  notes: string
  products: ProductRowForm[]
}

const emptyProductRow: ProductRowForm = {
  productId: '',
  targetQty: '1',
}

const emptyWOForm: WorkOrderForm = {
  priority: 'medium',
  plannedStart: '',
  plannedEnd: '',
  notes: '',
  products: [{ ...emptyProductRow }],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusBadge(status: WorkOrder['status']) {
  switch (status) {
    case 'planned':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    case 'in_progress':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
}

function getStatusLabel(status: WorkOrder['status']) {
  switch (status) {
    case 'planned': return 'Planned'
    case 'in_progress': return 'In Progress'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
  }
}

function getPriorityBadge(priority: WorkOrder['priority']) {
  switch (priority) {
    case 'low':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'critical':
      return 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300'
  }
}

function getPriorityLabel(priority: WorkOrder['priority']) {
  switch (priority) {
    case 'low': return 'Low'
    case 'medium': return 'Medium'
    case 'high': return 'High'
    case 'critical': return 'Critical'
  }
}

function getProgressColor(percent: number): string {
  if (percent >= 100) return '[&>div]:bg-emerald-500'
  if (percent >= 50) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-amber-300'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return '—'
  const s = start ? formatDate(start) : 'TBD'
  const e = end ? formatDate(end) : 'TBD'
  return `${s} → ${e}`
}

// ─── Loading Skeletons ───────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function BomCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  )
}

// ─── Create Work Order Dialog ────────────────────────────────────────────────

function CreateWorkOrderDialog({
  products,
  open,
  onOpenChange,
}: {
  products: Product[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<WorkOrderForm>({
    ...emptyWOForm,
    products: [{ ...emptyProductRow }],
  })
  const [error, setError] = useState<string | null>(null)

  const createWO = useMutation({
    mutationFn: async (data: {
      priority: string
      plannedStart?: string
      plannedEnd?: string
      notes?: string
      products: { productId: string; targetQty: number }[]
    }) => {
      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create work order')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      setForm({ ...emptyWOForm, products: [{ ...emptyProductRow }] })
      setError(null)
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const addProductRow = () => {
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, { ...emptyProductRow }],
    }))
  }

  const removeProductRow = (index: number) => {
    if (form.products.length <= 1) return
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }))
  }

  const updateProductRow = (index: number, field: keyof ProductRowForm, value: string) => {
    setForm((prev) => {
      const items = [...prev.products]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, products: items }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validProducts = form.products.filter((item) => item.productId)
    if (validProducts.length === 0) {
      setError('At least one product with a target quantity is required.')
      return
    }

    for (const item of validProducts) {
      const qty = parseInt(item.targetQty, 10)
      if (isNaN(qty) || qty <= 0) {
        setError('Target quantity must be a positive number for all products.')
        return
      }
    }

    if (form.plannedStart && form.plannedEnd && new Date(form.plannedStart) > new Date(form.plannedEnd)) {
      setError('Planned end date must be after planned start date.')
      return
    }

    createWO.mutate({
      priority: form.priority,
      plannedStart: form.plannedStart || undefined,
      plannedEnd: form.plannedEnd || undefined,
      notes: form.notes.trim() || undefined,
      products: validProducts.map((item) => ({
        productId: item.productId,
        targetQty: parseInt(item.targetQty, 10),
      })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Hammer className="h-5 w-5" />
            Create Work Order
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wo-priority">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((prev) => ({ ...prev, priority: v }))}>
                <SelectTrigger id="wo-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div />
          </div>

          {/* Planned Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wo-start" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Planned Start
              </Label>
              <Input
                id="wo-start"
                type="date"
                value={form.plannedStart}
                onChange={(e) => setForm((prev) => ({ ...prev, plannedStart: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wo-end" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Planned End
              </Label>
              <Input
                id="wo-end"
                type="date"
                value={form.plannedEnd}
                onChange={(e) => setForm((prev) => ({ ...prev, plannedEnd: e.target.value }))}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="wo-notes">Notes</Label>
            <Textarea
              id="wo-notes"
              placeholder="Additional instructions or notes..."
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Products Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                Products *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProductRow}
                className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Product
              </Button>
            </div>

            <div className="space-y-3">
              {form.products.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-border/60 p-3 sm:grid-cols-[1fr_120px_36px]"
                >
                  {/* Product Select */}
                  <Select value={item.productId} onValueChange={(v) => updateProductRow(idx, 'productId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                          <span className="ml-1 text-muted-foreground text-xs">({p.sku})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Target Quantity */}
                  <Input
                    type="number"
                    min="1"
                    placeholder="Target Qty"
                    value={item.targetQty}
                    onChange={(e) => updateProductRow(idx, 'targetQty', e.target.value)}
                  />

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-600"
                    onClick={() => removeProductRow(idx)}
                    disabled={form.products.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createWO.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {createWO.isPending ? 'Creating...' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ManufacturingModule() {
  const [activeTab, setActiveTab] = useState('work-orders')
  const [woDialogOpen, setWoDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const {
    data: workOrdersData,
    isLoading: workOrdersLoading,
    isError: workOrdersError,
    error: workOrdersErrorObj,
  } = useQuery<WorkOrder[]>({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const res = await fetch('/api/work-orders')
      if (!res.ok) throw new Error('Failed to fetch work orders')
      return res.json()
    },
  })

  const {
    data: bomData,
    isLoading: bomLoading,
    isError: bomError,
    error: bomErrorObj,
  } = useQuery<BomItem[]>({
    queryKey: ['bom'],
    queryFn: async () => {
      const res = await fetch('/api/bom')
      if (!res.ok) throw new Error('Failed to fetch Bill of Materials')
      return res.json()
    },
  })

  // Products list for dialog select
  const { data: productsData } = useQuery<Product[]>({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      return data.products ?? data
    },
  })

  // ─── Derived: Work Order Stats ─────────────────────────────────────────

  const woStats = {
    total: workOrdersData?.length ?? 0,
    planned: workOrdersData?.filter((wo) => wo.status === 'planned').length ?? 0,
    inProgress: workOrdersData?.filter((wo) => wo.status === 'in_progress').length ?? 0,
    completed: workOrdersData?.filter((wo) => wo.status === 'completed').length ?? 0,
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  const isLoading = workOrdersLoading && bomLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-40" />
        </div>
        {/* Tab bar skeleton */}
        <Skeleton className="h-10 w-80" />
        {/* Content skeleton */}
        <TableSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <BomCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────

  const hasError = workOrdersError || bomError
  const errorMessage =
    workOrdersErrorObj?.message ||
    bomErrorObj?.message ||
    'An unexpected error occurred.'

  if (hasError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Failed to Load Manufacturing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['work-orders'] })
              queryClient.invalidateQueries({ queryKey: ['bom'] })
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Hammer className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
            Karigarkhana
          </h2>
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="work-orders" className="gap-1.5">
            <Hammer className="h-3.5 w-3.5 hidden sm:inline-block" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="bom" className="gap-1.5">
            <Layers className="h-3.5 w-3.5 hidden sm:inline-block" />
            Bill of Materials
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Work Orders ──────────────────────────────────────── */}
        <TabsContent value="work-orders" className="mt-6 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="transition-shadow hover:shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">{woStats.total}</p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Planned</p>
                <p className="text-2xl font-bold tabular-nums text-gray-600 dark:text-gray-400">{woStats.planned}</p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{woStats.inProgress}</p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{woStats.completed}</p>
              </CardContent>
            </Card>
          </div>

          {/* Create Work Order Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setWoDialogOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Work Order
            </Button>
          </div>

          {/* Work Orders Table */}
          {workOrdersLoading ? (
            <TableSkeleton />
          ) : !workOrdersData || workOrdersData.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Hammer className="mx-auto h-12 w-12 text-amber-300 dark:text-amber-700" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No work orders yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Create your first work order to start manufacturing
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>WO Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-center">Products</TableHead>
                        <TableHead className="min-w-[140px]">Progress</TableHead>
                        <TableHead className="hidden md:table-cell">Planned Dates</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workOrdersData.map((wo) => {
                        const totalTarget = wo.products.reduce((sum, p) => sum + p.targetQty, 0)
                        const totalCompleted = wo.products.reduce((sum, p) => sum + p.completedQty, 0)
                        const progressPercent = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0

                        return (
                          <TableRow key={wo.id}>
                            {/* WO Number */}
                            <TableCell className="font-mono text-xs font-medium">
                              {wo.woNumber}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] capitalize ${getStatusBadge(wo.status)}`}
                              >
                                {getStatusLabel(wo.status)}
                              </Badge>
                            </TableCell>

                            {/* Priority */}
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] capitalize ${getPriorityBadge(wo.priority)}`}
                              >
                                {getPriorityLabel(wo.priority)}
                              </Badge>
                            </TableCell>

                            {/* Products Count */}
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                {wo.products.length}
                              </Badge>
                            </TableCell>

                            {/* Progress */}
                            <TableCell>
                              <div className="space-y-1.5">
                                <Progress
                                  value={progressPercent}
                                  className={`h-2 ${getProgressColor(progressPercent)}`}
                                />
                                <p className="text-[10px] text-muted-foreground tabular-nums">
                                  {totalCompleted} / {totalTarget} ({progressPercent}%)
                                </p>
                              </div>
                            </TableCell>

                            {/* Planned Dates */}
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 shrink-0 text-amber-500" />
                                <span className="truncate max-w-[200px]">
                                  {formatDateRange(wo.plannedStart, wo.plannedEnd)}
                                </span>
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create WO Dialog */}
          <CreateWorkOrderDialog
            products={productsData ?? []}
            open={woDialogOpen}
            onOpenChange={setWoDialogOpen}
          />
        </TabsContent>

        {/* ─── Tab 2: Bill of Materials ─────────────────────────────────── */}
        <TabsContent value="bom" className="mt-6">
          {bomLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BomCardSkeleton key={i} />
              ))}
            </div>
          ) : !bomData || bomData.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Layers className="mx-auto h-12 w-12 text-amber-300 dark:text-amber-700" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No manufactured products found
                </p>
                <p className="text-xs text-muted-foreground">
                  Mark products as &quot;Manufactured In-House&quot; to see their Bill of Materials here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bomData.map((item) => (
                <Card key={item.productId} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base flex items-center gap-2 truncate">
                          <Wrench className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span className="truncate">{item.productName}</span>
                        </CardTitle>
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          {item.sku}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                      >
                        {item.components.length} {item.components.length === 1 ? 'component' : 'components'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Visual hierarchy line */}
                    <div className="mb-3 flex items-center gap-2 text-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
                        <Layers className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-medium text-amber-700 dark:text-amber-400 truncate">
                        {item.productName}
                      </span>
                      <span className="text-muted-foreground">is made of →</span>
                    </div>

                    {/* Component List */}
                    <div className="space-y-0 border rounded-md overflow-hidden">
                      {item.components.map((comp, idx) => (
                        <div
                          key={comp.componentId}
                          className={`flex items-center justify-between px-3 py-2 text-sm ${
                            idx !== item.components.length - 1
                              ? 'border-b border-border/40'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-50 dark:bg-amber-900/20">
                              <Minus className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{comp.componentName}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{comp.sku}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-xs font-medium tabular-nums">{comp.quantity}</span>
                            <span className="text-[10px] text-muted-foreground ml-0.5">pcs</span>
                          </div>
                        </div>
                      ))}

                      {item.components.length === 0 && (
                        <div className="px-3 py-4 text-center">
                          <p className="text-xs text-muted-foreground">
                            No components defined
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Total Components */}
                    {item.components.length > 0 && (
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total material inputs</span>
                        <span className="font-medium tabular-nums">
                          {item.components.reduce((sum, c) => sum + c.quantity, 0)} units
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ManufacturingModule
