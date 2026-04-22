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
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { Star, Plus, Truck, FileText, Users, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  sent: 'bg-blue-50 text-blue-700 border-blue-300',
  confirmed: 'bg-purple-50 text-purple-700 border-purple-300',
  partial: 'bg-orange-50 text-orange-700 border-orange-300',
  received: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  cancelled: 'bg-red-50 text-red-700 border-red-300',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  shipped: 'bg-blue-50 text-blue-700 border-blue-300',
  in_transit: 'bg-cyan-50 text-cyan-700 border-cyan-300',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-300',
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>{status.replace(/_/g, ' ')}</Badge>
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export function SupplyChainModule() {
  const [activeTab, setActiveTab] = useState('suppliers')
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const [poDialogOpen, setPoDialogOpen] = useState(false)
  const qc = useQueryClient()

  // Form states for supplier
  const [sName, setSName] = useState('')
  const [sCode, setSCode] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sPhone, setSPhone] = useState('')
  const [sCity, setSCity] = useState('')
  const [sLeadTime, setSLeadTime] = useState('7')
  const [sPaymentTerms, setSPaymentTerms] = useState('Net 30')
  const [sRating, setSRating] = useState('4.0')

  // PO form states
  const [poSupplierId, setPoSupplierId] = useState('')
  const [poNotes, setPoNotes] = useState('')
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([])

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => fetch('/api/suppliers').then(r => r.json()),
  })

  const { data: purchaseOrders = [], isLoading: posLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => fetch('/api/purchase-orders').then(r => r.json()),
  })

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => fetch('/api/shipments').then(r => r.json()),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  })

  const createSupplierMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); toast({ title: 'Supplier created' }); setSupplierDialogOpen(false) },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  })

  const createPOMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/purchase-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchase-orders'] }); toast({ title: 'Purchase Order created' }); setPoDialogOpen(false) },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  })

  const updateShipmentMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/shipments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); toast({ title: 'Shipment updated' }) },
  })

  const updatePOMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/purchase-orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchase-orders'] }); toast({ title: 'PO updated' }) },
  })

  // Group shipments by status for kanban
  const shipmentColumns = ['pending', 'shipped', 'in_transit', 'delivered'].map(status => ({
    status,
    shipments: shipments.filter((s: any) => s.status === status),
  }))

  return (
    <div className="p-6 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="suppliers" className="gap-1.5"><Users className="w-3.5 h-3.5" />Suppliers</TabsTrigger>
          <TabsTrigger value="purchase-orders" className="gap-1.5"><FileText className="w-3.5 h-3.5" />Purchase Orders</TabsTrigger>
          <TabsTrigger value="shipments" className="gap-1.5"><Truck className="w-3.5 h-3.5" />Shipments</TabsTrigger>
        </TabsList>

        {/* Suppliers */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setSupplierDialogOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" />Add Supplier</Button>
          </div>
          {suppliersLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((s: any) => (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{s.code}</Badge>
                    </div>
                    <StarRating rating={s.rating} />
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="text-muted-foreground">{s.city}, {s.country}</p>
                    <p>Lead Time: {s.leadTimeDays} days</p>
                    <p>Terms: {s.paymentTerms}</p>
                    <p className="text-xs text-muted-foreground">{s.email} · {s.phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s._count?.purchaseOrders || 0} orders</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Purchase Orders */}
        <TabsContent value="purchase-orders" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setPoDialogOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" />New PO</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((po: any) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono font-semibold text-sm">{po.poNumber}</TableCell>
                        <TableCell>{po.supplier?.name}</TableCell>
                        <TableCell className="text-sm">{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-semibold">₹{po.totalAmount.toLocaleString()}</TableCell>
                        <TableCell><StatusBadge status={po.status} /></TableCell>
                        <TableCell className="text-right">
                          {po.status === 'draft' && (
                            <Button size="sm" variant="outline" onClick={() => updatePOMutation.mutate({ id: po.id, status: 'sent' })}>Send</Button>
                          )}
                          {po.status === 'sent' && (
                            <Button size="sm" variant="outline" onClick={() => updatePOMutation.mutate({ id: po.id, status: 'confirmed' })}>Confirm</Button>
                          )}
                          {po.status === 'confirmed' && (
                            <Button size="sm" variant="outline" onClick={() => updatePOMutation.mutate({ id: po.id, status: 'received' })}>Receive</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipments Kanban */}
        <TabsContent value="shipments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {shipmentColumns.map(col => (
              <div key={col.status}>
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={col.status} />
                  <span className="text-xs text-muted-foreground">({col.shipments.length})</span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {col.shipments.map((shipment: any) => (
                    <Card key={shipment.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        <p className="font-mono font-semibold text-xs">{shipment.shipmentNumber}</p>
                        <p className="text-xs text-muted-foreground">{shipment.carrier}</p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>{shipment.origin}</span>
                          <ChevronRight className="w-3 h-3" />
                          <span>{shipment.destination}</span>
                        </div>
                        {shipment.trackingNumber && (
                          <p className="text-[10px] font-mono text-muted-foreground">TRK: {shipment.trackingNumber}</p>
                        )}
                        <div className="flex gap-1">
                          {col.status === 'pending' && (
                            <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => updateShipmentMutation.mutate({ id: shipment.id, status: 'shipped', shippingDate: new Date().toISOString() })}>Ship</Button>
                          )}
                          {col.status === 'shipped' && (
                            <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => updateShipmentMutation.mutate({ id: shipment.id, status: 'in_transit' })}>In Transit</Button>
                          )}
                          {col.status === 'in_transit' && (
                            <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => updateShipmentMutation.mutate({ id: shipment.id, status: 'delivered', deliveryDate: new Date().toISOString() })}>Deliver</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Supplier Dialog */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Name</label><Input value={sName} onChange={e => setSName(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Code</label><Input value={sCode} onChange={e => setSCode(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Email</label><Input value={sEmail} onChange={e => setSEmail(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={sPhone} onChange={e => setSPhone(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">City</label><Input value={sCity} onChange={e => setSCity(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Lead Time (days)</label><Input type="number" value={sLeadTime} onChange={e => setSLeadTime(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Payment Terms</label><Input value={sPaymentTerms} onChange={e => setSPaymentTerms(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Rating</label><Input type="number" step="0.1" value={sRating} onChange={e => setSRating(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => createSupplierMutation.mutate({ name: sName, code: sCode, email: sEmail, phone: sPhone, city: sCity, leadTimeDays: parseInt(sLeadTime), paymentTerms: sPaymentTerms, rating: parseFloat(sRating) })} disabled={!sName || !sCode}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PO Dialog */}
      <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Supplier</label>
              <Select value={poSupplierId} onValueChange={setPoSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>{suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Notes</label><Textarea value={poNotes} onChange={e => setPoNotes(e.target.value)} /></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Items</label>
                <Button size="sm" variant="outline" onClick={() => setPoItems([...poItems, { productId: '', quantity: 10, unitPrice: 0 }])}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {poItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <Select value={item.productId} onValueChange={v => {
                      const p = products.find((pr: any) => pr.id === v)
                      const newItems = [...poItems]; newItems[idx] = { ...newItems[idx], productId: v, unitPrice: p?.costPrice || 0 }; setPoItems(newItems)
                    }}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Product" /></SelectTrigger>
                      <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" className="w-20" value={item.quantity} onChange={e => { const newItems = [...poItems]; newItems[idx] = { ...newItems[idx], quantity: parseInt(e.target.value) || 0 }; setPoItems(newItems) }} placeholder="Qty" />
                    <span className="text-xs text-muted-foreground pb-2">₹{item.unitPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPoDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              createPOMutation.mutate({
                supplierId: poSupplierId,
                notes: poNotes,
                items: poItems.filter(i => i.productId).map(i => ({ ...i, totalPrice: i.quantity * i.unitPrice })),
              })
            }} disabled={!poSupplierId || poItems.length === 0}>Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
