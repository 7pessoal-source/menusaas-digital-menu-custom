import React, { useState, useRef, useEffect } from 'react';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { useRestaurant } from '../../hooks/useRestaurant';
import { Restaurant } from '../../types';
import { supabase } from '../../services/supabase';
import { 
  Upload,
  Loader2, 
  Image as ImageIcon 
} from 'lucide-react';

const RestaurantSettings: React.FC = () => {
  const { currentRestaurant } = useRestaurantStore();
  const { updateRestaurant } = useRestaurant();
  const [loading, setLoading] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !currentRestaurant) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${currentRestaurant.id}-${Math.random()}.${fileExt}`;
    const filePath = `${type}s/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert(`Erro ao fazer upload da ${type}`);
      console.error(uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    if (type === 'logo') {
      setFormData({ ...formData, logo: publicUrl });
    } else {
      setFormData({ ...formData, cover_image: publicUrl });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.name?.trim()) {
      alert('❌ Nome do restaurante é obrigatório');
      return;
    }
    
    setLoading(true);
    const result = await updateRestaurant(formData);

    if (result?.success) {
      alert('✅ Configurações salvas com sucesso!');
    } else {
      alert(`❌ Erro ao salvar: ${result?.error || 'Erro desconhecido'}`);
    }

    setLoading(false);
  };

  if (!currentRestaurant) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white">Configurações</h2>
        <button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 flex items-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Logo e Cores */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#2a2a2a] p-6 rounded-3xl border border-white/5 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase block mb-4">Logo do Restaurante</span>
            <div
              className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center bg-[#1a1a1a] group cursor-pointer"
              onClick={() => logoInputRef.current?.click()}
            >
              {formData.logo ? (
                <img
                  src={formData.logo}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  alt="Logo"
                />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto text-gray-600" size={32} />
                  <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase">Upload Logo</p>
                </div>
              )}
              <input
                type="file"
                ref={logoInputRef}
                hidden
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
              />
            </div>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-3xl border border-white/5 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase block mb-4">Cor de Destaque</span>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              />
              <span className="font-mono font-bold text-white uppercase">{formData.primary_color}</span>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Informações */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#2a2a2a] p-8 rounded-3xl border border-white/5 shadow-sm space-y-6">
            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Nome do Estabelecimento</span>
              <input
                type="text"
                className="mt-1 w-full p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl font-bold outline-none focus:border-white/10 text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">
                URL do Cardápio (Slug)
              </span>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-gray-500 font-mono text-sm">seudominio.com/menu/</span>
                <input
                  type="text"
                  className="flex-1 p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl font-bold outline-none focus:border-white/10 text-white font-mono"
                  value={formData.slug}
                  onChange={(e) => {
                    // Remove espaços e caracteres especiais, converte para minúsculas
                    const slug = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, '');
                    setFormData({ ...formData, slug });
                  }}
                  placeholder="meu-restaurante"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">
                Este será o endereço do seu cardápio digital. Ex: seudominio.com/menu/<strong className="text-white">{formData.slug || 'meu-restaurante'}</strong>
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Descrição / Slogan</span>
              <textarea
                className="mt-1 w-full p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl h-24 resize-none font-medium outline-none focus:border-white/10 text-white"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1">WhatsApp (com DDD)</span>
                <input
                  type="text"
                  className="mt-1 w-full p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl font-bold outline-none focus:border-white/10 text-white"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1">Endereço Completo</span>
              <input
                type="text"
                className="mt-1 w-full p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl font-bold outline-none focus:border-white/10 text-white"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;
