import React, { useState, useRef, useEffect } from 'react';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { useRestaurant } from '../../hooks/useRestaurant';
import { Restaurant } from '../../types';
import { supabase } from '../../services/supabase';
import { 
  Save, 
  Loader2, 
  Truck, 
  Copy, 
  Check, 
  Image as ImageIcon,
  DollarSign 
} from 'lucide-react';

const RestaurantSettings: React.FC = () => {
  const { currentRestaurant } = useRestaurantStore();
  const { updateRestaurant } = useRestaurant();
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: currentRestaurant?.name || '',
    slug: currentRestaurant?.slug || '',
    description: currentRestaurant?.description || '',
    logo: currentRestaurant?.logo || '',
    cover_image: currentRestaurant?.cover_image || '',
    primary_color: currentRestaurant?.primary_color || '#FBBF24',
    secondary_color: currentRestaurant?.secondary_color || '#000000',
    whatsapp: currentRestaurant?.whatsapp || '',
    contact_phone: currentRestaurant?.contact_phone || '',
    contact_email: currentRestaurant?.contact_email || '',
    address: currentRestaurant?.address || '',
    isOpen: currentRestaurant?.isOpen ?? true,
    allows_delivery: currentRestaurant?.allows_delivery ?? true,
    min_order_value: currentRestaurant?.min_order_value || 0,
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // 🔥 Sincronizar formData quando currentRestaurant mudar
  useEffect(() => {
    if (currentRestaurant) {
      setFormData({
        name: currentRestaurant.name || '',
        slug: currentRestaurant.slug || '',
        description: currentRestaurant.description || '',
        logo: currentRestaurant.logo || '',
        cover_image: currentRestaurant.cover_image || '',
        primary_color: currentRestaurant.primary_color || '#FBBF24',
        secondary_color: currentRestaurant.secondary_color || '#000000',
        whatsapp: currentRestaurant.whatsapp || '',
        contact_phone: currentRestaurant.contact_phone || '',
        contact_email: currentRestaurant.contact_email || '',
        address: currentRestaurant.address || '',
        isOpen: currentRestaurant.isOpen ?? true,
        allows_delivery: currentRestaurant.allows_delivery ?? true,
        min_order_value: currentRestaurant.min_order_value || 0,
      });
    }
  }, [currentRestaurant]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/menu/${currentRestaurant?.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRestaurant) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${currentRestaurant.id}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Erro ao fazer upload da logo');
      console.error(uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    setFormData({ ...formData, logo: publicUrl });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRestaurant) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `cover-${currentRestaurant.id}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Erro ao fazer upload da capa');
      console.error(uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    setFormData({ ...formData, cover_image: publicUrl });
  };

  // 🔥 VALIDAR se o slug já existe
  const validateSlug = async (slug: string): Promise<boolean> => {
    if (!slug || !currentRestaurant) return false;
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .neq('id', currentRestaurant.id) // Ignora o próprio restaurante
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao validar slug:', error);
      return false;
    }
    
    return data === null; // Retorna true se NÃO encontrou duplicata
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔥 VALIDAÇÃO: Campos obrigatórios
    if (!formData.name?.trim()) {
      alert('❌ Nome do restaurante é obrigatório');
      return;
    }
    
    if (!formData.slug?.trim()) {
      alert('❌ Link da Loja é obrigatório');
      return;
    }
    
    // 🔥 VALIDAÇÃO: Slug sem espaços ou caracteres especiais
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug)) {
      alert('❌ Slug deve conter apenas letras minúsculas, números e hífens (ex: meu-restaurante)');
      return;
    }
    
    // 🔥 VALIDAÇÃO: Slug único
    setLoading(true);
    const isSlugAvailable = await validateSlug(formData.slug);
    
    if (!isSlugAvailable) {
      setLoading(false);
      alert('❌ Este slug já está em uso. Por favor, escolha outro.');
      return;
    }

    console.log('🔵 [FORM SUBMIT] Submitting data:', formData);
    const result = await updateRestaurant(formData);

    if (result?.success) {
      console.log('✅ [FORM SUBMIT] Success!');
      alert('✅ Configurações salvas com sucesso!');
    } else {
      console.error('❌ [FORM SUBMIT] Error:', result?.error);
      alert(`❌ Erro ao salvar: ${result?.error || 'Erro desconhecido'}`);
    }

    setLoading(false);
  };

  if (!currentRestaurant) return null;

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-black">Configurações</h2>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Divulgação</p>
          <button
            onClick={handleCopyLink}
            type="button"
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              copiedLink 
                ? 'bg-green-500 text-white'
                : 'bg-white border border-gray-200 text-gray-800 hover:border-amber-400'
            }`}
          >
            {copiedLink ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link da Loja'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status do Restaurante */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-black mb-4">Status da Loja</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-black text-gray-900 text-xs uppercase tracking-tight">
                  Disponibilidade
                </h4>
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  {formData.isOpen ? 'Loja Aberta' : 'Loja Fechada'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
                className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all shadow-xl ${
                  formData.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {formData.isOpen ? 'Ativo' : 'Pausado'}
              </button>
            </div>

            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Truck className="text-amber-500" size={20} />
                <div>
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-tight">
                    Delivery
                  </h4>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">
                    {formData.allows_delivery ? 'Ativado' : 'Apenas Retirada'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, allows_delivery: !formData.allows_delivery })
                }
                className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all shadow-xl ${
                  formData.allows_delivery
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {formData.allows_delivery ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-black mb-4">Informações Básicas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">
                Nome do Restaurante
              </span>
              <input
                type="text"
                required
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">
                Link da Loja
              </span>
              <input
                type="text"
                required
                pattern="[a-z0-9-]+"
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.slug || ''}
                onChange={(e) => {
                  // 🔥 AUTO-FORMAT: Converter para minúsculas e remover caracteres inválidos
                  const cleanSlug = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-');
                  setFormData({ ...formData, slug: cleanSlug });
                }}
                placeholder="meu-restaurante"
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">
                💡 Este será o endereço do seu cardápio online. Use apenas letras minúsculas, números e hífens.
              </p>
              <p className="text-[10px] text-green-600 mt-1 ml-1 font-bold">
                🔗 Seu cardápio: {window.location.origin}/menu/{formData.slug || 'seu-link'}
              </p>
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Descrição</span>
              <textarea
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva seu restaurante..."
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">WhatsApp</span>
              <input
                type="text"
                placeholder="5511999999999"
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Telefone</span>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">E-mail de Contato</span>
              <input
                type="email"
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Endereço Completo</span>
              <input
                type="text"
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </label>
          </div>
        </div>

        {/* Identidade Visual */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-black mb-4">Identidade Visual</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="block md:col-span-2">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Imagem de Capa</span>
              <p className="text-[10px] text-gray-500 mt-1 ml-1 mb-3">
                Esta imagem aparece no topo do seu cardápio online, como uma capa.
              </p>
              <div className="mt-1 space-y-4">
                <div className="w-full h-40 rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                  {formData.cover_image ? (
                    <img
                      src={formData.cover_image}
                      className="w-full h-full object-cover"
                      alt="Capa"
                    />
                  ) : (
                    <ImageIcon className="text-gray-300" size={48} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm uppercase tracking-tighter"
                >
                  {formData.cover_image ? 'Alterar Capa' : 'Adicionar Capa'}
                </button>
                <input
                  type="file"
                  ref={coverInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleCoverUpload}
                />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Logo do Restaurante</span>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-300" size={32} />
                  )}
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase"
                  >
                    Alterar
                  </button>
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-black uppercase transition-colors"
                  >
                    Upload Logo
                  </button>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Recomendado: 512x512px (PNG ou JPG)
                  </p>
                </div>
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Cores da Marca</span>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Primária</span>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 border border-gray-100 rounded-2xl">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                      value={formData.primary_color || '#FBBF24'}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    />
                    <span className="text-xs font-bold uppercase">{formData.primary_color}</span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Secundária</span>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 border border-gray-100 rounded-2xl">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                      value={formData.secondary_color || '#000000'}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    />
                    <span className="text-xs font-bold uppercase">{formData.secondary_color}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações de Pedido */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-black mb-4">Configurações de Pedido</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center">
                <DollarSign size={14} className="mr-1" /> Valor Mínimo do Pedido
              </span>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.min_order_value || 0}
                onChange={(e) =>
                  setFormData({ ...formData, min_order_value: parseFloat(e.target.value) })
                }
              />
            </label>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-6 rounded-[32px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Save size={24} />
            )}
            <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantSettings;
