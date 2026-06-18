/**
 * Adapter para geração de imagens via Pollinations.ai
 * É 100% gratuito, não exige token e roda via API pública.
 */
class PollinationsImageAdapter {
  constructor() {
    this.baseUrl = 'https://image.pollinations.ai/prompt';
    this.modelName = process.env.POLLINATIONS_MODEL || 'flux'; // Opções: flux, flux-realism, flux-anime, flux-3d, turbo...
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
    const url = `${this.baseUrl}/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${this.modelName}&nologo=true`;

    console.log(`[Pollinations] Gerando imagem...`);
    
    try {
      const options = {};
      const apiKey = process.env.POLLINATIONS_API_KEY;
      
      if (apiKey) {
        options.headers = {
          'Authorization': `Bearer ${apiKey}`
        };
      }

      let response = await fetch(url, options);
      
      // Se usamos a chave (Premium) e ela falhou (ex: sem saldo ou revogada),
      // disparamos o Fallback automático pra API Pública Gratuita
      if (!response.ok && apiKey) {
        console.log(`[Pollinations] Erro na via Privada (${response.status}). Acionando Fallback pra API Pública Gratuita...`);
        response = await fetch(url);
      }

      if (!response.ok) {
        throw new Error(`Falha na API do Pollinations: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(`Erro ao gerar imagem: ${error.message}`);
    }
  }
}

module.exports = PollinationsImageAdapter;
