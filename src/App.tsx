import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { initializeAuth, useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import PendingApproval from '@/components/features/PendingApproval';
import { useApproval } from '@/hooks/useApproval';

// Pages
import LandingPage from '@pages/LandingPage';
import AuthPage from '@pages/AuthPage';
import AdminPage from '@pages/AdminPage';
import MenuPage from '@pages/MenuPage';
import NotFoundPage from '@pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuthStore();
  const { approved, loading } = useApproval();
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-amber-400"></div>
      </div>
    );
  }

  if (!approved) {
    return <PendingApproval />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { loading } = useAppStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/menu/:slug" element={<MenuPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
};

export default App;
