'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { Search, Plus, Package, Warehouse, BarChart3, ArrowLeftRight, Edit, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Product {
  id: string; name: string; sku: string; barcode?: string; description?: string
  price: number; costPrice: number; unit: string; minStockLevel: number; isActive: boolean; isManufactured: boolean
  category: { id: string; name: string; color?: string }
  inventoryItems: { id: string; quantity: number; warehouse: { id: string; name: string } }[]
}

interface Category { id: string; name: string; description?: string; _count: { products: number } }

export function InventoryModule() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedInvItem, setSelectedInvItem] = useState<{ id: string; productId: string; productName: string; currentQty: number; warehouseId: string } | null>(null)
  const [adjustType, setAdjustType] = useState('in')
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [activeTab, setActiveTab] = useState('products')

  const qc = useQueryClient()

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()),
  })

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['products', search, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter !== 'all') params.set('categoryId', categoryFilter)
      return fetch(`/api/products?${params}`).then(r => r.json())
    },
  })

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => fetch('/api/warehouses').then(r => r.json()),
  })

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['inventory', 'levels'],
    queryFn: () => fetch('/api/inventory?type=levels').then(r => r.json()),
  })

  const { data: movements = [] } = useQuery({
    queryKey: ['inventory', 'movements'],
    queryFn: () => fetch('/api/inventory?type=movements').then(r => r.json()),
  })

  // Product form state
  const [formName, setFormName] = useState('')
  const [formSku, setFormSku] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCostPrice, setFormCostPrice] = useState('')
  const [formUnit, setFormUnit] = useState('piece')
  const [formMinStock, setFormMinStock] = useState('10')
  const [formIsManufactured, setFormIsManufactured] = useState(false)

  const createProductMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast({ title: 'Product created' }); setProductDialogOpen(false); resetForm() },
    onError: () => toast({ title: 'Error creating product', variant: 'destructive' }),
  })

  const updateProductMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast({ title: 'Product updated' }); setProductDialogOpen(false); resetForm() },
    onError: () => toast({ title: 'Error updating product', variant: 'destructive' }),
  })

  const adjustStockMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast({ title: 'Stock adjusted' }); setStockDialogOpen(false) },
    onError: () => toast({ title: 'Error adjusting stock', variant: 'destructive' }),
  })

  function resetForm() {
    setFormName(''); setFormSku(''); setFormCategoryId(''); setFormPrice(''); setFormCostPrice(''); setFormUnit('piece'); setFormMinStock('10'); setFormIsManufactured(false); setEditingProduct(null)
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product)
    setFormName(product.name); setFormSku(product.sku); setFormCategoryId(product.category.id)
    setFormPrice(product.price.toString()); setFormCostPrice(product.costPrice.toString())
    setFormUnit(product.unit); setFormMinStock(product.minStockLevel.toString()); setFormIsManufactured(product.isManufactured)
    setProductDialogOpen(true)
  }

  function handleProductSubmit() {
    const data = { name: formName, sku: formSku, categoryId: formCategoryId, price: parseFloat(formPrice), costPrice: parseFloat(formCostPrice), unit: formUnit, minStockLevel: parseInt(formMinStock), isManufactured: formIsManufactured }
    if (editingProduct) {
      updateProductMutation.mutate({ ...data, id: editingProduct.id })
    } else {
      createProductMutation.mutate(data)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products" className="gap-1.5"><Package className="w-3.5 h-3.5" />Products</TabsTrigger>
          <TabsTrigger value="warehouses" className="gap-1.5"><Warehouse className="w-3.5 h-3.5" />Warehouses</TabsTrigger>
          <TabsTrigger value="stock" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" />Stock Levels</TabsTrigger>
          <TabsTrigger value="movements" className="gap-1.5"><ArrowLeftRight className="w-3.5 h-3.5" />Movements</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => { resetForm(); setProductDialogOpen(true) }} className="gap-1.5">
              <Plus className="w-4 h-4" />Add Product
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {productsLoading ? (
                <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => {
                      const totalStock = p.inventoryItems.reduce((s, i) => s + i.quantity, 0)
                      const isLow = totalStock <= p.minStockLevel
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono">{p.sku}</TableCell>
                          <TableCell><Badge variant="outline" style={{ borderColor: p.category.color, color: p.category.color }}>{p.category.name}</Badge></TableCell>
                          <TableCell className="text-right">₹{p.price.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">₹{p.costPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <span className={isLow ? 'text-red-600 font-semibold' : ''}>{totalStock}</span>
                            {isLow && <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />}
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.isActive ? 'default' : 'secondary'} className="text-[10px]">
                              {p.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openEditProduct(p)}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((wh: any) => (
              <Card key={wh.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-primary" />{wh.name}
                  </CardTitle>
                  <CardDescription>{wh.city} · {wh.code}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>Manager: {wh.manager}</p>
                  <p>Items: {wh._count?.inventoryItems || wh.inventoryItems?.length || 0}</p>
                  <p>Capacity: {wh.capacity}</p>
                  <p className="text-muted-foreground text-xs">{wh.address}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stock Levels Tab */}
        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stock Levels Overview</CardTitle>
              <CardDescription>Items highlighted in red are below minimum stock levels</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Reserved</TableHead>
                      <TableHead className="text-center">Reorder Point</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLevels.map((item: any) => {
                      const isLow = item.quantity <= item.reorderPoint
                      return (
                        <TableRow key={item.id} className={isLow ? 'bg-red-50/50 dark:bg-red-950/20' : ''}>
                          <TableCell className="font-medium">{item.product?.name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.warehouse?.name}</TableCell>
                          <TableCell className={`text-center font-semibold ${isLow ? 'text-red-600' : ''}`}>{item.quantity}</TableCell>
                          <TableCell className="text-center text-muted-foreground">{item.reservedQty}</TableCell>
                          <TableCell className="text-center">{item.reorderPoint}</TableCell>
                          <TableCell>
                            {isLow ? <Badge variant="destructive">Low Stock</Badge> : <Badge variant="secondary">OK</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedInvItem({ id: item.id, productId: item.productId, productName: item.product?.name, currentQty: item.quantity, warehouseId: item.warehouseId })
                              setStockDialogOpen(true)
                            }}>Adjust</Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Inventory Movements Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{m.inventoryItem?.product?.name}</TableCell>
                        <TableCell className="text-muted-foreground">{m.warehouse?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            m.type === 'in' ? 'border-emerald-300 text-emerald-700' :
                            m.type === 'out' ? 'border-red-300 text-red-700' :
                            m.type === 'transfer' ? 'border-blue-300 text-blue-700' :
                            m.type === 'return' ? 'border-amber-300 text-amber-700' :
                            'border-gray-300 text-gray-700'
                          }>{m.type}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{m.type === 'out' ? `-${m.quantity}` : `+${m.quantity}`}</TableCell>
                        <TableCell className="text-xs font-mono">{m.reference || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Name</label><Input value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div><label className="text-sm font-medium">SKU</label><Input value={formSku} onChange={e => setFormSku(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Category</label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Selling Price</label><Input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Cost Price</label><Input type="number" value={formCostPrice} onChange={e => setFormCostPrice(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-medium">Unit</label>
                <Select value={formUnit} onValueChange={setFormUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Min Stock</label><Input type="number" value={formMinStock} onChange={e => setFormMinStock(e.target.value)} /></div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm mt-6"><input type="checkbox" checked={formIsManufactured} onChange={e => setFormIsManufactured(e.target.checked)} className="rounded" />Manufactured</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleProductSubmit} disabled={!formName || !formSku || !formCategoryId}>
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjust Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {selectedInvItem && (
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium">{selectedInvItem.productName}</p>
                <p className="text-sm text-muted-foreground">Current Stock: <span className="font-semibold text-foreground">{selectedInvItem.currentQty}</span></p>
              </div>
              <div><label className="text-sm font-medium">Adjustment Type</label>
                <Select value={adjustType} onValueChange={setAdjustType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In (Add)</SelectItem>
                    <SelectItem value="out">Stock Out (Remove)</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Quantity</label><Input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="Enter quantity" /></div>
              <div><label className="text-sm font-medium">Reason</label><Input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Optional reason" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedInvItem && adjustQty) {
                adjustStockMutation.mutate({
                  inventoryItemId: selectedInvItem.id,
                  type: adjustType,
                  quantity: parseInt(adjustQty),
                  reason: adjustReason,
                  warehouseId: selectedInvItem.warehouseId,
                })
              }
            }} disabled={!adjustQty}>Confirm Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
