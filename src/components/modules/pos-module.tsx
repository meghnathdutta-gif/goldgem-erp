'use client'

import { useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingBag,
  CheckCircle,
  Package,
  AlertTriangle,
  Gem,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  categoryId: string
  category: Category
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

interface InventoryItem {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  reservedQty: number
  reorderPoint: number
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

type PaymentMethod = 'cash' | 'card' | 'digital'

interface PosPayload {
  items: { productId: string; name: string; price: number; quantity: number }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TAX_RATE = 0.08

function getStockForProduct(productId: string, stockMap: Record<string, number>): number {
  return stockMap[productId] ?? 0
}

function getCategoryBadgeColor(categoryName: string): string {
  const map: Record<string, string> = {
    'Rings': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    'Necklaces': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Earrings': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Bracelets': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    'Bangles': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    'Pendants': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Chains': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
    'Anklets': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  }
  return map[categoryName] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
}

// ─── Loading Skeletons ───────────────────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="py-0">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CartSkeleton() {
  return (
    <Card className="py-0">
      <CardHeader className="p-4 pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

// ─── Product Card ────────────────────────────────────────────────────────────

function ProductCard({
  product,
  stock,
  cartQuantity,
  onAddToCart,
  justAdded,
}: {
  product: Product
  stock: number
  cartQuantity: number
  onAddToCart: (product: Product) => void
  justAdded: boolean
}) {
  const isOutOfStock = stock <= 0

  return (
    <Card
      className={`py-0 transition-all duration-200 cursor-pointer group relative overflow-hidden ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 active:scale-[0.97]'
      } ${justAdded ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}
      onClick={() => {
        if (!isOutOfStock) onAddToCart(product)
      }}
    >
      {/* Just-added flash animation */}
      {justAdded && (
        <div className="absolute inset-0 bg-amber-200/40 dark:bg-amber-700/30 animate-pulse pointer-events-none z-10" />
      )}

      <CardContent className="p-4 space-y-2">
        {/* Category badge */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="secondary"
            className={`text-[10px] shrink-0 ${getCategoryBadgeColor(product.category.name)}`}
          >
            {product.category.name}
          </Badge>
          {cartQuantity > 0 && (
            <Badge className="bg-amber-500 text-white text-[10px] shrink-0">
              {cartQuantity} in cart
            </Badge>
          )}
        </div>

        {/* Product name */}
        <p className="text-sm font-semibold leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </p>

        {/* SKU */}
        <p className="text-[11px] text-muted-foreground font-mono">{product.sku}</p>

        {/* Price */}
        <p className="text-base font-bold text-amber-700 dark:text-amber-400">
          {formatCurrency(product.price)}
        </p>

        {/* Weight + Purity */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {product.weight != null && <span>{product.weight}g</span>}
          {product.weight != null && product.purity && <span>·</span>}
          {product.purity && <span>{product.purity}</span>}
          {!product.weight && !product.purity && <span>—</span>}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs font-medium ${isOutOfStock ? 'text-red-500' : stock <= product.minStockLevel ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isOutOfStock ? 'Out of stock' : `${stock} left`}
          </span>
          {!isOutOfStock && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Cart Item Row ───────────────────────────────────────────────────────────

function CartItemRow({
  item,
  stock,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem
  stock: number
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemove: (productId: string) => void
}) {
  const lineTotal = item.price * item.quantity
  const isAtMaxStock = item.quantity >= stock

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.productId, -1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.productId, 1)}
          disabled={isAtMaxStock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Line total & remove */}
      <div className="flex flex-col items-end shrink-0 gap-1">
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
          {formatCurrency(lineTotal)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => onRemove(item.productId)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          <span className="text-xs">Remove</span>
        </Button>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PosModule() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  const queryClient = useQueryClient()

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj,
  } = useQuery<{ products: Product[]; total: number }>({
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
  } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory')
      if (!res.ok) throw new Error('Failed to fetch inventory')
      return res.json()
    },
  })

  // ─── Derived Data ───────────────────────────────────────────────────────

  const stockMap: Record<string, number> = {}
  if (inventoryData) {
    for (const item of inventoryData) {
      stockMap[item.productId] = (stockMap[item.productId] ?? 0) + item.quantity
    }
  }

  const products = (productsData?.products ?? []).filter((p) => p.isActive)

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    )
  })

  const cartQuantityMap: Record<string, number> = {}
  for (const item of cart) {
    cartQuantityMap[item.productId] = item.quantity
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const discountAmount = Math.max(0, parseFloat(discount) || 0)
  const total = Math.max(0, subtotal + tax - discountAmount)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // ─── Cart Actions ───────────────────────────────────────────────────────

  const addToCart = useCallback((product: Product) => {
    const currentStock = getStockForProduct(product.id, stockMap)
    const currentCartQty = cartQuantityMap[product.id] ?? 0

    if (currentStock <= 0) {
      toast.error('Out of stock', { description: `${product.name} is not available.` })
      return
    }

    if (currentCartQty >= currentStock) {
      toast.error('Insufficient stock', {
        description: `Only ${currentStock} unit${currentStock !== 1 ? 's' : ''} available for ${product.name}.`,
      })
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })

    // Flash animation
    setJustAddedId(product.id)
    setTimeout(() => setJustAddedId(null), 500)

    toast.success('Added to cart', {
      description: `${product.name} × 1`,
      duration: 1500,
    })
  }, [stockMap, cartQuantityMap])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item
          const newQty = item.quantity + delta
          const availableStock = getStockForProduct(productId, stockMap)
          if (newQty < 1) return item
          if (newQty > availableStock) {
            toast.error('Insufficient stock', {
              description: `Only ${availableStock} unit${availableStock !== 1 ? 's' : ''} available.`,
            })
            return item
          }
          return { ...item, quantity: newQty }
        })
    )
  }, [stockMap])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setDiscount('')
    setPaymentMethod('cash')
  }, [])

  // ─── Sale Mutation ──────────────────────────────────────────────────────

  const completeSale = useMutation({
    mutationFn: async (payload: PosPayload) => {
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Sale failed' }))
        throw new Error(err.error || 'Failed to complete sale')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Sale completed!', {
        description: `Payment of ${formatCurrency(total)} via ${paymentMethod.toUpperCase()} received.`,
        duration: 4000,
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
      clearCart()
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (err: Error) => {
      toast.error('Sale failed', {
        description: err.message,
        duration: 5000,
      })
    },
  })

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty', { description: 'Add items before completing a sale.' })
      return
    }

    completeSale.mutate({
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod,
    })
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  if (productsLoading || inventoryLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Gem className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <ProductGridSkeleton />
          </div>
          <div className="lg:col-span-2">
            <CartSkeleton />
          </div>
        </div>
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────

  if (productsError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Failed to Load Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {productsErrorObj?.message || 'An unexpected error occurred.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['products'] })
              queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
    <div className="space-y-4">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Gem className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
            Counter Sale
          </h2>
        </div>

        {/* Mobile cart toggle */}
        <Button
          variant="outline"
          className="lg:hidden relative w-fit"
          onClick={() => setMobileCartOpen(!mobileCartOpen)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white text-[10px]">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* ─── Split Layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ─── Left Panel: Product Grid (60%) ──────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <Card className="py-0">
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? 'No products match your search.'
                    : 'No products available.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stock={getStockForProduct(product.id, stockMap)}
                  cartQuantity={cartQuantityMap[product.id] ?? 0}
                  onAddToCart={addToCart}
                  justAdded={justAddedId === product.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Right Panel: Cart & Checkout (40%) ──────────────────────── */}
        {/* Desktop: inline side panel */}
        <div className="lg:col-span-2 hidden lg:block">
          <Card className="py-0 sticky top-4">
            {/* Cart Header */}
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-amber-600" />
                  Shopping Cart
                </span>
                {cartItemCount > 0 && (
                  <Badge className="bg-amber-500 text-white text-xs">
                    {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              {/* ─── Cart Items ────────────────────────────────────────── */}
              {cart.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click a product to add it
                  </p>
                </div>
              ) : (
                <>
                  <div className="max-h-72 overflow-y-auto space-y-0 pr-1 scrollbar-thin">
                    {cart.map((item) => (
                      <CartItemRow
                        key={item.productId}
                        item={item}
                        stock={getStockForProduct(item.productId, stockMap)}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>

                  <Separator className="my-3" />

                  {/* ─── Order Summary ──────────────────────────────────── */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sales Tax (8%)</span>
                      <span className="tabular-nums">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm gap-2">
                      <Label htmlFor="discount" className="text-muted-foreground shrink-0 cursor-pointer">
                        Discount (₹)
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="h-7 w-24 text-right text-sm tabular-nums"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold">Total</span>
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* ─── Payment Method ─────────────────────────────────── */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <Label
                        htmlFor="pay-cash"
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-colors ${
                          paymentMethod === 'cash'
                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <RadioGroupItem value="cash" id="pay-cash" className="sr-only" />
                        <Banknote className={`h-5 w-5 ${paymentMethod === 'cash' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${paymentMethod === 'cash' ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
                          Cash
                        </span>
                      </Label>

                      <Label
                        htmlFor="pay-card"
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <RadioGroupItem value="card" id="pay-card" className="sr-only" />
                        <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${paymentMethod === 'card' ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
                          Card
                        </span>
                      </Label>

                      <Label
                        htmlFor="pay-digital"
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-colors ${
                          paymentMethod === 'digital'
                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <RadioGroupItem value="digital" id="pay-digital" className="sr-only" />
                        <Smartphone className={`h-5 w-5 ${paymentMethod === 'digital' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${paymentMethod === 'digital' ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
                          Digital
                        </span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {/* ─── Complete Sale Button ────────────────────────────── */}
                  <Button
                    className="w-full mt-4 h-12 text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleCompleteSale}
                    disabled={completeSale.isPending || cart.length === 0}
                  >
                    {completeSale.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Complete Sale · {formatCurrency(total)}
                      </span>
                    )}
                  </Button>

                  {/* Clear cart link */}
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={clearCart}
                      disabled={cart.length === 0}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear Cart
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Mobile Cart Bottom Sheet ────────────────────────────────────── */}
      {mobileCartOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileCartOpen(false)}
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden max-h-[60vh] rounded-t-2xl bg-background shadow-2xl border-t overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="overflow-y-auto max-h-[55vh] px-4 pb-4">
              <Card className="py-0 border-0 shadow-none">
                {/* Cart Header */}
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-amber-600" />
                      Shopping Cart
                    </span>
                    <div className="flex items-center gap-2">
                      {cartItemCount > 0 && (
                        <Badge className="bg-amber-500 text-white text-xs">
                          {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setMobileCartOpen(false)}>
                        ✕
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-3 pt-0">
                  {cart.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/30" />
                      <p className="mt-2 text-sm text-muted-foreground">Your cart is empty</p>
                      <p className="text-xs text-muted-foreground mt-1">Click a product to add it</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-32 overflow-y-auto space-y-0 pr-1 scrollbar-thin">
                        {cart.map((item) => (
                          <CartItemRow
                            key={item.productId}
                            item={item}
                            stock={getStockForProduct(item.productId, stockMap)}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeFromCart}
                          />
                        ))}
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tax (8%)</span>
                          <span className="tabular-nums">{formatCurrency(tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold">Total</span>
                          <span className="text-lg font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-3 h-11 text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={handleCompleteSale}
                        disabled={completeSale.isPending || cart.length === 0}
                      >
                        {completeSale.isPending ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Complete Sale · {formatCurrency(total)}
                          </span>
                        )}
                      </Button>

                      <div className="flex justify-center mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          onClick={clearCart}
                          disabled={cart.length === 0}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear Cart
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PosModule
