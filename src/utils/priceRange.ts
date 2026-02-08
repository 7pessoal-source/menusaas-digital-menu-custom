import { supabase } from '@/services/supabase';
import { ProductVariationOption } from '@/types';

/**
 * Calcula a faixa de preço de um produto baseado em suas variações
 * @param productId ID do produto
 * @returns { min, max, hasVariations } ou null se houver erro
 */
export async function calculateProductPriceRange(productId: string): Promise<{
  min: number;
  max: number;
  hasVariations: boolean;
} | null> {
  try {
    // 1. Buscar todos os grupos de variação do produto
    const { data: groups, error: groupsError } = await supabase
      .from('product_variation_groups')
      .select('id')
      .eq('product_id', productId);

    if (groupsError) {
      console.error('Erro ao buscar grupos de variação:', groupsError);
      return null;
    }

    // Se não tem grupos, não tem variações
    if (!groups || groups.length === 0) {
      return { min: 0, max: 0, hasVariations: false };
    }

    // 2. Buscar todas as opções de todos os grupos
    const groupIds = groups.map(g => g.id);
    const { data: options, error: optionsError } = await supabase
      .from('product_variation_options')
      .select('price_adjustment')
      .in('variation_group_id', groupIds)
      .eq('is_available', true);

    if (optionsError) {
      console.error('Erro ao buscar opções de variação:', optionsError);
      return null;
    }

    // Se não tem opções disponíveis, não tem variações válidas
    if (!options || options.length === 0) {
      return { min: 0, max: 0, hasVariations: false };
    }

    // 3. Calcular min e max baseado nos price_adjustment
    const priceAdjustments = options.map(opt => opt.price_adjustment || 0);
    const min = Math.min(...priceAdjustments);
    const max = Math.max(...priceAdjustments);

    return {
      min,
      max,
      hasVariations: true
    };
  } catch (error) {
    console.error('Erro ao calcular faixa de preço:', error);
    return null;
  }
}

/**
 * Atualiza os campos de faixa de preço no produto
 * @param productId ID do produto
 * @param basePrice Preço base do produto
 */
export async function updateProductPriceRange(
  productId: string,
  basePrice: number
): Promise<boolean> {
  try {
    const range = await calculateProductPriceRange(productId);
    
    if (!range) {
      console.error('Não foi possível calcular a faixa de preço');
      return false;
    }

    // Se não tem variações, limpar os campos
    if (!range.hasVariations) {
      const { error } = await supabase
        .from('products')
        .update({
          price_display_min: null,
          price_display_max: null,
          has_variations: false
        })
        .eq('id', productId);

      if (error) {
        console.error('Erro ao atualizar produto (sem variações):', error);
        return false;
      }

      return true;
    }

    // Calcular preços finais (preço base + ajustes)
    const displayMin = basePrice + range.min;
    const displayMax = basePrice + range.max;

    // Atualizar no banco
    const { error } = await supabase
      .from('products')
      .update({
        price_display_min: displayMin,
        price_display_max: displayMax,
        has_variations: true
      })
      .eq('id', productId);

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return false;
    }

    console.log(`Faixa de preço atualizada: R$ ${displayMin.toFixed(2)} - R$ ${displayMax.toFixed(2)}`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar faixa de preço:', error);
    return false;
  }
}

/**
 * Formata o preço para exibição no cardápio
 * @param product Produto com informações de preço
 * @returns String formatada do preço
 */
export function formatProductPrice(product: {
  price: number;
  price_display_min?: number | null;
  price_display_max?: number | null;
  has_variations?: boolean | null;
}): string {
  // Se tem variações e os preços de exibição estão configurados
  if (product.has_variations && 
      product.price_display_min !== null && 
      product.price_display_max !== null &&
      product.price_display_min !== undefined &&
      product.price_display_max !== undefined) {
    
    const min = product.price_display_min;
    const max = product.price_display_max;
    
    // Se min == max, mostrar só um preço
    if (min === max) {
      return `R$ ${min.toFixed(2)}`;
    }
    
    // Se min < max, mostrar faixa
    return `R$ ${min.toFixed(2)} – R$ ${max.toFixed(2)}`;
  }
  
  // Produto simples: mostrar preço normal
  return `R$ ${product.price.toFixed(2)}`;
}
