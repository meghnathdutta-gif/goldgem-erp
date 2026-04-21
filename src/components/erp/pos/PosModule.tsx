'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { useERPStore } from '@/store/erp-store'
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PosModule() {
  const {
    posCart, addToPosCart, removeFromPosCart, updatePosCartQty, clearPosCart,
    posCustomerName, setPosCustomerName, posPaymentMethod, setPosPaymentMethod,
    posDiscount, setPosDiscount, showReceipt, setShowReceipt, receiptData, setReceiptData,
  } = useERPStore()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('pos')

  const qc = useQueryClient()

  const { data: products = [] } = useQuery({
    queryKey: ['products', search, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter !== 'all') params.set('categoryId', categoryFilter)
      return fetch(`/api/products?${params}`).then(r => r.json())
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()),
  })

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['pos-transactions'],
    queryFn: () => fetch('/api/pos').then(r => r.json()),
  })

  const checkoutMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/pos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['pos-transactions'] })
      setReceiptData(data)
      setShowReceipt(true)
      clearPosCart()
      toast({ title: 'Transaction completed!' })
    },
    onError: () => toast({ title: 'Checkout failed', variant: 'destructive' }),
  })

  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxAmount = (subtotal - posDiscount) * 0.18
  const totalAmount = subtotal - posDiscount + taxAmount

  const activeProducts = products.filter((p: any) => p.isActive)

  function handleAddToCart(product: any) {
    const stock = product.inventoryItems?.reduce((s: number, i: any) => s + i.quantity, 0) || 0
    addToPosCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      maxStock: stock,
    })
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList>
            <TabsTrigger value="pos" className="gap-1.5"><ShoppingCart className="w-3.5 h-3.5" />POS Terminal</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1.5"><Receipt className="w-3.5 h-3.5" />Recent Transactions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pos" className="flex-1 flex gap-4 px-6 pb-6 min-h-0">
          {/* Product Grid - Left Side */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-min">
              {activeProducts.map((product: any) => {
                const stock = product.inventoryItems?.reduce((s: number, i: any) => s + i.quantity, 0) || 0
                const inCart = posCart.find(c => c.productId === product.id)
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="cursor-pointer"
                    onClick={() => handleAddToCart(product)}
                  >
                    <Card className={`hover:shadow-md transition-all h-full ${inCart ? 'ring-2 ring-primary' : ''} ${stock <= 0 ? 'opacity-50' : ''}`}>
                      <CardContent className="p-3">
                        <div className="w-full h-20 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center mb-2">
                          <span className="text-2xl">{product.category?.icon === 'Monitor' ? '💻' : product.category?.icon === 'Shirt' ? '👕' : product.category?.icon === 'Coffee' ? '☕' : product.category?.icon === 'Armchair' ? '🪑' : '⚙️'}</span>
                        </div>
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-bold text-primary">₹{product.price.toLocaleString()}</p>
                          <span className={`text-[10px] ${stock <= product.minStockLevel ? 'text-red-500' : 'text-muted-foreground'}`}>{stock} in stock</span>
                        </div>
                        {inCart && (
                          <Badge className="mt-1 text-[10px]">{inCart.quantity} in cart</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Cart - Right Side */}
          <Card className="w-96 flex flex-col shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />Cart
                {posCart.length > 0 && <Badge variant="secondary">{posCart.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
              {/* Customer Name */}
              <div className="mb-3">
                <Input placeholder="Customer name (optional)" value={posCustomerName} onChange={e => setPosCustomerName(e.target.value)} className="h-8 text-sm" />
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                <AnimatePresence>
                  {posCart.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Cart is empty. Click products to add.</p>
                  )}
                  {posCart.map(item => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price.toLocaleString()} each</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updatePosCartQty(item.productId, item.quantity - 1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updatePosCartQty(item.productId, item.quantity + 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold w-16 text-right">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeFromPosCart(item.productId)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Totals */}
              <div className="border-t pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <Input
                    type="number"
                    className="h-7 w-24 text-sm text-right"
                    value={posDiscount || ''}
                    onChange={e => setPosDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                </div>

                {/* Payment Method */}
                <div className="flex gap-2">
                  <Button
                    variant={posPaymentMethod === 'cash' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setPosPaymentMethod('cash')}
                  >
                    <Banknote className="w-3 h-3" />Cash
                  </Button>
                  <Button
                    variant={posPaymentMethod === 'card' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setPosPaymentMethod('card')}
                  >
                    <CreditCard className="w-3 h-3" />Card
                  </Button>
                  <Button
                    variant={posPaymentMethod === 'upi' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setPosPaymentMethod('upi')}
                  >
                    <Smartphone className="w-3 h-3" />UPI
                  </Button>
                </div>

                <Button
                  className="w-full h-11 text-base"
                  disabled={posCart.length === 0}
                  onClick={() => {
                    checkoutMutation.mutate({
                      items: posCart.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalPrice: item.price * item.quantity,
                      })),
                      customerName: posCustomerName || null,
                      paymentMethod: posPaymentMethod,
                      discount: posDiscount,
                    })
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Checkout ₹{totalAmount.toLocaleString()}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Transactions */}
        <TabsContent value="transactions" className="px-6 pb-6">
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Transaction #</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Payment</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((trx: any) => (
                      <tr key={trx.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm font-semibold">{trx.transactionNumber}</td>
                        <td className="p-3 text-sm">{trx.customerName || 'Walk-in'}</td>
                        <td className="p-3 text-right font-semibold">₹{trx.totalAmount.toLocaleString()}</td>
                        <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{trx.paymentMethod}</Badge></td>
                        <td className="p-3 text-center">
                          <Badge variant={trx.status === 'completed' ? 'default' : trx.status === 'refunded' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {trx.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{new Date(trx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="w-4 h-4" />Receipt</DialogTitle>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-4 text-sm">
              <div className="text-center">
                <h3 className="font-bold text-lg">NexERP Store</h3>
                <p className="text-xs text-muted-foreground">Transaction Receipt</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p><span className="text-muted-foreground">Transaction:</span> <span className="font-mono">{(receiptData as any).transactionNumber}</span></p>
                <p><span className="text-muted-foreground">Date:</span> {new Date((receiptData as any).createdAt).toLocaleString()}</p>
                {(receiptData as any).customerName && <p><span className="text-muted-foreground">Customer:</span> {(receiptData as any).customerName}</p>}
                <p><span className="text-muted-foreground">Payment:</span> {(receiptData as any).paymentMethod?.toUpperCase()}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                {((receiptData as any).items || []).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>₹{item.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{(receiptData as any).subtotal?.toLocaleString()}</span></div>
                {(receiptData as any).discount > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>-₹{(receiptData as any).discount?.toLocaleString()}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>₹{(receiptData as any).taxAmount?.toLocaleString()}</span></div>
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">₹{(receiptData as any).totalAmount?.toLocaleString()}</span></div>
              </div>
              <div className="text-center text-xs text-muted-foreground pt-2">Thank you for your purchase!</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
