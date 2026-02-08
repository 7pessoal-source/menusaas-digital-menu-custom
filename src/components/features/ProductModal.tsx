import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product, ProductExtra } from '@/types';
import { supabase } from '@/services/supabase';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: {
    product: Product;
    quantity: number;
    selectedExtras: ProductExtra[];
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
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);
  const [observations, setObservations] = useState('');
  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchExtras();
      // Reset ao abrir
      setQuantity(1);
      setSelectedExtras([]);
      setObservations('');
    }
  }, [isOpen, product]);

  const fetchExtras = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_extras')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      setExtras(data || []);
    } catch (error) {
      console.error('Erro ao buscar adicionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExtra = (extra: ProductExtra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const calculateTotal = () => {
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return (product.price + extrasTotal) * quantity;
  };

  const handleAddToCart = () => {
    onAddToCart({
      product,
      quantity,
      selectedExtras,
      observations,
      totalPrice: calculateTotal(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1a1a1a] w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header com imagem */}
        <div className="relative h-64 sm:h-80">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover sm:rounded-t-3xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Nome e Preço */}
          <div>
            <h2 className="text-2xl font-black text-white mb-3">{product.name}</h2>
            
            {/* DESCRIÇÃO DO PRODUTO - DESTACADA */}
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
              R$ {product.price.toFixed(2)}
            </p>
          </div>

          {/* Adicionais */}
          {extras.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">
                Adicionais
              </h3>
              <div className="space-y-2">
                {extras.map((extra) => {
                  const isSelected = selectedExtras.find((e) => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                        isSelected
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
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400'
                            : 'border-gray-600'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 bg-black rounded-full" />
                        )}
                      </div>
                    </button>
                  );
                })}
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
            className="w-full bg-amber-400 text-black p-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 hover:bg-amber-300 transition-all shadow-xl"
          >
            <ShoppingCart size={24} />
            <span>Adicionar • R$ {calculateTotal().toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
