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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
import { Truck, Package, Star, Plus, Minus, MapPin } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Supplier {
  id: string
  name: string
  code: string
  contactPerson: string
  phone: string
  email: string
  rating: number
  leadTimeDays: number
  paymentTerms: string
  isActive: boolean
  _count: { purchaseOrders: number }
  createdAt: string
  updatedAt: string
}

interface PurchaseOrderLineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplier: { id: string; name: string; code: string }
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  totalAmount: number
  tax: number
  notes: string | null
  lineItems: PurchaseOrderLineItem[]
  createdAt: string
  updatedAt: string
}

interface Shipment {
  id: string
  shipmentNumber: string
  carrier: string
  origin: string
  destination: string
  trackingNumber: string | null
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered'
  itemCount: number
  purchaseOrderId: string | null
  createdAt: string
  updatedAt: string
}

// ─── Form State ──────────────────────────────────────────────────────────────

interface LineItemForm {
  productId: string
  quantity: string
  unitPrice: string
}

interface PurchaseOrderForm {
  supplierId: string
  lineItems: LineItemForm[]
  notes: string
}

const emptyLineItem: LineItemForm = {
  productId: '',
  quantity: '1',
  unitPrice: '0',
}

const emptyPOForm: PurchaseOrderForm = {
  supplierId: '',
  lineItems: [{ ...emptyLineItem }],
  notes: '',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusBadge(status: PurchaseOrder['status']) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    case 'sent':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'confirmed':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'received':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
}

function getShipmentStatusColor(status: Shipment['status']) {
  switch (status) {
    case 'pending':
      return 'border-l-gray-400'
    case 'shipped':
      return 'border-l-blue-500'
    case 'in_transit':
      return 'border-l-amber-500'
    case 'delivered':
      return 'border-l-emerald-500'
  }
}

function getShipmentStatusLabel(status: Shipment['status']) {
  switch (status) {
    case 'pending': return 'Pending'
    case 'shipped': return 'Shipped'
    case 'in_transit': return 'In Transit'
    case 'delivered': return 'Delivered'
  }
}

function renderStars(rating: number) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      )
    } else if (i - 0.5 <= rating) {
      stars.push(
        <div key={i} className="relative inline-block h-3.5 w-3.5">
          <Star className="h-3.5 w-3.5 text-amber-400/40" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      )
    } else {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 text-amber-400/40" />
      )
    }
  }
  return stars
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Loading Skeletons ───────────────────────────────────────────────────────

function SupplierCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-36" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-3.5 rounded-sm" />
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanColumnSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-24" />
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Create PO Dialog ────────────────────────────────────────────────────────

function CreatePODialog({
  suppliers,
  products,
  open,
  onOpenChange,
}: {
  suppliers: Supplier[]
  products: { id: string; name: string; sku: string; costPrice: number }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<PurchaseOrderForm>({ ...emptyPOForm, lineItems: [{ ...emptyLineItem }] })
  const [error, setError] = useState<string | null>(null)

  const createPO = useMutation({
    mutationFn: async (data: {
      supplierId: string
      lineItems: { productId: string; quantity: number; unitPrice: number }[]
      notes?: string
    }) => {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create purchase order')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setForm({ ...emptyPOForm, lineItems: [{ ...emptyLineItem }] })
      setError(null)
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const addLineItem = () => {
    setForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { ...emptyLineItem }],
    }))
  }

  const removeLineItem = (index: number) => {
    if (form.lineItems.length <= 1) return
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }))
  }

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string) => {
    setForm((prev) => {
      const items = [...prev.lineItems]
      items[index] = { ...items[index], [field]: value }
      // Auto-fill unit price when product is selected
      if (field === 'productId') {
        const product = products.find((p) => p.id === value)
        if (product) {
          items[index].unitPrice = product.costPrice.toString()
        }
      }
      return { ...prev, lineItems: items }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.supplierId) {
      setError('Please select a supplier.')
      return
    }

    const validItems = form.lineItems.filter((item) => item.productId)
    if (validItems.length === 0) {
      setError('At least one line item with a product is required.')
      return
    }

    for (const item of validItems) {
      const qty = parseInt(item.quantity, 10)
      const price = parseFloat(item.unitPrice)
      if (isNaN(qty) || qty <= 0) {
        setError('Quantity must be a positive number for all items.')
        return
      }
      if (isNaN(price) || price < 0) {
        setError('Unit price must be a valid number for all items.')
        return
      }
    }

    createPO.mutate({
      supplierId: form.supplierId,
      lineItems: validItems.map((item) => ({
        productId: item.productId,
        quantity: parseInt(item.quantity, 10),
        unitPrice: parseFloat(item.unitPrice),
      })),
      notes: form.notes.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Package className="h-5 w-5" />
            Create Purchase Order
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Supplier Select */}
          <div className="space-y-2">
            <Label htmlFor="po-supplier">Supplier *</Label>
            <Select value={form.supplierId} onValueChange={(v) => setForm((prev) => ({ ...prev, supplierId: v }))}>
              <SelectTrigger id="po-supplier">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line Items *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {form.lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-border/60 p-3 sm:grid-cols-[1fr_100px_120px_36px]"
                >
                  {/* Product Select */}
                  <Select value={item.productId} onValueChange={(v) => updateLineItem(idx, 'productId', v)}>
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

                  {/* Quantity */}
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                  />

                  {/* Unit Price */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(idx, 'unitPrice', e.target.value)}
                      className="pl-6"
                    />
                  </div>

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-600"
                    onClick={() => removeLineItem(idx)}
                    disabled={form.lineItems.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="po-notes">Notes</Label>
            <Textarea
              id="po-notes"
              placeholder="Additional notes or instructions..."
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Subtotal preview */}
          {form.lineItems.some((item) => item.productId) && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  {formatCurrency(
                    form.lineItems
                      .filter((item) => item.productId)
                      .reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0) * (parseFloat(item.unitPrice) || 0), 0)
                  )}
                </span>
              </div>
            </div>
          )}

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
              disabled={createPO.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {createPO.isPending ? 'Creating...' : 'Create PO'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SupplyChainModule() {
  const [activeTab, setActiveTab] = useState('suppliers')
  const [poDialogOpen, setPODialogOpen] = useState(false)
  const queryClient = useQueryClient()

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const {
    data: suppliersData,
    isLoading: suppliersLoading,
    isError: suppliersError,
    error: suppliersErrorObj,
  } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await fetch('/api/suppliers')
      if (!res.ok) throw new Error('Failed to fetch suppliers')
      return res.json()
    },
  })

  const {
    data: purchaseOrdersData,
    isLoading: purchaseOrdersLoading,
    isError: purchaseOrdersError,
    error: purchaseOrdersErrorObj,
  } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const res = await fetch('/api/purchase-orders')
      if (!res.ok) throw new Error('Failed to fetch purchase orders')
      return res.json()
    },
  })

  const {
    data: shipmentsData,
    isLoading: shipmentsLoading,
    isError: shipmentsError,
    error: shipmentsErrorObj,
  } = useQuery<Shipment[]>({
    queryKey: ['shipments'],
    queryFn: async () => {
      const res = await fetch('/api/shipments')
      if (!res.ok) throw new Error('Failed to fetch shipments')
      return res.json()
    },
  })

  // Products for PO dialog select
  const { data: productsData } = useQuery<{ id: string; name: string; sku: string; costPrice: number }[]>({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      return data.products ?? data
    },
  })

  // ─── Derived: Shipments by status ───────────────────────────────────────

  const shipmentsByStatus: Record<Shipment['status'], Shipment[]> = {
    pending: [],
    shipped: [],
    in_transit: [],
    delivered: [],
  }

  if (shipmentsData) {
    for (const shipment of shipmentsData) {
      shipmentsByStatus[shipment.status].push(shipment)
    }
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  const isLoading = suppliersLoading || purchaseOrdersLoading || shipmentsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-32" />
        </div>
        {/* Tab bar skeleton */}
        <Skeleton className="h-10 w-96" />
        {/* Content skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SupplierCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────

  const hasError = suppliersError || purchaseOrdersError || shipmentsError
  const errorMessage =
    suppliersErrorObj?.message ||
    purchaseOrdersErrorObj?.message ||
    shipmentsErrorObj?.message ||
    'An unexpected error occurred.'

  if (hasError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Failed to Load Supply Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['suppliers'] })
              queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
              queryClient.invalidateQueries({ queryKey: ['shipments'] })
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
            <Truck className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
            Supply Chain
          </h2>
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="suppliers" className="gap-1.5">
            <Package className="h-3.5 w-3.5 hidden sm:inline-block" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="gap-1.5">
            <Truck className="h-3.5 w-3.5 hidden sm:inline-block" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="shipments" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5 hidden sm:inline-block" />
            Shipments
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Suppliers ──────────────────────────────────────────── */}
        <TabsContent value="suppliers" className="mt-6">
          {suppliersLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SupplierCardSkeleton key={i} />
              ))}
            </div>
          ) : !suppliersData || suppliersData.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="mx-auto h-12 w-12 text-amber-300 dark:text-amber-700" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No suppliers found
                </p>
                <p className="text-xs text-muted-foreground">
                  Add suppliers to start managing your supply chain
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {suppliersData.map((supplier) => (
                <Card key={supplier.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base truncate">{supplier.name}</CardTitle>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[10px] font-mono px-2">
                          {supplier.code}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            supplier.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-1.5">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Contact:</span> {supplier.contactPerson}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Phone:</span> {supplier.phone}
                      </p>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex">{renderStars(supplier.rating)}</div>
                      <span className="text-xs text-muted-foreground ml-1">
                        {supplier.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Lead Time & Payment Terms */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">{supplier.leadTimeDays}</span> day lead time
                      </span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">{supplier.paymentTerms}</span>
                      </span>
                    </div>

                    {/* PO Count */}
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    >
                      {supplier._count.purchaseOrders} Purchase Order{supplier._count.purchaseOrders !== 1 ? 's' : ''}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Tab 2: Purchase Orders ────────────────────────────────────── */}
        <TabsContent value="purchase-orders" className="mt-6 space-y-4">
          {/* Create PO Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setPODialogOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create PO
            </Button>
          </div>

          {purchaseOrdersLoading ? (
            <TableSkeleton />
          ) : !purchaseOrdersData || purchaseOrdersData.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="mx-auto h-12 w-12 text-amber-300 dark:text-amber-700" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No purchase orders yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Create your first purchase order to get started
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
                        <TableHead>PO Number</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total Amount (₹)</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Tax (₹)</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseOrdersData.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="font-mono text-xs font-medium">
                            {po.poNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate max-w-[140px]">
                                {po.supplier.name}
                              </span>
                              <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                                {po.supplier.code}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize ${getStatusBadge(po.status)}`}
                            >
                              {po.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-amber-700 dark:text-amber-400 tabular-nums">
                            {formatCurrency(po.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell text-muted-foreground tabular-nums">
                            {formatCurrency(po.tax)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {formatDate(po.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create PO Dialog */}
          <CreatePODialog
            suppliers={suppliersData ?? []}
            products={productsData ?? []}
            open={poDialogOpen}
            onOpenChange={setPODialogOpen}
          />
        </TabsContent>

        {/* ─── Tab 3: Shipments (Kanban) ─────────────────────────────────── */}
        <TabsContent value="shipments" className="mt-6">
          {shipmentsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <KanbanColumnSkeleton key={i} />
              ))}
            </div>
          ) : !shipmentsData || shipmentsData.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Truck className="mx-auto h-12 w-12 text-amber-300 dark:text-amber-700" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No shipments found
                </p>
                <p className="text-xs text-muted-foreground">
                  Shipments will appear here when purchase orders are dispatched
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(['pending', 'shipped', 'in_transit', 'delivered'] as const).map((status) => {
                const shipments = shipmentsByStatus[status]
                return (
                  <div key={status} className="space-y-3">
                    {/* Column Header */}
                    <div className="flex items-center gap-2 px-1">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          status === 'pending'
                            ? 'bg-gray-400'
                            : status === 'shipped'
                            ? 'bg-blue-500'
                            : status === 'in_transit'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <h3 className="text-sm font-semibold text-foreground">
                        {getShipmentStatusLabel(status)}
                      </h3>
                      <Badge variant="secondary" className="text-[10px] ml-auto px-1.5">
                        {shipments.length}
                      </Badge>
                    </div>

                    {/* Column Cards */}
                    <div className="space-y-3">
                      {shipments.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
                          <p className="text-xs text-muted-foreground">No shipments</p>
                        </div>
                      ) : (
                        shipments.map((shipment) => (
                          <Card
                            key={shipment.id}
                            className={`border-l-4 transition-shadow hover:shadow-md ${getShipmentStatusColor(shipment.status)}`}
                          >
                            <CardContent className="p-4 space-y-2">
                              {/* Shipment Number */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-mono font-semibold truncate">
                                  {shipment.shipmentNumber}
                                </span>
                                <Badge variant="secondary" className="text-[10px] shrink-0">
                                  {shipment.carrier}
                                </Badge>
                              </div>

                              {/* Route */}
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0 text-amber-500" />
                                <span className="truncate">{shipment.origin}</span>
                                <span className="shrink-0">→</span>
                                <span className="truncate">{shipment.destination}</span>
                              </div>

                              {/* Tracking Number */}
                              {shipment.trackingNumber && (
                                <p className="text-[11px] font-mono text-muted-foreground">
                                  Track: {shipment.trackingNumber}
                                </p>
                              )}

                              {/* Item Count */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Package className="h-3 w-3" />
                                <span>
                                  {shipment.itemCount} item{shipment.itemCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SupplyChainModule
