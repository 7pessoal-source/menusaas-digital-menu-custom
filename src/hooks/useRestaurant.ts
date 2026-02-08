import { useEffect, useRef, useCallback } from 'react';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { supabase } from '../services/supabase';
import { Restaurant, Category, Product } from '../types';

export const useRestaurant = () => {
  const { session } = useAuthStore();
  const { setLoading, setError } = useAppStore();
  const {
    restaurants,
    currentRestaurant,
    categories,
    products,
    setRestaurants,
    setCurrentRestaurant,
    setCategories,
    setProducts,
  } = useRestaurantStore();

  // 🔥 FIX: useRef para evitar re-fetch desnecessário após update
  const isInitialMount = useRef(true);
  const currentRestaurantIdRef = useRef<string | null>(null);

  // 🔥 FIX: Memoizar fetchRestaurantData para evitar recriação
  const fetchRestaurantData = useCallback(async (restaurantId: string) => {
    console.log('🔵 [FETCH DATA] Loading data for restaurant:', restaurantId);
    
    try {
      const [categoriesResult, productsResult] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('order'),
        supabase
          .from('products')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false }),
      ]);

      if (categoriesResult.error) {
        console.error('❌ [FETCH DATA] Categories error:', categoriesResult.error);
        throw categoriesResult.error;
      }
      if (productsResult.error) {
        console.error('❌ [FETCH DATA] Products error:', productsResult.error);
        throw productsResult.error;
      }

      // 🆕 CRIAR CATEGORIAS PADRÃO SE NÃO EXISTIREM
      let categories = categoriesResult.data as Category[] || [];
      
      if (categories.length === 0) {
        console.log('🔵 [DEFAULT CATEGORIES] Criando categorias padrão...');
        
        const defaultCategories = [
          { name: '🍔 Lanches', order: 0 },
          { name: '🍕 Pizzas', order: 1 },
          { name: '🥤 Bebidas', order: 2 },
          { name: '🍰 Sobremesas', order: 3 },
          { name: '🍟 Porções', order: 4 }
        ];

        const categoriesToInsert = defaultCategories.map(cat => ({
          restaurant_id: restaurantId,
          name: cat.name,
          order: cat.order
        }));

        const { data: newCategories, error: insertError } = await supabase
          .from('categories')
          .insert(categoriesToInsert)
          .select();

        if (insertError) {
          console.error('❌ [DEFAULT CATEGORIES] Erro ao criar:', insertError);
        } else {
          console.log('✅ [DEFAULT CATEGORIES] Criadas com sucesso!');
          categories = newCategories as Category[];
        }
      }

      console.log('✅ [FETCH DATA] Success:', {
        categories: categories.length,
        products: productsResult.data?.length || 0
      });

      setCategories(categories);
      setProducts(productsResult.data as Product[] || []);
    } catch (error: any) {
      console.error('❌ [FETCH DATA] Error:', error);
      setError('Falha ao carregar dados do restaurante.');
    }
  }, [setCategories, setProducts, setError]);

  // 🔥 FIX: Carregar restaurantes apenas uma vez na montagem
  useEffect(() => {
    const fetchRestaurants = async () => {
      console.log('🔵 [FETCH RESTAURANTS] Loading all restaurants...');
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('❌ [FETCH RESTAURANTS] Error:', error);
          throw error;
        }
        
        console.log('✅ [FETCH RESTAURANTS] Success:', data?.length || 0, 'restaurants found');
        
        if (data) {
          setRestaurants(data as Restaurant[]);
        }
      } catch (error: any) {
        console.error('❌ [FETCH RESTAURANTS] Error:', error);
        setError('Falha ao carregar restaurantes.');
      } finally {
        setLoading(false);
      }
    };

    // Apenas na primeira montagem
    if (isInitialMount.current) {
      fetchRestaurants();
      isInitialMount.current = false;
    }
  }, [setLoading, setError, setRestaurants]);

  // 🔥 FIX: Definir currentRestaurant baseado em session (apenas quando necessário)
  useEffect(() => {
    if (!session || restaurants.length === 0) {
      console.log('⚠️ [SET CURRENT] Skipping - no session or no restaurants');
      return;
    }

    console.log('🔵 [SET CURRENT] Finding restaurant for user:', session.user.id);
    
    const userRestaurant = restaurants.find(
      (r) => (r as any).user_id === session.user.id
    );
    
    if (userRestaurant) {
      console.log('✅ [SET CURRENT] Found user restaurant:', userRestaurant.name);
      setCurrentRestaurant(userRestaurant);
    } else if (restaurants[0]) {
      console.log('⚠️ [SET CURRENT] User restaurant not found, using first:', restaurants[0].name);
      setCurrentRestaurant(restaurants[0]);
    } else {
      console.log('❌ [SET CURRENT] No restaurants available');
      setCurrentRestaurant(null as any);
    }
  }, [session, restaurants, setCurrentRestaurant]);

  // 🔥 FIX: Buscar dados apenas quando currentRestaurant mudar DE VERDADE
  useEffect(() => {
    if (!currentRestaurant) {
      console.log('⚠️ [LOAD DATA] No current restaurant');
      return;
    }

    // Evita re-fetch se o ID não mudou (ex: após update)
    if (currentRestaurantIdRef.current === currentRestaurant.id) {
      console.log('⚠️ [LOAD DATA] Same restaurant, skipping fetch');
      return;
    }

    console.log('🔵 [LOAD DATA] Current restaurant changed to:', currentRestaurant.name);
    currentRestaurantIdRef.current = currentRestaurant.id;
    fetchRestaurantData(currentRestaurant.id);
  }, [currentRestaurant, fetchRestaurantData]);

  // 🔥 FIX: updateRestaurant com sincronização ATÔMICA de estado
  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    if (!currentRestaurant) {
      console.error('❌ [UPDATE] No current restaurant defined');
      return { success: false, error: 'Nenhum restaurante selecionado' };
    }

    console.log('🔵 [UPDATE] Starting update for:', currentRestaurant.name);
    console.log('🔵 [UPDATE] Updates:', updates);

    setLoading(true);
    
    try {
      // Remove campos auto-gerados e readonly
      const { created_at, updated_at, user_id, id, ...cleanUpdates } = updates as any;
      
      console.log('🔵 [UPDATE] Clean updates:', cleanUpdates);
      
      const { data, error } = await supabase
        .from('restaurants')
        .update(cleanUpdates)
        .eq('id', currentRestaurant.id)
        .select()
        .single();

      if (error) {
        console.error('❌ [UPDATE] Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ [UPDATE] No data returned from Supabase');
        throw new Error('Nenhum dado retornado do servidor');
      }

      console.log('✅ [UPDATE] Success! New data:', data);
      
      // 🔥 CRÍTICO: Atualizar estado local IMEDIATAMENTE
      setCurrentRestaurant(data as Restaurant);
      
      // 🔥 CRÍTICO: Atualizar também na lista de restaurantes
      setRestaurants(
        restaurants.map(r => r.id === data.id ? data as Restaurant : r)
      );
      
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ [UPDATE] Error:', error);
      setError(error.message || 'Erro ao atualizar restaurante');
      return { success: false, error: error.message || 'Erro desconhecido' };
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIX: Adicionar função de refresh manual (útil após updates)
  const refreshRestaurantData = useCallback(async () => {
    if (!currentRestaurant) return;
    
    console.log('🔄 [REFRESH] Manually refreshing restaurant data...');
    await fetchRestaurantData(currentRestaurant.id);
  }, [currentRestaurant, fetchRestaurantData]);

  return {
    restaurants,
    currentRestaurant,
    categories,
    products,
    updateRestaurant,
    refreshRestaurantData, // 🔥 NOVO: permite refresh manual
  };
};
