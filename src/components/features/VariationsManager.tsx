import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { 
  Product, 
  ProductVariationGroup, 
  ProductVariationOption 
} from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface VariationsManagerProps {
  product: Product;
  onClose: () => void;
}

const VariationsManager: React.FC<VariationsManagerProps> = ({ product, onClose }) => {
  const [groups, setGroups] = useState<ProductVariationGroup[]>([]);
  const [options, setOptions] = useState<Record<string, ProductVariationOption[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Formulário para novo grupo
  const [newGroup, setNewGroup] = useState({
    name: '',
    is_required: true,
    allow_multiple: false
  });

  // Formulário para nova opção
  const [newOption, setNewOption] = useState<Record<string, {
    name: string;
    price_adjustment: number;
    is_default: boolean;
  }>>({});

  useEffect(() => {
    fetchVariations();
  }, []);

  const fetchVariations = async () => {
    // Buscar grupos
    const { data: groupsData } = await supabase
      .from('product_variation_groups')
      .select('*')
      .eq('product_id', product.id)
      .order('display_order');
    
    if (groupsData) {
      setGroups(groupsData);
      
      // Buscar opções de cada grupo
      const optionsMap: Record<string, ProductVariationOption[]> = {};
      
      for (const group of groupsData) {
        const { data: optionsData } = await supabase
          .from('product_variation_options')
          .select('*')
          .eq('variation_group_id', group.id)
          .order('display_order');
        
        if (optionsData) {
          optionsMap[group.id] = optionsData;
        }
      }
      
      setOptions(optionsMap);
    }
  };

  // ==================== GERENCIAR GRUPOS ====================

  const handleAddGroup = async () => {
    if (!newGroup.name.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('product_variation_groups')
      .insert({
        product_id: product.id,
        name: newGroup.name,
        is_required: newGroup.is_required,
        allow_multiple: newGroup.allow_multiple,
        display_order: groups.length
      });

    if (!error) {
      setNewGroup({ name: '', is_required: true, allow_multiple: false });
      await fetchVariations();
    }
    setLoading(false);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Deletar este grupo de variação? Todas as opções serão removidas.')) {
      return;
    }

    const { error } = await supabase
      .from('product_variation_groups')
      .delete()
      .eq('id', groupId);

    if (!error) {
      await fetchVariations();
    }
  };

  // ==================== GERENCIAR OPÇÕES ====================

  const handleAddOption = async (groupId: string) => {
    const data = newOption[groupId];
    if (!data?.name.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('product_variation_options')
      .insert({
        variation_group_id: groupId,
        name: data.name,
        price_adjustment: data.price_adjustment,
        is_default: data.is_default,
        display_order: (options[groupId]?.length || 0)
      });

    if (!error) {
      setNewOption({ ...newOption, [groupId]: { name: '', price_adjustment: 0, is_default: false } });
      await fetchVariations();
    }
    setLoading(false);
  };

  const handleDeleteOption = async (optionId: string, groupId: string) => {
    const { error } = await supabase
      .from('product_variation_options')
      .delete()
      .eq('id', optionId);

    if (!error) {
      await fetchVariations();
    }
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1a1a1a] max-w-4xl w-full rounded-3xl p-8 my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              Variações - {product.name}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Configure tamanhos, sabores, tipos de massa, etc.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ========== ADICIONAR NOVO GRUPO ========== */}
        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 p-6 rounded-2xl mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Plus size={20} className="mr-2 text-orange-400" />
            Novo Grupo de Variação
          </h3>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ex: Tamanho, Borda, Tipo de Massa..."
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              className="w-full p-4 bg-black/50 border border-gray-700 rounded-xl text-white outline-none focus:border-orange-400 transition-colors"
            />
            
            <div className="flex gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGroup.is_required}
                  onChange={(e) => setNewGroup({ ...newGroup, is_required: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 text-orange-500 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-300">Obrigatório</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGroup.allow_multiple}
                  onChange={(e) => setNewGroup({ ...newGroup, allow_multiple: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 text-orange-500 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-300">Permitir múltiplas seleções</span>
              </label>
            </div>

            <button
              onClick={handleAddGroup}
              disabled={loading}
              className="w-full bg-orange-500 text-white p-4 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Plus size={20} />
              <span>Criar Grupo</span>
            </button>
          </div>
        </div>

        {/* ========== LISTA DE GRUPOS ========== */}
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-2xl">
              <p className="text-gray-500 font-medium">
                Nenhum grupo de variação criado ainda
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Crie um grupo acima para começar (ex: Tamanho)
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="bg-[#2a2a2a] rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Cabeçalho do Grupo */}
                <div className="p-4 flex items-center justify-between bg-black/30">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedGroups.has(group.id) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    
                    <div>
                      <h4 className="font-bold text-white text-lg">{group.name}</h4>
                      <div className="flex gap-2 mt-1">
                        {group.is_required && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                            Obrigatório
                          </span>
                        )}
                        {group.allow_multiple && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            Múltipla escolha
                          </span>
                        )}
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                          {options[group.id]?.length || 0} opções
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-500 hover:text-red-400 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Opções do Grupo (quando expandido) */}
                {expandedGroups.has(group.id) && (
                  <div className="p-4 space-y-3">
                    {/* Adicionar Nova Opção */}
                    <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                      <div className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          placeholder="Nome da opção (ex: Broto)"
                          value={newOption[group.id]?.name || ''}
                          onChange={(e) => setNewOption({
                            ...newOption,
                            [group.id]: {
                              ...(newOption[group.id] || { price_adjustment: 0, is_default: false }),
                              name: e.target.value
                            }
                          })}
                          className="col-span-6 p-3 bg-black border border-gray-700 rounded-lg text-white text-sm outline-none focus:border-orange-400"
                        />
                        
                        <input
                          type="number"
                          step="0.01"
                          placeholder="+ R$"
                          value={newOption[group.id]?.price_adjustment || 0}
                          onChange={(e) => setNewOption({
                            ...newOption,
                            [group.id]: {
                              ...(newOption[group.id] || { name: '', is_default: false }),
                              price_adjustment: parseFloat(e.target.value) || 0
                            }
                          })}
                          className="col-span-3 p-3 bg-black border border-gray-700 rounded-lg text-white text-sm outline-none focus:border-orange-400"
                        />

                        <label className="col-span-2 flex items-center justify-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newOption[group.id]?.is_default || false}
                            onChange={(e) => setNewOption({
                              ...newOption,
                              [group.id]: {
                                ...(newOption[group.id] || { name: '', price_adjustment: 0 }),
                                is_default: e.target.checked
                              }
                            })}
                            className="w-4 h-4 rounded border-gray-700 text-orange-500"
                          />
                          <span className="text-xs text-gray-400">Padrão</span>
                        </label>

                        <button
                          onClick={() => handleAddOption(group.id)}
                          disabled={loading}
                          className="col-span-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Lista de Opções */}
                    <div className="space-y-2">
                      {options[group.id]?.map((option) => (
                        <div
                          key={option.id}
                          className="bg-black/30 p-3 rounded-xl border border-gray-700 flex items-center justify-between group hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <GripVertical size={16} className="text-gray-600" />
                            <div>
                              <p className="font-medium text-white">{option.name}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs text-orange-400">
                                  {option.price_adjustment >= 0 ? '+' : ''}R$ {option.price_adjustment.toFixed(2)}
                                </span>
                                {option.is_default && (
                                  <span className="text-xs bg-green-500/20 text-green-400 px-2 rounded-full">
                                    Padrão
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteOption(option.id, group.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 text-white p-4 rounded-2xl font-bold hover:bg-gray-700 transition-all"
        >
          Concluir
        </button>
      </div>
    </div>
  );
};

export default VariationsManager;
