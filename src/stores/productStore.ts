// src/stores/productStore.ts

import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware'; 
import { Product, CartItem } from '@/types/pos'; 
import { categories } from '@/data/products';

// Interface do Store
interface ProductState {
    products: Product[];
    addProduct: (product: Product) => void;
    editProduct: (id: string, updatedProduct: Omit<Product, 'id'>) => void; 
    removeProduct: (id: string) => void;
    decreaseStock: (items: CartItem[]) => void; 
}

// Produtos iniciais
const initialProducts: Product[] = [
    // Lanches
    { id: 'l1', name: 'X-Burger', price: 18.90, category: 'lanches', emoji: '🍔', costPrice: 0, stockQuantity: 0 },
    { id: 'l2', name: 'X-Salada', price: 20.90, category: 'lanches', emoji: '🥗', costPrice: 0, stockQuantity: 0 },
    // Bebidas
    { id: 'b1', name: 'Coca-Cola', price: 6.90, category: 'bebidas', emoji: '🥤', costPrice: 0, stockQuantity: 0 },
    { id: 'b2', name: 'Guaraná', price: 6.90, category: 'bebidas', emoji: '🥤', costPrice: 0, stockQuantity: 0 },
    // Pizzas
    { id: 'p1', name: 'Margherita', price: 45.90, category: 'pizzas', emoji: '🍕', costPrice: 0, stockQuantity: 0 },
];

// Configuração do Persist
const productPersistOptions: PersistOptions<ProductState> = {
    name: 'pos-product-storage',
    // ⚠️ ALTERAÇÃO: 'skipHydration: true' foi removido para garantir o carregamento correto.
};

export const useProductStore = create<ProductState>()(
    persist(
        (set) => ({
            products: initialProducts,
            
            addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),

            editProduct: (id, updatedProduct) => set((state) => ({
                products: state.products.map(product => 
                    product.id === id 
                        ? { ...product, ...updatedProduct } 
                        : product
                ),
            })),

            removeProduct: (id) => set((state) => ({
                products: state.products.filter(product => product.id !== id),
            })),
            
            decreaseStock: (items) =>
                set((state) => {
                    const stockChanges = items.reduce((acc, item) => {
                        acc[item.product.id] = (acc[item.product.id] || 0) + item.quantity;
                        return acc;
                    }, {} as Record<string, number>);

                    const updatedProducts = state.products.map((product) => {
                        const quantityToDecrease = stockChanges[product.id];
                        
                        if (quantityToDecrease) {
                            const currentStock = product.stockQuantity || 0; 
                            const newStock = Math.max(0, currentStock - quantityToDecrease); 
                            
                            return {
                                ...product,
                                stockQuantity: newStock,
                            };
                        }
                        return product;
                    });

                    return { products: updatedProducts };
                }),
        }),
        productPersistOptions
    )
);