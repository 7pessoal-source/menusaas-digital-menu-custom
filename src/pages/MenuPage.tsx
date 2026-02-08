import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicMenu from '../components/features/PublicMenu';
import { supabase } from '../services/supabase';
import { Restaurant, Category, Product } from '../types';

const MenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!slug) {
        console.error('❌ [MENU PAGE] No slug provided');
        navigate('/404');
        return;
      }

      console.log('🔵 [MENU PAGE] Loading menu for slug:', slug);

      try {
        // Buscar restaurante pelo slug
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        console.log('🔵 [MENU PAGE] Restaurant query result:', { restaurantData, restaurantError });

        if (restaurantError) {
          console.error('❌ [MENU PAGE] Restaurant error:', restaurantError);
          throw restaurantError;
        }
        
        if (!restaurantData) {
          console.error('❌ [MENU PAGE] Restaurant not found for slug:', slug);
          navigate('/404');
          return;
        }

        console.log('✅ [MENU PAGE] Restaurant found:', restaurantData.name);
        setRestaurant(restaurantData);

        // Buscar categorias e produtos
        console.log('🔵 [MENU PAGE] Loading categories and products...');
        
        const [categoriesResult, productsResult] = await Promise.all([
          supabase
            .from('categories')
            .select('*')
            .eq('restaurant_id', restaurantData.id)
            .order('order'),
          supabase
            .from('products')
            .select('*')
            .eq('restaurant_id', restaurantData.id)
            .eq('is_available', true),
        ]);

        console.log('✅ [MENU PAGE] Data loaded:', {
          categories: categoriesResult.data?.length || 0,
          products: productsResult.data?.length || 0
        });

        if (categoriesResult.data) setCategories(categoriesResult.data);
        if (productsResult.data) setProducts(productsResult.data);
      } catch (error: any) {
        console.error('❌ [MENU PAGE] Error fetching menu:', error);
        console.error('❌ [MENU PAGE] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <PublicMenu
      restaurant={restaurant}
      categories={categories}
      products={products}
      onExit={() => navigate('/')}
    />
  );
};

export default MenuPage;
