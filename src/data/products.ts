// src/data/products.ts

import { Category } from '@/types/pos';

export const categories: Category[] = [
  // 1. Antigo ID 'lanches' se torna 'vendas'
  { id: 'vendas', name: 'Venda', emoji: '🍔' }, 
  
  // 2. Antigo ID 'bebidas' se torna 'estoque'
  { id: 'estoque', name: 'Controle de Estoque', emoji: '🥤' }, 
  
  // 3. Antigo ID 'pizzas' se torna 'financeiro' (e o resto é excluído)
  { id: 'financeiro', name: 'Controle Financeiro', emoji: '💰' }, 
];

// O array 'products' e a função 'getProductsByCategory' permanecem removidos.
// A lista de produtos é gerenciada dinamicamente pelo useProductStore.