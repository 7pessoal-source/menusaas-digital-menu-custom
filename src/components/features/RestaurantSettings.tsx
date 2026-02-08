import React, { useState, useRef } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔥 VALIDAÇÃO: Campos obrigatórios
    if (!formData.name?.trim()) {
      alert('❌ Nome do restaurante é obrigatório');
      return;
    }
    
    if (!formData.slug?.trim()) {
      alert('❌ Slug (URL) é obrigatório');
      return;
    }
    
    // 🔥 VALIDAÇÃO: Slug sem espaços ou caracteres especiais
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug)) {
      alert('❌ Slug deve conter apenas letras minúsculas, números e hífens (ex: meu-restaurante)');
      return;
    }

    console.log('🔵 [FORM SUBMIT] Submitting data:', formData);
    setLoading(true);

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
                Slug (URL)
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
                💡 Apenas letras minúsculas, números e hífens. Ex: pizzaria-do-ze
              </p>
              <p className="text-[10px] text-green-600 mt-1 ml-1 font-bold">
                🔗 Seu link: {window.location.origin}/menu/{formData.slug || 'seu-slug'}
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
                placeholder="(11) 9999-9999"
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.contact_phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Endereço</span>
              <input
                type="text"
                className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">
                Pedido Mínimo (R$)
              </span>
              <div className="relative mt-1">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-400"
                  value={formData.min_order_value || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, min_order_value: parseFloat(e.target.value) })
                  }
                />
              </div>
            </label>

            <div className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Logo</span>
              <div className="mt-1 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                  {formData.logo ? (
                    <img
                      src={formData.logo}
                      className="w-full h-full object-cover"
                      alt="Logo"
                    />
                  ) : (
                    <ImageIcon className="text-gray-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm uppercase tracking-tighter"
                >
                  Atualizar
                </button>
                <input
                  type="file"
                  ref={logoInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-6 rounded-3xl font-black text-xl flex items-center justify-center space-x-2 active:scale-95 shadow-xl disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </form>
    </div>
  );
};

export default RestaurantSettings;
