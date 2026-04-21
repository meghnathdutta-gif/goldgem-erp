'use client'

import { useERPStore, type ModuleKey } from '@/store/erp-store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Truck,
  Factory,
  ShoppingCart,
  Globe,
  Brain,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'inventory', label: 'Inventory', icon: Package },
  { key: 'supply-chain', label: 'Supply Chain', icon: Truck },
  { key: 'manufacturing', label: 'Manufacturing', icon: Factory },
  { key: 'pos', label: 'Point of Sale', icon: ShoppingCart },
  { key: 'ecommerce', label: 'E-Commerce', icon: Globe },
  { key: 'ai-insights', label: 'AI Insights', icon: Brain },
]

export function AppSidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar } = useERPStore()

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 220 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-screen flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 gap-3 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-base font-bold tracking-tight">NexERP</h1>
                <p className="text-[10px] text-sidebar-foreground/60">Enterprise Suite</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeModule === item.key
            const Icon = item.icon
            const button = (
              <button
                key={item.key}
                onClick={() => setActiveModule(item.key)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  sidebarCollapsed && 'justify-center px-0'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive && 'drop-shadow-sm')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return button
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
