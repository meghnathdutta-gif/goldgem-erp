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
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { Plus, Factory, ListTree, Wrench, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-50 text-blue-700 border-blue-300',
  high: 'bg-orange-50 text-orange-700 border-orange-300',
  urgent: 'bg-red-50 text-red-700 border-red-300',
}

const WO_STATUS_COLORS: Record<string, string> = {
  planned: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-300',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  cancelled: 'bg-red-50 text-red-700 border-red-300',
}

export function ManufacturingModule() {
  const [activeTab, setActiveTab] = useState('work-orders')
  const [woDialogOpen, setWoDialogOpen] = useState(false)
  const [selectedBomProduct, setSelectedBomProduct] = useState('')
  const qc = useQueryClient()

  const [woProductId, setWoProductId] = useState('')
  const [woTargetQty, setWoTargetQty] = useState('')
  const [woPriority, setWoPriority] = useState('medium')
  const [woPlannedStart, setWoPlannedStart] = useState('')
  const [woPlannedEnd, setWoPlannedEnd] = useState('')
  const [woNotes, setWoNotes] = useState('')

  const { data: workOrders = [], isLoading: woLoading } = useQuery({
    queryKey: ['work-orders'],
    queryFn: () => fetch('/api/work-orders').then(r => r.json()),
  })

  const { data: bomData = [] } = useQuery({
    queryKey: ['bom', selectedBomProduct],
    queryFn: () => selectedBomProduct ? fetch(`/api/bom?productId=${selectedBomProduct}`).then(r => r.json()) : Promise.resolve([]),
    enabled: !!selectedBomProduct,
  })

  const { data: allBom = [] } = useQuery({
    queryKey: ['bom'],
    queryFn: () => fetch('/api/bom').then(r => r.json()),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  })

  const createWOMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/work-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['work-orders'] }); toast({ title: 'Work Order created' }); setWoDialogOpen(false) },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  })

  const updateWOMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => fetch('/api/work-orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['work-orders'] }); toast({ title: 'Work Order updated' }) },
  })

  // Get products that have BOMs
  const productsWithBom = [...new Set(allBom.map((b: any) => b.product?.id))].map(id => allBom.find((b: any) => b.product?.id === id)?.product).filter(Boolean)

  // Manufacturable products
  const manufacturableProducts = products.filter((p: any) => p.isManufactured)

  return (
    <div className="p-6 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="work-orders" className="gap-1.5"><Factory className="w-3.5 h-3.5" />Work Orders</TabsTrigger>
          <TabsTrigger value="bom" className="gap-1.5"><ListTree className="w-3.5 h-3.5" />Bill of Materials</TabsTrigger>
          <TabsTrigger value="progress" className="gap-1.5"><Wrench className="w-3.5 h-3.5" />Production Progress</TabsTrigger>
        </TabsList>

        {/* Work Orders */}
        <TabsContent value="work-orders" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setWoDialogOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" />New Work Order</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO Number</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Wastage</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((wo: any) => {
                      const wp = wo.products?.[0]
                      const progress = wp ? Math.round((wp.completedQty / wp.targetQty) * 100) : 0
                      return (
                        <TableRow key={wo.id}>
                          <TableCell className="font-mono font-semibold text-sm">{wo.woNumber}</TableCell>
                          <TableCell className="font-medium">{wp?.product?.name || '-'}</TableCell>
                          <TableCell>{wp?.targetQty || 0}</TableCell>
                          <TableCell className="font-semibold">{wp?.completedQty || 0}</TableCell>
                          <TableCell>{wp?.wastageQty || 0} {wp?.wastageQty > 0 && <AlertTriangle className="w-3 h-3 text-amber-500 inline" />}</TableCell>
                          <TableCell><Badge variant="outline" className={PRIORITY_COLORS[wo.priority]}>{wo.priority}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className={WO_STATUS_COLORS[wo.status]}>{wo.status.replace(/_/g, ' ')}</Badge></TableCell>
                          <TableCell className="text-right">
                            {wo.status === 'planned' && (
                              <Button size="sm" variant="outline" onClick={() => updateWOMutation.mutate({ id: wo.id, status: 'in_progress', actualStart: new Date().toISOString() })}>Start</Button>
                            )}
                            {wo.status === 'in_progress' && (
                              <Button size="sm" variant="outline" onClick={() => updateWOMutation.mutate({
                                id: wo.id, status: 'completed', actualEnd: new Date().toISOString(),
                                completedQty: wp?.targetQty, productId: wp?.productId
                              })}>Complete</Button>
                            )}
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

        {/* BOM Viewer */}
        <TabsContent value="bom" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bill of Materials</CardTitle>
              <CardDescription>Select a product to view its components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedBomProduct} onValueChange={setSelectedBomProduct}>
                <SelectTrigger className="w-80"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                <SelectContent>
                  {productsWithBom.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>

              {selectedBomProduct && bomData.length > 0 && (
                <div className="space-y-3">
                  <div className="bg-primary/5 p-4 rounded-lg border">
                    <h3 className="font-semibold text-sm mb-1">Assembly: {bomData[0]?.product?.name || 'Product'}</h3>
                    <p className="text-xs text-muted-foreground">{bomData.length} component(s) required</p>
                  </div>
                  <div className="space-y-2">
                    {bomData.map((comp: any) => (
                      <div key={comp.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-mono">
                            {comp.component?.category?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{comp.component?.name}</p>
                            <p className="text-[11px] text-muted-foreground">{comp.component?.category?.name} · {comp.component?.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{comp.quantity} {comp.component?.unit}</p>
                          {comp.notes && <p className="text-[11px] text-muted-foreground">{comp.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedBomProduct && bomData.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No BOM data found for this product.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Production Progress */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workOrders.filter((wo: any) => wo.status === 'in_progress' || wo.status === 'completed').map((wo: any) => {
              const wp = wo.products?.[0]
              const progress = wp ? Math.round((wp.completedQty / wp.targetQty) * 100) : 0
              const wastagePercent = wp && wp.targetQty > 0 ? Math.round((wp.wastageQty / wp.targetQty) * 100) : 0
              return (
                <Card key={wo.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-mono">{wo.woNumber}</CardTitle>
                        <CardDescription>{wp?.product?.name}</CardDescription>
                      </div>
                      <Badge variant="outline" className={WO_STATUS_COLORS[wo.status]}>{wo.status.replace(/_/g, ' ')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Target</p>
                        <p className="font-semibold">{wp?.targetQty || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Completed</p>
                        <p className="font-semibold text-emerald-600">{wp?.completedQty || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Wastage</p>
                        <p className="font-semibold text-amber-600">{wp?.wastageQty || 0} ({wastagePercent}%)</p>
                      </div>
                    </div>
                    {wo.plannedStart && (
                      <p className="text-xs text-muted-foreground">
                        Planned: {new Date(wo.plannedStart).toLocaleDateString()} → {wo.plannedEnd ? new Date(wo.plannedEnd).toLocaleDateString() : 'TBD'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Work Order Dialog */}
      <Dialog open={woDialogOpen} onOpenChange={setWoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Work Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Product</label>
              <Select value={woProductId} onValueChange={setWoProductId}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{manufacturableProducts.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Target Quantity</label><Input type="number" value={woTargetQty} onChange={e => setWoTargetQty(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Priority</label>
              <Select value={woPriority} onValueChange={setWoPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Planned Start</label><Input type="date" value={woPlannedStart} onChange={e => setWoPlannedStart(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Planned End</label><Input type="date" value={woPlannedEnd} onChange={e => setWoPlannedEnd(e.target.value)} /></div>
            </div>
            <div><label className="text-sm font-medium">Notes</label><Textarea value={woNotes} onChange={e => setWoNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWoDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => createWOMutation.mutate({
              products: [{ productId: woProductId, targetQty: parseInt(woTargetQty) }],
              priority: woPriority,
              plannedStart: woPlannedStart || undefined,
              plannedEnd: woPlannedEnd || undefined,
              notes: woNotes,
            })} disabled={!woProductId || !woTargetQty}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
