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
  allows_observations?: boolean;
  price_display_min?: number;
  price_display_max?: number;
  has_variations?: boolean;
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

// Tipos para extras/adicionais
export interface ProductExtra {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_available: boolean;
  created_at?: string;
}

// ========================================
// NOVOS TIPOS: Sistema de Variações
// ========================================

// Grupo de variação (ex: "Tamanho", "Borda", "Massa")
export interface ProductVariationGroup {
  id: string;
  product_id: string;
  name: string; // Ex: "Tamanho", "Borda"
  is_required: boolean; // Se o cliente DEVE escolher
  allow_multiple: boolean; // Permite múltiplas seleções
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

// Opção de variação (ex: "Broto", "Média", "Grande")
export interface ProductVariationOption {
  id: string;
  variation_group_id: string;
  name: string; // Ex: "Broto (4 fatias)", "Grande (8 fatias)"
  price_adjustment: number; // Valor a somar no preço base
  is_default: boolean; // Opção padrão selecionada
  is_available: boolean;
  display_order: number;
  created_at?: string;
}

// Variação selecionada pelo cliente no carrinho
export interface SelectedVariation {
  group_id: string;
  group_name: string;
  option_id: string;
  option_name: string;
  price_adjustment: number;
}

// Item do carrinho com extras E variações
export interface CartItem {
  product: Product;
  quantity: number;
  selectedExtras: ProductExtra[];
  selectedVariations: SelectedVariation[]; // NOVO!
  observations: string;
  totalPrice: number;
}

// ========================================

// View Types
export type ViewType = 'landing' | 'auth' | 'admin' | 'menu';
export type AdminTabType = 'menu' | 'inventory' | 'settings' | 'templates';

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

// ============================================
// TEMPLATES GLOBAIS DE VARIAÇÃO
// ============================================

export interface VariationGroupTemplate {
  id: string;
  restaurant_id: string;
  name: string;
  is_required: boolean;
  allow_multiple: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface VariationOptionTemplate {
  id: string;
  template_group_id: string;
  name: string;
  price_adjustment: number;
  is_default: boolean;
  display_order: number;
  created_at?: string;
}

export interface ProductVariationAssignment {
  id: string;
  product_id: string;
  template_group_id: string;
  display_order: number;
  created_at?: string;
}
