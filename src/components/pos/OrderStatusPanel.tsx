// src/components/pos/OrderStatusPanel.tsx
import { Order } from '@/types/pos';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChefHat, CookingPot, Check, Package, Clock } from 'lucide-react';

interface OrderStatusPanelProps {
  orders: Order[];
}

// ⚠️ ATENÇÃO: É VITAL USAR EXPORTAÇÃO PADRÃO (DEFAULT) PARA COMBINAR COM A IMPORTAÇÃO NO Caixa.tsx
export default function OrderStatusPanel({ orders }: OrderStatusPanelProps) {
  // Filtra pedidos ativos (excluindo os finalizados/entregues)
  const activeOrders = orders.filter(
    (order) => order.status !== 'ENTREGUE' && order.status !== 'CANCELADO'
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Mais novos primeiro

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'NOVO':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'EM_PREPARO':
        return <CookingPot className="w-4 h-4 text-orange-500 animate-spin-slow" />;
      case 'PRONTO':
        return <Check className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'NOVO':
        return 'Novo';
      case 'EM_PREPARO':
        return 'Em Preparo';
      case 'PRONTO':
        return 'Pronto p/ Entrega';
      default:
        return status;
    }
  };

  const timeSince = (date: Date): string => {
    const diff = new Date().getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff / 1000) % 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };


  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-xl">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <ChefHat className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">Status dos Pedidos ({activeOrders.length})</h2>
      </div>

      <ScrollArea className="flex-1 p-4 pr-2">
        {activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
            <span className="text-5xl mb-3">✅</span>
            <p className="font-medium">Nenhum pedido ativo</p>
            <p className="text-sm">Tudo em dia!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className={cn(
                  "p-3 rounded-xl border transition-all shadow-sm",
                  order.status === 'PRONTO' ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-extrabold text-xl text-indigo-600">
                    #{order.id.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeSince(order.createdAt)}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                    {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-700">
                            <span className="font-bold text-indigo-500 mr-2">{item.quantity}x</span>
                            {item.productName}
                        </p>
                    ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2',
                      order.status === 'PRONTO' ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-700'
                  )}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="text-md font-bold text-gray-700">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}