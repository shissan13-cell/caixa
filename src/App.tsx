import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

import MenuPrincipal from "./pages/MenuPrincipal";
import Caixa from "./pages/Caixa";
import Cozinha from "./pages/Cozinha";
import ProductManagementPage from "./pages/ProductManagementPage"; 
import ControleFinanceiroPage from "./pages/ControleFinanceiroPage"; 
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para proteger rotas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { session } = useAuthStore();
  return session ? children : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><MenuPrincipal /></PrivateRoute>} />
          <Route path="/caixa" element={<PrivateRoute><Caixa /></PrivateRoute>} />
          <Route path="/produtos" element={<PrivateRoute><ProductManagementPage /></PrivateRoute>} /> 
          <Route path="/financeiro" element={<PrivateRoute><ControleFinanceiroPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/cozinha" element={<PrivateRoute><Cozinha /></PrivateRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;