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
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  
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

    // Buscar extras
    const { data: extrasData } = await supabase
      .from('product_extras')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_available', true)
      .order('name');
    
    if (extrasData) setExtras(extrasData);

    // Buscar grupos de variação
    const { data: groupsData } = await supabase
      .from('product_variation_groups')
      .select('*')
      .eq('product_id', product.id)
      .order('display_order');
    
    if (groupsData) {
      setVariationGroups(groupsData);
      
      // Buscar opções de cada grupo
      const optionsMap: Record<string, ProductVariationOption[]> = {};
      const defaultSelections: Record<string, string> = {};
      
      for (const group of groupsData) {
        const { data: optionsData } = await supabase
          .from('product_variation_options')
          .select('*')
          .eq('variation_group_id', group.id)
          .eq('is_available', true)
          .order('display_order');
        
        if (optionsData) {
          optionsMap[group.id] = optionsData;
          
          // Selecionar opção padrão automaticamente
          const defaultOption = optionsData.find(opt => opt.is_default);
          if (defaultOption) {
            defaultSelections[group.id] = defaultOption.id;
          }
        }
      }
      
      setVariationOptions(optionsMap);
      setSelectedVariations(defaultSelections);
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
    setSelectedVariations({ ...selectedVariations, [groupId]: optionId });
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
    Object.entries(selectedVariations).forEach(([groupId, optionId]) => {
      const option = variationOptions[groupId]?.find(opt => opt.id === optionId);
      if (option) {
        total += option.price_adjustment;
      }
    });
    
    return total * quantity;
  };

  const canAddToCart = () => {
    // Verificar se todos os grupos obrigatórios têm seleção
    return variationGroups.every(group => {
      if (group.is_required) {
        return selectedVariations[group.id] !== undefined;
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
    
    const selectedVariationsArray: SelectedVariation[] = Object.entries(selectedVariations).map(
      ([groupId, optionId]) => {
        const group = variationGroups.find(g => g.id === groupId);
        const option = variationOptions[groupId]?.find(opt => opt.id === optionId);
        
        return {
          group_id: groupId,
          group_name: group?.name || '',
          option_id: optionId,
          option_name: option?.name || '',
          price_adjustment: option?.price_adjustment || 0
        };
      }
    );
    
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
                    <h3 className="font-bold text-white">{group.name}</h3>
                    {group.is_required && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                        Obrigatório
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {variationOptions[group.id]?.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedVariations[group.id] === option.id
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-gray-800 bg-black/50 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`variation-${group.id}`}
                            checked={selectedVariations[group.id] === option.id}
                            onChange={() => handleVariationChange(group.id, option.id)}
                            className="w-5 h-5 text-orange-500"
                          />
                          <span className="text-white font-bold">{option.name}</span>
                        </div>
                        <span className="text-orange-400 font-black">
                          {option.price_adjustment >= 0 ? '+' : ''}
                          R$ {option.price_adjustment.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========== EXTRAS ========== */}
          {extras.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Adicionais</h3>
              <div className="space-y-2">
                {extras.map((extra) => (
                  <label
                    key={extra.id}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between cursor-pointer ${
                      selectedExtras.has(extra.id)
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-gray-800 bg-black/50 hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white">{extra.name}</p>
                      <p className="text-sm text-amber-400">
                        + R$ {extra.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedExtras.has(extra.id)}
                        onChange={() => toggleExtra(extra.id)}
                        className="w-6 h-6 rounded-full border-2 border-gray-600 text-amber-400 focus:ring-amber-400 bg-transparent"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {product.allows_observations !== false && (
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase block mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: Sem cebola, ponto da carne bem passado..."
                className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white resize-none h-24 outline-none focus:border-amber-400 transition-all"
              />
            </div>
          )}

          {/* Quantidade */}
          <div className="flex items-center justify-between bg-black/50 p-4 rounded-2xl border border-gray-800">
            <span className="font-bold text-white">Quantidade</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all"
              >
                <Minus size={18} className="text-white" />
              </button>
              <span className="text-2xl font-black text-white w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Botão Adicionar */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart()}
            className="w-full bg-amber-400 text-black p-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 hover:bg-amber-300 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={24} />
            <span>Adicionar • R$ {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
