import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from '@constants/index';

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!GEMINI_API_KEY;
    
    if (this.isEnabled) {
      try {
        this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
        this.isEnabled = false;
      }
    } else {
      console.warn('Gemini API key not found. AI features will be disabled.');
    }
  }

  isAIEnabled(): boolean {
    return this.isEnabled && this.ai !== null;
  }

  async generateDescription(productName: string, cuisineType: string = 'Culinária'): Promise<string> {
    if (!this.isAIEnabled()) {
      return 'Serviço de IA não disponível no momento.';
    }

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Escreva uma descrição curta, viciante e persuasiva para um prato de cardápio chamado "${productName}" em um restaurante de "${cuisineType}". Use no máximo 200 caracteres. Seja criativo e apetitoso!`,
      });
      
      const text = response.text || 'Erro ao gerar descrição.';
      
      // Limitar a 200 caracteres
      return text.length > 200 ? text.substring(0, 197) + '...' : text;
    } catch (error) {
      console.error('Gemini generateDescription error:', error);
      return 'Não foi possível gerar a descrição automaticamente.';
    }
  }

  async suggestPrice(productName: string, ingredients: string): Promise<string> {
    if (!this.isAIEnabled()) {
      return 'Serviço de IA não disponível no momento.';
    }

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Sugira um preço justo em reais para um prato "${productName}" feito com "${ingredients}". Responda apenas com o valor em formato numérico (ex: 35.00) sem o símbolo R$.`,
      });
      
      const text = response.text || 'R$ 0,00';
      
      // Extrair apenas números e vírgula/ponto
      const priceMatch = text.match(/[\d.,]+/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace(',', '.'));
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
      }
      
      return 'R$ 0,00';
    } catch (error) {
      console.error('Gemini suggestPrice error:', error);
      return 'Erro na sugestão de preço.';
    }
  }

  async generateMenuItemName(ingredients: string): Promise<string> {
    if (!this.isAIEnabled()) {
      return 'Serviço de IA não disponível';
    }

    try {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Crie um nome criativo e atraente para um prato feito com: ${ingredients}. Responda apenas com o nome do prato, sem explicações.`,
      });
      
      return response.text || 'Prato Especial';
    } catch (error) {
      console.error('Gemini generateMenuItemName error:', error);
      return 'Erro ao gerar nome';
    }
  }
}

// Singleton instance
export const geminiService = new GeminiService();
