import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useAppStore } from '../stores/appStore';
import { useRestaurant } from '../hooks/useRestaurant';
import AdminLayout from '../components/features/AdminLayout';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { currentRestaurant } = useRestaurantStore();
  const { activeAdminTab, setActiveAdminTab } = useAppStore();
  
  // ✅ CORREÇÃO: Chamar o hook useRestaurant para carregar os dados
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
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Painel Administrativo</h2>
        <p>Conteúdo do painel</p>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
