const { GoogleGenAI } = require('@google/genai');

/**
 * Adapter para integração com Google Gemini API (SDK novo @google/genai)
 * Substitui o SDK legado @google/generative-ai (descontinuado em Ago/2025)
 */
class GeminiAdapter {
  constructor({ apiKey = process.env.GEMINI_API_KEY, model = 'gemini-2.5-flash' } = {}) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não encontrada. Configure no arquivo .env');
    }
    
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = model;
  }

  /**
   * Gera conteúdo usando o modelo Gemini
   * @param {string|Array} contents - Conteúdo para o modelo
   * @param {Object} config - Configurações adicionais
   * @returns {Promise<string>} Resposta do modelo
   */
  async generateContent(contents, config = {}) {
    try {
      const prompt = Array.isArray(contents) ? contents.join('\n') : String(contents);
      
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: config.temperature ?? 0.4
        }
      });

      return response.text;
    } catch (error) {
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Chave da API Gemini inválida. Verifique GEMINI_API_KEY no .env');
      }
      if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Cota da API Gemini excedida. Tente novamente mais tarde');
      }
      if (error.message.includes('SAFETY')) {
        throw new Error('Conteúdo bloqueado por filtros de segurança do Gemini');
      }
      throw new Error(`Erro na API Gemini: ${error.message}`);
    }
  }

  /**
   * Verifica se a API está funcionando
   * @returns {Promise<boolean>} Status da API
   */
  async healthCheck() {
    try {
      await this.generateContent('Teste de conectividade');
      return true;
    } catch (error) {
      console.error('Health check falhou:', error.message);
      return false;
    }
  }
}

module.exports = GeminiAdapter;
