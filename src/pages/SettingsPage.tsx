// src/pages/SettingsPage.tsx
import { useSettingsStore, OrderGroupingMode } from '@/stores/settingsStore';
import { Link } from 'react-router-dom';
import { Settings, ShoppingCart, Utensils, Zap } from 'lucide-react';

export default function SettingsPage() {
  const { orderGrouping, setOrderGrouping } = useSettingsStore();

  const handleModeChange = (mode: OrderGroupingMode) => {
    setOrderGrouping(mode);
  };

  return (
    <div className="p-8 h-full bg-white overflow-auto">
      <header className="flex items-center justify-between mb-8 border-b pb-4">
        <div className="flex items-center gap-4">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Configurações do POS</h1>
        </div>

        <Link to="/" className="bg-green-600 text-white p-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors">
          <ShoppingCart className="w-5 h-5" />
          Voltar para a Venda
        </Link>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Agrupamento de Pedidos */}
        <section className="p-6 border rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-indigo-600" />
            Configuração de Agrupamento de Pedidos
          </h2>
          <p className="text-gray-600 mb-6">
            Defina como os itens do carrinho devem ser agrupados ao finalizar o pedido.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Opção 1: Pedido Único */}
            <button
              onClick={() => handleModeChange('SINGLE')}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                orderGrouping === 'SINGLE'
                  ? 'border-indigo-600 ring-4 ring-indigo-100 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 bg-white'
              }`}
            >
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                Pedido Único
              </h3>
              <p className="text-gray-700">
                Todos os itens geram um **único ticket de pedido** (padrão).
              </p>
              <p className="text-sm text-red-600 mt-2 font-medium">
                O cliente só pode retirar o pedido quando todos os itens estiverem prontos.
              </p>
            </button>

            {/* Opção 2: Separado por Preparo */}
            <button
              onClick={() => handleModeChange('SPLIT_BY_PREP_TIME')}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                orderGrouping === 'SPLIT_BY_PREP_TIME'
                  ? 'border-blue-600 ring-4 ring-blue-100 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Separado por Preparo (Agilizado)
              </h3>
              <p className="text-gray-700">
                Itens de diferentes tempos de preparo (Rápido vs. Lento) geram **sub-pedidos separados** (um para a cozinha, outro para o caixa).
              </p>
              <p className="text-sm text-green-600 mt-2 font-medium">
                O cliente pode retirar a bebida imediatamente e o lanche depois.
              </p>
            </button>

          </div>
        </section>

        {/* NOTA SOBRE A IMPLEMENTAÇÃO */}
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
            <h3 className="font-bold mb-1">Próxima Etapa Crítica:</h3>
            <p className="text-sm">
                A lógica para o modo <code className="font-mono">SPLIT_BY_PREP_TIME</code> está implementada no <code className="font-mono">Caixa.tsx</code>. Se o problema persistir após selecionar esta opção, o erro pode estar na reidratação do <code className="font-mono">useSettingsStore</code> ou na sua lista <code className="font-mono">NON_KITCHEN_CATEGORIES</code> (que define o que é preparo rápido).
            </p>
        </div>
      </div>
    </div>
  );
}