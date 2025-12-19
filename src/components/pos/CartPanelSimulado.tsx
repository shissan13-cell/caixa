import React, { useMemo } from 'react';
import { CartItem, PaymentMethod } from '@/types/pos';
import { Trash2, MessageCircle, DollarSign, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
// Importe componentes que você usa (Button, Separator, etc. - Ajuste conforme sua UI library)

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  paymentMethod: PaymentMethod;
  onSelectPayment: (method: PaymentMethod) => void;
  onSendToKitchen: () => void;
  canSendToKitchen: boolean;
  
  // NOVAS PROPS
  receivedAmount: number;
  onUpdateReceivedAmount: (amount: number) => void;
}

// Mapeamento de botões de pagamento para o exemplo (ajuste conforme seu 'PaymentMethod' type)
const paymentButtons: { method: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { method: 'DINHEIRO', label: 'Dinheiro', icon: <DollarSign className="w-4 h-4 mr-2" /> },
  { method: 'CREDITO', label: 'Crédito', icon: <CreditCard className="w-4 h-4 mr-2" /> },
  { method: 'DEBITO', label: 'Débito', icon: <Banknote className="w-4 h-4 mr-2" /> },
  { method: 'PIX', label: 'PIX', icon: <QrCode className="w-4 h-4 mr-2" /> },
];

export function CartPanelSimulado({
  items,
  onUpdateQuantity,
  onRemoveItem,
  paymentMethod,
  onSelectPayment,
  onSendToKitchen,
  canSendToKitchen,
  receivedAmount,
  onUpdateReceivedAmount,
}: CartPanelProps) {
  
  // 1. Cálculo do Total
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  // 2. Cálculo do Troco
  const change = useMemo(() => {
    return receivedAmount > total ? receivedAmount - total : 0;
  }, [receivedAmount, total]);

  const totalFormatted = `R$ ${total.toFixed(2).replace('.', ',')}`;
  const changeFormatted = `R$ ${change.toFixed(2).replace('.', ',')}`;
  
  const handleReceivedAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(',', '.')) || 0;
    onUpdateReceivedAmount(value);
  };
  
  return (
    <div className="flex flex-col h-full bg-card p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-3">🛒 Carrinho</h2>
      <p className="text-sm text-muted-foreground mb-4">{items.length} itens</p>

      {/* Itens do Carrinho */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Carrinho vazio.</p>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between p-3 bg-card-foreground/10 rounded-md">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.product.name}</p>
                <p className="text-sm text-primary font-bold">
                  R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                </p>
                {item.notes && <p className="text-xs text-muted-foreground italic mt-1">Obs: {item.notes}</p>}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {/* Controles de Quantidade */}
                <div className="flex items-center border rounded-md">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                
                {/* Botões de Ação */}
                <Button size="icon" variant="ghost" onClick={() => {/* Lógica de notas */}}>
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onRemoveItem(item.product.id)}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <Separator className="my-4" />

      {/* Resumo e Pagamento */}
      <div className="flex flex-col">
        {/* Total */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-xl font-semibold">Total</p>
          <p className="text-3xl font-extrabold text-primary">{totalFormatted}</p>
        </div>

        <h3 className="text-lg font-semibold mb-3">Método de Pagamento</h3>
        
        {/* Botões de Pagamento */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {paymentButtons.map(({ method, label, icon }) => (
            <Button
              key={method}
              variant={paymentMethod === method ? 'default' : 'outline'}
              className="text-lg py-6"
              onClick={() => onSelectPayment(method)}
            >
              {icon}
              {label}
            </Button>
          ))}
        </div>
        
        {/* NOVO CAMPO DE VALOR RECEBIDO E TROCO */}
        {paymentMethod === 'DINHEIRO' && (
          <div className="p-3 border border-dashed border-primary/50 rounded-lg mb-4">
            <label htmlFor="received-amount" className="block text-sm font-medium mb-2">
              Valor Recebido do Cliente (R$)
            </label>
            <input
              id="received-amount"
              type="number"
              step="0.01"
              placeholder={totalFormatted}
              value={receivedAmount > 0 ? receivedAmount.toString().replace('.', ',') : ''}
              onChange={handleReceivedAmountChange}
              className="w-full p-2 rounded bg-background border border-border text-lg text-white placeholder:text-muted-foreground/50"
            />
            
            {/* Exibe o troco ou a falta */}
            {receivedAmount >= total && receivedAmount > 0 ? (
              <p className="mt-3 text-xl font-bold text-green-400">
                Troco: {changeFormatted}
              </p>
            ) : receivedAmount > 0 && receivedAmount < total ? (
              <p className="mt-3 text-xl font-bold text-red-400">
                Faltando: R$ {(total - receivedAmount).toFixed(2).replace('.', ',')}
              </p>
            ) : null}
          </div>
        )}

        {/* Botão de Envio */}
        <Button 
          className="w-full text-lg py-6"
          onClick={onSendToKitchen}
          disabled={!canSendToKitchen}
        >
          Enviar Pedido e Finalizar
        </Button>
      </div>
    </div>
  );
}