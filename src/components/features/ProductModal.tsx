import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { 
  Product, 
  ProductExtra,
  ProductVariationGroup,
  ProductVariationOption,
  SelectedVariation
} from '@/types';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: {
    product: Product;
    quantity: number;
    selectedExtras: ProductExtra[];
    selectedVariations: SelectedVariation[];
    observations: string;
    totalPrice: number;
  }) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  
  // Extras
  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  
  // Variações
  const [variationGroups, setVariationGroups] = useState<ProductVariationGroup[]>([]);
  const [variationOptions, setVariationOptions] = useState<Record<string, ProductVariationOption[]>>({});
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string[]>>({});
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && product) {
      fetchProductData();
      // Reset ao abrir
      setQuantity(1);
      setObservations('');
      setSelectedExtras(new Set());
      setSelectedVariations({});
    }
  }, [isOpen, product?.id]);

  const fetchProductData = async () => {
    setLoading(true);

    try {
      // Buscar extras
      const { data: extrasData } = await supabase
        .from('product_extras')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_available', true)
        .order('name');
      
      if (extrasData) setExtras(extrasData);

      // NOVO: Buscar templates vinculados ao produto via assignments
      const { data: assignmentsData } = await supabase
        .from('product_variation_assignments')
        .select(`
          *,
          variation_group_templates!inner (
            *,
            variation_option_templates (*)
          )
        `)
        .eq('product_id', product.id)
        .order('display_order');
      
      const allGroups: any[] = [];
      const optionsMap: Record<string, any[]> = {};
      const defaultSelections: Record<string, string[]> = {};

      if (assignmentsData && assignmentsData.length > 0) {
        assignmentsData.forEach(a => {
          const group = (a as any).variation_group_templates;
          if (group) {
            allGroups.push(group);
            const opts = group.variation_option_templates || [];
            optionsMap[group.id] = opts;
            
            const defaultOpt = opts.find((o: any) => o.is_default);
            if (defaultOpt && !group.allow_multiple) {
              defaultSelections[group.id] = [defaultOpt.id];
            } else if (group.allow_multiple) {
              defaultSelections[group.id] = [];
            }
          }
        });
      }

      // Buscar grupos de variação diretos (sistema antigo, se houver)
      const { data: groupsData } = await supabase
        .from('product_variation_groups')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order');
      
      if (groupsData) {
        for (const group of groupsData) {
          allGroups.push(group);
          const { data: optionsData } = await supabase
            .from('product_variation_options')
            .select('*')
            .eq('variation_group_id', group.id)
            .eq('is_available', true)
            .order('display_order');
          
          if (optionsData) {
            optionsMap[group.id] = optionsData;
            const defaultOption = optionsData.find(opt => opt.is_default);
            if (defaultOption && !group.allow_multiple) {
              defaultSelections[group.id] = [defaultOption.id];
            } else if (group.allow_multiple) {
              defaultSelections[group.id] = [];
            }
          }
        }
      }

      setVariationGroups(allGroups);
      setVariationOptions(optionsMap);
      setSelectedVariations(defaultSelections);
    } catch (err) {
      console.error('Erro ao buscar dados do produto:', err);
    }

    setLoading(false);
  };

  const toggleExtra = (extraId: string) => {
    const newSelected = new Set(selectedExtras);
    if (newSelected.has(extraId)) {
      newSelected.delete(extraId);
    } else {
      newSelected.add(extraId);
    }
    setSelectedExtras(newSelected);
  };

  const handleVariationChange = (groupId: string, optionId: string) => {
    const group = variationGroups.find(g => g.id === groupId);
    
    if (!group) return;

    if (!group.allow_multiple) {
      // Seleção única (radio button)
      setSelectedVariations({ ...selectedVariations, [groupId]: [optionId] });
    } else {
      // Múltiplas seleções (checkbox)
      const currentSelections = selectedVariations[groupId] || [];
      const maxSelections = group.max_selections || 1;
      
      if (currentSelections.includes(optionId)) {
        // Remove se já está selecionado
        setSelectedVariations({
          ...selectedVariations,
          [groupId]: currentSelections.filter(id => id !== optionId)
        });
      } else {
        // Adiciona se não atingiu o limite
        if (currentSelections.length < maxSelections) {
          setSelectedVariations({
            ...selectedVariations,
            [groupId]: [...currentSelections, optionId]
          });
        } else {
          alert(`Você pode escolher no máximo ${maxSelections} ${maxSelections === 1 ? 'sabor' : 'sabores'}`);
        }
      }
    }
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    
    // Somar extras
    extras.forEach(extra => {
      if (selectedExtras.has(extra.id)) {
        total += extra.price;
      }
    });
    
    // Somar ajustes de variações
    Object.entries(selectedVariations).forEach(([groupId, optionIds]) => {
      optionIds.forEach(optionId => {
        const option = variationOptions[groupId]?.find(opt => opt.id === optionId);
        if (option) {
          total += option.price_adjustment;
        }
      });
    });
    
    return total * quantity;
  };

  const canAddToCart = () => {
    return variationGroups.every(group => {
      if (group.is_required) {
        const selections = selectedVariations[group.id] || [];
        
        if (group.allow_multiple) {
          // Para multi-seleção, deve ter EXATAMENTE max_selections
          const maxSelections = group.max_selections || 1;
          return selections.length === maxSelections;
        } else {
          // Para seleção única, deve ter pelo menos 1
          return selections.length === 1;
        }
      }
      return true;
    });
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) {
      alert('Por favor, selecione todas as opções obrigatórias');
      return;
    }

    const selectedExtrasArray = extras.filter(extra => selectedExtras.has(extra.id));
    
    const selectedVariationsArray: SelectedVariation[] = [];
    
    Object.entries(selectedVariations).forEach(([groupId, optionIds]) => {
      const group = variationGroups.find(g => g.id === groupId);
      
      optionIds.forEach(optionId => {
        const option = variationOptions[groupId]?.find(opt => opt.id === optionId);
        
        selectedVariationsArray.push({
          group_id: groupId,
          group_name: group?.name || '',
          option_id: optionId,
          option_name: option?.name || '',
          price_adjustment: option?.price_adjustment || 0
        });
      });
    });
    
    onAddToCart({
      product,
      quantity,
      selectedExtras: selectedExtrasArray,
      selectedVariations: selectedVariationsArray,
      observations,
      totalPrice: calculateTotalPrice()
    });
    onClose();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-[#1a1a1a] p-8 rounded-3xl">
          <p className="text-white font-bold">Carregando...</p>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1a1a1a] w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header com imagem */}
        <div className="relative h-64 sm:h-80">
          <img
            src={`${product.image}?width=800&height=800&resize=cover`}
            alt={product.name}
            className="w-full h-full object-cover sm:rounded-t-3xl"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%231a1a1a"/%3E%3C/svg%3E';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Nome e Preço Base */}
          <div>
            <h2 className="text-2xl font-black text-white mb-3">{product.name}</h2>
            
            {product.description && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
                  Descrição
                </p>
                <p className="text-white text-base leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
            
            <p className="text-3xl font-black text-amber-400">
              A partir de R$ {product.price.toFixed(2)}
            </p>
          </div>

          {/* ========== VARIAÇÕES ========== */}
          {variationGroups.length > 0 && (
            <div className="space-y-4">
              {variationGroups.map((group) => (
                <div key={group.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">
                      {group.name}
                      {group.allow_multiple && group.max_selections && (
                        <span className="ml-2 text-sm font-normal text-gray-400">
                          (Escolha {group.max_selections})
                        </span>
                      )}
                    </h3>
                    {group.is_required && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                        Obrigatório
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {variationOptions[group.id]?.map((option) => {
                      const isSelected = (selectedVariations[group.id] || []).includes(option.id);
                      const currentCount = (selectedVariations[group.id] || []).length;
                      const maxSelections = group.max_selections || 1;
                      
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-gray-800 bg-black/50 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type={group.allow_multiple ? "checkbox" : "radio"}
                              name={`variation-${group.id}`}
                              checked={isSelected}
                              onChange={() => handleVariationChange(group.id, option.id)}
                              className="w-5 h-5 text-orange-500"
                            />
                            <div>
                              <span className="text-white font-bold">{option.name}</span>
                              {group.allow_multiple && isSelected && (
                                <span className="ml-2 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-black">
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-orange-400 font-black">
                            {option.price_adjustment >= 0 ? '+' : ''}
                            R$ {option.price_adjustment.toFixed(2)}
                          </span>
                        </label>
                      );
                    })}
                    
                    {/* Contador de seleções */}
                    {group.allow_multiple && (
                      <div className="mt-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <p className="text-xs font-bold text-center">
                          {((selectedVariations[group.id] || []).length) === (group.max_selections || 1) ? (
                            <span className="text-green-400">
                              ✓ {(group.max_selections || 1)} {(group.max_selections || 1) === 1 ? 'sabor escolhido' : 'sabores escolhidos'}
                            </span>
                          ) : (
                            <span className="text-blue-400">
                              {((selectedVariations[group.id] || []).length)} de {(group.max_selections || 1)} {(group.max_selections || 1) === 1 ? 'sabor escolhido' : 'sabores escolhidos'}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========== ADICIONAIS ========== */}
          {extras.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center">
                Adicionais
                <span className="ml-2 text-xs font-normal text-gray-400 uppercase tracking-widest">
                  Opcional
                </span>
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {extras.map((extra) => (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      selectedExtras.has(extra.id)
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-800 bg-black/50 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedExtras.has(extra.id)
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-700'
                      }`}>
                        {selectedExtras.has(extra.id) && <Plus size={16} className="text-white" />}
                      </div>
                      <span className="text-white font-bold">{extra.name}</span>
                    </div>
                    <span className="text-orange-400 font-black">
                      + R$ {extra.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-3">
            <h3 className="text-lg font-black text-white">Alguma observação?</h3>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ex: Tirar cebola, maionese à parte..."
              className="w-full h-32 bg-black/50 border-2 border-gray-800 rounded-2xl p-4 text-white placeholder-gray-600 outline-none focus:border-orange-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer com Quantidade e Botão */}
        <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-black/50 rounded-2xl p-1 border-2 border-gray-800">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center text-white hover:text-orange-500 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center text-xl font-black text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center text-white hover:text-orange-500 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="text-right">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Total do Item
              </p>
              <p className="text-3xl font-black text-white">
                R$ {totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 transition-all ${
              canAddToCart()
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={24} />
            <span>Adicionar ao Carrinho</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
