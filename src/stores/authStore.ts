// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  session: any | null;
  setAuth: (session: any) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      setAuth: (session) => set({ 
        session, 
        user: session?.user ?? null 
      }),
      signOut: () => set({ session: null, user: null }),
    }),
    { 
      name: 'auth-storage', // Nome da chave que será salva no navegador
    }
  )
);