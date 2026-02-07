/**
 * COMPONENTE DE DEBUG - MenuSaaS
 * 
 * Este componente ajuda a identificar problemas no carregamento
 * Adicione temporariamente no AdminPage.tsx para debugar
 * 
 * USO:
 * import DebugPanel from './DebugPanel';
 * 
 * E adicione dentro do AdminPage:
 * <DebugPanel />
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useAppStore } from '../stores/appStore';
import { supabase } from '../services/supabase';

const DebugPanel: React.FC = () => {
  const { session, user } = useAuthStore();
  const { restaurants, currentRestaurant, categories, products } = useRestaurantStore();
  const { loading, error } = useAppStore();
  const [dbCheck, setDbCheck] = useState<any>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      // Verifica conexão com Supabase
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*');

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      setDbCheck({
        restaurants: { data: restaurantsData, error: restaurantsError },
        categories: { data: categoriesData, error: categoriesError },
        products: { data: productsData, error: productsError },
      });
    } catch (err) {
      console.error('Erro ao verificar banco:', err);
      setDbCheck({ error: err });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-black text-white p-4 rounded-lg shadow-xl overflow-auto max-h-[80vh] z-[9999] text-xs font-mono">
      <h3 className="text-amber-400 font-bold mb-2 text-sm">🐛 DEBUG PANEL</h3>
      
      {/* Estado de Autenticação */}
      <div className="mb-3">
        <h4 className="text-green-400 font-semibold mb-1">✓ Autenticação</h4>
        <div className="pl-2 space-y-1">
          <p>Session: <span className={session ? 'text-green-400' : 'text-red-400'}>{session ? '✓' : '✗'}</span></p>
          {session && (
            <>
              <p>User ID: {session.user.id.substring(0, 8)}...</p>
              <p>Email: {session.user.email}</p>
            </>
          )}
        </div>
      </div>

      {/* Estado do Restaurante */}
      <div className="mb-3">
        <h4 className="text-blue-400 font-semibold mb-1">🏪 Restaurante</h4>
        <div className="pl-2 space-y-1">
          <p>Total Restaurantes: {restaurants.length}</p>
          <p>Restaurante Atual: <span className={currentRestaurant ? 'text-green-400' : 'text-red-400'}>
            {currentRestaurant ? '✓' : '✗ NULO!'}
          </span></p>
          {currentRestaurant && (
            <>
              <p>Nome: {currentRestaurant.name}</p>
              <p>Slug: {currentRestaurant.slug}</p>
              <p>ID: {currentRestaurant.id.substring(0, 8)}...</p>
            </>
          )}
        </div>
      </div>

      {/* Categorias e Produtos */}
      <div className="mb-3">
        <h4 className="text-purple-400 font-semibold mb-1">📦 Dados</h4>
        <div className="pl-2 space-y-1">
          <p>Categorias: {categories.length}</p>
          <p>Produtos: {products.length}</p>
        </div>
      </div>

      {/* Estado da App */}
      <div className="mb-3">
        <h4 className="text-yellow-400 font-semibold mb-1">⚙️ App State</h4>
        <div className="pl-2 space-y-1">
          <p>Loading: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>{loading ? 'Sim' : 'Não'}</span></p>
          {error && <p className="text-red-400">Error: {error}</p>}
        </div>
      </div>

      {/* Verificação do Banco */}
      <div className="mb-3">
        <h4 className="text-orange-400 font-semibold mb-1">💾 Banco de Dados</h4>
        {dbCheck ? (
          <div className="pl-2 space-y-1 text-[10px]">
            <p>Restaurantes no DB: {dbCheck.restaurants?.data?.length || 0}</p>
            {dbCheck.restaurants?.error && (
              <p className="text-red-400">Erro: {dbCheck.restaurants.error.message}</p>
            )}
            <p>Categorias no DB: {dbCheck.categories?.data?.length || 0}</p>
            <p>Produtos no DB: {dbCheck.products?.data?.length || 0}</p>
          </div>
        ) : (
          <p className="pl-2 text-gray-400">Verificando...</p>
        )}
      </div>

      {/* Variáveis de Ambiente */}
      <div className="mb-3">
        <h4 className="text-pink-400 font-semibold mb-1">🔧 Env Vars</h4>
        <div className="pl-2 space-y-1 text-[10px]">
          <p>SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✓' : '✗'}</p>
          <p>SUPABASE_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗'}</p>
          <p>APP_URL: {import.meta.env.VITE_APP_URL || 'default'}</p>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="border-t border-gray-700 pt-2 mt-2">
        <h4 className="text-red-400 font-semibold mb-1">⚠️ Diagnóstico</h4>
        <div className="pl-2 space-y-1 text-[10px]">
          {!session && <p className="text-red-400">→ Sem sessão ativa</p>}
          {!currentRestaurant && session && (
            <p className="text-red-400">→ Restaurante não carregado (useRestaurant não chamado?)</p>
          )}
          {restaurants.length === 0 && session && (
            <p className="text-yellow-400">→ Nenhum restaurante no store (verificar fetch)</p>
          )}
          {dbCheck?.restaurants?.data?.length === 0 && (
            <p className="text-yellow-400">→ Nenhum restaurante no DB (criar trigger?)</p>
          )}
          {!import.meta.env.VITE_SUPABASE_URL && (
            <p className="text-red-400">→ VITE_SUPABASE_URL não configurada</p>
          )}
        </div>
      </div>

      <button 
        onClick={checkDatabase}
        className="mt-3 w-full bg-amber-400 text-black py-1 px-2 rounded text-[10px] font-bold hover:bg-amber-500"
      >
        🔄 Recarregar
      </button>
    </div>
  );
};

export default DebugPanel;
