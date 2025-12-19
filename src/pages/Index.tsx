import { Link } from 'react-router-dom';
import { ShoppingCart, ChefHat } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <span className="text-8xl mb-6 block">🍽️</span>
        <h1 className="text-5xl font-black text-foreground mb-4">
          Sistema PDV
        </h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Sistema de ponto de venda otimizado para tablets com integração de cozinha em tempo real
        </p>
      </div>

      <div className="flex gap-6">
        <Link
          to="/caixa"
          className="group flex flex-col items-center gap-4 bg-card border border-border rounded-3xl p-8 hover:border-primary transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ShoppingCart className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Caixa</h2>
            <p className="text-muted-foreground mt-1">Interface de vendas</p>
          </div>
        </Link>

        <Link
          to="/cozinha"
          className="group flex flex-col items-center gap-4 bg-card border border-border rounded-3xl p-8 hover:border-warning transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-24 h-24 rounded-2xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
            <ChefHat className="w-12 h-12 text-warning" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Cozinha</h2>
            <p className="text-muted-foreground mt-1">Painel KDS</p>
          </div>
        </Link>
      </div>

      <p className="mt-12 text-muted-foreground text-sm">
        Otimizado para tablets • Alto contraste • Toque rápido
      </p>
    </div>
  );
}
