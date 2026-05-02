import { create } from 'zustand'

type Module = 'dashboard' | 'inventory' | 'supply-chain' | 'manufacturing' | 'pos' | 'ecommerce' | 'ai-insights'

interface ERPState {
  activeModule: Module
  sidebarOpen: boolean
  setActiveModule: (module: Module) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useERPStore = create<ERPState>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: false,
  setActiveModule: (module) => set({ activeModule: module }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
