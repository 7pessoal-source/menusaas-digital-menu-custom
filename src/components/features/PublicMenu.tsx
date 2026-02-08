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
  Star,
  CreditCard,
  QrCode,
  Banknote,
  Store as StoreIcon,
  Sparkles,
  Flame
} from 'lucide-react';
import { Restaurant, Category, Product, OrderItem } from '../../types';

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
  const [scrollY, setScrollY] = useState(0);
  
  // Checkout States
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cartão' | 'Pix' | 'Dinheiro' | ''>('');

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      return matchesSearch && matchesCategory;
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
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pb-32 text-gray-900 transition-all duration-500 ${!effectiveIsOpen ? 'grayscale-[0.5]' : ''}`}>
      {/* Alert de fechado com gradiente animado */}
      {!effectiveIsOpen && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white text-center py-4 px-4 sticky top-0 z-[60] font-black flex items-center justify-center shadow-2xl animate-pulse">
           <AlertCircle size={20} className="mr-2 animate-bounce" /> 
           <span className="tracking-wider">RESTAURANTE FECHADO AGORA</span>
        </div>
      )}

      {/* Header com Parallax e gradiente */}
      <header className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
        {/* Cover com parallax */}
        <div 
          className="h-72 w-full relative overflow-hidden"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
          <img 
            src={restaurant.cover_image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000"} 
            className="w-full h-full object-cover scale-110 transition-transform duration-700 hover:scale-125" 
            alt="Banner" 
          />
          {/* Overlay com efeito glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        </div>

        {/* Botão voltar com glassmorphism */}
        <div className="absolute top-6 left-6 z-20">
           <button 
             onClick={onExit} 
             className="group p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl"
           >
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           </button>
        </div>

        {/* Info do restaurante */}
        <div className="px-6 -mt-16 relative z-20 pb-8">
          {/* Logo com animação e borda gradiente */}
          <div className="relative inline-block mb-4 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-[28px] blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
            <div className="relative bg-white p-3 rounded-3xl shadow-2xl">
              {restaurant.logo ? (
                <img 
                  src={restaurant.logo} 
                  className="w-28 h-28 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105" 
                  alt="Logo" 
                />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                  <StoreIcon size={40} />
                </div>
              )}
            </div>
          </div>

          {/* Nome e descrição */}
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="text-gray-300 text-sm mb-4 max-w-lg leading-relaxed">
              {restaurant.description}
            </p>
          )}

          {/* Badges informativos com gradiente */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              <span className="text-green-300 text-xs font-bold">
                {effectiveIsOpen ? 'Aberto Agora' : 'Fechado'}
              </span>
            </div>
            {restaurant.min_order_value > 0 && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-amber-400 text-xs font-bold">
                  Pedido mín: R$ {Number(restaurant.min_order_value).toFixed(2)}
                </span>
              </div>
            )}
            {allowsDelivery && (
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <MapPin size={14} className="mr-1.5 text-amber-400" />
                <span className="text-white text-xs font-bold">Delivery disponível</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Busca com efeito glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="px-6 py-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-semibold text-gray-800 outline-none border-2 border-transparent focus:border-amber-400 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-all"
              >
                <XIcon size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Categorias com scroll horizontal suave */}
        <div className="overflow-x-auto scrollbar-hide px-6 pb-4">
          <div className="flex space-x-3 min-w-max">
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg shadow-amber-400/30 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 active:scale-95'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de produtos com animações */}
      <div className="px-6 py-6 space-y-4 max-w-2xl mx-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-400 font-bold text-lg">Nenhum produto encontrado</p>
            <p className="text-gray-400 text-sm mt-2">Tente outra busca ou categoria</p>
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-3xl p-4 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-amber-200 relative overflow-hidden hover:-translate-y-1"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              {/* Badge de promoção com animação */}
              {product.is_promotion && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur animate-pulse" />
                    <div className="relative bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1.5 rounded-full flex items-center space-x-1 shadow-lg">
                      <Flame size={14} className="text-white animate-pulse" />
                      <span className="text-white text-xs font-black uppercase tracking-wider">Promoção</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Info do produto */}
                <div className="flex-1 space-y-2">
                  <h3 className="font-black text-lg text-gray-900 leading-tight group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    {/* Preço com destaque */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        R$ {Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    {/* Botão de adicionar com animação */}
                    <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-1.5 border border-gray-200 group-hover:border-amber-300 transition-all">
                      {cart.has(product.id) ? (
                        <>
                          <button 
                            onClick={() => removeFromCart(product.id)} 
                            className="p-2.5 bg-white rounded-xl text-amber-500 shadow-sm hover:shadow-md transition-all hover:scale-110 active:scale-95"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-black text-base min-w-[40px] text-center">
                            {cart.get(product.id)}
                          </span>
                          <button 
                            onClick={() => addToCart(product.id)} 
                            className="p-2.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl text-white shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
                          >
                            <Plus size={16} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => addToCart(product.id)} 
                          disabled={!effectiveIsOpen} 
                          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase flex items-center shadow-md transition-all duration-300 ${
                            effectiveIsOpen 
                              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:shadow-lg hover:scale-105 active:scale-95' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus size={16} className="mr-1.5" /> 
                          Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Imagem do produto com efeito hover */}
                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={product.name} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <StoreIcon size={32} />
                    </div>
                  )}
                  {/* Overlay gradiente no hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão do carrinho flutuante com animação */}
      {cartItemsCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-6 right-6 z-40 max-w-xl mx-auto">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className={`w-full p-6 rounded-3xl flex items-center justify-between shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 ${
              isBelowMinOrder 
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed' 
                : 'bg-gradient-to-r from-black via-gray-900 to-black hover:shadow-amber-400/20'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur animate-pulse" />
                <div className="relative bg-gradient-to-r from-amber-400 to-orange-400 text-black w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                  {cartItemsCount}
                </div>
              </div>
              <div className="text-left">
                <span className="font-black text-base uppercase tracking-wider text-white block">
                  Ver Carrinho
                </span>
                <span className="text-xs text-gray-400 font-bold">
                  {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'itens'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-2xl bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent block leading-none">
                R$ {cartTotal.toFixed(2)}
              </span>
              {isBelowMinOrder && (
                <span className="text-[10px] text-white/50 font-bold uppercase mt-1 block">
                  Abaixo do mínimo
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Modal do carrinho com animações suaves */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-white to-gray-50 w-full max-w-2xl rounded-t-[40px] h-[94vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
            {/* Header do modal */}
            <div className="p-8 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Finalizar Pedido
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                  {restaurant.name}
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-3 bg-white border-2 border-gray-200 rounded-2xl text-gray-400 hover:text-black hover:border-gray-300 transition-all hover:scale-110 active:scale-95 shadow-sm"
              >
                <XIcon size={24} />
              </button>
            </div>
            
            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Items do carrinho */}
              <div className="space-y-3">
                {Array.from(cart.entries()).map(([id, qty]) => {
                  const p = products.find(prod => prod.id === id)!;
                  return (
                    <div 
                      key={id} 
                      className="flex justify-between items-center bg-white p-5 rounded-3xl border-2 border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex-1">
                        <h4 className="font-black text-gray-800 group-hover:text-amber-600 transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs font-bold text-amber-600 mt-1">
                          Unitário: R$ {Number(p.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-gray-50 rounded-2xl p-2 border-2 border-gray-200 group-hover:border-amber-300 transition-all">
                          <button 
                            onClick={() => removeFromCart(id)} 
                            className="p-2 text-amber-500 hover:bg-white rounded-lg transition-all hover:scale-110 active:scale-95"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 font-black text-base">
                            {qty}
                          </span>
                          <button 
                            onClick={() => addToCart(id)} 
                            className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg text-white transition-all hover:scale-110 active:scale-95 shadow-sm"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-black text-gray-900 min-w-[90px] text-right text-lg">
                          R$ {(Number(p.price) * qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Formulário de dados */}
              <div className="pt-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-1.5 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                  <h3 className="font-black text-xl uppercase tracking-tight">Seus Dados</h3>
                </div>
                
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Digite seu nome completo *" 
                    className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-gray-200 focus:border-amber-400 focus:bg-white transition-all shadow-sm hover:shadow-md" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                  />
                  
                  {allowsDelivery ? (
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                      <input 
                        type="text" 
                        placeholder="Endereço Completo com Bairro *" 
                        className="w-full p-5 pl-14 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-gray-200 focus:border-amber-400 focus:bg-white transition-all shadow-sm hover:shadow-md" 
                        value={customerAddress} 
                        onChange={(e) => setCustomerAddress(e.target.value)} 
                      />
                    </div>
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 flex flex-col space-y-3 text-amber-900 shadow-inner">
                      <div className="flex items-center space-x-2 font-black uppercase text-sm">
                        <StoreIcon size={18} /> 
                        <span>Retirada no Local</span>
                      </div>
                      <p className="text-[11px] font-bold opacity-70 uppercase tracking-widest">
                        Endereço para retirada:
                      </p>
                      <p className="font-black text-base leading-tight">
                        {restaurant.address}
                      </p>
                    </div>
                  )}
                </div>

                {/* Forma de pagamento */}
                <div className="pt-4 space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-1.5 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                    <h3 className="font-black text-xl uppercase tracking-tight">Pagamento</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'Cartão', icon: CreditCard },
                      { id: 'Pix', icon: QrCode },
                      { id: 'Dinheiro', icon: Banknote }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 space-y-3 ${
                          paymentMethod === method.id 
                            ? 'bg-gradient-to-br from-amber-400 to-orange-400 border-amber-400 text-white shadow-2xl shadow-amber-400/30 scale-110' 
                            : 'bg-white border-gray-200 text-gray-400 hover:border-amber-200 hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        <method.icon size={28} strokeWidth={2.5} />
                        <span className="text-xs font-black uppercase tracking-widest">
                          {method.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alert de pedido mínimo */}
              {isBelowMinOrder && (
                <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl flex items-center space-x-4 text-red-700 shadow-lg animate-in fade-in zoom-in duration-300">
                  <AlertCircle size={24} className="shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">
                      Pedido mínimo: R$ {Number(restaurant.min_order_value).toFixed(2)}
                    </p>
                    <p className="text-xs font-bold opacity-80 mt-1">
                      Faltam R$ {(restaurant.min_order_value - cartTotal).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer com botão de finalizar */}
            <div className="p-8 bg-gradient-to-r from-black via-gray-900 to-black border-t border-gray-800">
              <div className="flex justify-between items-center text-white mb-6">
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">
                  Total do Pedido
                </span>
                <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
              <button 
                onClick={handleSubmitOrder} 
                disabled={isFormInvalid() || isBelowMinOrder}
                className={`w-full p-6 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 ${
                  isFormInvalid() || isBelowMinOrder 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 text-black hover:scale-105 hover:shadow-amber-400/30 active:scale-95'
                }`}
              >
                <span>
                  {isBelowMinOrder 
                    ? 'Adicione mais itens' 
                    : (isFormInvalid() ? 'Preencha os dados' : 'Enviar Pedido')
                  }
                </span>
                {!isFormInvalid() && !isBelowMinOrder && <ChevronRight size={24} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animação de fadeInUp */}
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
    </div>
  );
};

export default PublicMenu;
