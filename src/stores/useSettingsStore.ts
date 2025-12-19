// src/stores/settingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define os modos de agrupamento de pedidos
export type OrderGroupingMode = 'SINGLE' | 'SPLIT_BY_PREP_TIME';

interface SettingsState {
  // 'SINGLE': Todos os itens em um pedido único.
  // 'SPLIT_BY_PREP_TIME': Cria sub-pedidos separados para itens de preparo rápido e lento.
  orderGrouping: OrderGroupingMode;
  
  // Ações
  setOrderGrouping: (mode: OrderGroupingMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      orderGrouping: 'SINGLE', // Padrão: Pedido Único
      
      setOrderGrouping: (mode) => set({ orderGrouping: mode }),
    }),
    {
      name: 'pos-settings-storage', // Nome para o localStorage
      // A reidratação é tratada pelo middleware 'persist'
    }
  )
);