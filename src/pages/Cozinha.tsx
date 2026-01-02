// src/pages/Cozinha.tsx

import { useCallback, useEffect } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { useSettingsStore } from '@/stores/settingsStore'; // Importe o store de configurações
import { KDSColumn } from '@/components/kds/KDSColumn';
import { OrderStatus, Order } from '@/types/pos';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { NON_KITCHEN_CATEGORIES } from '@/pages/ProductManagementPage';

const normalizeOrders = (orders: Order[]): Order[] =>
  orders.map(order => ({
    ...order,
    createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt as any),
    updatedAt: (order as any).updatedAt ? new Date((order as any).updatedAt) : new Date(order.createdAt as any),
  }));

// FUNÇÃO ATUALIZADA: Agora decide como mostrar os itens baseado na configuração
const getDisplayOrders = (orders: Order[], mode: string): any[] => {
  if (mode === 'SINGLE') {
    // Modo Pedido Único: Mostra o pedido inteiro como um bloco só na cozinha
    return orders.filter(order => {
      // Só mostra se houver ao menos um item que não seja bebida/sobremesa
      return order.items.some(item => !NON_KITCHEN_CATEGORIES.includes(item.category?.toLowerCase()));
    });
  }

  // Modo SPLIT ou Padrão: Explode por item (o comportamento que você já tinha)
  const exploded: any[] = [];
  orders.forEach(order => {
    const kitchenOnlyItems = order.items.filter((item: any) => {
      return !NON_KITCHEN_CATEGORIES.includes(item.category?.toLowerCase());
    });

    kitchenOnlyItems.forEach((item: any, index: number) => {
      const currentItemStatus = item.status || order.status;
      exploded.push({
        ...order,
        id: `${order.id}-${index}`, 
        status: currentItemStatus,
        items: [item],
        sortTime: item.lastModified || order.createdAt.getTime()
      });
    });
  });
  return exploded;
};

export default function Cozinha() {
  const { orders, updateItemStatus } = useOrderStore();
  const { orderGrouping } = useSettingsStore(); // Lê a configuração escolhida na SettingsPage

  useEffect(() => {
    useOrderStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate(); // Garante que a configuração seja carregada
  }, []);

  const normalized = normalizeOrders(orders);
  // Usa a nova função de filtragem baseada no modo selecionado
  const displayItems = getDisplayOrders(normalized, orderGrouping);

  const newOrders = displayItems
    .filter(o => o.status === 'NOVO')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const preparingOrders = displayItems
    .filter(o => o.status === 'EM_PREPARO')
    .sort((a, b) => b.sortTime || b.createdAt.getTime() - (a.sortTime || a.createdAt.getTime()));

 const readyOrders = displayItems
  .filter(o => o.status === 'PRONTO')
  // Alterado: Agora ordena pelo tempo de modificação (o mais recente primeiro)
  .sort((a, b) => {
    const timeA = b.sortTime || b.updatedAt?.getTime() || 0;
    const timeB = a.sortTime || a.updatedAt?.getTime() || 0;
    return timeA - timeB;
  });

  const handleMoveToNextStatus = useCallback(
    (virtualId: string) => {
      // Se for modo SINGLE, o ID não tem "-", se for SPLIT, tem.
      const isSplit = virtualId.includes('-');
      
      if (isSplit) {
        const [originalId, indexStr] = virtualId.split('-');
        const itemIndex = parseInt(indexStr);
        const order = orders.find(o => o.id === originalId);
        if (!order) return;
        const currentStatus = order.items[itemIndex].status || order.status;
        const next: Record<OrderStatus, OrderStatus> = {
          NOVO: 'EM_PREPARO',
          EM_PREPARO: 'PRONTO',
          PRONTO: 'CONCLUIDO',
          CONCLUIDO: 'CONCLUIDO',
        };
        updateItemStatus(originalId, itemIndex, next[currentStatus]);
      } else {
        // Lógica para pedido inteiro (Modo SINGLE)
        // Aqui você precisaria de uma função 'updateOrderStatus' no seu store
        // ou rodar um loop em todos os itens do pedido.
      }
    },
    [orders, updateItemStatus]
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 p-4 text-white">
      <header className="flex items-center justify-between mb-6 bg-slate-900 p-4 rounded-2xl border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-full hover:bg-slate-800 border border-slate-700 bg-slate-900">
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </Link>
          <div className="flex items-center gap-3 border-l pl-4 border-slate-700">
            <div className="bg-orange-600 p-2 rounded-lg">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase">Cozinha</h1>
              <p className="text-sm text-slate-400">
                Modo: {orderGrouping === 'SINGLE' ? 'Pedido Único' : 'Separado por Item'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <KDSColumn title="PARA FAZER" status="NOVO" orders={newOrders} onMoveToNextStatus={handleMoveToNextStatus} />
        <KDSColumn title="EM PREPARO" status="EM_PREPARO" orders={preparingOrders} onMoveToNextStatus={handleMoveToNextStatus} showReadyButton />
        <KDSColumn title="PRONTOS" status="PRONTO" orders={readyOrders} onMoveToNextStatus={handleMoveToNextStatus} />
      </div>
    </div>
  );
}