import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Loader2, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore'; // Importação essencial para salvar a sessão

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const navigate = useNavigate();
  const { setAuth } = useAuthStore(); // Função que valida o acesso no App.tsx

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // Lógica de Registo
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        toast.success('Registo efetuado! Verifique o seu e-mail ou tente entrar.');
        setIsRegistering(false);
      } else {
        // Lógica de Login
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });

        if (error) throw error;

        if (data.session) {
          // ATUALIZA O ESTADO GLOBAL ANTES DE NAVEGAR
          setAuth(data.session); 
          toast.success('Bem-vindo ao sistema!');
          navigate('/'); // Redireciona para o Menu Principal
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação');
      console.error('Erro Auth:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4">
            {isRegistering ? <UserPlus className="text-white w-8 h-8" /> : <LogIn className="text-white w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRegistering ? 'Criar Nova Conta' : 'Acesso ao Sistema'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {isRegistering ? 'Preencha os dados para se registar' : 'Introduza as suas credenciais'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 ml-1 uppercase">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 ml-1 uppercase">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegistering ? "new-password" : "current-password"}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              isRegistering ? 'Finalizar Registo' : 'Entrar no Sistema'
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Ou</span></div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setPassword('');
            }}
            className="w-full text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isRegistering ? 'Já tem conta? Faça Login' : 'Não tem conta? Registe-se aqui'}
          </button>
        </form>
      </div>
    </div>
  );
}