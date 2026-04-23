'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  LayoutDashboard, Package, Truck, Factory, ShoppingCart, Store, Brain,
  ChevronLeft, ChevronRight, Bell, Moon, Sun, Search, Plus,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, Clock,
  XCircle, TrendingUp, DollarSign, BarChart3, Users, BoxIcon,
  FileText, TruckIcon, Menu, RefreshCw, Minus, Plus as PlusIcon,
  CreditCard, Banknote, Smartphone, Trash2, Eye, MapPin,
  PackageCheck, PackageX, Cog, Target, Activity
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'

// Data fetching helper using TanStack Query
function useApi<T>(key: string, url: string | null) {
  return useQuery<T>({
    queryKey: [key, url],
    queryFn: async () => {
      if (!url) return null as unknown as T
      const res = await fetch(url)
      if (!res.ok) throw new Error('Fetch failed')
      return res.json()
    },
    enabled: !!url,
    staleTime: 30000,
  })
}

// ============================================
// TYPES
// ============================================
interface KPIs {
  totalRevenue: number; totalOrders: number; inventoryValue: number;
  totalProducts: number; activeWorkOrders: number; pendingShipments: number;
  lowStockItems: number; totalCustomers: number;
}

interface Product {
  id: string; name: string; sku: string; price: number; costPrice: number;
  categoryId: string; category: { id: string; name: string; color: string };
  minStockLevel: number; unit: string; isManufactured: boolean; isActive: boolean;
  inventoryItems: { quantity: number; reservedQty: number; warehouse: { name: string } }[];
}

interface Supplier {
  id: string; name: string; code: string; email: string; phone: string;
  city: string; country: string; rating: number; leadTimeDays: number;
  paymentTerms: string; isActive: boolean; _count: { purchaseOrders: number };
}

interface PurchaseOrder {
  id: string; poNumber: string; status: string; totalAmount: number;
  taxAmount: number; orderDate: string; expectedDate: string | null;
  supplier: { name: string };
  items: { product: { name: string }; quantity: number; unitPrice: number; totalPrice: number; receivedQty: number }[];
}

interface Shipment {
  id: string; shipmentNumber: string; status: string; carrier: string;
  trackingNumber: string; origin: string; destination: string;
  shippingDate: string | null; deliveryDate: string | null; cost: number;
  items: { product: { name: string }; quantity: number }[];
}

interface WorkOrder {
  id: string; woNumber: string; status: string; priority: string;
  plannedStart: string | null; plannedEnd: string | null;
  actualStart: string | null; actualEnd: string | null;
  products: { product: { name: string }; targetQty: number; completedQty: number; wastageQty: number }[];
}

interface BomProduct {
  id: string; name: string; sku: string;
  bomComponents: { component: { name: string; sku: string }; quantity: number }[];
}

interface Customer {
  id: string; name: string; email: string; phone: string; city: string; type: string;
  _count: { salesOrders: number; ecommerceOrders: number };
}

interface PosTransaction {
  id: string; transactionNumber: string; customerName: string | null;
  subtotal: number; taxAmount: number; discount: number; totalAmount: number;
  paymentMethod: string; status: string; createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number; totalPrice: number }[];
}

interface EcommerceOrder {
  id: string; orderNumber: string; status: string; totalAmount: number;
  paymentStatus: string; paymentMethod: string; shippingCost: number;
  customer: { name: string }; items: { productName: string; quantity: number; totalPrice: number }[];
}

interface Warehouse {
  id: string; name: string; code: string; city: string; capacity: number; manager: string;
  inventoryItems: { product: { name: string }; quantity: number }[];
}

// ============================================
// CONSTANTS
// ============================================
const COLORS = ['#d97706', '#f59e0b', '#dc2626', '#6366f1', '#06b6d4', '#ec4899', '#94a3b8', '#f97316']
const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-800', delivered: 'bg-emerald-100 text-emerald-800',
  active: 'bg-emerald-100 text-emerald-800', paid: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800', draft: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-amber-100 text-amber-800', planned: 'bg-amber-100 text-amber-800',
  shipped: 'bg-sky-100 text-sky-800', in_transit: 'bg-sky-100 text-sky-800',
  confirmed: 'bg-purple-100 text-purple-800', processing: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800', refunded: 'bg-red-100 text-red-800',
  urgent: 'bg-red-100 text-red-800', partial: 'bg-orange-100 text-orange-800',
  received: 'bg-teal-100 text-teal-800',
}
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

function formatCurrency(amount: number) {
  if (amount >= 100000) return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  return <Badge className={`${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'} text-xs font-medium border-0`}>{status.replace(/_/g, ' ')}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
  return <Badge className={`${PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700'} text-xs font-medium border-0`}>{priority}</Badge>
}

function RatingStars({ rating }: { rating: number }) {
  return <span className="text-amber-500 text-sm">{'★'.repeat(Math.floor(rating))}{rating % 1 >= 0.5 ? '½' : ''}{'☆'.repeat(5 - Math.ceil(rating))} <span className="text-gray-500">{rating.toFixed(1)}</span></span>
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function ERPApp() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleCollapsed } = useERPStore()
  const [isDark, setIsDark] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [seeding, setSeeding] = useState(true)

  useEffect(() => {
    // Check if database is seeded
    const checkSeed = async () => {
      setSeeding(true)
      try {
        const res = await fetch('/api/seed')
        if (res.ok) {
          const data = await res.json()
          if (data.seeded) { setSeeded(true); setSeeded(true) }
        }
      } catch { /* ignore */ }
      setSeeding(false)
    }
    checkSeed()
  }, [])

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-700">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 text-amber-950">G</div>
          {!sidebarCollapsed && <span className="font-bold text-lg tracking-tight">Gold<span className="text-amber-400">Gem</span></span>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => setActiveModule(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                ${activeModule === item.key ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button onClick={toggleCollapsed} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition text-sm">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {NAV_ITEMS.find(n => n.key === activeModule)?.label || 'Dashboard'}
            </h1>
            {seeding && <span className="text-xs text-gray-500 flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Loading data...</span>}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 text-sm font-medium">V</div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vikram</span>
            </div>
          </div>
        </header>

        {/* Module Content */}
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

// ============================================
// DASHBOARD MODULE
// ============================================
function DashboardModule() {
  const { data, isLoading } = useApi<{
    kpis: KPIs; revenueByMonth: Record<string, number>;
    salesByCategory: { name: string; value: number }[];
    orderStatusDist: { name: string; value: number }[];
    inventoryByWarehouse: { name: string; totalItems: number; capacity: number; utilization: number }[];
    recentActivity: { type: string; description: string; status: string; time: string }[];
    topProducts: { name: string; quantity: number; revenue: number }[];
  }>('dashboard', '/api/dashboard')

  if (isLoading || !data) return <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div>

  const kpis = data.kpis
  const revenueData = Object.entries(data.revenueByMonth).map(([name, value]) => ({ name, value: Math.round(value) }))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue), icon: <DollarSign className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+12.5%', up: true },
          { label: 'Total Orders', value: kpis.totalOrders.toLocaleString(), icon: <BarChart3 className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8.2%', up: true },
          { label: 'Vault Value', value: formatCurrency(kpis.inventoryValue), icon: <Package className="h-5 w-5" />, color: 'text-amber-700', bg: 'bg-amber-50', trend: '+3.1%', up: true },
          { label: 'Active Work Orders', value: kpis.activeWorkOrders.toString(), icon: <Factory className="h-5 w-5" />, color: 'text-orange-600', bg: 'bg-orange-50', trend: '-2.4%', up: false },
          { label: 'Pending Shipments', value: kpis.pendingShipments.toString(), icon: <Truck className="h-5 w-5" />, color: 'text-cyan-600', bg: 'bg-cyan-50', trend: '+5.7%', up: true },
          { label: 'Low Stock Alerts', value: kpis.lowStockItems.toString(), icon: <AlertTriangle className="h-5 w-5" />, color: 'text-red-600', bg: 'bg-red-50', trend: `${kpis.lowStockItems} items`, up: false },
          { label: 'Total Designs', value: kpis.totalProducts.toString(), icon: <BoxIcon className="h-5 w-5" />, color: 'text-teal-600', bg: 'bg-teal-50', trend: 'Active', up: true },
          { label: 'Total Customers', value: kpis.totalCustomers.toString(), icon: <Users className="h-5 w-5" />, color: 'text-pink-600', bg: 'bg-pink-50', trend: '+15.3%', up: true },
        ].map((kpi, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{kpi.value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.up ? 'text-amber-600' : 'text-red-500'}`}>
                    {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{kpi.trend}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <span className={kpi.color}>{kpi.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Overview</CardTitle><CardDescription>Monthly sales & making charges</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/><stop offset="95%" stopColor="#d97706" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="value" stroke="#d97706" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Sales by Category</CardTitle><CardDescription>Revenue by jewellery type</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.salesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Vault & Workshop Utilization</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.inventoryByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="totalItems" fill="#d97706" radius={[4, 4, 0, 0]} name="Items" />
                <Bar dataKey="capacity" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Order Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.orderStatusDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Orders">
                  {data.orderStatusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Top Selling Designs</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="text-right">Qty Sold</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.topProducts.map((p, i) => (
                  <TableRow key={i}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-right">{p.quantity}</TableCell><TableCell className="text-right">{formatCurrency(p.revenue)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {a.type === 'purchase_order' ? <FileText className="h-4 w-4 text-blue-500" /> :
                       a.type === 'work_order' ? <Cog className="h-4 w-4 text-orange-500" /> :
                       <ShoppingCart className="h-4 w-4 text-emerald-500" />}
                    </span>
                    <div><p className="text-sm font-medium">{a.description}</p><p className="text-xs text-gray-500">{formatDate(a.time)}</p></div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// INVENTORY MODULE
// ============================================
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
    } catch { toast.error('Failed to add product') }
  }

  const getTotalStock = (p: Product) => p.inventoryItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" /></div>
          <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-48"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogTrigger asChild><Button className="bg-amber-600 hover:bg-amber-700"><PlusIcon className="h-4 w-4 mr-2" />Add Product</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
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
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="products">Products & Designs</TabsTrigger><TabsTrigger value="warehouses">Vaults & Workshop</TabsTrigger><TabsTrigger value="low-stock">Low Stock Alerts</TabsTrigger></TabsList>

        <TabsContent value="products" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Total Stock</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map(p => {
                  const totalStock = getTotalStock(p)
                  const isLow = totalStock <= p.minStockLevel
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-gray-500">{p.sku}</TableCell>
                      <TableCell><Badge variant="outline" style={{ borderColor: p.category?.color, color: p.category?.color }}>{p.category?.name}</Badge></TableCell>
                      <TableCell className="text-right">{formatCurrency(p.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.costPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{totalStock}</TableCell>
                      <TableCell>{isLow ? <Badge className="bg-red-100 text-red-700 border-0"><AlertTriangle className="h-3 w-3 mr-1" />Low</Badge> : <Badge className="bg-amber-100 text-amber-700 border-0"><CheckCircle className="h-3 w-3 mr-1" />OK</Badge>}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="warehouses" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map(wh => {
              const totalItems = wh.inventoryItems.reduce((s, i) => s + i.quantity, 0)
              const utilization = Math.round((totalItems / wh.capacity) * 100)
              return (
                <Card key={wh.id}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">{wh.name}</CardTitle><CardDescription>{wh.code} · {wh.city}</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div><p className="text-sm text-gray-500">Manager: {wh.manager}</p><p className="text-sm text-gray-500">Items: {totalItems} / {wh.capacity}</p></div>
                      <Progress value={utilization} className="h-2" />
                      <p className="text-xs text-gray-500">{utilization}% utilized</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="low-stock" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Current Stock</TableHead><TableHead className="text-right">Min Level</TableHead><TableHead>Severity</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.filter(p => getTotalStock(p) <= p.minStockLevel * 1.5).map(p => {
                  const stock = getTotalStock(p)
                  const severity = stock === 0 ? 'Out of Stock' : stock <= p.minStockLevel ? 'Critical' : 'Warning'
                  const sevColor = stock === 0 ? 'bg-red-100 text-red-700' : stock <= p.minStockLevel ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell className="text-right font-medium">{stock}</TableCell>
                      <TableCell className="text-right">{p.minStockLevel}</TableCell>
                      <TableCell><Badge className={`${sevColor} border-0`}>{severity}</Badge></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// SUPPLY CHAIN MODULE
// ============================================
function SupplyChainModule() {
  const [activeTab, setActiveTab] = useState('suppliers')
  const { data: suppliers = [] } = useApi<Supplier[]>('suppliers', '/api/suppliers')
  const { data: purchaseOrders = [] } = useApi<PurchaseOrder[]>('pos', '/api/purchase-orders')
  const { data: shipments = [] } = useApi<Shipment[]>('shipments', '/api/shipments')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="suppliers">Suppliers</TabsTrigger><TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger><TabsTrigger value="shipments">Shipments</TabsTrigger></TabsList>

        <TabsContent value="suppliers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <Card key={s.id} className="hover:shadow-md transition">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between"><CardTitle className="text-base">{s.name}</CardTitle><Badge variant="outline">{s.code}</Badge></div>
                  <CardDescription>{s.city}, {s.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Rating</span><RatingStars rating={s.rating} /></div>
                    <div className="flex justify-between"><span className="text-gray-500">Lead Time</span><span className="font-medium">{s.leadTimeDays} days</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Payment Terms</span><span className="font-medium">{s.paymentTerms}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Orders</span><span className="font-medium">{s._count.purchaseOrders}</span></div>
                    <Separator />
                    <div className="text-xs text-gray-500">{s.email} · {s.phone}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchase-orders" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>PO Number</TableHead><TableHead>Supplier</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Order Date</TableHead><TableHead>Items</TableHead></TableRow></TableHeader>
              <TableBody>
                {purchaseOrders.map(po => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.poNumber}</TableCell>
                    <TableCell>{po.supplier.name}</TableCell>
                    <TableCell><StatusBadge status={po.status} /></TableCell>
                    <TableCell className="text-right">{formatCurrency(po.totalAmount)}</TableCell>
                    <TableCell>{formatDate(po.orderDate)}</TableCell>
                    <TableCell>{po.items.length} items</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="shipments" className="mt-4">
          <div className="grid grid-cols-4 gap-4">
            {['pending', 'shipped', 'in_transit', 'delivered'].map(status => (
              <div key={status}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 capitalize">
                  {status === 'pending' && <Clock className="h-4 w-4 text-amber-500" />}
                  {status === 'shipped' && <TruckIcon className="h-4 w-4 text-blue-500" />}
                  {status === 'in_transit' && <MapPin className="h-4 w-4 text-purple-500" />}
                  {status === 'delivered' && <PackageCheck className="h-4 w-4 text-emerald-500" />}
                  {status.replace(/_/g, ' ')}
                  <Badge variant="secondary" className="text-xs">{shipments.filter(s => s.status === status).length}</Badge>
                </h3>
                <div className="space-y-3">
                  {shipments.filter(s => s.status === status).map(s => (
                    <Card key={s.id} className="hover:shadow-md transition">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{s.shipmentNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.carrier}</p>
                        <div className="flex justify-between mt-2 text-xs"><span>{s.origin}</span><span>→</span><span>{s.destination}</span></div>
                        {s.trackingNumber && <p className="text-xs text-gray-400 mt-1">Track: ...{s.trackingNumber.slice(-8)}</p>}
                        <div className="flex justify-between mt-2"><span className="text-xs font-medium">{formatCurrency(s.cost)}</span><StatusBadge status={s.status} /></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// MANUFACTURING MODULE
// ============================================
function ManufacturingModule() {
  const [activeTab, setActiveTab] = useState('work-orders')
  const { data: workOrders = [] } = useApi<WorkOrder[]>('workOrders', '/api/work-orders')
  const { data: bomProducts = [] } = useApi<BomProduct[]>('bom', '/api/bom')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="work-orders">Work Orders</TabsTrigger><TabsTrigger value="bom">Bill of Materials</TabsTrigger><TabsTrigger value="production">Production Progress</TabsTrigger></TabsList>

        <TabsContent value="work-orders" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>WO Number</TableHead><TableHead>Product</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead className="text-right">Target</TableHead><TableHead className="text-right">Completed</TableHead><TableHead>Progress</TableHead></TableRow></TableHeader>
              <TableBody>
                {workOrders.map(wo => {
                  const wp = wo.products[0]
                  const progress = wp ? Math.round((wp.completedQty / wp.targetQty) * 100) : 0
                  return (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium">{wo.woNumber}</TableCell>
                      <TableCell>{wp?.product.name || 'N/A'}</TableCell>
                      <TableCell><StatusBadge status={wo.status} /></TableCell>
                      <TableCell><PriorityBadge priority={wo.priority} /></TableCell>
                      <TableCell className="text-right">{wp?.targetQty || 0}</TableCell>
                      <TableCell className="text-right">{wp?.completedQty || 0}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><Progress value={progress} className="h-2 w-20" /><span className="text-xs">{progress}%</span></div></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="bom" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bomProducts.map(p => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between"><CardTitle className="text-base">{p.name}</CardTitle><Badge variant="outline">{p.sku}</Badge></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 font-medium">Components Required:</p>
                    {p.bomComponents.map((comp, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                        <span className="font-medium">{comp.component.name}</span>
                        <span className="text-gray-500">x {comp.quantity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          <div className="space-y-4">
            {workOrders.filter(wo => wo.status === 'in_progress' || wo.status === 'planned').map(wo => {
              const wp = wo.products[0]
              const progress = wp ? Math.round((wp.completedQty / wp.targetQty) * 100) : 0
              return (
                <Card key={wo.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{wo.woNumber}</span>
                        <PriorityBadge priority={wo.priority} />
                        <StatusBadge status={wo.status} />
                      </div>
                      <span className="text-sm text-gray-500">{wp?.product.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Progress</span><span>{wp?.completedQty || 0} / {wp?.targetQty || 0}</span></div>
                      <Progress value={progress} className="h-3" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Wastage: {wp?.wastageQty || 0}</span>
                        <span>Planned: {formatDate(wo.plannedStart)} - {formatDate(wo.plannedEnd)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// POS MODULE
// ============================================
function POSModule() {
  const { data: products = [] } = useApi<Product[]>('pos-products', '/api/products')
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([])
  const [search, setSearch] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [lastReceipt, setLastReceipt] = useState<PosTransaction | null>(null)
  const [activeTab, setActiveTab] = useState('register')
  const [recentTrx, setRecentTrx] = useState<PosTransaction[]>([])

  useEffect(() => {
    if (activeTab === 'history') {
      fetch('/api/pos').then(r => r.json()).then(setRecentTrx).catch(console.error)
    }
  }, [activeTab])

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id)
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { product, quantity: 1 }]
    })
    toast.success(`${product.name} added to cart`)
  }

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c))
  }

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(c => c.product.id !== productId))

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.quantity, 0)
  const taxAmount = subtotal * 0.05
  const totalAmount = subtotal + taxAmount - discount

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty')
    try {
      const items = cart.map(c => ({ productId: c.product.id, productName: c.product.name, quantity: c.quantity, unitPrice: c.product.price, totalPrice: c.product.price * c.quantity }))
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerName, paymentMethod, discount })
      })
      if (res.ok) {
        const trx = await res.json()
        setLastReceipt(trx)
        setCart([])
        setCustomerName('')
        setDiscount(0)
        toast.success('Transaction completed!')
        setActiveTab('receipt')
      }
    } catch { toast.error('Checkout failed') }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="register">Cash Register</TabsTrigger><TabsTrigger value="history">Recent Transactions</TabsTrigger><TabsTrigger value="receipt">Receipt</TabsTrigger></TabsList>

        <TabsContent value="register" className="mt-4">
          <div className="grid grid-cols-5 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="col-span-3 space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search products by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
              <div className="grid grid-cols-3 gap-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {filteredProducts.slice(0, 30).map(p => (
                  <Card key={p.id} className="cursor-pointer hover:shadow-md hover:border-amber-300 transition-all" onClick={() => addToCart(p)}>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-amber-600">{formatCurrency(p.price)}</span>
                        <span className="text-xs text-gray-400">Stock: {p.inventoryItems.reduce((s, i) => s + i.quantity, 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2"><CardTitle className="text-base">Current Sale</CardTitle></CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-3"><Input placeholder="Customer name (optional)" value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
                  <ScrollArea className="flex-1" style={{ maxHeight: '300px' }}>
                    {cart.length === 0 ? <p className="text-center text-gray-400 py-8">No items in cart</p> :
                    <div className="space-y-2">
                      {cart.map(c => (
                        <div key={c.product.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1"><p className="text-sm font-medium">{c.product.name}</p><p className="text-xs text-gray-500">{formatCurrency(c.product.price)} each</p></div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQty(c.product.id, -1)}><Minus className="h-3 w-3" /></Button>
                            <span className="text-sm font-medium w-6 text-center">{c.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQty(c.product.id, 1)}><PlusIcon className="h-3 w-3" /></Button>
                            <span className="text-sm font-medium w-16 text-right">{formatCurrency(c.product.price * c.quantity)}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => removeFromCart(c.product.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>}
                  </ScrollArea>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between text-sm"><span>Tax (5%)</span><span>{formatCurrency(taxAmount)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-sm text-red-500"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                    <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-amber-600">{formatCurrency(totalAmount)}</span></div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div><Label className="text-xs">Payment Method</Label>
                      <div className="flex gap-2 mt-1">
                        {[{ key: 'cash', icon: <Banknote className="h-4 w-4" />, label: 'Cash' }, { key: 'card', icon: <CreditCard className="h-4 w-4" />, label: 'Card' }, { key: 'upi', icon: <Smartphone className="h-4 w-4" />, label: 'UPI' }].map(pm => (
                          <Button key={pm.key} variant={paymentMethod === pm.key ? 'default' : 'outline'} size="sm" onClick={() => setPaymentMethod(pm.key)} className={paymentMethod === pm.key ? 'bg-amber-600 hover:bg-amber-700' : ''}>
                            {pm.icon}<span className="ml-1">{pm.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Discount ₹" value={discount || ''} onChange={e => setDiscount(+e.target.value)} className="flex-1" />
                      <Button onClick={handleCheckout} className="flex-1 bg-amber-600 hover:bg-amber-700" disabled={cart.length === 0}>
                        <ShoppingCart className="h-4 w-4 mr-2" />Checkout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Trx #</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentTrx.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.transactionNumber}</TableCell>
                    <TableCell>{t.customerName || 'Walk-in'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(t.totalAmount)}</TableCell>
                    <TableCell className="capitalize">{t.paymentMethod}</TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell>{new Date(t.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="receipt" className="mt-4">
          {lastReceipt ? (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center pb-2"><CardTitle>Gold<span className="text-amber-600">Gem</span></CardTitle><CardDescription>Jewellery · Counter Sale Receipt</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Trx #</span><span className="font-mono">{lastReceipt.transactionNumber}</span></div>
                  <div className="flex justify-between text-sm"><span>Customer</span><span>{lastReceipt.customerName || 'Walk-in'}</span></div>
                  <div className="flex justify-between text-sm"><span>Payment</span><span className="capitalize">{lastReceipt.paymentMethod}</span></div>
                  <Separator />
                  {lastReceipt.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm"><span>{item.productName} x{item.quantity}</span><span>{formatCurrency(item.totalPrice)}</span></div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(lastReceipt.subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(lastReceipt.taxAmount)}</span></div>
                  {lastReceipt.discount > 0 && <div className="flex justify-between text-sm text-red-500"><span>Discount</span><span>-{formatCurrency(lastReceipt.discount)}</span></div>}
                  <div className="flex justify-between text-lg font-bold"><span>TOTAL</span><span className="text-amber-600">{formatCurrency(lastReceipt.totalAmount)}</span></div>
                  <p className="text-center text-xs text-gray-400 mt-4">Thank you for choosing GoldGem!</p>
                </div>
              </CardContent>
            </Card>
          ) : <p className="text-center text-gray-400 py-12">No receipt to display. Complete a transaction first.</p>}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// E-COMMERCE MODULE
// ============================================
function EcommerceModule() {
  const [activeTab, setActiveTab] = useState('catalog')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const { data: products = [] } = useApi<Product[]>('eco-products', '/api/products')
  const { data: categories = [] } = useApi<{ id: string; name: string; color: string }[]>('eco-categories', '/api/categories')
  const { data: orders = [] } = useApi<EcommerceOrder[]>('eco-orders', activeTab === 'orders' ? '/api/ecommerce' : null)

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="catalog">Product Catalog</TabsTrigger><TabsTrigger value="orders">Order Management</TabsTrigger></TabsList>

        <TabsContent value="catalog" className="mt-4">
          <div className="flex gap-6">
            <div className="w-48 flex-shrink-0">
              <h3 className="font-semibold mb-3 text-sm">Categories</h3>
              <div className="space-y-1">
                <button onClick={() => setSelectedCategory('all')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedCategory === 'all' ? 'bg-amber-100 text-amber-700 font-medium' : 'hover:bg-gray-100'}`}>All Products</button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedCategory === c.id ? 'bg-amber-100 text-amber-700 font-medium' : 'hover:bg-gray-100'}`}>{c.name}</button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-4"><Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md" /></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.slice(0, 24).map(p => (
                  <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300" />
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-amber-600">{formatCurrency(p.price)}</span>
                        <Badge variant="outline" className="text-xs">{p.category?.name}</Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 text-xs"><ShoppingCart className="h-3 w-3 mr-1" />Add to Cart</Button>
                        <Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Shipping</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.orderNumber}</TableCell>
                    <TableCell>{o.customer.name}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell><StatusBadge status={o.paymentStatus} /></TableCell>
                    <TableCell className="text-right">{formatCurrency(o.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(o.shippingCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// AI INSIGHTS MODULE
// ============================================
function AIInsightsModule() {
  const { data, isLoading } = useApi<{
    forecastDetails: { product: { name: string }; period: string; predictedDemand: number; confidence: number; model: string }[]
    optimizationSuggestions: { product: string; warehouse: string; currentStock: number; avgDailyDemand: number; reorderPoint: number; suggestedOrderQty: number; status: string }[]
    salesTrend: { date: string; revenue: number }[]
    anomalies: { type: string; product: string; severity: string; message: string }[]
  }>('ai-forecast', '/api/ai/forecast')

  if (isLoading || !data) return <div className="space-y-4"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>

  const forecastByPeriod: Record<string, Record<string, string | number>> = {}
  for (const f of data.forecastDetails) {
    if (!forecastByPeriod[f.period]) forecastByPeriod[f.period] = { period: f.period }
    forecastByPeriod[f.period][f.product.name] = f.predictedDemand
  }
  const forecastChartData = Object.values(forecastByPeriod)
  const productNames = [...new Set(data.forecastDetails.map(f => f.product.name))].slice(0, 5)

  return (
    <div className="space-y-6">
      {data.anomalies.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" />Anomaly Detection</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.anomalies.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-900 rounded-lg">
                  <span className={`p-1 rounded ${a.severity === 'critical' ? 'bg-red-100 text-red-600' : a.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {a.severity === 'critical' ? <PackageX className="h-4 w-4" /> : a.severity === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  </span>
                  <span className="text-sm">{a.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-5 w-5 text-amber-500" />Demand Forecast</CardTitle><CardDescription>AI-predicted demand for next 3 months</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                {productNames.map((name, i) => <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />)}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" />Sales Trend Analysis</CardTitle><CardDescription>Daily revenue patterns</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="h-5 w-5 text-purple-500" />Inventory Optimization Suggestions</CardTitle><CardDescription>AI-recommended reorder points and quantities</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Warehouse</TableHead><TableHead className="text-right">Current Stock</TableHead><TableHead className="text-right">Avg Daily Demand</TableHead><TableHead className="text-right">Reorder Point</TableHead><TableHead className="text-right">Suggested Order</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.optimizationSuggestions.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.product}</TableCell>
                  <TableCell>{s.warehouse}</TableCell>
                  <TableCell className="text-right">{s.currentStock}</TableCell>
                  <TableCell className="text-right">{s.avgDailyDemand}</TableCell>
                  <TableCell className="text-right">{s.reorderPoint}</TableCell>
                  <TableCell className="text-right font-medium text-amber-600">{s.suggestedOrderQty}</TableCell>
                  <TableCell>
                    <Badge className={`${s.status === 'critical' ? 'bg-red-100 text-red-700' : s.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-amber-100 text-amber-700'} border-0 capitalize`}>{s.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
