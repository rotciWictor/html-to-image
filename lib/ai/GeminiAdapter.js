const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Adapter para integração com Google Gemini API
 * Baseado nos padrões do @cookbook/quickstarts-js/
 */
class GeminiAdapter {
  constructor({ apiKey = process.env.GEMINI_API_KEY, model = 'gemini-2.5-flash' } = {}) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não encontrada. Configure no arquivo .env');
    }
    
    this.client = new GoogleGenerativeAI(apiKey);
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
      // API correta do Gemini
      const model = this.client.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(contents);
      const response = await result.response;
      
      return response.text();
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
   * Lista modelos disponíveis (seguindo padrão do cookbook)
   * @returns {Promise<Array>} Lista de modelos
   */
  async listModels() {
    try {
      // Seguir padrão do cookbook para listar modelos
      const models = await this.client.models.list();
      return models;
    } catch (error) {
      throw new Error(`Erro ao listar modelos: ${error.message}`);
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
