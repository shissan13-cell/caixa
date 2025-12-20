import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MenuPrincipal from "./pages/MenuPrincipal";
import Caixa from "./pages/Caixa";
import Cozinha from "./pages/Cozinha";
import ProductManagementPage from "./pages/ProductManagementPage"; 
import ControleFinanceiroPage from "./pages/ControleFinanceiroPage"; 
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <Routes>
          <Route path="/" element={<MenuPrincipal />} />
          <Route path="/caixa" element={<Caixa />} />
          <Route path="/produtos" element={<ProductManagementPage />} /> 
          <Route path="/financeiro" element={<ControleFinanceiroPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/cozinha" element={<Cozinha />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;