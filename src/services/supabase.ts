import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@constants/index';

// Singleton pattern para Supabase client
class SupabaseService {
  private static instance: SupabaseClient | null = null;

  static getInstance(): SupabaseClient {
    if (!this.instance) {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase credentials are missing. Check your environment variables.');
      }
      
      this.instance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
    return this.instance;
  }
}

export const supabase = SupabaseService.getInstance();
