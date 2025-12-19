import { useCallback, useEffect } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { KDSColumn } from '@/components/kds/KDSColumn';
import { OrderStatus, Order, OrderItem } from '@/types/pos';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
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
    // 1. FILTRO: Apenas itens que NÃO são de categorias de "não-cozinha" (bebidas, etc)
    const kitchenOnlyItems = order.items.filter((item: any) => {
      // Como o objeto OrderItem às vezes não traz a categoria direto, 
      // o ideal é que ela venha do produto ou seja verificada.
      // Se o seu store salva a categoria no item, o filtro abaixo funciona:
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
  
  // 2. APLICAÇÃO DO FILTRO: 
  // Filtramos os itens para garantir que bebidas não apareçam no KDS
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
      <header className="flex items-center justify-between mb-6 bg-slate-900 p-6 rounded-2xl border-b-4 border-orange-500">
        <div className="flex items-center gap-4">
          <span className="text-5xl">👨‍🍳</span>
          <div>
            <h1 className="text-3xl font-black uppercase">Painel da Cozinha</h1>
            <p className="text-slate-400 font-bold">Apenas itens para preparo (bebidas ocultas)</p>
          </div>
        </div>

        <Link to="/" className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-black hover:bg-orange-500 hover:text-white">
          <ShoppingCart size={22} />
          VOLTAR AO CAIXA
        </Link>
      </header>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <KDSColumn title="PARA FAZER" status="NOVO" orders={newOrders} onMoveToNextStatus={handleMoveToNextStatus} />
        <KDSColumn title="EM PREPARO" status="EM_PREPARO" orders={preparingOrders} onMoveToNextStatus={handleMoveToNextStatus} showReadyButton />
        <KDSColumn title="PRONTOS" status="PRONTO" orders={readyOrders} onMoveToNextStatus={handleMoveToNextStatus} />
      </div>
    </div>
  );
}