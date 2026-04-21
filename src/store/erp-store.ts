import { create } from 'zustand'

export type ModuleKey = 'dashboard' | 'inventory' | 'supply-chain' | 'manufacturing' | 'pos' | 'ecommerce' | 'ai-insights'

interface ERPState {
  activeModule: ModuleKey
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setActiveModule: (module: ModuleKey) => void
  toggleSidebar: () => void
  toggleCollapsed: () => void
}

export const useERPStore = create<ERPState>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  sidebarCollapsed: false,
  setActiveModule: (module) => set({ activeModule: module }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
