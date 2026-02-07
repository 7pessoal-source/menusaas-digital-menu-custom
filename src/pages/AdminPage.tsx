import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useAppStore } from '../stores/appStore';
import AdminLayout from '../components/features/AdminLayout';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { currentRestaurant } = useRestaurantStore();
  const { activeAdminTab, setActiveAdminTab } = useAppStore();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!currentRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando restaurante...</p>
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
