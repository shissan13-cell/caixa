// src/pages/SettingsPage.tsx
import { useSettingsStore, OrderGroupingMode } from '@/stores/settingsStore';
import { Link } from 'react-router-dom';
import { Settings, ShoppingCart, Utensils, Zap, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const { orderGrouping, setOrderGrouping } = useSettingsStore();

  const handleModeChange = (mode: OrderGroupingMode) => {
    setOrderGrouping(mode);
  };

  return (
    // Removido h-full e adicionado min-h-screen para evitar que o fundo "acabe" antes do conteúdo
    <div className="min-h-screen bg-gray-50 p-8 overflow-auto">
      {/* CABEÇALHO PADRONIZADO */}
      <header className="flex items-center justify-between mb-8 border-b pb-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 rounded-full hover:bg-white transition-colors border border-slate-200 bg-white shadow-sm"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>

          <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <Settings className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações do POS</h1>
              <p className="text-sm text-gray-500 font-medium">Gerencie o comportamento do sistema</p>
            </div>
          </div>
        </div>

        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sistema</p>
          <p className="text-sm font-semibold text-gray-700">v1.0.0</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 pb-12"> {/* Adicionado padding inferior para evitar colagem no rodapé */}
        {/* Agrupamento de Pedidos */}
        <section className="p-6 bg-white border rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-indigo-600" />
            Agrupamento de Pedidos
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
                  : 'border-gray-200 hover:border-indigo-300 bg-white hover:bg-gray-50'
              }`}
            >
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                Pedido Único
              </h3>
              <p className="text-sm text-gray-700">
                Todos os itens geram um **único ticket de pedido** (padrão).
              </p>
              <p className="text-xs text-red-600 mt-2 font-medium">
                O cliente só pode retirar o pedido quando todos os itens estiverem prontos.
              </p>
            </button>

            {/* Opção 2: Separado por Preparo */}
            <button
              onClick={() => handleModeChange('SPLIT_BY_PREP_TIME')}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                orderGrouping === 'SPLIT_BY_PREP_TIME'
                  ? 'border-blue-600 ring-4 ring-blue-100 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-gray-50'
              }`}
            >
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Separado por Preparo
              </h3>
              <p className="text-sm text-gray-700">
                Itens de diferentes tempos de preparo (Rápido vs. Lento) geram **sub-pedidos separados**.
              </p>
              <p className="text-xs text-green-600 mt-2 font-medium">
                O cliente pode retirar a bebida imediatamente e o lanche depois.
              </p>
            </button>

          </div>
        </section>

        {/* NOTA SOBRE A IMPLEMENTAÇÃO */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 shadow-sm">
            <h3 className="font-bold mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              Nota de Operação:
            </h3>
            <p className="text-sm">
                Esta configuração altera a forma como o sistema processa os pedidos no banco de dados e na impressão.
            </p>
        </div>
      </div>
    </div>
  );
}