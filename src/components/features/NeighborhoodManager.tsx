import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Neighborhood } from '../../types';
import { 
  Plus, 
  Trash2, 
  MapPin, 
  AlertCircle, 
  Edit2, 
  Check, 
  X,
  DollarSign
} from 'lucide-react';

interface Props {
  restaurantId: string;
}

const NeighborhoodManager: React.FC<Props> = ({ restaurantId }) => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    delivery_fee: 0,
    is_active: true
  });

  useEffect(() => {
    if (restaurantId) {
      fetchNeighborhoods();
    }
  }, [restaurantId]);

  const fetchNeighborhoods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name');
      
      if (error) throw error;
      setNeighborhoods(data || []);
    } catch (err) {
      console.error('Erro ao carregar bairros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Digite o nome do bairro');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('neighborhoods')
          .update({
            name: formData.name,
            delivery_fee: formData.delivery_fee,
            is_active: formData.is_active
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('neighborhoods')
          .insert({
            restaurant_id: restaurantId,
            name: formData.name,
            delivery_fee: formData.delivery_fee,
            is_active: formData.is_active
          });
        if (error) throw error;
      }

      setFormData({ name: '', delivery_fee: 0, is_active: true });
      setIsAdding(false);
      setEditingId(null);
      await fetchNeighborhoods();
    } catch (err) {
      console.error('Erro ao salvar bairro:', err);
      alert('Erro ao salvar bairro. Verifique se a tabela foi criada no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este bairro?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('neighborhoods')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchNeighborhoods();
    } catch (err) {
      console.error('Erro ao deletar bairro:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (n: Neighborhood) => {
    setFormData({
      name: n.name,
      delivery_fee: n.delivery_fee,
      is_active: n.is_active
    });
    setEditingId(n.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="text-amber-400" size={24} />
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Bairros e Taxas</h2>
          </div>
          <p className="text-gray-400 font-medium">
            Gerencie os bairros atendidos e suas respectivas taxas de entrega.
          </p>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => {
              setFormData({ name: '', delivery_fee: 0, is_active: true });
              setEditingId(null);
              setIsAdding(true);
            }}
            className="bg-amber-400 text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/20"
          >
            <Plus size={20} />
            <span>Novo Bairro</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-[#2a2a2a] border border-white/5 p-6 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            {editingId ? <Edit2 size={20} className="mr-2 text-amber-400" /> : <Plus size={20} className="mr-2 text-amber-400" />}
            {editingId ? 'Editar Bairro' : 'Cadastrar Novo Bairro'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1 block">Nome do Bairro</label>
              <input
                type="text"
                placeholder="Ex: Centro, Jardim das Flores..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 bg-black/30 border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-amber-400/50 transition-all"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1 block">Taxa de Entrega (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
                  className="w-full p-4 pl-12 bg-black/30 border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-amber-400/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-4">
            <label className="flex items-center space-x-3 cursor-pointer bg-black/20 p-4 rounded-2xl border border-white/5 hover:bg-black/40 transition-all">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 text-amber-400 focus:ring-amber-400 bg-gray-900"
              />
              <span className="text-xs text-gray-300 font-black uppercase">Bairro Ativo</span>
            </label>
          </div>

          <div className="mt-8 flex space-x-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-amber-400 text-black p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-amber-400/20"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div> : <Check size={20} />}
              <span>{editingId ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-8 bg-white/5 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {neighborhoods.length === 0 && !loading ? (
          <div className="col-span-full text-center py-20 bg-[#2a2a2a] border-2 border-dashed border-white/5 rounded-3xl">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-tighter text-xl">Nenhum bairro cadastrado</p>
            <p className="text-gray-600 text-sm mt-2 max-w-xs mx-auto font-medium">
              Cadastre os bairros que você atende para cobrar taxas de entrega automáticas.
            </p>
          </div>
        ) : (
          neighborhoods.map((n) => (
            <div
              key={n.id}
              className={`bg-[#2a2a2a] rounded-3xl border border-white/5 p-5 shadow-sm hover:shadow-md transition-all ${!n.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.is_active ? 'bg-amber-400/10 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg uppercase tracking-tight">{n.name}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${n.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {n.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(n)}
                    className="w-8 h-8 flex items-center justify-center bg-white/5 text-gray-400 rounded-lg hover:bg-amber-400 hover:text-black transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500 font-bold uppercase">Taxa de Entrega</span>
                <span className="text-xl font-black text-amber-400">
                  {n.delivery_fee === 0 ? 'GRÁTIS' : `R$ ${n.delivery_fee.toFixed(2)}`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NeighborhoodManager;
