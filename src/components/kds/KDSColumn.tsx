import { Order, OrderStatus } from '@/types/pos';
import { OrderCard } from './OrderCard';
import { cn } from '@/lib/utils';

interface KDSColumnProps {
  title: string;
  status: OrderStatus;
  orders: Order[];
  onMoveToNextStatus: (orderId: string) => void;
  showReadyButton?: boolean;
}

export function KDSColumn({
  title,
  status,
  orders,
  onMoveToNextStatus,
  showReadyButton
}: KDSColumnProps) {

  const headerClass = cn(
    'kds-column-header',
    status === 'NOVO' && 'bg-new-order/20 text-new-order',
    status === 'EM_PREPARO' && 'bg-preparing/20 text-preparing',
    status === 'PRONTO' && 'bg-ready/20 text-ready'
  );

  return (
    <div className="kds-column">
      <div className={headerClass}>
        <span>{title}</span>
        <span className="ml-2 opacity-70">({orders.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onMoveToNextStatus={onMoveToNextStatus}
            showReadyButton={showReadyButton}
          />
        ))}

        {orders.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-xl">
            Sem pedidos
          </div>
        )}
      </div>
    </div>
  );
}
