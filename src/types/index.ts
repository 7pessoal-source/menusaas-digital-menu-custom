// Database Types
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  cover_image?: string;
  description?: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  whatsapp: string;
  address: string;
  isOpen: boolean;
  min_order_value: number;
  allows_delivery: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_available: boolean;
  is_promotion?: boolean;
  created_at?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface ProductFormData extends Partial<Product> {
  category_id: string;
}

export interface RestaurantFormData extends Partial<Restaurant> {}

// View Types
export type ViewType = 'landing' | 'auth' | 'admin' | 'menu';
export type AdminTabType = 'menu' | 'inventory' | 'settings';

// Store Types
export interface AppState {
  view: ViewType;
  activeAdminTab: AdminTabType;
  loading: boolean;
  error: string | null;
  
  setView: (view: ViewType) => void;
  setActiveAdminTab: (tab: AdminTabType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface RestaurantState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  categories: Category[];
  products: Product[];
  
  setRestaurants: (restaurants: Restaurant[]) => void;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export interface AuthState {
  session: AuthSession | null;
  user: User | null;
  
  setSession: (session: AuthSession | null) => void;
  setUser: (user: User | null) => void;
  signOut: () => void;
}
