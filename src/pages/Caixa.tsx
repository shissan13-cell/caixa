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

// 🔹 Normaliza datas vindas do banco
const normalizeOrderDates = (orders: Order[]): Order[] => {
  return orders.map(order => ({
    ...order,
    createdAt: new Date(order.createdAt as string),
    sentToKitchenAt: order.sentToKitchenAt
      ? new Date(order.sentToKitchenAt as string)
      : undefined,
  })) as Order[];
};

// 🔹 Card de produto
const ProductCard = ({ product, onSelect }: { product: any; onSelect: (p: any) => void }) => (
  <button
    onClick={() => onSelect(product)}
    className="flex flex-col items-center justify-center p-3 border rounded-xl shadow-sm hover:shadow-md transition-all bg-white"
  >
    <span className="text-3xl">{product.emoji || '📦'}</span>
    <span className="text-sm font-medium text-center mt-1 text-gray-800 line-clamp-2">
      {product.nome}
    </span>
    <span className="text-xs font-bold text-green-600">
      R$ {Number(product.preco).toFixed(2)}
    </span>
  </button>
);

export default function Caixa() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [receivedAmount, setReceivedAmount] = useState(0);

  const { orders, addOrder } = useOrderStore();

  // 🔹 Buscar produtos
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const normalizedOrders = useMemo(
    () => normalizeOrderDates(orders),
    [orders]
  );

  const totalCart = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const changeAmount = useMemo(() => {
    if (paymentMethod === 'DINHEIRO') {
      return Math.max(0, receivedAmount - totalCart);
    }
    return 0;
  }, [paymentMethod, receivedAmount, totalCart]);

  // 🔹 Adicionar produto
  const handleAddProduct = useCallback((dbProduct: any) => {
    const product: Product = {
      id: dbProduct.id.toString(),
      name: dbProduct.nome,
      price: Number(dbProduct.preco),
      category: dbProduct.categoria || 'outros',
      emoji: dbProduct.emoji || '📦',
    };

    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(i =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i
        )
        .filter(i => i.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const handleUpdateNotes = useCallback((productId: string, notes: string) => {
    setCartItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, notes } : i
      )
    );
  }, []);

  const handleSelectPayment = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method !== 'DINHEIRO') setReceivedAmount(0);
  }, []);

  // 🔹 Enviar pedido
  const handleSendToKitchen = useCallback(async () => {
    if (cartItems.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    const now = new Date();

    const orderItems: OrderItem[] = cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      notes: item.notes,
      productPrice: item.product.price,
      category: item.product.category,
    }));

    const order: Order = {
      id: Date.now().toString(),
      items: orderItems,
      status: 'NOVO',
      paymentMethod,
      total: totalCart,
      createdAt: now,
      sentToKitchenAt: now,
    };

    const receipt = generateReceiptContent(order, changeAmount, receivedAmount);
    sendPrintRequest(receipt, 'receipt');

    const kitchenItems = orderItems.filter(
      i => !NON_KITCHEN_CATEGORIES.includes(i.category.toLowerCase())
    );

    if (kitchenItems.length) {
      sendPrintRequest(
        generateReceiptContent({ ...order, items: kitchenItems }, 0, 0, true),
        'kitchen'
      );
    }

    addOrder(order);
    setCartItems([]);
    setReceivedAmount(0);
    toast.success('Pedido finalizado!');
  }, [cartItems, totalCart, paymentMethod, receivedAmount, addOrder, changeAmount]);

  // 🔹 Filtros
  const foodProducts = useMemo(
    () => products.filter(p => !NON_KITCHEN_CATEGORIES.includes(p.categoria) && p.categoria !== 'outros'),
    [products]
  );
  const drinkProducts = useMemo(
    () => products.filter(p => NON_KITCHEN_CATEGORIES.includes(p.categoria)),
    [products]
  );
  const otherProducts = useMemo(
    () => products.filter(p => p.categoria === 'outros' || !p.categoria),
    [products]
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-4 pt-0 gap-4">

      {/* PRODUTOS */}
      <div className="flex-1 overflow-y-auto lg:pr-4 space-y-6">

        <div className="bg-white p-4 rounded-xl shadow border">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 border-b pb-2">
            <Utensils className="text-orange-500" /> Comidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {foodProducts.map(p => (
              <ProductCard key={p.id} product={p} onSelect={handleAddProduct} />
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 border-b pb-2">
            <GlassWater className="text-blue-500" /> Bebidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {drinkProducts.map(p => (
              <ProductCard key={p.id} product={p} onSelect={handleAddProduct} />
            ))}
          </div>
        </div>

        {otherProducts.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="text-lg font-semibold mb-3">Outros</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {otherProducts.map(p => (
                <ProductCard key={p.id} product={p} onSelect={handleAddProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CARRINHO + STATUS */}
      <div className="w-full lg:w-[380px] flex flex-col gap-4 flex-shrink-0">
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

        <OrderStatusPanel orders={normalizedOrders} />
      </div>
    </div>
  );
}
