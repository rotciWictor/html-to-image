const { GoogleGenAI } = require('@google/genai');

/**
 * Adapter para geração de imagens via Google Imagen API
 * Usa o SDK unificado @google/genai
 */
class GeminiImagenAdapter {
  constructor({ apiKey = process.env.GEMINI_API_KEY, model = 'imagen-4.0-generate-001' } = {}) {
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
        throw new Error('Nenhuma imagem foi gerada pelo Imagen');
      }

      const imageBytes = response.generatedImages[0].image.imageBytes;
      return Buffer.from(imageBytes, 'base64');

    } catch (error) {
      if (error.message.includes('SAFETY')) {
        throw new Error('Imagem bloqueada por filtros de segurança do Google. Tente reformular o prompt.');
      }
      if (error.message.includes('QUOTA')) {
        throw new Error('Cota da API Imagen excedida. Tente novamente mais tarde.');
      }
      throw new Error(`Erro na API Imagen: ${error.message}`);
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
