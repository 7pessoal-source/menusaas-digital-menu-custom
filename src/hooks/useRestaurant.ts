import { useEffect } from 'react';
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

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (session && restaurants.length > 0) {
      const userRestaurant = restaurants.find(
        (r) => (r as any).user_id === session.user.id
      );
      
      if (userRestaurant) {
        setCurrentRestaurant(userRestaurant);
      } else if (restaurants[0]) {
        setCurrentRestaurant(restaurants[0]);
      } else {
        setCurrentRestaurant(null as any);
      }
    }
  }, [session, restaurants]);

  useEffect(() => {
    if (currentRestaurant) {
      fetchRestaurantData(currentRestaurant.id);
    }
  }, [currentRestaurant]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data) setRestaurants(data as Restaurant[]);
    } catch (error: any) {
      console.error('Fetch restaurants error:', error);
      setError('Falha ao carregar restaurantes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantData = async (restaurantId: string) => {
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

      if (categoriesResult.error) throw categoriesResult.error;
      if (productsResult.error) throw productsResult.error;

      setCategories(categoriesResult.data as Category[] || []);
      setProducts(productsResult.data as Product[] || []);
    } catch (error: any) {
      console.error('Fetch restaurant data error:', error);
      setError('Falha ao carregar dados do restaurante.');
    }
  };

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    if (!currentRestaurant) return;

    setLoading(true);
    try {
      // Remove campos que não existem no banco (updated_at, created_at)
      const { created_at, updated_at, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('restaurants')
        .update(cleanUpdates)
        .eq('id', currentRestaurant.id)
        .select()
        .single();

      if (error) throw error;
      setCurrentRestaurant(data as Restaurant);
      return { success: true, data };
    } catch (error: any) {
      console.error('Update restaurant error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    restaurants,
    currentRestaurant,
    categories,
    products,
    fetchRestaurants,
    fetchRestaurantData,
    updateRestaurant,
  };
};
