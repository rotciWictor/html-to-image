const { GoogleGenAI } = require('@google/genai');

/**
 * Adapter para geração de imagens via Google Imagen API
 * Usa o SDK unificado @google/genai
 */
class GeminiImagenAdapter {
  constructor({ apiKey = process.env.GEMINI_API_KEY, model = 'gemini-3.1-flash-image' } = {}) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não encontrada. Configure no arquivo .env');
    }

    this.client = new GoogleGenAI({ apiKey });
    this.modelName = model;
  }

  /**
   * Gera uma imagem a partir de um prompt textual
   * @param {string} prompt - Descrição da imagem desejada
   * @param {Object} config - Configurações (numberOfImages, aspectRatio, etc.)
   * @returns {Promise<Buffer>} Buffer da imagem PNG gerada
   */
  async generateImage(prompt, config = {}) {
    let attempt = 0;
    const maxRetries = 3;
    while (attempt <= maxRetries) {
      try {
        console.log(`[GeminiImagen] Gerando imagem com modelo "${this.modelName}"...`);

        const response = await this.client.models.generateImages({
          model: this.modelName,
          prompt,
          config: {
            numberOfImages: config.numberOfImages || 1,
            ...(config.aspectRatio && { aspectRatio: config.aspectRatio })
          }
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
          throw new Error('Nenhuma imagem foi gerada pelo Gemini');
        }

        const imageBytes = response.generatedImages[0].image.imageBytes;
        return Buffer.from(imageBytes, 'base64');

      } catch (error) {
        const isOverloaded = error.message.includes('503') || error.message.includes('429');
        if (isOverloaded && attempt < maxRetries) {
          attempt++;
          // Exponential backoff: 5s, 10s, 20s
          const delaySecs = 5 * Math.pow(2, attempt - 1);
          console.log(`\n⚠️  Gerador de Imagem sobrecarregado. Tentando novamente em ${delaySecs} segundos... (Tentativa ${attempt}/${maxRetries})`);
          await new Promise(r => setTimeout(r, delaySecs * 1000));
        } else {
          if (error.message.includes('SAFETY')) {
            throw new Error('Imagem bloqueada por filtros de segurança do Google. Tente reformular o prompt.');
          }
          if (error.message.includes('QUOTA')) {
            throw new Error('Cota da API excedida. Tente novamente mais tarde.');
          }
          throw new Error(`Erro na API de Imagens: ${error.message}`);
        }
      }
    }
  }

  async healthCheck() {
    try {
      // Teste simples para verificar se a API responde
      await this.client.models.generateImages({
        model: this.modelName,
        prompt: 'A simple blue circle on white background',
        config: { numberOfImages: 1 }
      });
      return true;
    } catch (e) {
      console.error('Health check Imagen falhou:', e.message);
      return false;
    }
  }
}

module.exports = GeminiImagenAdapter;
