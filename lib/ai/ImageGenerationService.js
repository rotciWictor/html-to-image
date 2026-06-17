const fs = require('fs');
const path = require('path');

/**
 * Serviço de Geração de Imagens (Camada SOLID compartilhada)
 * 
 * Responsabilidades:
 *   - Escolher o adapter correto (API vs Local)
 *   - Salvar a imagem na pasta ./assets/
 *   - Retornar o caminho relativo para uso no HTML/CSS
 *   - Logs visuais para o terminal
 * 
 * Os adapters (GeminiImagen, ComfyUI) cuidam APENAS da chamada HTTP.
 */
class ImageGenerationService {
  constructor() {
    this.provider = process.env.IMAGE_PROVIDER || 'gemini';
    this.adapter = this._createAdapter();
    this.assetsDir = path.resolve(process.cwd(), 'assets');
  }

  _createAdapter() {
    if (this.provider === 'comfyui') {
      const ComfyUIImageAdapter = require('./ComfyUIImageAdapter');
      console.log(`🎨 Gerador de Imagens: ComfyUI (Local)`);
      return new ComfyUIImageAdapter();
    }
    
    // Default: Gemini (Image) API
    const GeminiImagenAdapter = require('./GeminiImagenAdapter');
    console.log(`🎨 Gerador de Imagens: Google Gemini (Image API)`);
    return new GeminiImagenAdapter();
  }

  /**
   * Gera uma imagem e salva automaticamente em ./assets/
   * @param {string} prompt - Descrição da imagem
   * @param {Object} options - Opções extras (filename, width, height, etc.)
   * @returns {Promise<string>} Caminho relativo para uso no HTML (ex: './assets/ai-bg-cyberpunk.png')
   */
  async generate(prompt, options = {}) {
    // Garantir que a pasta assets exista
    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }

    console.log(`\n🎨 [Imagen] Gerando imagem: "${prompt.substring(0, 60)}..."`);
    const startTime = Date.now();

    try {
      // Chamar o adapter (API ou Local) - interface idêntica
      const imageBuffer = await this.adapter.generateImage(prompt, {
        width: options.width || 1024,
        height: options.height || 1024,
        ...options
      });

      // Gerar nome descritivo para o arquivo
      const safeName = this._generateFilename(prompt, options.filename);
      const outputPath = path.join(this.assetsDir, safeName);

      // Salvar fisicamente
      fs.writeFileSync(outputPath, imageBuffer);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const sizeKB = (imageBuffer.length / 1024).toFixed(0);
      console.log(`✅ [Imagen] Imagem salva: '${safeName}' (${sizeKB}KB em ${elapsed}s)`);

      // Retornar caminho relativo para uso no HTML
      return `./assets/${safeName}`;

    } catch (error) {
      console.error(`❌ [Imagen] Falha ao gerar imagem: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gera um nome de arquivo seguro e descritivo a partir do prompt
   */
  _generateFilename(prompt, customName) {
    if (customName) return customName.endsWith('.png') ? customName : `${customName}.png`;

    const slug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 4)
      .join('-');

    return `ai-${slug}-${Date.now()}.png`;
  }

  /**
   * Verifica se o provider está disponível
   */
  async healthCheck() {
    return await this.adapter.healthCheck();
  }
}

module.exports = ImageGenerationService;
