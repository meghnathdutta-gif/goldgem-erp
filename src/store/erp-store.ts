import { create } from 'zustand'

export type ModuleKey = 'dashboard' | 'inventory' | 'supply-chain' | 'manufacturing' | 'pos' | 'ecommerce' | 'ai-insights'

interface ERPState {
  activeModule: ModuleKey
  sidebarCollapsed: boolean
  setActiveModule: (module: ModuleKey) => void
  toggleCollapsed: () => void
}

export const useERPStore = create<ERPState>((set) => ({
  activeModule: 'dashboard',
  sidebarCollapsed: false,
  setActiveModule: (module) => set({ activeModule: module }),
  toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
