import { create } from 'zustand'

export type ModuleKey = 'dashboard' | 'inventory' | 'supply-chain' | 'manufacturing' | 'pos' | 'ecommerce' | 'ai-insights'

interface ERPState {
  activeModule: ModuleKey
  sidebarCollapsed: boolean
  setActiveModule: (m: ModuleKey) => void
  toggleCollapsed: () => void
}

export const useERPStore = create<ERPState>((set) => ({
  activeModule: 'dashboard',
  sidebarCollapsed: false,
  setActiveModule: (m) => set({ activeModule: m }),
  toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
