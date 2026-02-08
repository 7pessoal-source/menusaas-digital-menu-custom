import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';

export const useApproval = () => {
  const { user } = useAuthStore();
  const [approved, setApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    checkApproval();
  }, [user]);

  const checkApproval = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setApproved(data?.approved || false);
    } catch (error) {
      console.error('Erro ao verificar aprovação:', error);
      setApproved(false);
    } finally {
      setLoading(false);
    }
  };

  return { approved, loading, checkApproval };
};
