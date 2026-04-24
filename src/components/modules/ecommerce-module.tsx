'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatINR } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

interface EcommerceOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string | null
  items: OrderItem[]
  totalAmount: number
  shippingAddress: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
  updatedAt: string
}

// ─── Badge Helpers ───────────────────────────────────────────────────────────

function getPaymentStatusBadge(status: string) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400'
}

function getOrderStatusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    shipped: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400'
}

// ─── Loading Skeletons ───────────────────────────────────────────────────────

function KPISkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
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

// ─── Create Order Dialog ─────────────────────────────────────────────────────

function CreateOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [itemsJson, setItemsJson] = useState('')
  const [totalAmount, setTotalAmount] = useState('')

  const createOrder = useMutation({
    mutationFn: async (payload: {
      customerName: string
      customerEmail?: string
      shippingAddress: string
      items: OrderItem[]
      totalAmount: number
    }) => {
      const res = await fetch('/api/ecommerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create order' }))
        throw new Error(err.error || 'Failed to create order')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Order created successfully!')
      queryClient.invalidateQueries({ queryKey: ['ecommerce'] })
      onOpenChange(false)
      setCustomerName('')
      setCustomerEmail('')
      setShippingAddress('')
      setItemsJson('')
      setTotalAmount('')
    },
    onError: (err: Error) => {
      toast.error('Failed to create order', { description: err.message })
    },
  })

  const handleSubmit = () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required')
      return
    }
    if (!shippingAddress.trim()) {
      toast.error('Shipping address is required')
      return
    }

    let parsedItems: OrderItem[]
    try {
      parsedItems = JSON.parse(itemsJson)
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        throw new Error('Items must be a non-empty array')
      }
      for (const item of parsedItems) {
        if (!item.productId || !item.name || item.price === undefined || item.quantity === undefined) {
          throw new Error('Each item must have productId, name, price, quantity')
        }
      }
    } catch (e) {
      toast.error('Invalid items JSON', {
        description: e instanceof Error ? e.message : 'Please provide valid JSON',
      })
      return
    }

    const amount = parseFloat(totalAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid total amount')
      return
    }

    createOrder.mutate({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || undefined,
      shippingAddress: shippingAddress.trim(),
      items: parsedItems,
      totalAmount: amount,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <ShoppingBag className="h-5 w-5" />
            Create New Order
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="customer@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address *</Label>
            <Textarea
              id="shippingAddress"
              placeholder="Full shipping address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemsJson">Items (JSON) *</Label>
            <Textarea
              id="itemsJson"
              placeholder={'[{"productId":"abc","name":"Gold Ring","price":25000,"quantity":1}]'}
              value={itemsJson}
              onChange={(e) => setItemsJson(e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Each item needs: productId, name, price, quantity
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount (₹) *</Label>
            <Input
              id="totalAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="25000"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createOrder.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {createOrder.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Order
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

export function EcommerceModule() {
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data: orders = [], isLoading, isError, error } = useQuery<EcommerceOrder[]>({
    queryKey: ['ecommerce'],
    queryFn: async () => {
      const res = await fetch('/api/ecommerce')
      if (!res.ok) throw new Error('Failed to fetch ecommerce orders')
      return res.json()
    },
    refetchInterval: 30000,
  })

  // ─── Derived KPIs ────────────────────────────────────────────────────────

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length
  const totalRevenue = orders
    .filter((o) => o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  // ─── Filtered Orders ─────────────────────────────────────────────────────

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    )
  })

  // ─── Loading State ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KPISkeleton key={i} />
          ))}
        </div>
        <TableSkeleton />
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
            Failed to Load Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred while fetching orders.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['ecommerce'] })}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
              <ShoppingBag className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight text-foreground">{totalOrders.toLocaleString('en-IN')}</p>
            <p className="mt-1 text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight text-yellow-700 dark:text-yellow-400">{pendingOrders.toLocaleString('en-IN')}</p>
            <p className="mt-1 text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Orders</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">{deliveredOrders.toLocaleString('en-IN')}</p>
            <p className="mt-1 text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Truck className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-400">{formatINR(totalRevenue)}</p>
            <p className="mt-1 text-xs text-muted-foreground">From delivered orders</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Orders Table ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-amber-600" />
              Orders
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order # or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Payment</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-16 text-center text-muted-foreground">
                      {searchQuery.trim()
                        ? 'No orders match your search.'
                        : 'No orders found. Create your first order!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="group">
                      <TableCell className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.customerName}</p>
                          {order.customerEmail && (
                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {Array.isArray(order.items) ? order.items.length : 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatINR(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getPaymentStatusBadge(order.paymentStatus)}`}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getOrderStatusBadge(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Create Order Dialog ───────────────────────────────────────────── */}
      <CreateOrderDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}

export default EcommerceModule
