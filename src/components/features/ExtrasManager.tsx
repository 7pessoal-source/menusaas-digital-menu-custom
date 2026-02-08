import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Product, ProductExtra } from '@/types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface ExtrasManagerProps {
  product: Product;
  onClose: () => void;
}

const ExtrasManager: React.FC<ExtrasManagerProps> = ({ product, onClose }) => {
  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const [newExtra, setNewExtra] = useState({ name: '', price: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExtras();
  }, []);

  const fetchExtras = async () => {
    const { data } = await supabase
      .from('product_extras')
      .select('*')
      .eq('product_id', product.id)
      .order('name');
    
    setExtras(data || []);
  };

  const handleAddExtra = async () => {
    if (!newExtra.name || newExtra.price < 0) return;

    setLoading(true);
    const { error } = await supabase
      .from('product_extras')
      .insert({
        product_id: product.id,
        name: newExtra.name,
        price: newExtra.price,
      });

    if (!error) {
      setNewExtra({ name: '', price: 0 });
      fetchExtras();
    }
    setLoading(false);
  };

  const handleDeleteExtra = async (id: string) => {
    const { error } = await supabase
      .from('product_extras')
      .delete()
      .eq('id', id);

    if (!error) fetchExtras();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] max-w-2xl w-full rounded-3xl p-8">
        <h2 className="text-2xl font-black text-white mb-6">
          Gerenciar Adicionais - {product.name}
        </h2>

        {/* Adicionar novo */}
        <div className="bg-black/50 p-6 rounded-2xl mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Novo Adicional</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do adicional"
              value={newExtra.name}
              onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
              className="p-4 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-amber-400"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Preço"
              value={newExtra.price}
              onChange={(e) => setNewExtra({ ...newExtra, price: parseFloat(e.target.value) || 0 })}
              className="p-4 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={handleAddExtra}
            disabled={loading}
            className="mt-4 w-full bg-amber-400 text-black p-4 rounded-2xl font-bold hover:bg-amber-300 transition-all flex items-center justify-center space-x-2"
          >
            <Plus size={20} />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Lista de adicionais */}
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {extras.map((extra) => (
            <div
              key={extra.id}
              className="bg-black/50 p-4 rounded-2xl border border-gray-800 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-white">{extra.name}</p>
                <p className="text-sm text-amber-400">R$ {extra.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleDeleteExtra(extra.id)}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-800 text-white p-4 rounded-2xl font-bold hover:bg-gray-700 transition-all"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ExtrasManager;
