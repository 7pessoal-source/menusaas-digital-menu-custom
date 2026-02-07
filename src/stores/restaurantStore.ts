import { create } from 'zustand';
import { RestaurantState, Restaurant, Category, Product } from '../types';

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  currentRestaurant: null,
  categories: [],
  products: [],

  setRestaurants: (restaurants: Restaurant[]) => set({ restaurants }),
  
  setCurrentRestaurant: (restaurant: Restaurant | null) => set({ currentRestaurant: restaurant }),
  
  setCategories: (categories: Category[]) => set({ categories }),
  
  setProducts: (products: Product[]) => set({ products }),
  
  addProduct: (product: Product) => 
    set((state) => ({ products: [product, ...state.products] })),
  
  updateProduct: (id: string, updatedProduct: Partial<Product>) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    })),
  
  deleteProduct: (id: string) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
}));
