// src/pages/ControleFinanceiroPage.tsx

import { Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/stores/orderStore';
import { useMemo, useCallback, useEffect, useState } from 'react'; 
import { Order } from '@/types/pos';
import { DollarSign, BarChart2, TrendingUp, HandCoins, ClipboardList, Eraser, Loader2 } from 'lucide-react'; 
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Categorias de pagamento
const PAYMENT_METHODS = ['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO'] as const;
type ValidPaymentMethod = typeof PAYMENT_METHODS[number];

const PAYMENT_MAP: Record<string, ValidPaymentMethod> = {
    'DINHEIRO': 'DINHEIRO',
    'PIX': 'PIX',
    'CREDITO': 'CREDITO',
    'DEBITO': 'DEBITO',
    'CARTAO_CREDITO': 'CREDITO', 
    'CARTAO_DEBITO': 'DEBITO',   
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
};

const MetricCard = ({ icon: Icon, title, value, colorClass = 'text-gray-900', description }: { icon: any, title: string, value: string, colorClass?: string, description: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border flex flex-col justify-between h-full transition-shadow duration-300 hover:shadow-lg">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</h3>
            </div>
            <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>
        <p className="text-xs text-muted-foreground mt-4">{description}</p>
    </div>
);

const ControleFinanceiroPage = () => {
    const { orders, clearOrders } = useOrderStore(); 
    const [dbProducts, setDbProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            // Garante que os pedidos locais foram carregados
            await useOrderStore.persist.rehydrate();
            
            const { data, error } = await supabase.from('produtos').select('*');
            if (error) {
                toast.error("Erro ao sincronizar produtos do banco");
            } else if (data) {
                setDbProducts(data);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    // Mapa de produtos para busca rápida por ID (converte ID para string para evitar erro de tipo)
    const productDetailMap = useMemo(() => {
        return dbProducts.reduce((acc, product) => {
            acc[String(product.id)] = {
                name: product.nome,
                emoji: product.emoji,
                costPrice: Number(product.preco_custo) || 0,
                price: Number(product.preco) || 0,
            };
            return acc;
        }, {} as Record<string, { name: string; emoji: string; costPrice: number; price: number }>);
    }, [dbProducts]);

    const { 
        totalSales, 
        totalCostOfGoodsSold, 
        netProfit, 
        paymentSummary, 
        productSalesArray, 
    } = useMemo(() => {
        let totalSales = 0;
        let totalCostOfGoodsSold = 0;
        
        let paymentSummary: Record<ValidPaymentMethod, number> = PAYMENT_METHODS.reduce((acc, method) => {
            acc[method] = 0;
            return acc;
        }, {} as Record<ValidPaymentMethod, number>);
        
        let productSalesSummary: Record<string, { name: string; emoji: string; quantity: number; revenue: number }> = {};

        orders.forEach((order: Order) => {
            const saleValue = Number(order.total) || 0; 
            totalSales += saleValue;

            const paymentMethodUpper = (order.paymentMethod || '').toUpperCase();
            const mappedMethod = PAYMENT_MAP[paymentMethodUpper];
            if (mappedMethod) {
                paymentSummary[mappedMethod] += saleValue; 
            }
            
            order.items.forEach(item => {
                // Tenta encontrar o ID no banco, se não existir usa o ID do item
                const productId = String(item.productId || item.id);
                const quantity = Number(item.quantity) || 0;
                const detail = productDetailMap[productId];
                
                // CÁLCULO DE CUSTO: Se achar no banco, usa o preco_custo, senão 0
                const unitCost = detail?.costPrice || 0;
                totalCostOfGoodsSold += unitCost * quantity;

                // DADOS PARA A TABELA: Se não achar no banco, usa os dados salvos no pedido (fallback)
                const name = detail?.name || item.productName || 'Produto';
                const emoji = detail?.emoji || '📦';
                const unitPrice = detail?.price || Number(item.price) || 0;
                const revenue = quantity * unitPrice;

                // Agrupamento por Produto
// Agrupamento por Produto
                // Usamos o productId se o produto for do banco, ou o nome se for um item manual (como bebida)
                const groupingKey = detail ? productId : name;

                if (productSalesSummary[groupingKey]) {
                    productSalesSummary[groupingKey].quantity += quantity;
                    productSalesSummary[groupingKey].revenue += revenue;
                } else {
                    productSalesSummary[groupingKey] = {
                        name,
                        emoji,
                        quantity,
                        revenue,
                    };
                }
            });
        });

        const netProfit = totalSales - totalCostOfGoodsSold;
        const productSalesArray = Object.values(productSalesSummary).sort((a, b) => b.quantity - a.quantity);

        return { totalSales, totalCostOfGoodsSold, netProfit, paymentSummary, productSalesArray };
    }, [orders, productDetailMap]);

    const handleClearFinance = useCallback(() => {
        if (window.confirm("ATENÇÃO: Deseja apagar todos os dados de vendas?")) {
            clearOrders();
            toast.success("Controle financeiro limpo!");
        }
    }, [clearOrders]);

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" size={48}/></div>;

    return (
        <div className="p-8 h-full bg-gray-50 overflow-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">📊 Controle Financeiro e Caixa</h1>
                <div className="flex space-x-4">
                    <button 
                        onClick={handleClearFinance}
                        className="flex items-center gap-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        disabled={orders.length === 0}
                    >
                        <Eraser className="w-5 h-5" />
                        Limpar Dados
                    </button>
                    <Link to="/caixa" className="bg-slate-900 text-white p-2 px-4 rounded-lg hover:bg-black transition-colors">
                        Voltar para a Venda
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard 
                    icon={DollarSign} 
                    title="Total de Vendas Brutas" 
                    value={formatCurrency(totalSales)}
                    colorClass="text-green-600"
                    description="Soma de todos os pedidos realizados."
                />
                <MetricCard 
                    icon={BarChart2} 
                    title="Custo Total (CPV)" 
                    value={formatCurrency(totalCostOfGoodsSold)}
                    colorClass="text-red-600"
                    description="Custo dos itens baseado no cadastro."
                />
                <MetricCard 
                    icon={TrendingUp} 
                    title="Lucro Líquido" 
                    value={formatCurrency(netProfit)}
                    colorClass={netProfit >= 0 ? "text-blue-600" : "text-red-600"}
                    description="Resultado final (Vendas - Custos)."
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <HandCoins className="w-6 h-6 text-yellow-600" />
                    Resumo por Meio de Pagamento
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {PAYMENT_METHODS.map((method) => (
                        <div key={method} className="p-3 bg-gray-50 rounded-lg border">
                            <p className="text-sm font-medium text-gray-600">{method}</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(paymentSummary[method] || 0)}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-indigo-600" />
                    Vendas por Produto
                </h2>
                {productSalesArray.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">Nenhuma venda registrada.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produto</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Qtd</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Receita</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {productSalesArray.map((sale, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {sale.emoji} {sale.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700 font-bold">
                                            {sale.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-700 font-bold">
                                            {formatCurrency(sale.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControleFinanceiroPage;