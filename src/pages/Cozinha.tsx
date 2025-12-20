// src/pages/Cozinha.tsx

import { useCallback, useEffect } from 'react';
import { useOrderStore } from '@/stores/orderStore';
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

const explodeOrdersByItem = (orders: Order[]): any[] => {
  const exploded: any[] = [];

  orders.forEach(order => {
    // FILTRO: Apenas itens que NÃO são de categorias de "não-cozinha" (bebidas, etc)
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

  useEffect(() => {
    useOrderStore.persist.rehydrate();
  }, []);

  const normalized = normalizeOrders(orders);
  const explodedItems = explodeOrdersByItem(normalized);

  const newOrders = explodedItems
    .filter(o => o.status === 'NOVO')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const preparingOrders = explodedItems
    .filter(o => o.status === 'EM_PREPARO')
    .sort((a, b) => b.sortTime - a.sortTime);

  const readyOrders = explodedItems
    .filter(o => o.status === 'PRONTO')
    .sort((a, b) => b.sortTime - a.sortTime);

  const handleMoveToNextStatus = useCallback(
    (virtualId: string) => {
      const [originalId, indexStr] = virtualId.split('-');
      const itemIndex = parseInt(indexStr);

      const order = orders.find(o => o.id === originalId);
      if (!order || isNaN(itemIndex)) return;

      const currentItemStatus = order.items[itemIndex].status || order.status;

      const next: Record<OrderStatus, OrderStatus> = {
        NOVO: 'EM_PREPARO',
        EM_PREPARO: 'PRONTO',
        PRONTO: 'CONCLUIDO',
        CONCLUIDO: 'CONCLUIDO',
      };

      updateItemStatus(originalId, itemIndex, next[currentItemStatus]);
    },
    [orders, updateItemStatus]
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 p-4 text-white">
      {/* CABEÇALHO PADRONIZADO */}
      <header className="flex items-center justify-between mb-6 bg-slate-900 p-4 rounded-2xl border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 rounded-full hover:bg-slate-800 transition-colors border border-slate-700 bg-slate-900"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </Link>

          <div className="flex items-center gap-3 border-l pl-4 border-slate-700">
            <div className="bg-orange-600 p-2 rounded-lg">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Painel da Cozinha</h1>
              <p className="text-sm text-slate-400 font-medium">Itens de preparo e monitoramento KDS</p>
            </div>
          </div>
        </div>

        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status da Operação</p>
          <p className="text-sm font-semibold text-orange-500 italic">
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • Ao Vivo
          </p>
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