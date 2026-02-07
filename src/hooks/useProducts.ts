import { useState } from 'react';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useAppStore } from '../stores/appStore';
import { supabase } from '../services/supabase';
import { Product, ProductFormData } from '../types';

export const useProducts = () => {
  const { setLoading, setError } = useAppStore();
  const { products, addProduct, updateProduct, deleteProduct } = useRestaurantStore();
  const { currentRestaurant } = useRestaurantStore();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productFormData, setProductFormData] = useState<Partial<ProductFormData>>({});

  const openProductModal = (product?: Product) => {
    if (product) {
      setProductFormData(product);
    } else {
      setProductFormData({
        restaurant_id: currentRestaurant?.id,
        is_available: true,
      });
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setProductFormData({});
  };

  const saveProduct = async (data: ProductFormData) => {
    if (!currentRestaurant) {
      setError('Nenhum restaurante selecionado');
      return { success: false };
    }

    setLoading(true);
    try {
      const productData = {
        ...data,
        restaurant_id: currentRestaurant.id,
      };

      if (productFormData.id) {
        // Update existing product
        const { data: updatedProduct, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productFormData.id)
          .select()
          .single();

        if (error) throw error;
        updateProduct(productFormData.id, updatedProduct as Product);
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        addProduct(newProduct as Product);
      }

      closeProductModal();
      return { success: true };
    } catch (error: any) {
      console.error('Save product error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      deleteProduct(productId);
      return { success: true };
    } catch (error: any) {
      console.error('Delete product error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const toggleProductAvailability = async (productId: string, isAvailable: boolean) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ is_available: !isAvailable })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      updateProduct(productId, data as Product);
      return { success: true };
    } catch (error: any) {
      console.error('Toggle availability error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    isProductModalOpen,
    productFormData,
    setProductFormData,
    openProductModal,
    closeProductModal,
    saveProduct,
    removeProduct,
    toggleProductAvailability,
  };
};
