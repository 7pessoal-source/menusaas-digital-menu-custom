import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { 
  Product, 
  ProductVariationGroup, 
  ProductVariationOption 
} from '@/types';
import { updateProductPriceRange } from '@/utils/priceRange';
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
    allow_multiple: false,
    max_selections: 1  // NOVO
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
        max_selections: newGroup.max_selections,  // NOVO
        display_order: groups.length
      });

    if (!error) {
      setNewGroup({ name: '', is_required: true, allow_multiple: false, max_selections: 1 });
      await fetchVariations();
      await updateProductPriceRange(product.id, product.price);
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
      await updateProductPriceRange(product.id, product.price);
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
      await updateProductPriceRange(product.id, product.price);
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
      await updateProductPriceRange(product.id, product.price);
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

            {/* NOVO CAMPO: Quantidade de seleções */}
            {newGroup.allow_multiple && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase block">
                  Quantas opções o cliente pode escolher?
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newGroup.max_selections}
                    onChange={(e) => setNewGroup({ 
                      ...newGroup, 
                      max_selections: parseInt(e.target.value) || 1 
                    })}
                    className="w-20 p-3 bg-black/50 border border-blue-500/30 rounded-lg text-white font-bold text-center outline-none focus:border-blue-400"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-300 font-medium">
                      {newGroup.max_selections === 2 && '🍕 Ex: Pizza Meia-Meia (2 sabores)'}
                      {newGroup.max_selections === 3 && '🍕 Ex: Pizza 3 Sabores'}
                      {newGroup.max_selections === 4 && '🍕 Ex: Pizza 4 Sabores'}
                      {newGroup.max_selections > 4 && `📝 Cliente escolhe ${newGroup.max_selections} opções`}
                      {newGroup.max_selections === 1 && '✅ Escolha única (padrão)'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Cliente pode escolher o mesmo sabor repetido
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                            Escolher {group.max_selections || 1}
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
                        <div className="col-span-6">
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
                            className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white text-sm outline-none focus:border-orange-400"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            placeholder="Preço (+)"
                            value={newOption[group.id]?.price_adjustment || 0}
                            onChange={(e) => setNewOption({
                              ...newOption,
                              [group.id]: {
                                ...(newOption[group.id] || { name: '', is_default: false }),
                                price_adjustment: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white text-sm outline-none focus:border-orange-400"
                          />
                        </div>
                        <div className="col-span-3 flex items-center space-x-2">
                          <button
                            onClick={() => handleAddOption(group.id)}
                            disabled={loading}
                            className="w-full h-full bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center justify-center"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
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
                            className="w-4 h-4 rounded border-gray-700 text-orange-500 focus:ring-orange-400"
                          />
                          <span className="text-xs text-gray-400">Opção padrão</span>
                        </label>
                      </div>
                    </div>

                    {/* Lista de Opções Existentes */}
                    <div className="space-y-2">
                      {options[group.id]?.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <GripVertical size={16} className="text-gray-600" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{option.name}</span>
                                {option.is_default && (
                                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                                    Padrão
                                  </span>
                                )}
                              </div>
                              <span className="text-orange-400 text-xs font-bold">
                                {option.price_adjustment >= 0 ? '+' : ''}
                                R$ {option.price_adjustment.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteOption(option.id, group.id)}
                            className="text-gray-600 hover:text-red-500 transition-colors p-2"
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
      </div>
    </div>
  );
};

export default VariationsManager;
