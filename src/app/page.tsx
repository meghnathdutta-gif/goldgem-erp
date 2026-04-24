'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useERPStore, type ModuleKey } from '@/store/erp-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  LayoutDashboard, Package, Truck, Factory, ShoppingCart, Store, Brain,
  ChevronLeft, ChevronRight, Bell, Moon, Sun, Search, Plus,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, Clock,
  TrendingUp, DollarSign, BarChart3, Users, BoxIcon,
  FileText, TruckIcon, RefreshCw, Minus, Plus as PlusIcon,
  CreditCard, Banknote, Smartphone, Trash2, MapPin,
  PackageCheck, Cog, Target, Activity
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'

// ── Data fetching hook ──
function useApi<T>(key: string, url: string | null) {
  return useQuery<T>({ queryKey: [key, url], queryFn: async () => { if (!url) return null as unknown as T; const r = await fetch(url); if (!r.ok) throw new Error('Fetch failed'); return r.json() }, enabled: !!url, staleTime: 30000 })
}

// ── Types ──
interface KPIs { totalRevenue: number; totalOrders: number; inventoryValue: number; totalProducts: number; activeWorkOrders: number; pendingShipments: number; lowStockItems: number; totalCustomers: number }
interface Product { id: string; name: string; sku: string; price: number; costPrice: number; categoryId: string; category: { id: string; name: string; color: string }; minStockLevel: number; unit: string; isManufactured: boolean; isActive: boolean; inventoryItems: { quantity: number; reservedQty: number; warehouse: { name: string } }[] }
interface Supplier { id: string; name: string; code: string; email: string; phone: string; city: string; country: string; rating: number; leadTimeDays: number; paymentTerms: string; isActive: boolean; _count: { purchaseOrders: number } }
interface PurchaseOrder { id: string; poNumber: string; status: string; totalAmount: number; taxAmount: number; orderDate: string; expectedDate: string | null; supplier: { name: string }; items: { product: { name: string }; quantity: number; unitPrice: number; totalPrice: number; receivedQty: number }[] }
interface Shipment { id: string; shipmentNumber: string; status: string; carrier: string; trackingNumber: string; origin: string; destination: string; shippingDate: string | null; deliveryDate: string | null; cost: number; items: { product: { name: string }; quantity: number }[] }
interface WorkOrder { id: string; woNumber: string; status: string; priority: string; plannedStart: string | null; plannedEnd: string | null; actualStart: string | null; actualEnd: string | null; products: { product: { name: string }; targetQty: number; completedQty: number; wastageQty: number }[] }
interface BomProduct { id: string; name: string; sku: string; bomComponents: { component: { name: string; sku: string }; quantity: number }[] }
interface Customer { id: string; name: string; email: string; phone: string; city: string; type: string; _count: { salesOrders: number; ecommerceOrders: number } }
interface PosTransaction { id: string; transactionNumber: string; customerName: string | null; subtotal: number; taxAmount: number; discount: number; totalAmount: number; paymentMethod: string; status: string; createdAt: string; items: { productName: string; quantity: number; unitPrice: number; totalPrice: number }[] }
interface EcommerceOrder { id: string; orderNumber: string; status: string; totalAmount: number; paymentStatus: string; paymentMethod: string; shippingCost: number; customer: { name: string }; items: { productName: string; quantity: number; totalPrice: number }[] }
interface Warehouse { id: string; name: string; code: string; city: string; capacity: number; manager: string; inventoryItems: { product: { name: string }; quantity: number }[] }

// ── Constants ──
const COLORS = ['#d97706', '#f59e0b', '#dc2626', '#6366f1', '#06b6d4', '#ec4899', '#94a3b8', '#f97316']
const STATUS_COLORS: Record<string, string> = { completed: 'bg-emerald-100 text-emerald-800', delivered: 'bg-emerald-100 text-emerald-800', active: 'bg-emerald-100 text-emerald-800', paid: 'bg-emerald-100 text-emerald-800', pending: 'bg-amber-100 text-amber-800', draft: 'bg-amber-100 text-amber-800', in_progress: 'bg-amber-100 text-amber-800', planned: 'bg-amber-100 text-amber-800', shipped: 'bg-sky-100 text-sky-800', in_transit: 'bg-sky-100 text-sky-800', confirmed: 'bg-purple-100 text-purple-800', processing: 'bg-purple-100 text-purple-800', cancelled: 'bg-red-100 text-red-800', refunded: 'bg-red-100 text-red-800', urgent: 'bg-red-100 text-red-800', partial: 'bg-orange-100 text-orange-800', received: 'bg-teal-100 text-teal-800' }
const PRIORITY_COLORS: Record<string, string> = { low: 'bg-slate-100 text-slate-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }
const NAV_ITEMS: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { key: 'inventory', label: 'Inventory & Vault', icon: <Package className="h-5 w-5" /> },
  { key: 'supply-chain', label: 'Supply Chain', icon: <Truck className="h-5 w-5" /> },
  { key: 'manufacturing', label: 'Karigarkhana', icon: <Factory className="h-5 w-5" /> },
  { key: 'pos', label: 'Counter Sale', icon: <ShoppingCart className="h-5 w-5" /> },
  { key: 'ecommerce', label: 'Online Store', icon: <Store className="h-5 w-5" /> },
  { key: 'ai-insights', label: 'AI Insights', icon: <Brain className="h-5 w-5" /> },
]

function formatCurrency(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) }
function formatDate(d: string | null) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }
function StatusBadge({ status }: { status: string }) { return <Badge className={`${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'} text-xs font-medium border-0`}>{status.replace(/_/g, ' ')}</Badge> }
function PriorityBadge({ priority }: { priority: string }) { return <Badge className={`${PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700'} text-xs font-medium border-0`}>{priority}</Badge> }
function RatingStars({ rating }: { rating: number }) { return <span className="text-amber-500 text-sm">{'★'.repeat(Math.floor(rating))}{rating % 1 >= 0.5 ? '½' : ''}{'☆'.repeat(5 - Math.ceil(rating))} <span className="text-gray-500">{rating.toFixed(1)}</span></span> }

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function ERPApp() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleCollapsed } = useERPStore()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => { if (isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark') }, [isDark])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-700">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 text-amber-950">G</div>
          {!sidebarCollapsed && <span className="font-bold text-lg tracking-tight">Gold<span className="text-amber-400">Gem</span></span>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => setActiveModule(item.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${activeModule === item.key ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              {item.icon}{!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button onClick={toggleCollapsed} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition text-sm">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-gray-900 border-b flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{NAV_ITEMS.find(n => n.key === activeModule)?.label}</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 text-sm font-medium">V</div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vikram</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {activeModule === 'dashboard' && <DashboardModule />}
          {activeModule === 'inventory' && <InventoryModule />}
          {activeModule === 'supply-chain' && <SupplyChainModule />}
          {activeModule === 'manufacturing' && <ManufacturingModule />}
          {activeModule === 'pos' && <POSModule />}
          {activeModule === 'ecommerce' && <EcommerceModule />}
          {activeModule === 'ai-insights' && <AIInsightsModule />}
        </main>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
function DashboardModule() {
  const { data, isLoading } = useApi<{ kpis: KPIs; revenueByMonth: Record<string, number>; salesByCategory: { name: string; value: number }[]; orderStatusDist: { name: string; value: number }[]; inventoryByWarehouse: { name: string; totalItems: number; capacity: number; utilization: number }[]; recentActivity: { type: string; description: string; status: string; time: string }[]; topProducts: { name: string; quantity: number; revenue: number }[] }>('dashboard', '/api/dashboard')

  if (isLoading || !data) return <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}</div>

  const kpis = data.kpis
  const revenueData = Object.entries(data.revenueByMonth).map(([name, value]) => ({ name, value: Math.round(value) }))

  const kpiCards = [
    { label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue), icon: <DollarSign className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+12.5%', up: true },
    { label: 'Total Orders', value: kpis.totalOrders.toLocaleString(), icon: <BarChart3 className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8.2%', up: true },
    { label: 'Vault Value', value: formatCurrency(kpis.inventoryValue), icon: <Package className="h-5 w-5" />, color: 'text-amber-700', bg: 'bg-amber-50', trend: '+3.1%', up: true },
    { label: 'Active Work Orders', value: kpis.activeWorkOrders.toString(), icon: <Factory className="h-5 w-5" />, color: 'text-orange-600', bg: 'bg-orange-50', trend: '-2.4%', up: false },
    { label: 'Pending Shipments', value: kpis.pendingShipments.toString(), icon: <Truck className="h-5 w-5" />, color: 'text-cyan-600', bg: 'bg-cyan-50', trend: '+5.7%', up: true },
    { label: 'Low Stock Alerts', value: kpis.lowStockItems.toString(), icon: <AlertTriangle className="h-5 w-5" />, color: 'text-red-600', bg: 'bg-red-50', trend: `${kpis.lowStockItems} items`, up: false },
    { label: 'Total Designs', value: kpis.totalProducts.toString(), icon: <BoxIcon className="h-5 w-5" />, color: 'text-teal-600', bg: 'bg-teal-50', trend: 'Active', up: true },
    { label: 'Total Customers', value: kpis.totalCustomers.toString(), icon: <Users className="h-5 w-5" />, color: 'text-pink-600', bg: 'bg-pink-50', trend: '+15.3%', up: true },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{kpi.value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.up ? 'text-amber-600' : 'text-red-500'}`}>{kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{kpi.trend}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}><span className={kpi.color}>{kpi.icon}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Revenue Overview</CardTitle><CardDescription>Monthly sales &amp; making charges</CardDescription></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}><AreaChart data={revenueData}><defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d97706" stopOpacity={0.3} /><stop offset="95%" stopColor="#d97706" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(value: number) => formatCurrency(value)} /><Area type="monotone" dataKey="value" stroke="#d97706" fill="url(#colorRev)" strokeWidth={2} /></AreaChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Sales by Category</CardTitle><CardDescription>Revenue by jewellery type</CardDescription></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={data.salesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{data.salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => formatCurrency(value)} /></PieChart></ResponsiveContainer></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Vault &amp; Workshop Utilization</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}><BarChart data={data.inventoryByWarehouse}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="totalItems" fill="#d97706" radius={[4, 4, 0, 0]} name="Items" /><Bar dataKey="capacity" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Capacity" /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Order Status Distribution</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={280}><BarChart data={data.orderStatusDist}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="value" radius={[4, 4, 0, 0]} name="Orders">{data.orderStatusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Top Selling Designs</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="text-right">Qty Sold</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader><TableBody>{data.topProducts.map((p, i) => <TableRow key={i}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-right">{p.quantity}</TableCell><TableCell className="text-right">{formatCurrency(p.revenue)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">{data.recentActivity.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">{a.type === 'purchase_order' ? <FileText className="h-4 w-4 text-blue-500" /> : a.type === 'work_order' ? <Cog className="h-4 w-4 text-orange-500" /> : <ShoppingCart className="h-4 w-4 text-emerald-500" />}</span>
                <div><p className="text-sm font-medium">{a.description}</p><p className="text-xs text-gray-500">{formatDate(a.time)}</p></div>
              </div>
              <StatusBadge status={a.status} />
            </div>))}</div></CardContent></Card>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// INVENTORY MODULE
// ═══════════════════════════════════════════
function InventoryModule() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('products')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: 0, costPrice: 0, categoryId: '', minStockLevel: 10, unit: 'piece' })
  const [refreshKey, setRefreshKey] = useState(0)

  const productsUrl = useMemo(() => `/api/products?${new URLSearchParams({ ...(search && { search }), ...(filterCategory !== 'all' && { category: filterCategory }), _r: String(refreshKey) }).toString()}`, [search, filterCategory, refreshKey])
  const { data: products = [] } = useApi<Product[]>('products', productsUrl)
  const { data: warehouses = [] } = useApi<Warehouse[]>('warehouses', '/api/warehouses')
  const { data: categories = [] } = useApi<{ id: string; name: string }[]>('categories', '/api/categories')

  const handleAddProduct = async () => {
    try {
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProduct) })
      if (res.ok) { toast.success('Product added!'); setShowAddProduct(false); setNewProduct({ name: '', sku: '', price: 0, costPrice: 0, categoryId: '', minStockLevel: 10, unit: 'piece' }); setRefreshKey(k => k + 1) }
      else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to add product') }
  }

  const getTotalStock = (p: Product) => p.inventoryItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" /></div>
          <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-48"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogTrigger asChild><Button className="bg-amber-600 hover:bg-amber-700"><PlusIcon className="h-4 w-4 mr-2" />Add Product</Button></DialogTrigger>
          <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>SKU</Label><Input value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Selling Price</Label><Input type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: +e.target.value }))} /></div>
                <div><Label>Cost Price</Label><Input type="number" value={newProduct.costPrice} onChange={e => setNewProduct(p => ({ ...p, costPrice: +e.target.value }))} /></div>
              </div>
              <div><Label>Category</Label><Select value={newProduct.categoryId} onValueChange={v => setNewProduct(p => ({ ...p, categoryId: v }))}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Min Stock Level</Label><Input type="number" value={newProduct.minStockLevel} onChange={e => setNewProduct(p => ({ ...p, minStockLevel: +e.target.value }))} /></div>
                <div><Label>Unit</Label><Select value={newProduct.unit} onValueChange={v => setNewProduct(p => ({ ...p, unit: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="piece">Piece</SelectItem><SelectItem value="gram">Gram</SelectItem><SelectItem value="carat">Carat</SelectItem><SelectItem value="meter">Meter</SelectItem></SelectContent></Select></div>
              </div>
              <Button onClick={handleAddProduct} className="w-full bg-amber-600 hover:bg-amber-700">Add Product</Button>
            </div></DialogContent>
        </Dialog>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="products">Products &amp; Designs</TabsTrigger><TabsTrigger value="warehouses">Vaults &amp; Workshop</TabsTrigger><TabsTrigger value="low-stock">Low Stock Alerts</TabsTrigger></TabsList>
        <TabsContent value="products" className="mt-4">
          <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Stock</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{products.map(p => { const stock = getTotalStock(p); const isLow = stock <= p.minStockLevel; return (
              <TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-gray-500">{p.sku}</TableCell><TableCell><Badge variant="outline" style={{ borderColor: p.category?.color, color: p.category?.color }}>{p.category?.name}</Badge></TableCell><TableCell className="text-right">{formatCurrency(p.price)}</TableCell><TableCell className="text-right">{formatCurrency(p.costPrice)}</TableCell><TableCell className="text-right font-medium">{stock}</TableCell><TableCell>{isLow ? <Badge className="bg-red-100 text-red-700 border-0"><AlertTriangle className="h-3 w-3 mr-1 inline" />Low</Badge> : <Badge className="bg-amber-100 text-amber-700 border-0"><CheckCircle className="h-3 w-3 mr-1 inline" />OK</Badge>}</TableCell></TableRow>)})}</TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="warehouses" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{warehouses.map(wh => { const totalItems = wh.inventoryItems.reduce((s, i) => s + i.quantity, 0); const util = Math.round((totalItems / wh.capacity) * 100); return (
            <Card key={wh.id}><CardHeader className="pb-2"><CardTitle className="text-base">{wh.name}</CardTitle><CardDescription>{wh.code} · {wh.city}</CardDescription></CardHeader><CardContent><div className="space-y-3"><p className="text-sm text-gray-500">Manager: {wh.manager}</p><p className="text-sm text-gray-500">Items: {totalItems} / {wh.capacity}</p><Progress value={util} className="h-2" /><p className="text-xs text-gray-500">{util}% utilized</p></div></CardContent></Card>)})}</div>
        </TabsContent>
        <TabsContent value="low-stock" className="mt-4">
          <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Current Stock</TableHead><TableHead className="text-right">Min Level</TableHead><TableHead>Severity</TableHead></TableRow></TableHeader>
            <TableBody>{products.filter(p => getTotalStock(p) <= p.minStockLevel * 1.5).map(p => { const stock = getTotalStock(p); const severity = stock === 0 ? 'Out of Stock' : stock <= p.minStockLevel ? 'Critical' : 'Warning'; const sevColor = stock === 0 ? 'bg-red-100 text-red-700' : stock <= p.minStockLevel ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'; return (
              <TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell>{p.sku}</TableCell><TableCell className="text-right font-medium">{stock}</TableCell><TableCell className="text-right">{p.minStockLevel}</TableCell><TableCell><Badge className={`${sevColor} border-0`}>{severity}</Badge></TableCell></TableRow>)})}</TableBody></Table></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════
// SUPPLY CHAIN MODULE
// ═══════════════════════════════════════════
function SupplyChainModule() {
  const [activeTab, setActiveTab] = useState('suppliers')
  const { data: suppliers = [] } = useApi<Supplier[]>('suppliers', '/api/suppliers')
  const { data: purchaseOrders = [] } = useApi<PurchaseOrder[]>('purchaseOrders', '/api/purchase-orders')
  const { data: shipments = [] } = useApi<Shipment[]>('shipments', '/api/shipments')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="suppliers">Suppliers</TabsTrigger><TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger><TabsTrigger value="shipments">Shipments</TabsTrigger></TabsList>
        <TabsContent value="suppliers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{suppliers.map(s => (
            <Card key={s.id} className="hover:shadow-md transition"><CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-base">{s.name}</CardTitle><Badge variant="outline">{s.code}</Badge></div><CardDescription>{s.city}, {s.country}</CardDescription></CardHeader>
              <CardContent><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">Rating</span><RatingStars rating={s.rating} /></div><div className="flex justify-between"><span className="text-gray-500">Lead Time</span><span className="font-medium">{s.leadTimeDays} days</span></div><div className="flex justify-between"><span className="text-gray-500">Payment Terms</span><span className="font-medium">{s.paymentTerms}</span></div><div className="flex justify-between"><span className="text-gray-500">Orders</span><span className="font-medium">{s._count.purchaseOrders}</span></div><Separator /><div className="text-xs text-gray-500">{s.email} · {s.phone}</div></div></CardContent></Card>))}</div>
        </TabsContent>
        <TabsContent value="purchase-orders" className="mt-4">
          <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>PO Number</TableHead><TableHead>Supplier</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Order Date</TableHead><TableHead>Items</TableHead></TableRow></TableHeader>
            <TableBody>{purchaseOrders.map(po => <TableRow key={po.id}><TableCell className="font-medium">{po.poNumber}</TableCell><TableCell>{po.supplier.name}</TableCell><TableCell><StatusBadge status={po.status} /></TableCell><TableCell className="text-right">{formatCurrency(po.totalAmount)}</TableCell><TableCell>{formatDate(po.orderDate)}</TableCell><TableCell>{po.items.length} items</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="shipments" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{['pending', 'shipped', 'in_transit', 'delivered'].map(status => (
            <div key={status}><h3 className="text-sm font-semibold mb-3 flex items-center gap-2 capitalize">{status === 'pending' && <Clock className="h-4 w-4 text-amber-500" />}{status === 'shipped' && <TruckIcon className="h-4 w-4 text-blue-500" />}{status === 'in_transit' && <MapPin className="h-4 w-4 text-purple-500" />}{status === 'delivered' && <PackageCheck className="h-4 w-4 text-emerald-500" />}{status.replace(/_/g, ' ')}<Badge variant="secondary" className="text-xs">{shipments.filter(s => s.status === status).length}</Badge></h3>
              <div className="space-y-3">{shipments.filter(s => s.status === status).map(s => (
                <Card key={s.id} className="hover:shadow-md transition"><CardContent className="p-3"><p className="font-medium text-sm">{s.shipmentNumber}</p><p className="text-xs text-gray-500 mt-1">{s.carrier}</p><div className="flex justify-between mt-2 text-xs"><span>{s.origin || '—'}</span><span>→</span><span>{s.destination || '—'}</span></div>{s.trackingNumber && <p className="text-xs text-gray-400 mt-1">Track: ...{s.trackingNumber.slice(-8)}</p>}<div className="flex justify-between mt-2"><span className="text-xs font-medium">{formatCurrency(s.cost)}</span><StatusBadge status={s.status} /></div></CardContent></Card>))}</div></div>))}</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════
// MANUFACTURING MODULE
// ═══════════════════════════════════════════
function ManufacturingModule() {
  const [activeTab, setActiveTab] = useState('work-orders')
  const { data: workOrders = [] } = useApi<WorkOrder[]>('workOrders', '/api/work-orders')
  const { data: bomProducts = [] } = useApi<BomProduct[]>('bom', '/api/bom')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="work-orders">Work Orders</TabsTrigger><TabsTrigger value="bom">Bill of Materials</TabsTrigger><TabsTrigger value="production">Production Progress</TabsTrigger></TabsList>
        <TabsContent value="work-orders" className="mt-4">
          <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>WO Number</TableHead><TableHead>Product</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead className="text-right">Target</TableHead><TableHead className="text-right">Completed</TableHead><TableHead>Progress</TableHead></TableRow></TableHeader>
            <TableBody>{workOrders.map(wo => { const wp = wo.products[0]; const progress = wp ? Math.round((wp.completedQty / wp.targetQty) * 100) : 0; return (
              <TableRow key={wo.id}><TableCell className="font-medium">{wo.woNumber}</TableCell><TableCell>{wp?.product.name || 'N/A'}</TableCell><TableCell><StatusBadge status={wo.status} /></TableCell><TableCell><PriorityBadge priority={wo.priority} /></TableCell><TableCell className="text-right">{wp?.targetQty || 0}</TableCell><TableCell className="text-right">{wp?.completedQty || 0}</TableCell><TableCell><div className="flex items-center gap-2"><Progress value={progress} className="h-2 w-20" /><span className="text-xs">{progress}%</span></div></TableCell></TableRow>)})}</TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="bom" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{bomProducts.map(p => (
            <Card key={p.id}><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base">{p.name}</CardTitle><Badge variant="outline">{p.sku}</Badge></div></CardHeader>
              <CardContent><div className="space-y-2"><p className="text-sm text-gray-500 font-medium">Components Required:</p>{p.bomComponents.map((comp, i) => (<div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"><span className="font-medium">{comp.component.name}</span><span className="text-gray-500">x {comp.quantity}</span></div>))}</div></CardContent></Card>))}</div>
        </TabsContent>
        <TabsContent value="production" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{workOrders.filter(wo => wo.status === 'in_progress').map(wo => { const wp = wo.products[0]; const progress = wp ? Math.round((wp.completedQty / wp.targetQty) * 100) : 0; return (
            <Card key={wo.id}><CardHeader className="pb-2"><CardTitle className="text-base">{wo.woNumber}</CardTitle><CardDescription>{wp?.product.name}</CardDescription></CardHeader>
              <CardContent><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-gray-500">Progress</span><span className="font-medium">{wp?.completedQty}/{wp?.targetQty}</span></div><Progress value={progress} className="h-3" /><div className="flex justify-between text-sm"><span className="text-gray-500">Wastage</span><span className="font-medium text-red-500">{wp?.wastageQty || 0}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">Priority</span><PriorityBadge priority={wo.priority} /></div></div></CardContent></Card>)})}</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════
// POS MODULE (Counter Sale)
// ═══════════════════════════════════════════
function POSModule() {
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([])
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [productSearch, setProductSearch] = useState('')
  const { data: allProducts = [] } = useApi<Product[]>('posProducts', '/api/products')

  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))

  const addToCart = (product: Product) => {
    setCart(prev => { const existing = prev.find(c => c.product.id === product.id); if (existing) return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c); return [...prev, { product, qty: 1 }] })
  }
  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, qty: Math.max(1, c.qty + delta) } : c))
  }
  const removeFromCart = (productId: string) => setCart(prev => prev.filter(c => c.product.id !== productId))

  const subtotal = cart.reduce((sum, c) => sum + c.product.price * c.qty, 0)
  const tax = Math.round(subtotal * 0.03)
  const total = subtotal + tax - discount

  const handleCompleteSale = async () => {
    if (cart.length === 0) return
    try {
      const items = cart.map(c => ({ productId: c.product.id, productName: c.product.name, quantity: c.qty, unitPrice: c.product.price, totalPrice: c.product.price * c.qty }))
      const res = await fetch('/api/pos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, customerName, paymentMethod, discount }) })
      if (res.ok) { toast.success('Sale completed!'); setCart([]); setCustomerName(''); setDiscount(0) }
      else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Sale failed') }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col">
        <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="pl-9" /></div>
        <div className="flex-1 overflow-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="text-left p-3 border rounded-lg hover:border-amber-400 hover:shadow transition bg-white dark:bg-gray-900">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-xs text-gray-500">{p.sku}</p>
              <p className="text-amber-600 font-bold mt-1">{formatCurrency(p.price)}</p>
            </button>
          ))}
        </div>
      </div>
      {/* Cart */}
      <div className="w-96 border rounded-lg bg-white dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b"><h2 className="font-bold text-lg">Counter Sale</h2></div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 && <p className="text-gray-400 text-center py-8">Cart is empty</p>}
          {cart.map(c => (
            <div key={c.product.id} className="flex items-center gap-3 border-b pb-2">
              <div className="flex-1"><p className="text-sm font-medium">{c.product.name}</p><p className="text-xs text-gray-500">{formatCurrency(c.product.price)} each</p></div>
              <div className="flex items-center gap-1"><Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(c.product.id, -1)}><Minus className="h-3 w-3" /></Button><span className="w-8 text-center text-sm">{c.qty}</span><Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(c.product.id, 1)}><PlusIcon className="h-3 w-3" /></Button></div>
              <p className="text-sm font-medium w-20 text-right">{formatCurrency(c.product.price * c.qty)}</p>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => removeFromCart(c.product.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
        <div className="border-t p-4 space-y-3">
          <div><Label className="text-xs">Customer Name</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in Customer" className="h-8" /></div>
          <div className="flex gap-2"><div className="flex-1"><Label className="text-xs">Payment</Label><Select value={paymentMethod} onValueChange={setPaymentMethod}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cash"><Banknote className="h-3 w-3 mr-1 inline" />Cash</SelectItem><SelectItem value="card"><CreditCard className="h-3 w-3 mr-1 inline" />Card</SelectItem><SelectItem value="upi"><Smartphone className="h-3 w-3 mr-1 inline" />UPI</SelectItem></SelectContent></Select></div><div className="w-24"><Label className="text-xs">Discount</Label><Input type="number" value={discount} onChange={e => setDiscount(+e.target.value)} className="h-8" /></div></div>
          <Separator />
          <div className="space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>Tax (3%)</span><span>{formatCurrency(tax)}</span></div>{discount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}<div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-amber-600">{formatCurrency(total)}</span></div></div>
          <Button onClick={handleCompleteSale} disabled={cart.length === 0} className="w-full bg-amber-600 hover:bg-amber-700 h-10">Complete Sale</Button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// ECOMMERCE MODULE
// ═══════════════════════════════════════════
function EcommerceModule() {
  const { data: orders = [] } = useApi<EcommerceOrder[]>('ecommerce', '/api/ecommerce')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Total Orders', value: orders.length, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-amber-600' }, { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600' }, { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: <PackageCheck className="h-5 w-5" />, color: 'text-emerald-600' }, { label: 'Revenue', value: formatCurrency(orders.reduce((s, o) => s + o.totalAmount, 0)), icon: <DollarSign className="h-5 w-5" />, color: 'text-amber-600' }].map((kpi, i) => (
          <Card key={i}><CardContent className="p-4 flex items-center gap-4"><span className={kpi.color}>{kpi.icon}</span><div><p className="text-xs text-gray-500">{kpi.label}</p><p className="text-xl font-bold">{kpi.value}</p></div></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Order Number</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Items</TableHead></TableRow></TableHeader>
        <TableBody>{orders.map(o => (<TableRow key={o.id}><TableCell className="font-medium">{o.orderNumber}</TableCell><TableCell>{o.customer.name}</TableCell><TableCell><StatusBadge status={o.status} /></TableCell><TableCell><Badge className={o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 border-0' : 'bg-amber-100 text-amber-800 border-0'}>{o.paymentStatus}</Badge></TableCell><TableCell className="text-right">{formatCurrency(o.totalAmount)}</TableCell><TableCell>{o.items.length} items</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  )
}

// ═══════════════════════════════════════════
// AI INSIGHTS MODULE
// ═══════════════════════════════════════════
function AIInsightsModule() {
  const [activeTab, setActiveTab] = useState('forecast')
  const { data, isLoading } = useApi<{ forecastByProduct: Record<string, { period: string; predictedDemand: number; confidence: number; model: string; productName: string }[]>; optimizationSuggestions: { product: string; warehouse: string; currentStock: number; reorderPoint: number; suggestedOrderQty: number; status: string }[]; salesTrend: { date: string; revenue: number }[]; anomalies: { type: string; product: string; severity: string; message: string }[] }>('aiForecast', '/api/ai/forecast')

  if (isLoading || !data) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}</div>

  const forecastChartData = Object.entries(data.forecastByProduct).flatMap(([, items]) => items.map(item => ({ period: item.period, demand: item.predictedDemand, confidence: Math.round(item.confidence * 100), product: item.productName })))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-2 rounded-lg bg-purple-50"><Target className="h-5 w-5 text-purple-600" /></div><div><p className="text-xs text-gray-500">Forecast Products</p><p className="text-xl font-bold">{Object.keys(data.forecastByProduct).length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-2 rounded-lg bg-amber-50"><AlertTriangle className="h-5 w-5 text-amber-600" /></div><div><p className="text-xs text-gray-500">Anomalies</p><p className="text-xl font-bold">{data.anomalies.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-2 rounded-lg bg-emerald-50"><Activity className="h-5 w-5 text-emerald-600" /></div><div><p className="text-xs text-gray-500">Optimization Items</p><p className="text-xl font-bold">{data.optimizationSuggestions.length}</p></div></CardContent></Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="forecast">Demand Forecast</TabsTrigger><TabsTrigger value="optimization">Inventory Optimization</TabsTrigger><TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger></TabsList>
        <TabsContent value="forecast" className="mt-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">Demand Forecast</CardTitle><CardDescription>AI-powered 3-month demand predictions</CardDescription></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={forecastChartData}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="period" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Line type="monotone" dataKey="demand" stroke="#d97706" strokeWidth={2} name="Predicted Demand" /><Line type="monotone" dataKey="confidence" stroke="#6366f1" strokeWidth={1} strokeDasharray="5 5" name="Confidence %" /></LineChart></ResponsiveContainer></CardContent></Card>
        </TabsContent>
        <TabsContent value="optimization" className="mt-4">
          <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Warehouse</TableHead><TableHead className="text-right">Current Stock</TableHead><TableHead className="text-right">Reorder Point</TableHead><TableHead className="text-right">Suggested Order</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{data.optimizationSuggestions.map((item, i) => (<TableRow key={i}><TableCell className="font-medium">{item.product}</TableCell><TableCell>{item.warehouse}</TableCell><TableCell className="text-right">{item.currentStock}</TableCell><TableCell className="text-right">{item.reorderPoint}</TableCell><TableCell className="text-right font-medium">{item.suggestedOrderQty}</TableCell><TableCell><Badge className={item.status === 'critical' ? 'bg-red-100 text-red-700 border-0' : item.status === 'warning' ? 'bg-amber-100 text-amber-700 border-0' : 'bg-emerald-100 text-emerald-700 border-0'}>{item.status}</Badge></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="anomalies" className="mt-4">
          <div className="space-y-3">{data.anomalies.length === 0 && <Card><CardContent className="p-6 text-center text-gray-500">No anomalies detected</CardContent></Card>}
            {data.anomalies.map((a, i) => (<Card key={i} className={`border-l-4 ${a.severity === 'critical' ? 'border-l-red-500' : a.severity === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'}`}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="font-medium">{a.product}</p><p className="text-sm text-gray-500 mt-1">{a.message}</p></div><Badge className={a.severity === 'critical' ? 'bg-red-100 text-red-700 border-0' : a.severity === 'warning' ? 'bg-amber-100 text-amber-700 border-0' : 'bg-blue-100 text-blue-700 border-0'}>{a.severity}</Badge></div></CardContent></Card>))}</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
