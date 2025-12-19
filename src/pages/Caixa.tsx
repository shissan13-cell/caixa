// src/pages/Caixa.tsx

import { useState, useCallback, useMemo, useEffect } from 'react'; 
import { supabase } from "@/lib/supabase";

import { CartItem, PaymentMethod, Product, Order, OrderItem } from '@/types/pos';
import { CartPanel } from '@/components/pos/CartPanel';
import OrderStatusPanel from '@/components/pos/OrderStatusPanel';
import { useOrderStore } from '@/stores/orderStore';
import { toast } from 'sonner';
import { Utensils, GlassWater, Loader2 } from 'lucide-react'; 
import { NON_KITCHEN_CATEGORIES } from '@/pages/ProductManagementPage';
import { generateReceiptContent, sendPrintRequest } from '@/utils/printUtils';
import { useSettingsStore } from '@/stores/settingsStore'; 

// 🟢 FUNÇÃO DE NORMALIZAÇÃO DE DATAS
const normalizeOrderDates = (orders: Order[]): Order[] => {
    return orders.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt as string), 
        sentToKitchenAt: order.sentToKitchenAt 
            ? new Date(order.sentToKitchenAt as string)
            : undefined,
    })) as Order[];
};

// Componente para um card de produto
const ProductCard = ({ product, onSelect }: { product: any; onSelect: (p: any) => void }) => (
    <button 
        key={product.id}
        onClick={() => onSelect(product)}
        className="product-card flex flex-col items-center justify-center p-3 border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
    >
        <span className="text-3xl">{product.emoji || '📦'}</span>
        <span className="text-sm font-medium text-center mt-1 text-gray-800 line-clamp-2 leading-tight">{product.nome}</span>
        <span className="text-xs font-bold text-green-600 mt-0.5">R$ {Number(product.preco).toFixed(2)}</span>
    </button>
);

export default function Caixa() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX'); 
  const [receivedAmount, setReceivedAmount] = useState(0); 

  const { orders, addOrder } = useOrderStore();
  
  // BUSCAR PRODUTOS DO SUPABASE
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const normalizedOrders = useMemo(() => normalizeOrderDates(orders), [orders]);

  const totalCart = useMemo(() => 
    cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0), 
    [cartItems]
  );

  const changeAmount = useMemo(() => {
    if (paymentMethod === 'DINHEIRO') {
      return Math.max(0, receivedAmount - totalCart);
    }
    return 0;
  }, [paymentMethod, receivedAmount, totalCart]);

  const handleAddProduct = useCallback((dbProduct: any) => {
    const product: Product = {
        id: dbProduct.id.toString(),
        name: dbProduct.nome,
        price: Number(dbProduct.preco),
        category: dbProduct.categoria || 'outros',
        emoji: dbProduct.emoji || '📦'
    };

    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setCartItems(prev => {
      const newItems = prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0);
      return newItems;
    });
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const handleUpdateNotes = useCallback((productId: string, notes: string) => {
    setCartItems(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, notes } 
        : item
    ));
  }, []);

  const handleSelectPayment = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method !== 'DINHEIRO') setReceivedAmount(0);
  }, []);

  const handleSendToKitchen = useCallback(async () => {
    if (cartItems.length === 0) {
      toast.error('O carrinho está vazio.');
      return;
    }

    try {
      // 1. Criar a Venda no Banco
      const { data: venda, error: vError } = await supabase
        .from('vendas')
        .insert([{
          total: totalCart,
          status: 'pendente',
          mesa_ou_cliente: 'Balcão'
        }])
        .select()
        .single();

      if (vError) throw vError;

      // 2. Inserir Itens da Venda
      const itensVenda = cartItems.map(item => ({
        venda_id: venda.id,
        produto_id: parseInt(item.product.id),
        quantidade: item.quantity,
        preco_unitario: item.product.price
      }));

      const { error: iError } = await supabase.from('itens_venda').insert(itensVenda);
      if (iError) throw iError;

      // 3. Atualizar Estoque
      for (const item of cartItems) {
        await supabase.rpc('increment_inventory', { 
            row_id: parseInt(item.product.id), 
            quantity: -item.quantity 
        });
      }

      const now = new Date();
      
      // Criar lista de todos os itens para o Store e Recibo
      const allOrderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        notes: item.notes,
        productPrice: item.product.price,
        category: item.product.category // Importante para o filtro no KDS
      }));

      const singleOrder: Order = {
          id: venda.id.toString(), 
          items: allOrderItems,
          status: 'NOVO',
          paymentMethod,
          total: totalCart,
          createdAt: now,
          sentToKitchenAt: now, 
      };

      // 4. IMPRESSÃO DO RECIBO (Imprime tudo, inclusive bebidas)
      const receiptContent = generateReceiptContent(singleOrder, changeAmount, receivedAmount);
      sendPrintRequest(receiptContent, 'receipt');

      // 5. IMPRESSÃO DA COMANDA (Filtra apenas o que DEVE ir para a cozinha)
      const kitchenItems = cartItems
        .filter(item => !NON_KITCHEN_CATEGORIES.includes(item.product.category.toLowerCase())) 
        .map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            notes: item.notes,
            productPrice: item.product.price,
        }));

      if (kitchenItems.length > 0) {
          const kitchenOrder: Order = { ...singleOrder, items: kitchenItems };
          const kitchenContent = generateReceiptContent(kitchenOrder, 0, 0, true); 
          sendPrintRequest(kitchenContent, 'kitchen');
      }

      addOrder(singleOrder);
      setCartItems([]);
      setReceivedAmount(0);
      toast.success('Pedido finalizado com sucesso!');

    } catch (error: any) {
      toast.error('Erro ao processar venda: ' + error.message);
    }
  }, [cartItems, totalCart, paymentMethod, receivedAmount, addOrder, changeAmount]); 

  // FILTRAGEM DE PRODUTOS PARA EXIBIÇÃO NA TELA DO CAIXA
  const foodProducts = useMemo(() => products.filter(p => !NON_KITCHEN_CATEGORIES.includes(p.categoria) && p.categoria !== 'outros'), [products]);
  const drinkProducts = useMemo(() => products.filter(p => NON_KITCHEN_CATEGORIES.includes(p.categoria)), [products]);
  const otherProducts = useMemo(() => products.filter(p => p.categoria === 'outros' || !p.categoria), [products]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    );
  }

  return (
      <div className="flex flex-1 overflow-hidden p-4 pt-0">
        <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 h-fit">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2 border-b pb-2">
                            <Utensils className="w-6 h-6 text-orange-500" />
                            Comidas ({foodProducts.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {foodProducts.map(p => <ProductCard key={p.id} product={p} onSelect={handleAddProduct} />)}
                        </div>
                        
                        {otherProducts.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-600 mb-3">Outros</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {otherProducts.map(p => <ProductCard key={p.id} product={p} onSelect={handleAddProduct} />)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 h-fit">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2 border-b pb-2">
                            <GlassWater className="w-6 h-6 text-blue-500" />
                            Bebidas ({drinkProducts.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {drinkProducts.map(p => <ProductCard key={p.id} product={p} onSelect={handleAddProduct} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="w-[380px] flex flex-col gap-4 flex-shrink-0">
          <div className="flex-[2]"> 
            <CartPanel
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onUpdateNotes={handleUpdateNotes}
              paymentMethod={paymentMethod}
              onSelectPayment={handleSelectPayment} 
              onSendToKitchen={handleSendToKitchen}
              canSendToKitchen={cartItems.length > 0} 
              receivedAmount={receivedAmount}
              onUpdateReceivedAmount={setReceivedAmount}
            />
          </div>

          <div className="flex-1 flex-shrink-0"> 
            <OrderStatusPanel orders={normalizedOrders} />
          </div>
        </div>
      </div>
  );
}