// src/components/pos/CartPanel.tsx (Corrigido para manipulação do input)

import { CartItem, PaymentMethod } from '@/types/pos';
import { Minus, Plus, Trash2, MessageSquare, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  paymentMethod: PaymentMethod;
  onSelectPayment: (method: PaymentMethod) => void;
  onSendToKitchen: () => void;
  canSendToKitchen: boolean;
  
  // PROPS para a função de Troco
  receivedAmount: number;
  onUpdateReceivedAmount: (amount: number) => void;
}

const paymentMethods: { id: PaymentMethod; label: string; emoji: string }[] = [
  { id: 'DINHEIRO', label: 'Dinheiro', emoji: '💵' },
  { id: 'CARTAO_CREDITO', label: 'Crédito', emoji: '💳' },
  { id: 'CARTAO_DEBITO', label: 'Débito', emoji: '💳' },
  { id: 'PIX', label: 'PIX', emoji: '📱' },
];

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  paymentMethod,
  onSelectPayment,
  onSendToKitchen,
  canSendToKitchen,
  receivedAmount,
  onUpdateReceivedAmount,
}: CartPanelProps) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  
  // Estado local para o valor do INPUT (string)
  const [inputReceivedAmount, setInputReceivedAmount] = useState<string>(
    receivedAmount > 0 ? receivedAmount.toFixed(2).replace('.', ',') : ''
  );

  const total = useMemo(() => items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ), [items]);
  
  const change = useMemo(() => {
    return receivedAmount > total ? receivedAmount - total : 0;
  }, [receivedAmount, total]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };
  
  // --- FUNÇÃO CORRIGIDA PARA O INPUT ---
  const handleReceivedAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // 1. Limpa o valor (remove tudo que não for dígito ou vírgula)
    value = value.replace(/[^0-9,]/g, ''); 
    
    // 2. Garante que só há uma vírgula
    const parts = value.split(',');
    if (parts.length > 2) {
        value = parts[0] + ',' + parts.slice(1).join('');
    }

    setInputReceivedAmount(value);

    // 3. Converte a string limpa para float usando ponto como separador decimal
    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    
    // 4. Atualiza o estado numérico no Caixa.tsx (apenas se for diferente)
    if (numericValue !== receivedAmount) {
        onUpdateReceivedAmount(numericValue);
    }
  };
  // ------------------------------------

  const handleStartEditNotes = (productId: string, currentNotes: string) => {
    setEditingNotes(productId);
    setTempNotes(currentNotes);
  };

  const handleSaveNotes = (productId: string) => {
    onUpdateNotes(productId, tempNotes);
    setEditingNotes(null);
    setTempNotes('');
  };
  
  // Efeito para sincronizar o estado local (string) quando receivedAmount (number) muda
  // (Ex: quando o pedido é enviado e receivedAmount volta a 0 no Caixa.tsx)
  useState(() => {
    if (receivedAmount === 0 && inputReceivedAmount !== '') {
        setInputReceivedAmount('');
    } else if (receivedAmount > 0 && receivedAmount.toFixed(2).replace('.', ',') !== inputReceivedAmount) {
        // Isso impede a sobrescrita durante a digitação, mas garante o reset
        if (inputReceivedAmount === '') {
             setInputReceivedAmount(receivedAmount.toFixed(2).replace('.', ','));
        }
    }
  }, [receivedAmount]);


  return (
    // 🚨 CORREÇÃO: Fundo branco, borda e texto principal escuros
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-xl">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">🛒 Carrinho</h2>
        <p className="text-gray-500 text-sm">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2">
        {items.length === 0 ? (
          // 🚨 CORREÇÃO: Texto cinza
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-5xl mb-3">🛒</span>
            <p className="font-medium">Carrinho vazio</p>
            <p className="text-sm">Adicione produtos</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              // 🚨 CORREÇÃO: Fundo sutil cinza claro (secondary)
              className="bg-gray-50 rounded-xl p-3 animate-scale-in border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.product.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-gray-800">{item.product.name}</p>
                  {/* 🚨 CORREÇÃO: Preço em verde (destaque de valor) */}
                  <p className="text-green-600 font-bold">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-orange-600 mt-1 italic">
                      📝 {item.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    // 🚨 CORREÇÃO: Botão de quantidade em tons de cinza claro
                    className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300 active:scale-95 transition-all text-gray-800"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-10 text-center font-bold text-lg text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    // 🚨 CORREÇÃO: Botão de quantidade em tons de cinza claro
                    className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300 active:scale-95 transition-all text-gray-800"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      handleStartEditNotes(item.product.id, item.notes)
                    }
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center active:scale-95 transition-all',
                      item.notes
                        // 🚨 CORREÇÃO: Observações em laranja (warning)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    )}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    // 🚨 CORREÇÃO: Botão de remover em vermelho (destructive)
                    className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {editingNotes === item.product.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Observações..."
                    // 🚨 CORREÇÃO: Input de notas em fundo branco e borda clara
                    className="flex-1 bg-white rounded-lg px-3 py-2 text-sm border border-gray-300 text-gray-800 focus:border-indigo-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveNotes(item.product.id)}
                    // 🚨 CORREÇÃO: Botão OK em índigo (primary)
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold active:scale-95"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditingNotes(null)}
                    // 🚨 CORREÇÃO: Botão X em cinza
                    className="p-2 bg-gray-200 rounded-lg active:scale-95 text-gray-700 hover:bg-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">Total</span>
          {/* 🚨 CORREÇÃO: Total em índigo */}
          <span className="text-2xl font-black text-indigo-600">
            {formatPrice(total)}
          </span>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Método de Pagamento
          </p>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  onSelectPayment(method.id);
                  // Reseta o input string ao mudar o método de pagamento
                  if (method.id !== 'DINHEIRO') {
                      setInputReceivedAmount('');
                      onUpdateReceivedAmount(0);
                  }
                }}
                className={cn(
                  'py-3 px-4 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2',
                  paymentMethod === method.id
                    // 🚨 CORREÇÃO: Selecionado em índigo, não selecionado em cinza/índigo sutil
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-indigo-600 hover:bg-indigo-50 border border-indigo-300'
                )}
              >
                <span>{method.emoji}</span>
                <span>{method.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* --- CAMPO DE VALOR RECEBIDO E CÁLCULO DE TROCO --- */}
        {paymentMethod === 'DINHEIRO' && (
          // 🚨 CORREÇÃO: Fundo sutil e borda de destaque
          <div className="p-3 border border-dashed border-indigo-400 rounded-lg bg-indigo-50">
            <label htmlFor="received-amount" className="block text-sm font-semibold mb-2 text-gray-700">
              💵 Valor Recebido do Cliente (R$)
            </label>
            <input
              id="received-amount"
              type="text" 
              inputMode="decimal"
              placeholder={formatPrice(total)}
              value={inputReceivedAmount} // Usando o estado de string local
              onChange={handleReceivedAmountChange}
              // 🟢 CORREÇÃO DO BUG: Adiciona autocomplete="off" e title="" para evitar tooltips do navegador/extensões
              autocomplete="off" 
              title="" 
              // 🚨 CORREÇÃO: Input em fundo branco e texto escuro
              className="w-full p-2 rounded bg-white border border-indigo-400 text-lg text-center font-bold text-gray-800 focus:border-indigo-600 focus:outline-none"
              autoFocus
            />
            
            {/* Exibe o troco ou a falta, baseado no estado numérico (receivedAmount) */}
            {receivedAmount >= total && receivedAmount > 0 ? (
              // 🚨 CORREÇÃO: Troco em verde
              <p className="mt-3 text-xl font-bold text-green-600 text-center">
                Troco: {formatPrice(change)}
              </p>
            ) : receivedAmount > 0 && receivedAmount < total ? (
              // 🚨 CORREÇÃO: Faltando em vermelho
              <p className="mt-3 text-xl font-bold text-red-600 text-center">
                Faltando: {formatPrice(total - receivedAmount)}
              </p>
            ) : null}
          </div>
        )}
        {/* --- FIM CAMPO DE VALOR RECEBIDO --- */}

        <button
          onClick={onSendToKitchen}
          disabled={!canSendToKitchen}
          // 🚨 CORREÇÃO: Botão de ação em verde
          className={cn(
            'w-full py-3 px-4 rounded-xl font-bold text-lg transition-all',
            canSendToKitchen 
              ? 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.99]' 
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          )}
        >
          <span className="text-2xl">🍳</span>
          <span>Enviar Pedido e Finalizar</span>
        </button>

        {!paymentMethod && items.length > 0 && (
          // 🚨 CORREÇÃO: Aviso em laranja
          <p className="text-center text-orange-600 text-sm font-medium animate-pulse">
            ⚠️ Selecione o pagamento para enviar
          </p>
        )}
      </div>
    </div>
  );
}