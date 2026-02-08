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
        <h2 className="text-3xl font-black text-white">Categorias</h2>
        <button
          onClick={() => {
            setFormData({ name: '' });
            setIsModalOpen(true);
          }}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-orange-600 transition-all shadow-lg"
        >
          <PlusCircle size={18} className="mr-2" /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl text-gray-500 font-bold">
            Nenhuma categoria cadastrada.
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-[#2a2a2a] p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-orange-500/30 transition-all shadow-sm"
            >
              <h4 className="font-bold text-lg text-white">{c.name}</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setFormData(c);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
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
            className="bg-[#1a1a1a] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#2a2a2a]">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                {formData.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1">Nome da Categoria</span>
                <input
                  type="text"
                  required
                  className="mt-1 w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-2xl font-bold outline-none focus:border-white/10 text-white placeholder:text-gray-600"
                  placeholder="Ex: Bebidas, Pizzas..."
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>
            </div>

            <div className="p-6 bg-[#2a2a2a] border-t border-white/10 flex space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg"
              >
                {formData.id ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
