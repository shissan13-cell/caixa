import { Link } from 'react-router-dom';
import { ChefHat, Package, ShoppingCart, Settings, BarChart3, DollarSign } from 'lucide-react';

const MenuCard = ({ to, label, icon: Icon, description, color }: any) => (
  <Link 
    to={to} 
    className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all border border-slate-100 group"
  >
    <div className={`p-4 rounded-2xl ${color} text-white mb-4 group-hover:rotate-6 transition-transform`}>
      <Icon size={40} />
    </div>
    <span className="text-xl font-bold text-slate-800">{label}</span>
    <p className="text-slate-500 text-sm text-center mt-2">{description}</p>
  </Link>
);

export default function MenuPrincipal() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black text-slate-900 mb-2 flex items-center justify-center gap-3">
          <DollarSign className="text-green-600 w-12 h-12" /> Moy POS
        </h1>
        <p className="text-slate-500 font-medium text-lg">Selecione um módulo para começar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
        <MenuCard 
          to="/caixa" 
          label="Venda (Caixa)" 
          icon={ShoppingCart} 
          description="Realizar novos pedidos e pagamentos"
          color="bg-indigo-600"
        />
        <MenuCard 
          to="/produtos" 
          label="Estoque / Catálogo" 
          icon={Package} 
          description="Gerenciar produtos e preços"
          color="bg-purple-600"
        />
        <MenuCard 
          to="/financeiro" 
          label="Financeiro" 
          icon={BarChart3} 
          description="Relatórios de faturamento"
          color="bg-emerald-600"
        />
        <MenuCard 
          to="/cozinha" 
          label="Cozinha (KDS)" 
          icon={ChefHat} 
          description="Painel de preparo de pedidos"
          color="bg-orange-500"
        />
        <MenuCard 
          to="/settings" 
          label="Configurações" 
          icon={Settings} 
          description="Ajustes de impressão e sistema"
          color="bg-slate-700"
        />
      </div>
    </div>
  );
}