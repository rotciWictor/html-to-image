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
    let attempt = 0;
    const maxRetries = 3;
    const prompt = Array.isArray(contents) ? contents.join('\n') : String(contents);

    while (attempt <= maxRetries) {
      try {
        if (config.onChunk) {
          const stream = await this.client.models.generateContentStream({
            model: this.modelName,
            contents: prompt,
            config: {
              temperature: config.temperature ?? 0.4
            }
          });
          let fullText = '';
          for await (const chunk of stream) {
            if (chunk.text) {
              fullText += chunk.text;
              config.onChunk(chunk.text);
            }
          }
          return fullText;
        } else {
          const response = await this.client.models.generateContent({
            model: this.modelName,
            contents: prompt,
            config: {
              temperature: config.temperature ?? 0.4
            }
          });
          return response.text;
        }
      } catch (error) {
        const isOverloaded = error.message.includes('503') || error.message.includes('429') || error.message.includes('Quota exceeded');
        if (isOverloaded && attempt < maxRetries) {
          attempt++;
          let delaySecs = 5 * Math.pow(2, attempt - 1);
          
          // Se a API avisou exatamente quanto tempo esperar (ex: "Please retry in 32s")
          const retryMatch = error.message.match(/retry in (\d+(?:\.\d+)?)s/i);
          if (retryMatch && retryMatch[1]) {
            delaySecs = Math.ceil(parseFloat(retryMatch[1])) + 1; // +1s de segurança
          }

          console.log(`\n⚠️  API do Gemini atingiu o limite (Cota). Aguardando ${delaySecs} segundos para liberar... (Tentativa ${attempt}/${maxRetries})`);
          await new Promise(r => setTimeout(r, delaySecs * 1000));
        } else {
          if (error.message.includes('API_KEY_INVALID')) {
            throw new Error('Chave da API Gemini inválida. Verifique GEMINI_API_KEY no .env');
          }
          if (error.message.includes('QUOTA')) {
            throw new Error('Cota da API Gemini excedida. Tente novamente mais tarde');
          }
          if (error.message.includes('SAFETY')) {
            throw new Error('Conteúdo bloqueado por filtros de segurança do Gemini');
          }
          throw new Error(`Erro na API Gemini: ${error.message}`);
        }
      }
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
