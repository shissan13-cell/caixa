// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Importações de páginas
import Caixa from "./pages/Caixa";
import Cozinha from "./pages/Cozinha";
import NotFound from "./pages/NotFound";
import ProductManagementPage from "./pages/ProductManagementPage"; 
import ControleFinanceiroPage from "./pages/ControleFinanceiroPage"; 
// 🚨 NOVO: Importação da página de Configurações
import SettingsPage from "./pages/SettingsPage"; 
// Importação do Layout
import { POSLayout } from "./components/layout/POSLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <Routes>
          {/* ROTA PAI: Usa o POSLayout para renderizar o menu fixo */}
          <Route path="/" element={<POSLayout />}>
            {/* ROTAS ANINHADAS: O conteúdo delas será renderizado no <Outlet /> do POSLayout */}
            <Route index element={<Caixa />} /> 
            <Route path="/caixa" element={<Caixa />} />
            <Route path="/produtos" element={<ProductManagementPage />} /> 
            <Route path="/financeiro" element={<ControleFinanceiroPage />} />
            {/* 🚨 NOVO: Rota para a Página de Configurações */}
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          {/* ROTAS EXTERNAS (SEM O LAYOUT) */}
          <Route path="/cozinha" element={<Cozinha />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;