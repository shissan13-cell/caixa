// src/components/layout/POSLayout.tsx (MODIFICADO)

import { Outlet, Link, useLocation } from 'react-router-dom';
// 🚨 MODIFICADO: Adicionado 'Settings'
import { ChefHat, DollarSign, LayoutList, Package, ShoppingCart, Settings } from 'lucide-react'; 
import { cn } from '@/lib/utils'; 

const POSHeader = () => {
  const location = useLocation();

  const navItems = [
    { to: '/caixa', label: 'Venda', icon: ShoppingCart, id: 'venda', active: location.pathname === '/caixa' || location.pathname === '/' },
    { to: '/produtos', label: 'Estoque', icon: Package, id: 'estoque', active: location.pathname === '/produtos' },
    { to: '/financeiro', label: 'Financeiro', icon: LayoutList, id: 'financeiro', active: location.pathname === '/financeiro' },
    // 🚨 NOVO: Item de Configurações
    { to: '/settings', label: 'Config.', icon: Settings, id: 'settings', active: location.pathname === '/settings' },
    { to: '/cozinha', label: 'Ver Cozinha', icon: ChefHat, id: 'cozinha', isKitchen: true },
  ];

  return (
    // 🟢 REMOVIDO px-4, ajustado margens
    <header className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 bg-white">
      <h1 className="text-3xl font-bold text-gray-800">
        <DollarSign className="inline w-7 h-7 mr-2 text-green-600" /> Moy
      </h1>
      <div className="flex space-x-4">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className={cn(
              'p-2 rounded-lg transition-colors flex items-center gap-1 font-semibold',
              item.isKitchen
                ? 'bg-green-600 text-white hover:bg-green-700'
                : item.active
                ? item.id === 'venda' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
};

export function POSLayout() {
  return (
    // 🟢 ADICIONADO PADDING GERAL p-4, e ajustado bg-gray-50 para dar contraste visual
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 p-4"> 
      <POSHeader />
      
      {/* 🟢 REMOVIDO px-4, REMOVIDO pt-4 (pois o PAI já tem padding) */}
      <main className="flex-1 overflow-auto pb-0"> 
        <Outlet /> 
      </main>
    </div>
  );
}