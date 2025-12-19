// src/types/pos.ts

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  // NOVOS CAMPOS PARA PERSISTÊNCIA
  stockQuantity: number; 
  costPrice: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  notes: string;
}

export type OrderStatus = 'NOVO' | 'EM_PREPARO' | 'PRONTO' | 'CONCLUIDO' | 'PAGO';

export type PaymentMethod = 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | null;

export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  createdAt: Date;
  sentToKitchenAt: Date | null;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}