import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware'; 
import { Order, OrderStatus } from '@/types/pos';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateItemStatus: (orderId: string, itemIndex: number, status: OrderStatus) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  clearOrders: () => void; 
}

const orderPersistOptions: PersistOptions<OrderStore> = {
  name: 'pos-order-storage',
  skipHydration: true, 
  partialize: (state) => ({ orders: state.orders }),
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (order) => {
        set((state) => ({
          orders: [...state.orders, order],
        }));
      },
      
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
          ),
        }));
      },

      updateItemStatus: (orderId, itemIndex, status) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;

            const newItems = [...order.items];
            if (newItems[itemIndex]) {
              // ✨ NOVO: Adiciona um timestamp individual ao item clicado
              newItems[itemIndex] = { 
                ...newItems[itemIndex], 
                status,
                lastModified: new Date().getTime() 
              };
            }

            return { 
              ...order, 
              items: newItems,
              updatedAt: new Date() 
            };
          }),
        }));
      },
      
      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },
      
      clearOrders: () => set({ orders: [] }),
    }),
    orderPersistOptions
  )
);