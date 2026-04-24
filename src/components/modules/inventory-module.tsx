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
  DialogTrigger,
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
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, Package, AlertTriangle, Warehouse } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  icon: string
  color: string
  _count: { products: number }
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  categoryId: string
  category: { id: string; name: string; icon: string; color: string }
  price: number
  costPrice: number
  weight: number | null
  purity: string | null
  isManufactured: boolean
  minStockLevel: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  products: Product[]
  total: number
}

interface Warehouse {
  id: string
  name: string
  code: string
  city: string
  capacity: number
  _count: { inventoryItems: number }
  totalQuantity: number
  createdAt: string
  updatedAt: string
}

interface InventoryItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    sku: string
    price: number
    costPrice: number
    weight: number | null
    minStockLevel: number
    category: { id: string; name: string }
  }
  warehouseId: string
  warehouse: { id: string; name: string; code: string; city: string }
  quantity: number
  reservedQty: number
  reorderPoint: number
  createdAt: string
  updatedAt: string
}

// ─── Product Stock Aggregation ───────────────────────────────────────────────

interface ProductWithStock extends Product {
  totalStock: number
}

// ─── Low Stock Alert ─────────────────────────────────────────────────────────

interface LowStockAlert {
  productId: string
  productName: string
  productSku: string
  warehouseId: string
  warehouseName: string
  currentQty: number
  reorderPoint: number
  severity: 'Out of Stock' | 'Critical' | 'Warning'
}

// ─── Form State ──────────────────────────────────────────────────────────────

interface ProductForm {
  name: string
  sku: string
  description: string
  categoryId: string
  price: string
  costPrice: string
  weight: string
  purity: string
  isManufactured: boolean
  minStockLevel: string
}

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  categoryId: '',
  price: '',
  costPrice: '',
  weight: '',
  purity: '',
  isManufactured: false,
  minStockLevel: '10',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStockStatus(stock: number, minStockLevel: number) {
  if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  if (stock <= minStockLevel) return { label: 'Low Stock', variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
  return { label: 'In Stock', variant: 'outline' as const, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
}

function getProgressColor(percent: number): string {
  if (percent > 90) return '[&>div]:bg-red-500'
  if (percent >= 70) return '[&>div]:bg-yellow-500'
  return '[&>div]:bg-emerald-500'
}

function getAlertSeverity(qty: number, reorderPoint: number): LowStockAlert['severity'] {
  if (qty === 0) return 'Out of Stock'
  if (qty <= reorderPoint * 0.5) return 'Critical'
  return 'Warning'
}

function getSeverityBadge(severity: LowStockAlert['severity']) {
  switch (severity) {
    case 'Out of Stock':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'Critical':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'Warning':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
}

// ─── Loading Skeletons ───────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function WarehouseCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-2 w-full rounded-full mb-3" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  )
}

function AlertListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Add Product Dialog ──────────────────────────────────────────────────────

function AddProductDialog({
  categories,
  open,
  onOpenChange,
}: {
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const createProduct = useMutation({
    mutationFn: async (data: Omit<ProductForm, 'price' | 'costPrice' | 'weight' | 'minStockLevel'> & { price: number; costPrice: number; weight: number | null; minStockLevel: number }) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create product')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setForm(emptyForm)
      setError(null)
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.sku.trim() || !form.categoryId) {
      setError('Name, SKU, and Category are required.')
      return
    }

    const price = parseFloat(form.price)
    const costPrice = parseFloat(form.costPrice)
    if (isNaN(price) || isNaN(costPrice)) {
      setError('Price and Cost Price must be valid numbers.')
      return
    }

    createProduct.mutate({
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || undefined,
      categoryId: form.categoryId,
      price,
      costPrice,
      weight: form.weight ? parseFloat(form.weight) : null,
      purity: form.purity.trim() || undefined,
      isManufactured: form.isManufactured,
      minStockLevel: parseInt(form.minStockLevel, 10) || 10,
    })
  }

  const updateField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Package className="h-5 w-5" />
            Add New Product
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prod-name">Name *</Label>
              <Input
                id="prod-name"
                placeholder="Gold Necklace"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-sku">SKU *</Label>
              <Input
                id="prod-sku"
                placeholder="GN-001"
                value={form.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prod-desc">Description</Label>
            <Textarea
              id="prod-desc"
              placeholder="Product description..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prod-category">Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                <SelectTrigger id="prod-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-purity">Purity</Label>
              <Input
                id="prod-purity"
                placeholder="22K, 18K, 925..."
                value={form.purity}
                onChange={(e) => updateField('purity', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prod-price">Selling Price (₹) *</Label>
              <Input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-costprice">Cost Price (₹) *</Label>
              <Input
                id="prod-costprice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.costPrice}
                onChange={(e) => updateField('costPrice', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prod-weight">Weight (g)</Label>
              <Input
                id="prod-weight"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.weight}
                onChange={(e) => updateField('weight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-minstock">Min Stock Level</Label>
              <Input
                id="prod-minstock"
                type="number"
                min="0"
                placeholder="10"
                value={form.minStockLevel}
                onChange={(e) => updateField('minStockLevel', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="prod-manufactured">Manufactured In-House</Label>
              <p className="text-xs text-muted-foreground">
                Toggle if this product is made in your workshop
              </p>
            </div>
            <Switch
              id="prod-manufactured"
              checked={form.isManufactured}
              onCheckedChange={(v) => updateField('isManufactured', v)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProduct.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {createProduct.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function InventoryModule() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj,
  } = useQuery<ProductsResponse>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    isError: inventoryError,
    error: inventoryErrorObj,
  } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory')
      if (!res.ok) throw new Error('Failed to fetch inventory')
      return res.json()
    },
  })

  const {
    data: warehousesData,
    isLoading: warehousesLoading,
    isError: warehousesError,
    error: warehousesErrorObj,
  } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await fetch('/api/warehouses')
      if (!res.ok) throw new Error('Failed to fetch warehouses')
      return res.json()
    },
  })

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  const {
    data: lowStockData,
    isLoading: lowStockLoading,
  } = useQuery<InventoryItem[]>({
    queryKey: ['inventory', 'lowStock'],
    queryFn: async () => {
      const res = await fetch('/api/inventory?lowStock=true')
      if (!res.ok) throw new Error('Failed to fetch low stock items')
      return res.json()
    },
  })

  // ─── Derived Data ───────────────────────────────────────────────────────

  // Compute stock per product from inventory items
  const stockByProduct: Record<string, number> = {}
  if (inventoryData) {
    for (const item of inventoryData) {
      stockByProduct[item.productId] = (stockByProduct[item.productId] || 0) + item.quantity
    }
  }

  // Products with total stock
  const productsWithStock: ProductWithStock[] = (productsData?.products ?? []).map((p) => ({
    ...p,
    totalStock: stockByProduct[p.id] ?? 0,
  }))

  // Apply filters
  const filteredProducts = productsWithStock.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || p.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Low stock alerts
  const lowStockAlerts: LowStockAlert[] = (lowStockData ?? []).map((item) => ({
    productId: item.productId,
    productName: item.product.name,
    productSku: item.product.sku,
    warehouseId: item.warehouseId,
    warehouseName: item.warehouse.name,
    currentQty: item.quantity,
    reorderPoint: item.reorderPoint,
    severity: getAlertSeverity(item.quantity, item.reorderPoint),
  }))

  // Sort alerts by severity: Out of Stock > Critical > Warning
  const severityOrder: Record<LowStockAlert['severity'], number> = {
    'Out of Stock': 0,
    'Critical': 1,
    'Warning': 2,
  }
  lowStockAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  // ─── Loading State ──────────────────────────────────────────────────────

  const isLoading = productsLoading || inventoryLoading || warehousesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <TableSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <WarehouseCardSkeleton key={i} />
          ))}
        </div>
        <AlertListSkeleton />
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────

  if (productsError || inventoryError || warehousesError) {
    const errMsg =
      productsErrorObj?.message ||
      inventoryErrorObj?.message ||
      warehousesErrorObj?.message ||
      'An unexpected error occurred.'

    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Failed to Load Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{errMsg}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['products'] })
              queryClient.invalidateQueries({ queryKey: ['inventory'] })
              queryClient.invalidateQueries({ queryKey: ['warehouses'] })
              queryClient.invalidateQueries({ queryKey: ['categories'] })
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
            <Package className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
            Inventory &amp; Vault
          </h2>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <AddProductDialog
            categories={categoriesData ?? []}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </Dialog>
      </div>

      {/* ─── Products Table ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-amber-600" />
            Products
            {productsData && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {productsData.total}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-3 mb-4 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categoriesData ?? []).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">Cost Price</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">Weight</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-16 text-center text-muted-foreground">
                      {searchQuery || categoryFilter !== 'all'
                        ? 'No products match your filters.'
                        : 'No products found. Add your first product!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStockStatus(product.totalStock, product.minStockLevel)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium max-w-[180px] truncate">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {product.sku}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {product.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-amber-700 dark:text-amber-400">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell text-muted-foreground">
                          {formatCurrency(product.costPrice)}
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell text-muted-foreground">
                          {product.weight != null ? `${product.weight}g` : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {product.totalStock}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status.variant}
                            className={`text-xs ${status.className}`}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Warehouses ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Warehouse className="h-5 w-5 text-amber-600" />
          Warehouses
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(warehousesData ?? []).length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-10 text-center text-muted-foreground">
                No warehouses configured.
              </CardContent>
            </Card>
          ) : (
            (warehousesData ?? []).map((wh) => {
              const utilization = wh.capacity > 0 ? Math.round((wh.totalQuantity / wh.capacity) * 100) : 0
              return (
                <Card key={wh.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="truncate">{wh.name}</span>
                      <Badge variant="secondary" className="ml-2 text-[10px] font-mono shrink-0">
                        {wh.code}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{wh.city}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Capacity Utilization</span>
                      <span className="font-medium">{utilization}%</span>
                    </div>
                    <Progress value={utilization} className={`h-2 ${getProgressColor(utilization)}`} />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {wh.totalQuantity.toLocaleString('en-US')} / {wh.capacity.toLocaleString('en-US')} items
                      </span>
                      <span className="text-muted-foreground">
                        {wh._count.inventoryItems} product{wh._count.inventoryItems !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* ─── Low Stock Alerts ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Low Stock Alerts
            {lowStockAlerts.length > 0 && (
              <Badge className="ml-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
                {lowStockAlerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : lowStockAlerts.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto h-10 w-10 text-emerald-300 dark:text-emerald-700" />
              <p className="mt-2 text-sm text-muted-foreground">
                All products are sufficiently stocked
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-0">
              {lowStockAlerts.map((alert, idx) => (
                <div
                  key={`${alert.productId}-${alert.warehouseId}`}
                  className="flex items-center gap-3 border-b py-3 last:border-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {alert.productName}
                      <span className="ml-2 text-xs text-muted-foreground font-mono">
                        {alert.productSku}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.warehouseName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono tabular-nums">
                      <span className={
                        alert.currentQty === 0
                          ? 'text-red-600 dark:text-red-400 font-bold'
                          : 'text-foreground'
                      }>
                        {alert.currentQty}
                      </span>
                      <span className="text-muted-foreground"> / {alert.reorderPoint}</span>
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-0.5 ${getSeverityBadge(alert.severity)}`}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InventoryModule
