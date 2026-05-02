'use client'

import { useERPStore } from '@/store/erp-store'
import { DashboardModule } from '@/components/modules/dashboard-module'
import { InventoryModule } from '@/components/modules/inventory-module'
import { SupplyChainModule } from '@/components/modules/supply-chain-module'
import { ManufacturingModule } from '@/components/modules/manufacturing-module'
import { PosModule } from '@/components/modules/pos-module'
import { EcommerceModule } from '@/components/modules/ecommerce-module'
import { AiInsightsModule } from '@/components/modules/ai-insights-module'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Package,
  Truck,
  Hammer,
  ShoppingCart,
  Globe,
  Brain,
  Gem,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

type Module = 'dashboard' | 'inventory' | 'supply-chain' | 'manufacturing' | 'pos' | 'ecommerce' | 'ai-insights'

const navItems: { id: Module; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory & Vault', icon: Package },
  { id: 'supply-chain', label: 'Supply Chain', icon: Truck },
  { id: 'manufacturing', label: 'Manufacturing', icon: Hammer },
  { id: 'pos', label: 'Counter Sale / POS', icon: ShoppingCart },
  { id: 'ecommerce', label: 'Online Store', icon: Globe },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain },
]

function Sidebar() {
  const { activeModule, setActiveModule, sidebarOpen, toggleSidebar, setSidebarOpen } = useERPStore()

  // Fetch low stock count for badge
  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-low-stock'],
    queryFn: () => fetch('/api/inventory?lowStock=true').then(r => r.json()),
    refetchInterval: 60000,
  })

  const lowStockCount = Array.isArray(inventoryData) ? inventoryData.length : 0

  // Auto-close sidebar on mobile when module changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16',
          'lg:relative lg:z-0'
        )}
      >
        {/* Logo area */}
        <div className={cn(
          'flex items-center gap-3 p-4 border-b border-sidebar-border min-h-[64px]',
          !sidebarOpen && 'lg:justify-center lg:p-2'
        )}>
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Gem className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">GoldGem</h1>
              <p className="text-xs text-sidebar-foreground/60 whitespace-nowrap">Jewellery ERP</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden lg:flex h-7 w-7"
            onClick={toggleSidebar}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', !sidebarOpen && 'rotate-180')} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeModule === item.id
              const showBadge = item.id === 'inventory' && lowStockCount > 0

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id)
                    if (window.innerWidth < 1024) setSidebarOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70',
                    !sidebarOpen && 'lg:justify-center lg:px-2'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {showBadge && (
                        <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                          {lowStockCount}
                        </Badge>
                      )}
                    </>
                  )}
                  {!sidebarOpen && showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">AC</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Alex Carter</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

function ModuleContent({ module }: { module: Module }) {
  switch (module) {
    case 'dashboard':
      return <DashboardModule />
    case 'inventory':
      return <InventoryModule />
    case 'supply-chain':
      return <SupplyChainModule />
    case 'manufacturing':
      return <ManufacturingModule />
    case 'pos':
      return <PosModule />
    case 'ecommerce':
      return <EcommerceModule />
    case 'ai-insights':
      return <AiInsightsModule />
    default:
      return <DashboardModule />
  }
}

function MobileHeader() {
  const { toggleSidebar } = useERPStore()

  return (
    <header className="lg:hidden flex items-center gap-3 p-3 border-b bg-background sticky top-0 z-30">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9">
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <Gem className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm">GoldGem ERP</span>
      </div>
    </header>
  )
}

function MobileBottomNav() {
  const { activeModule, setActiveModule } = useERPStore()

  const bottomNavItems: { id: Module; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'ecommerce', label: 'Store', icon: Globe },
    { id: 'ai-insights', label: 'AI', icon: Brain },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activeModule === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                isActive
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-amber-700 dark:text-amber-400')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default function Home() {
  const { activeModule } = useERPStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">
          <ModuleContent module={activeModule} />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  )
}
