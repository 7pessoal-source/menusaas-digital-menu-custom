import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthSession, User } from '../types';
import { supabase } from '../services/supabase';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,

      setSession: (session: AuthSession | null) => set({ session, user: session?.user || null }),
      
      setUser: (user: User | null) => set({ user }),
      
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize auth state from Supabase
export const initializeAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    useAuthStore.getState().setSession({
      user: {
        id: session.user.id,
        email: session.user.email || '',
        created_at: session.user.created_at,
      },
      access_token: session.access_token,
      refresh_token: session.refresh_token || '',
      expires_at: session.expires_at || 0,
    });
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      useAuthStore.getState().setSession({
        user: {
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at,
        },
        access_token: session.access_token,
        refresh_token: session.refresh_token || '',
        expires_at: session.expires_at || 0,
      });
    } else {
      useAuthStore.getState().setSession(null);
    }
  });
};
