import React, { useMemo, useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Minus, 
  ChevronRight, 
  Search, 
  ArrowLeft, 
  X as XIcon, 
  AlertCircle, 
  CreditCard,
  QrCode,
  Banknote,
  Store as StoreIcon,
  Flame,
  ShoppingBag
} from 'lucide-react';
import { Restaurant, Category, Product, OrderItem, CartItem } from '../../types';
import ProductModal from './ProductModal';

interface PublicMenuProps {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  onExit: () => void;
}

const PublicMenu: React.FC<PublicMenuProps> = ({ 
  restaurant, 
  categories, 
  products, 
  onExit
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Checkout States
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cartão' | 'Pix' | 'Dinheiro' | ''>('');

  const effectiveIsOpen = Boolean(restaurant.isOpen);
  const allowsDelivery = Boolean(restaurant.allows_delivery);

  const menuCategories = useMemo(() => [
    { id: 'all', name: '✨ Todos', restaurant_id: restaurant.id, order: -1 },
    ...categories
  ], [categories, restaurant.id]);

  const addToCart = (productId: string) => {
    if (!effectiveIsOpen) return;
    setCart((prev) => {
      const newCart = new Map<string, number>(prev);
      const currentQty = newCart.get(productId) || 0;
      newCart.set(productId, currentQty + 1);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newCart = new Map<string, number>(prev);
      const current = newCart.get(productId) || 0;
      if (current <= 1) newCart.delete(productId);
      else newCart.set(productId, current - 1);
      return newCart;
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
    // Aqui você pode adicionar lógica adicional, como mostrar toast de sucesso
    console.log('Item adicionado ao carrinho:', item);
    
    // Mantendo compatibilidade com o contador do carrinho atual
    addToCart(item.product.id);
  };

  const cartTotal: number = [...cart].reduce((sum, [id, qty]) => {
    const product = products.find(p => p.id === id);
    return sum + (Number(product?.price) || 0) * qty;
  }, 0);

  const cartItemsCount: number = [...cart.values()].reduce((sum, qty) => sum + qty, 0);

  const isBelowMinOrder = cartTotal < (restaurant.min_order_value || 0);
  
  const isFormInvalid = () => {
    if (!customerName.trim()) return true;
    if (!paymentMethod) return true;
    if (allowsDelivery && !customerAddress.trim()) return true;
    return false;
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
      return matchesSearch && matchesCategory && p.is_available;
    })
    .sort((a, b) => {
      if (a.is_promotion && !b.is_promotion) return -1;
      if (!a.is_promotion && b.is_promotion) return 1;
      return 0;
    });

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid() || isBelowMinOrder || !effectiveIsOpen) return;

    const items: OrderItem[] = Array.from(cart.entries()).map(([id, qty]) => {
      const p = products.find(prod => prod.id === id)!;
      return {
        productId: id,
        productName: p.name,
        quantity: qty,
        price: Number(p.price)
      };
    });

    const serviceType = allowsDelivery ? '✅ ENTREGA EM CASA' : '✅ RETIRADA NO LOCAL';
    const addressDetails = allowsDelivery ? `\n📍 *Endereço:* ${customerAddress}` : `\n📍 *Ponto de Retirada:* ${restaurant.address}`;

    const message = `*🍕 NOVO PEDIDO - ${restaurant.name}*\n\n` +
      `*Itens:*\n${items.map(i => `• ${i.quantity}x ${i.productName}`).join('\n')}\n\n` +
      `💰 *Total:* R$ ${cartTotal.toFixed(2)}\n\n` +
      `*👤 Dados do Cliente:*\n` +
      `• Nome: ${customerName}\n` +
      `• Pagamento: ${paymentMethod}\n` +
      `• Modo: ${serviceType}${addressDetails}`;

    window.open(`https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    setCart(new Map());
    setIsCartOpen(false);
  };

  return (
    <div className={`min-h-screen bg-[#1a1a1a] pb-32 text-white ${!effectiveIsOpen ? 'opacity-60' : ''}`}>
      {/* Alert de fechado */}
      {!effectiveIsOpen && (
        <div className="bg-red-600/90 backdrop-blur-sm text-white text-center py-3 px-4 sticky top-0 z-[60] font-bold flex items-center justify-center">
           <AlertCircle size={18} className="mr-2" /> 
           RESTAURANTE FECHADO
        </div>
      )}

      {/* Header com busca */}
      <div className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-5 py-4">
          {/* Logo e voltar */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onExit}
              className="p-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
            
            {restaurant.logo && (
              <img 
                src={restaurant.logo} 
                className="h-10 w-10 rounded-xl object-cover" 
                alt={restaurant.name} 
              />
            )}
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search your favourites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-[#2a2a2a] rounded-2xl text-white placeholder:text-gray-500 outline-none border border-white/5 focus:border-white/10 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <XIcon size={18} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Categorias */}
        <div className="overflow-x-auto scrollbar-hide px-5 pb-4">
          <div className="flex space-x-3 min-w-max">
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-center px-5 py-3 rounded-2xl transition-all ${
                  activeCategory === cat.id
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-[#2a2a2a] border border-white/5 hover:bg-white/5'
                }`}
              >
                <span className="text-2xl mb-1">
                  {cat.id === 'all' ? '✨' : (cat.name.toLowerCase().includes('bebida') ? '🥤' : '🍽️')}
                </span>
                <span className="text-xs font-semibold whitespace-nowrap">
                  {cat.name.replace('✨ ', '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de produtos - 2 colunas */}
      <div className="px-5 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-600" size={32} />
            </div>
            <p className="text-gray-400 font-semibold text-lg">No items found</p>
            <p className="text-gray-600 text-sm mt-2">Try another search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-[#2a2a2a]/50 backdrop-blur-sm rounded-3xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden cursor-pointer"
                onClick={() => handleProductClick(product)}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Badge de promoção */}
                {product.is_promotion && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full shadow-lg">
                      <Flame size={14} className="text-white" />
                    </div>
                  </div>
                )}

                {/* Imagem */}
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#1a1a1a] mb-3 flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={`${product.image}?width=400&height=400&resize=cover`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={product.name}
                    />
                  ) : (
                    <StoreIcon size={40} className="text-gray-700" />
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-white leading-tight line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Preço e botão */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-orange-500 text-xl font-bold">
                      ${Number(product.price).toFixed(2)}
                    </span>

                    {cart.has(product.id) ? (
                      <div className="flex items-center bg-[#1a1a1a] rounded-xl p-1 border border-white/10">
                        <button 
                          onClick={() => removeFromCart(product.id)} 
                          className="p-2 hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Minus size={14} className="text-orange-500" />
                        </button>
                        <span className="px-3 font-bold text-sm text-white">
                          {cart.get(product.id)}
                        </span>
                        <button 
                          onClick={() => addToCart(product.id)} 
                          className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-all"
                        >
                          <Plus size={14} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(product.id)} 
                        disabled={!effectiveIsOpen}
                        className={`p-2.5 rounded-xl transition-all ${
                          effectiveIsOpen
                            ? 'bg-orange-500 hover:bg-orange-600 active:scale-95'
                            : 'bg-gray-700 cursor-not-allowed'
                        }`}
                      >
                        <Plus size={18} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão do carrinho flutuante */}
      {cartItemsCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-5 right-5 z-40">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className={`w-full p-5 rounded-2xl flex items-center justify-between shadow-2xl transition-all ${
              isBelowMinOrder 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm w-10 h-10 rounded-xl flex items-center justify-center font-black">
                {cartItemsCount}
              </div>
              <span className="font-bold text-white">View Cart</span>
            </div>
            <span className="font-black text-xl text-white">
              R$ {cartTotal.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Modal do carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-t-[40px] h-[94vh] flex flex-col overflow-hidden border-t border-white/10">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Finalizar Pedido</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">{restaurant.name}</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-3 bg-white/5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <XIcon size={24} />
              </button>
            </div>
            
            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Items */}
              <div className="space-y-3">
                {Array.from(cart.entries()).map(([id, qty]) => {
                  const p = products.find(prod => prod.id === id)!;
                  return (
                    <div key={id} className="flex justify-between items-center bg-[#2a2a2a]/50 p-4 rounded-2xl border border-white/5">
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{p.name}</h4>
                        <p className="text-xs font-semibold text-orange-500 mt-1">
                          R$ {Number(p.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-[#1a1a1a] rounded-xl p-1 border border-white/10">
                          <button onClick={() => removeFromCart(id)} className="p-2 hover:bg-white/5 rounded-lg">
                            <Minus size={14} className="text-orange-500" />
                          </button>
                          <span className="px-3 font-bold text-sm text-white">{qty}</span>
                          <button onClick={() => addToCart(id)} className="p-2 bg-orange-500 rounded-lg">
                            <Plus size={14} className="text-white" />
                          </button>
                        </div>
                        <span className="font-bold text-white min-w-[80px] text-right">
                          R$ {(Number(p.price) * qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Formulário */}
              <div className="space-y-5">
                <h3 className="font-black text-lg text-white">Seus Dados</h3>
                
                <input 
                  type="text" 
                  placeholder="Nome completo *" 
                  className="w-full p-4 bg-[#2a2a2a] rounded-2xl text-white placeholder:text-gray-500 outline-none border border-white/5 focus:border-white/10" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                />
                
                {allowsDelivery ? (
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Endereço completo *" 
                      className="w-full p-4 pl-12 bg-[#2a2a2a] rounded-2xl text-white placeholder:text-gray-500 outline-none border border-white/5 focus:border-white/10" 
                      value={customerAddress} 
                      onChange={(e) => setCustomerAddress(e.target.value)} 
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                    <p className="text-orange-500 text-sm font-bold">
                      <StoreIcon size={16} className="inline mr-2" />
                      Retirada: {restaurant.address}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-black text-lg text-white mb-3">Pagamento</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'Cartão', icon: CreditCard },
                      { id: 'Pix', icon: QrCode },
                      { id: 'Dinheiro', icon: Banknote }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                          paymentMethod === method.id 
                            ? 'bg-orange-500 border-orange-500 text-white' 
                            : 'bg-[#2a2a2a] border-white/5 text-gray-400 hover:border-white/10'
                        }`}
                      >
                        <method.icon size={24} />
                        <span className="text-xs font-bold mt-2">{method.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isBelowMinOrder && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-red-500 text-sm font-bold">
                    <AlertCircle size={16} className="inline mr-2" />
                    Pedido mínimo: R$ {Number(restaurant.min_order_value).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#2a2a2a] border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm font-semibold">Total</span>
                <span className="text-3xl font-black text-orange-500">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
              <button 
                onClick={handleSubmitOrder} 
                disabled={isFormInvalid() || isBelowMinOrder}
                className={`w-full p-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                  isFormInvalid() || isBelowMinOrder 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                <span>
                  {isBelowMinOrder ? 'Adicione mais itens' : (isFormInvalid() ? 'Preencha os dados' : 'Enviar Pedido')}
                </span>
                {!isFormInvalid() && !isBelowMinOrder && <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default PublicMenu;
