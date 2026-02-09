import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { 
  VariationGroupTemplate, 
  VariationOptionTemplate 
} from '@/types';
import { 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

interface Props {
  restaurantId: string;
}

const VariationTemplatesManager: React.FC<Props> = ({ restaurantId }) => {
  const [templates, setTemplates] = useState<VariationGroupTemplate[]>([]);
  const [options, setOptions] = useState<Record<string, VariationOptionTemplate[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    is_required: true,
    allow_multiple: false
  });

  const [newOption, setNewOption] = useState<Record<string, {
    name: string;
    price_adjustment: number;
    is_default: boolean;
  }>>({});

  useEffect(() => {
    fetchTemplates();
  }, [restaurantId]);

  const fetchTemplates = async () => {
    const { data: templatesData } = await supabase
      .from('variation_group_templates')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order');
    
    if (templatesData) {
      setTemplates(templatesData);
      
      const optionsMap: Record<string, VariationOptionTemplate[]> = {};
      
      for (const template of templatesData) {
        const { data: optionsData } = await supabase
          .from('variation_option_templates')
          .select('*')
          .eq('template_group_id', template.id)
          .order('display_order');
        
        if (optionsData) {
          optionsMap[template.id] = optionsData;
        }
      }
      
      setOptions(optionsMap);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name.trim()) {
      alert('Digite o nome do template');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('variation_group_templates')
      .insert({
        restaurant_id: restaurantId,
        name: newTemplate.name,
        is_required: newTemplate.is_required,
        allow_multiple: newTemplate.allow_multiple,
        display_order: templates.length
      });

    if (!error) {
      setNewTemplate({ name: '', is_required: true, allow_multiple: false });
      await fetchTemplates();
    }
    setLoading(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Deletar este template? Afetará todos os produtos que o usam.')) {
      return;
    }

    await supabase
      .from('variation_group_templates')
      .delete()
      .eq('id', templateId);

    await fetchTemplates();
  };

  const handleAddOption = async (templateId: string) => {
    const data = newOption[templateId];
    if (!data?.name.trim()) {
      alert('Digite o nome da opção');
      return;
    }

    setLoading(true);
    await supabase
      .from('variation_option_templates')
      .insert({
        template_group_id: templateId,
        name: data.name,
        price_adjustment: data.price_adjustment || 0,
        is_default: data.is_default,
        display_order: (options[templateId]?.length || 0)
      });

    setNewOption({ ...newOption, [templateId]: { name: '', price_adjustment: 0, is_default: false } });
    await fetchTemplates();
    setLoading(false);
  };

  const handleDeleteOption = async (optionId: string) => {
    await supabase
      .from('variation_option_templates')
      .delete()
      .eq('id', optionId);

    await fetchTemplates();
  };

  const toggleGroup = (templateId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Templates de Variações</h2>
        <p className="text-gray-400">
          Crie templates reutilizáveis (ex: Tamanho, Borda) e use em vários produtos
        </p>
      </div>

      {/* Criar Novo Template */}
      <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Plus size={20} className="mr-2 text-orange-400" />
          Novo Template Global
        </h3>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ex: Tamanho, Borda, Sabor, Tipo de Massa..."
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            className="w-full p-4 bg-black/50 border border-orange-500/30 rounded-xl text-white outline-none focus:border-orange-400"
          />
          
          <div className="flex gap-4">
            <label className="flex items-center space-x-3 cursor-pointer bg-black/30 px-4 py-3 rounded-xl border border-white/10 flex-1">
              <input
                type="checkbox"
                checked={newTemplate.is_required}
                onChange={(e) => setNewTemplate({ ...newTemplate, is_required: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 text-orange-500"
              />
              <span className="text-sm text-gray-300 font-semibold">Obrigatório</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer bg-black/30 px-4 py-3 rounded-xl border border-white/10 flex-1">
              <input
                type="checkbox"
                checked={newTemplate.allow_multiple}
                onChange={(e) => setNewTemplate({ ...newTemplate, allow_multiple: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 text-orange-500"
              />
              <span className="text-sm text-gray-300 font-semibold">Múltipla escolha</span>
            </label>
          </div>

          <button
            onClick={handleAddTemplate}
            disabled={loading}
            className="w-full bg-orange-500 text-white p-4 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus size={20} />
            <span>Criar Template</span>
          </button>
        </div>
      </div>

      {/* Lista de Templates */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-2xl">
            <AlertCircle size={48} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-500 font-medium">Nenhum template criado ainda</p>
            <p className="text-gray-600 text-sm mt-2">
              Crie templates reutilizáveis para usar em múltiplos produtos
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-[#2a2a2a] rounded-2xl border border-white/10 overflow-hidden"
            >
              {/* Cabeçalho */}
              <div className="p-4 flex items-center justify-between bg-black/30">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleGroup(template.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedGroups.has(template.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  <div>
                    <h4 className="font-bold text-white text-lg">{template.name}</h4>
                    <div className="flex gap-2 mt-1">
                      {template.is_required && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                          Obrigatório
                        </span>
                      )}
                      {template.allow_multiple && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                          Múltipla escolha
                        </span>
                      )}
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {options[template.id]?.length || 0} opções
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-500 hover:text-red-400 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Opções (expandido) */}
              {expandedGroups.has(template.id) && (
                <div className="p-4 space-y-3">
                  {/* Adicionar Opção */}
                  <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-5 rounded-2xl">
                    <p className="text-sm font-bold text-orange-400 mb-3 uppercase">➕ Nova Opção</p>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nome (ex: Pequeno, Médio, Grande)"
                        value={newOption[template.id]?.name || ''}
                        onChange={(e) => setNewOption({
                          ...newOption,
                          [template.id]: {
                            ...(newOption[template.id] || { price_adjustment: 0, is_default: false }),
                            name: e.target.value
                          }
                        })}
                        className="w-full p-3 bg-black border border-orange-500/30 rounded-xl text-white text-sm outline-none focus:border-orange-400"
                      />

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newOption[template.id]?.price_adjustment || 0}
                          onChange={(e) => setNewOption({
                            ...newOption,
                            [template.id]: {
                              ...(newOption[template.id] || { name: '', is_default: false }),
                              price_adjustment: parseFloat(e.target.value) || 0
                            }
                          })}
                          className="w-full p-3 pl-12 bg-black border border-orange-500/30 rounded-xl text-white text-sm outline-none focus:border-orange-400"
                        />
                      </div>

                      <div className="flex gap-3">
                        <label className="flex-1 flex items-center space-x-2 cursor-pointer p-3 bg-black/50 rounded-xl border border-gray-700">
                          <input
                            type="checkbox"
                            checked={newOption[template.id]?.is_default || false}
                            onChange={(e) => setNewOption({
                              ...newOption,
                              [template.id]: {
                                ...(newOption[template.id] || { name: '', price_adjustment: 0 }),
                                is_default: e.target.checked
                              }
                            })}
                            className="w-5 h-5 rounded border-gray-700 text-orange-500"
                          />
                          <span className="text-sm text-gray-300 font-semibold">Padrão</span>
                        </label>

                        <button
                          onClick={() => handleAddOption(template.id)}
                          disabled={loading}
                          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Plus size={18} />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Opções */}
                  <div className="space-y-2">
                    {options[template.id]?.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 group"
                      >
                        <div>
                          <p className="font-medium text-white">{option.name}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs font-bold text-orange-400">
                              {option.price_adjustment >= 0 ? '+' : ''}R$ {option.price_adjustment.toFixed(2)}
                            </span>
                            {option.is_default && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 rounded-full">Padrão</span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteOption(option.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 p-2"
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
  );
};

export default VariationTemplatesManager;
