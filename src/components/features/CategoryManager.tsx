import React, { useState } from 'react';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { supabase } from '../../services/supabase';
import { PlusCircle, Trash2, Edit2, X, Save } from 'lucide-react';
import { Category } from '../../types';

const CategoryManager: React.FC = () => {
  const { currentRestaurant, categories, setCategories } = useRestaurantStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    if (!currentRestaurant) return;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', currentRestaurant.id)
      .order('order');

    if (error) {
      console.error('Erro ao carregar categorias:', error);
      return;
    }

    if (data) setCategories(data as Category[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    setLoading(true);

    try {
      if (formData.id) {
        // Editar categoria existente
        const { error } = await supabase
          .from('categories')
          .update({ name: formData.name })
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        // Criar nova categoria
        const { error } = await supabase
          .from('categories')
          .insert([{
            restaurant_id: currentRestaurant.id,
            name: formData.name,
            order: categories.length
          }]);

        if (error) throw error;
      }

      await fetchCategories();
      setIsModalOpen(false);
      setFormData({});
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black">Categorias</h2>
        <button
          onClick={() => {
            setFormData({ name: '' });
            setIsModalOpen(true);
          }}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-gray-800 transition-all shadow-lg"
        >
          <PlusCircle size={18} className="mr-2" /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold">
            Nenhuma categoria cadastrada.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all"
            >
              <span className="font-bold text-lg">{cat.name}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setFormData(cat);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-600 hover:text-black transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold uppercase tracking-tight">
                {formData.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <label className="block">
                <span className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Nome da Categoria
                </span>
                <input
                  type="text"
                  required
                  className="mt-1 w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Pratos Principais, Bebidas, Sobremesas..."
                />
              </label>
            </div>

            <div className="p-6 bg-gray-50 flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Save size={18} />
                <span>{loading ? 'Salvando...' : 'Salvar'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 bg-gray-200 text-gray-700 py-4 rounded-2xl font-black uppercase"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
