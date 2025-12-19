import { Order } from '@/types/pos';
import { OrderTimer } from './OrderTimer';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onMoveToNextStatus: (orderId: string) => void;
  showReadyButton?: boolean;
}

export function OrderCard({ order, onMoveToNextStatus, showReadyButton }: OrderCardProps) {
  const getOrderNumber = (orderId: string) => {
    return orderId.slice(-4).toUpperCase();
  };

  const cardClass = cn(
    'bg-card rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]',
    order.status === 'NOVO' && 'order-card-new',
    order.status === 'EM_PREPARO' && 'order-card-preparing',
    order.status === 'PRONTO' && 'order-card-ready'
  );

  const handleCardClick = () => {
    if (order.status !== 'PRONTO' && !showReadyButton) {
      onMoveToNextStatus(order.id);
    }
  };

  return (
    <div className={cardClass} onClick={handleCardClick}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-kds-header text-foreground">
            #{getOrderNumber(order.id)}
          </h3>
        </div>
        {order.sentToKitchenAt && (
          <OrderTimer startTime={new Date(order.sentToKitchenAt)} />
        )}
      </div>

      <div className="space-y-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <span className="text-kds-qty text-primary bg-primary/20 px-3 py-1 rounded-lg min-w-[3rem] text-center">
              {item.quantity}x
            </span>
            <div className="flex-1">
              <p className="text-kds-item">{item.productName}</p>
              {item.notes && (
                <p className="text-warning text-lg italic mt-1">
                  📝 {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showReadyButton && order.status === 'EM_PREPARO' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToNextStatus(order.id);
          }}
          className="mt-4 w-full action-btn action-btn-success"
        >
          <Check className="w-6 h-6" />
          <span>PRONTO</span>
        </button>
      )}
    </div>
  );
}
