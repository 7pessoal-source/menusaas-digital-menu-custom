import React, { useState, useRef } from 'react';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  X, 
  Upload, 
  Star,
  Image as ImageIcon 
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const ProductManager: React.FC = () => {
  const { currentRestaurant, categories } = useRestaurantStore();
  const { products, saveProduct, removeProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const productImageRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRestaurant) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentRestaurant.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      alert('Erro ao fazer upload da imagem');
      console.error(uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    setFormData({ ...formData, image: publicUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await saveProduct(formData as any);
    
    if (result.success) {
      setIsModalOpen(false);
      setFormData({});
    }
  };

  const handleDelete = async (id: string) => {
    await removeProduct(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white">Produtos</h2>
        <button
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              price: 0,
              is_available: true,
              is_promotion: false,
              category_id: categories[0]?.id || '',
            });
            setIsModalOpen(true);
          }}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-orange-600 transition-all shadow-lg"
        >
          <PlusCircle size={18} className="mr-2" /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl text-gray-500 font-bold">
            Nenhum produto cadastrado.
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="bg-[#2a2a2a] rounded-3xl border border-white/5 overflow-hidden group shadow-sm hover:shadow-xl transition-all relative"
            >
              {p.is_promotion && (
                <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center">
                  <Star size={12} className="mr-1 fill-current" /> PROMO
                </div>
              )}
              <div className="h-48 overflow-hidden relative bg-[#1a1a1a]">
                {p.image ? (
                  <img
                    src={p.image}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={p.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setFormData(p);
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-[#2a2a2a] rounded-xl shadow-md text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-[#2a2a2a] rounded-xl shadow-md text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-white">{p.name}</h4>
                  <span className="font-black text-orange-500">
                    R$ {Number(p.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{p.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#1a1a1a] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#2a2a2a]">
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                {formData.id ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div
                className="relative h-48 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center bg-[#2a2a2a] group cursor-pointer"
                onClick={() => productImageRef.current?.click()}
              >
                {formData.image ? (
                  <img
                    src={formData.image}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    alt="Preview"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-gray-600" size={32} />
                    <p className="text-xs text-gray-500 font-bold mt-2 uppercase">
                      Subir Foto
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={productImageRef}
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1">Nome</span>
                <input
                  type="text"
                  required
                  className="mt-1 w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-2xl font-bold outline-none focus:border-white/10 text-white placeholder:text-gray-600"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1">Descrição</span>
                <textarea
                  className="mt-1 w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-2xl h-24 resize-none font-medium outline-none focus:border-white/10 text-white placeholder:text-gray-600"
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-gray-400 uppercase ml-1">Preço (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-2xl font-bold outline-none focus:border-white/10 text-white"
                    value={formData.price || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-gray-400 uppercase ml-1">Categoria</span>
                  <select
                    className="mt-1 w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-2xl font-bold outline-none focus:border-white/10 text-white appearance-none"
                    value={formData.category_id || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex items-center space-x-6 p-2">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.is_available}
                      onChange={(e) =>
                        setFormData({ ...formData, is_available: e.target.checked })
                      }
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.is_available ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_available ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-xs font-bold text-gray-400 uppercase group-hover:text-white transition-colors">Disponível</span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.is_promotion}
                      onChange={(e) =>
                        setFormData({ ...formData, is_promotion: e.target.checked })
                      }
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.is_promotion ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_promotion ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-xs font-bold text-gray-400 uppercase group-hover:text-white transition-colors">Promoção</span>
                </label>
              </div>
            </div>

            <div className="p-6 bg-[#2a2a2a] border-t border-white/10 flex space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg"
              >
                {formData.id ? 'Salvar Alterações' : 'Criar Produto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
