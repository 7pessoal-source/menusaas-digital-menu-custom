import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useAppStore } from '../stores/appStore';
import { useRestaurant } from '../hooks/useRestaurant';
import AdminLayout from '../components/features/AdminLayout';
import ProductManager from '../components/features/ProductManager';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { currentRestaurant } = useRestaurantStore();
  const { activeAdminTab, setActiveAdminTab } = useAppStore();
  
  useRestaurant();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!currentRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando restaurante...</p>
          <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      restaurant={currentRestaurant}
      activeTab={activeAdminTab}
      onTabChange={setActiveAdminTab}
      onLogout={handleLogout}
    >
      {activeAdminTab === 'menu' && <ProductManager />}
      
      {activeAdminTab === 'inventory' && (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Categorias</h2>
          <p className="text-gray-600">Em construção...</p>
        </div>
      )}
      
      {activeAdminTab === 'settings' && (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Configurações</h2>
          <p className="text-gray-600">Em construção...</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPage;
