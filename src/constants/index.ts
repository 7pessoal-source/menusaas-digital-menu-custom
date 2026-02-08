// App Constants
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MenuSaaS';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

// API Constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Supabase Constants
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// Routes
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  ADMIN: '/admin',
  MENU: '/menu/:slug',
  NOT_FOUND: '/404',
} as const;

// Admin Tabs
export const ADMIN_TABS = {
  MENU: 'menu',
  SETTINGS: 'settings',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'menusaas_auth_token',
  USER_DATA: 'menusaas_user_data',
  THEME: 'menusaas_theme',
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_ORDER_VALUE: 0,
  MAX_PRICE: 9999.99,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const;
