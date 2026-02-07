import { create } from 'zustand';
import { AppState, ViewType, AdminTabType } from '../types';

export const useAppStore = create<AppState>((set) => ({
  view: 'landing' as ViewType,
  activeAdminTab: 'menu' as AdminTabType,
  loading: false,
  error: null,

  setView: (view: ViewType) => set({ view }),
  
  setActiveAdminTab: (tab: AdminTabType) => set({ activeAdminTab: tab }),
  
  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
}));
