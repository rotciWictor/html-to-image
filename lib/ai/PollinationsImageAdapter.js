/**
 * Adapter para geração de imagens via Pollinations.ai
 * É 100% gratuito, não exige token e roda via API pública.
 */
class PollinationsImageAdapter {
  constructor() {
    this.baseUrl = 'https://image.pollinations.ai/prompt';
  }

  /**
   * Gera uma imagem a partir de um prompt textual
   * @param {string} prompt - Descrição da imagem desejada
   * @param {Object} config - Configurações (width, height)
   * @returns {Promise<Buffer>} Buffer da imagem gerada
   */
  async generateImage(prompt, config = {}) {
    const width = config.width || 1024;
    const height = config.height || 1024;
    
    // Seed aleatória para garantir que o mesmo prompt gere imagens diferentes
    const seed = Math.floor(Math.random() * 1000000000);
    
    const encodedPrompt = encodeURIComponent(prompt);
    // Adicionamos nologo=true para tentar remover marca d'água, se possível
    const url = `${this.baseUrl}/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    console.log(`[Pollinations] Gerando imagem (Gratuito API)...`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Falha na API do Pollinations: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(`Erro ao gerar imagem gratuita: ${error.message}`);
    }
  }
}

module.exports = PollinationsImageAdapter;
