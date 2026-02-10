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
  AlertCircle,
  Settings,
  Layers
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
    allow_multiple: false,
    max_selections: 1  // NOVO
  });

  const [newOption, setNewOption] = useState<Record<string, {
    name: string;
    price_adjustment: number;
    is_default: boolean;
  }>>({});

  useEffect(() => {
    if (restaurantId) {
      fetchTemplates();
    }
  }, [restaurantId]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data: templatesData, error: tError } = await supabase
        .from('variation_group_templates')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order');
      
      if (tError) throw tError;
      
      if (templatesData) {
        setTemplates(templatesData);
        
        const optionsMap: Record<string, VariationOptionTemplate[]> = {};
        
        // Buscar todas as opções de uma vez para otimizar
        const templateIds = templatesData.map(t => t.id);
        if (templateIds.length > 0) {
          const { data: optionsData, error: oError } = await supabase
            .from('variation_option_templates')
            .select('*')
            .in('template_group_id', templateIds)
            .order('display_order');
          
          if (oError) throw oError;

          if (optionsData) {
            optionsData.forEach(opt => {
              if (!optionsMap[opt.template_group_id]) {
                optionsMap[opt.template_group_id] = [];
              }
              optionsMap[opt.template_group_id].push(opt);
            });
          }
        }
        
        setOptions(optionsMap);
      }
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    } finally {
      setLoading(false);
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
        max_selections: newTemplate.max_selections,  // NOVO
        display_order: templates.length
      });

    if (!error) {
      setNewTemplate({ name: '', is_required: true, allow_multiple: false, max_selections: 1 });
      await fetchTemplates();
    } else {
      console.error('Erro ao criar template:', error);
      alert('Erro ao criar template. Verifique se as tabelas foram criadas no Supabase.');
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
    const { error } = await supabase
      .from('variation_option_templates')
      .insert({
        template_group_id: templateId,
        name: data.name,
        price_adjustment: data.price_adjustment || 0,
        is_default: data.is_default,
        display_order: (options[templateId]?.length || 0)
      });

    if (!error) {
      setNewOption({ ...newOption, [templateId]: { name: '', price_adjustment: 0, is_default: false } });
      await fetchTemplates();
    } else {
      console.error('Erro ao adicionar opção:', error);
    }
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Layers className="text-orange-500" size={24} />
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Templates de Variações</h2>
          </div>
          <p className="text-gray-400 font-medium">
            Gerencie modelos reutilizáveis de tamanhos, bordas e complementos para seus produtos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Criação */}
        <div className="lg:col-span-1">
          <div className="bg-[#2a2a2a] border border-white/5 p-6 rounded-3xl shadow-xl sticky top-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Plus size={20} className="mr-2 text-orange-500" />
              Criar Novo Template
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1 block">Nome do Grupo</label>
                <input
                  type="text"
                  placeholder="Ex: Tamanho, Borda, Sabores..."
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full p-4 bg-black/30 border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center space-x-3 cursor-pointer bg-black/20 p-4 rounded-2xl border border-white/5 hover:bg-black/40 transition-all">
                  <input
                    type="checkbox"
                    checked={newTemplate.is_required}
                    onChange={(e) => setNewTemplate({ ...newTemplate, is_required: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-700 text-orange-500 focus:ring-orange-500 bg-gray-900"
                  />
                  <span className="text-xs text-gray-300 font-black uppercase">Seleção Obrigatória</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer bg-black/20 p-4 rounded-2xl border border-white/5 hover:bg-black/40 transition-all">
                  <input
                    type="checkbox"
                    checked={newTemplate.allow_multiple}
                    onChange={(e) => setNewTemplate({ ...newTemplate, allow_multiple: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-700 text-orange-500 focus:ring-orange-500 bg-gray-900"
                  />
                  <span className="text-xs text-gray-300 font-black uppercase">Múltipla Escolha</span>
                </label>
              </div>

              {/* NOVO CAMPO: Quantidade de seleções */}
              {newTemplate.allow_multiple && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-3">
                  <label className="text-[10px] font-black text-blue-400 uppercase block">
                    Quantas opções o cliente pode escolher?
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newTemplate.max_selections}
                      onChange={(e) => setNewTemplate({ 
                        ...newTemplate, 
                        max_selections: parseInt(e.target.value) || 1 
                      })}
                      className="w-20 p-3 bg-black/50 border border-blue-500/30 rounded-xl text-white font-bold text-center outline-none focus:border-blue-400"
                    />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-300 font-medium">
                        {newTemplate.max_selections === 2 && '🍕 Ex: Pizza Meia-Meia (2 sabores)'}
                        {newTemplate.max_selections === 3 && '🍕 Ex: Pizza 3 Sabores'}
                        {newTemplate.max_selections === 4 && '🍕 Ex: Pizza 4 Sabores'}
                        {newTemplate.max_selections > 4 && `📝 Cliente escolhe ${newTemplate.max_selections} opções`}
                        {newTemplate.max_selections === 1 && '✅ Escolha única (padrão)'}
                      </p>
                      <p className="text-[9px] text-gray-500 mt-1">
                        Cliente pode escolher o mesmo sabor repetido
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddTemplate}
                disabled={loading}
                className="w-full bg-orange-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-orange-500/20 mt-2"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <Plus size={20} />}
                <span>Criar Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna de Lista */}
        <div className="lg:col-span-2 space-y-4">
          {templates.length === 0 && !loading ? (
            <div className="text-center py-20 bg-[#2a2a2a] border-2 border-dashed border-white/5 rounded-3xl">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-tighter text-xl">Nenhum template criado</p>
              <p className="text-gray-600 text-sm mt-2 max-w-xs mx-auto font-medium">
                Comece criando um template de variação ao lado para organizar seu cardápio.
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="bg-[#2a2a2a] rounded-3xl border border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Cabeçalho do Template */}
                <div className="p-5 flex items-center justify-between bg-white/5">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleGroup(template.id)}
                      className="w-10 h-10 flex items-center justify-center bg-black/20 rounded-xl text-gray-400 hover:text-white hover:bg-black/40 transition-all"
                    >
                      {expandedGroups.has(template.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    <div>
                      <h4 className="font-black text-white text-lg uppercase tracking-tight">{template.name}</h4>
                      <div className="flex gap-2 mt-1">
                        {template.is_required && (
                          <span className="text-[9px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-black uppercase">
                            Obrigatório
                          </span>
                        )}
                        {template.allow_multiple && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase">
                            Escolher {template.max_selections || 1}
                          </span>
                        )}
                        <span className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase">
                          {options[template.id]?.length || 0} opções
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Área de Opções (Expandida) */}
                {expandedGroups.has(template.id) && (
                  <div className="p-6 space-y-6 bg-black/20 animate-in slide-in-from-top-2 duration-300">
                    {/* Formulário de Nova Opção */}
                    <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Adicionar Opção ao Template</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase ml-1 mb-1 block">Nome da Opção</label>
                          <input
                            type="text"
                            placeholder="Ex: Pequena, Com Bacon, Tradicional..."
                            value={newOption[template.id]?.name || ''}
                            onChange={(e) => setNewOption({
                              ...newOption,
                              [template.id]: {
                                ...(newOption[template.id] || { price_adjustment: 0, is_default: false }),
                                name: e.target.value
                              }
                            })}
                            className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white text-sm font-bold outline-none focus:border-orange-500/50"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase ml-1 mb-1 block">Ajuste de Preço (R$)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 font-black text-xs">R$</span>
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
                              className="w-full p-3 pl-10 bg-black/40 border border-white/5 rounded-xl text-white text-sm font-bold outline-none focus:border-orange-500/50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-3">
                        <label className="flex-1 flex items-center space-x-3 cursor-pointer p-3 bg-black/20 rounded-xl border border-white/5 hover:bg-black/40 transition-all">
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
                            className="w-5 h-5 rounded border-gray-700 text-orange-500 focus:ring-orange-500 bg-gray-900"
                          />
                          <span className="text-xs text-gray-400 font-black uppercase">Marcar como Padrão</span>
                        </label>

                        <button
                          onClick={() => handleAddOption(template.id)}
                          disabled={loading}
                          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-xs rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-orange-500/10"
                        >
                          <Plus size={16} />
                          <span>Adicionar Opção</span>
                        </button>
                      </div>
                    </div>

                    {/* Lista de Opções do Template */}
                    <div className="space-y-2">
                      {options[template.id]?.length === 0 ? (
                        <p className="text-center py-4 text-gray-600 text-xs font-bold uppercase italic">Nenhuma opção cadastrada neste template</p>
                      ) : (
                        options[template.id]?.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5 group hover:border-white/10 transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-2 h-2 rounded-full ${option.is_default ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-700'}`}></div>
                              <div>
                                <p className="font-bold text-white text-sm">{option.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-black text-orange-500 uppercase">
                                    {option.price_adjustment >= 0 ? '+' : ''} R$ {option.price_adjustment.toFixed(2)}
                                  </span>
                                  {option.is_default && (
                                    <span className="text-[8px] bg-green-500/10 text-green-500 px-2 rounded-full font-black uppercase border border-green-500/20">Padrão</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteOption(option.id)}
                              className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
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

export default VariationTemplatesManager;
