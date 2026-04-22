'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { useERPStore } from '@/store/erp-store'
import { Search, ShoppingCart, Plus, Minus, Trash2, Globe, Package, CreditCard, CheckCircle2, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ECOM_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  confirmed: 'bg-purple-50 text-purple-700 border-purple-300',
  processing: 'bg-blue-50 text-blue-700 border-blue-300',
  shipped: 'bg-cyan-50 text-cyan-700 border-cyan-300',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  cancelled: 'bg-red-50 text-red-700 border-red-300',
}

export function EcommerceModule() {
  const {
    ecomCart, addToEcomCart, removeFromEcomCart, updateEcomCartQty, clearEcomCart,
    ecomCartOpen, setEcomCartOpen,
  } = useERPStore()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('catalog')
  const [checkoutStep, setCheckoutStep] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('online')
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

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetch('/api/customers').then(r => r.json()),
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['ecommerce-orders'],
    queryFn: () => fetch('/api/ecommerce').then(r => r.json()),
  })

  const createOrderMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/ecommerce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ecommerce-orders'] })
      clearEcomCart()
      setEcomCartOpen(false)
      setCheckoutStep(0)
      toast({ title: 'Order placed successfully!' })
    },
    onError: () => toast({ title: 'Order failed', variant: 'destructive' }),
  })

  const updateOrderMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/ecommerce', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ecommerce-orders'] }); toast({ title: 'Order updated' }) },
  })

  const cartTotal = ecomCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = cartTotal > 2000 ? 0 : 99
  const taxAmount = cartTotal * 0.18
  const orderTotal = cartTotal + shippingCost + taxAmount

  const activeProducts = products.filter((p: any) => p.isActive)

  function handleCheckout() {
    // Find or create a customer
    const existingCustomer = customers.find((c: any) => c.email === customerEmail)
    const customerId = existingCustomer?.id

    if (!customerId) {
      toast({ title: 'Please enter valid customer info', variant: 'destructive' })
      return
    }

    createOrderMutation.mutate({
      customerId,
      items: ecomCart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
      shippingAddress,
      billingAddress: shippingAddress,
      paymentMethod,
    })
  }

  return (
    <div className="p-6 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="catalog" className="gap-1.5"><Globe className="w-3.5 h-3.5" />Catalog</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5"><Package className="w-3.5 h-3.5" />Orders</TabsTrigger>
        </TabsList>

        {/* Product Catalog */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" className="relative" onClick={() => setEcomCartOpen(true)}>
              <ShoppingCart className="w-4 h-4" />
              {ecomCart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{ecomCart.length}</Badge>
              )}
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button variant={categoryFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter('all')}>All</Button>
            {categories.map((c: any) => (
              <Button key={c.id} variant={categoryFilter === c.id ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter(c.id)}>{c.name}</Button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {activeProducts.map((product: any) => {
              const inCart = ecomCart.find(c => c.productId === product.id)
              return (
                <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="h-36 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                      <span className="text-4xl">
                        {product.category?.icon === 'Monitor' ? '💻' : product.category?.icon === 'Shirt' ? '👕' : product.category?.icon === 'Coffee' ? '☕' : product.category?.icon === 'Armchair' ? '🪑' : '⚙️'}
                      </span>
                    </div>
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <p className="text-sm font-semibold line-clamp-2">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.category?.name}</p>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <p className="text-base font-bold text-primary">₹{product.price.toLocaleString()}</p>
                        {inCart ? (
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateEcomCartQty(product.id, inCart.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                            <span className="text-sm font-semibold w-5 text-center">{inCart.quantity}</span>
                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateEcomCartQty(product.id, inCart.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addToEcomCart({ productId: product.id, productName: product.name, price: product.price })}>
                            <Plus className="w-3 h-3 mr-0.5" />Add
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* Orders Management */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Order #</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Payment</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7}><Skeleton className="h-10 m-1" /></td></tr>) :
                    orders.map((order: any) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm font-semibold">{order.orderNumber}</td>
                        <td className="p-3 text-sm">{order.customer?.name}</td>
                        <td className="p-3 text-right font-semibold">₹{order.totalAmount.toLocaleString()}</td>
                        <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{order.paymentStatus}</Badge></td>
                        <td className="p-3 text-center"><Badge variant="outline" className={`text-[10px] ${ECOM_STATUS_COLORS[order.status] || ''}`}>{order.status}</Badge></td>
                        <td className="p-3 text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          {order.status === 'pending' && <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => updateOrderMutation.mutate({ id: order.id, status: 'confirmed' })}>Confirm</Button>}
                          {order.status === 'confirmed' && <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => updateOrderMutation.mutate({ id: order.id, status: 'processing' })}>Process</Button>}
                          {order.status === 'processing' && <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => updateOrderMutation.mutate({ id: order.id, status: 'shipped' })}>Ship</Button>}
                          {order.status === 'shipped' && <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => updateOrderMutation.mutate({ id: order.id, status: 'delivered' })}>Deliver</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-3">
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
                  const count = orders.filter((o: any) => o.status === status).length
                  return (
                    <div key={status} className="text-center p-3 rounded-lg border">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground capitalize">{status}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cart Drawer */}
      <Sheet open={ecomCartOpen} onOpenChange={setEcomCartOpen}>
        <SheetContent className="w-96 flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />Shopping Cart
              {ecomCart.length > 0 && <Badge>{ecomCart.length}</Badge>}
            </SheetTitle>
          </SheetHeader>

          {checkoutStep === 0 ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 py-4">
                {ecomCart.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Cart is empty</p>}
                <AnimatePresence>
                  {ecomCart.map(item => (
                    <motion.div key={item.productId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateEcomCartQty(item.productId, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                        <span className="w-5 text-center text-sm">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateEcomCartQty(item.productId, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                      </div>
                      <span className="text-sm font-semibold w-16 text-right">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeFromEcomCart(item.productId)}><Trash2 className="w-3 h-3" /></Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                <div className="flex justify-between text-sm"><span>Tax</span><span>₹{taxAmount.toLocaleString()}</span></div>
                <Separator />
                <div className="flex justify-between font-bold"><span>Total</span><span className="text-primary">₹{orderTotal.toLocaleString()}</span></div>
                <Button className="w-full" disabled={ecomCart.length === 0} onClick={() => setCheckoutStep(1)}>Proceed to Checkout</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <h3 className="font-semibold">Customer Information</h3>
              <div><label className="text-sm font-medium">Name</label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} /></div>
              <h3 className="font-semibold pt-2"><MapPin className="w-4 h-4 inline mr-1" />Shipping Address</h3>
              <Input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} placeholder="Full address" />
              <h3 className="font-semibold pt-2"><CreditCard className="w-4 h-4 inline mr-1" />Payment Method</h3>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Payment</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">₹{orderTotal.toLocaleString()}</span></div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCheckoutStep(0)}>Back</Button>
                  <Button className="flex-1" onClick={handleCheckout} disabled={!customerEmail || !shippingAddress}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />Place Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
