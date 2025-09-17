const fs = require('fs');
const path = require('path');
const GeminiAdapter = require('./ai/GeminiAdapter');

/**
 * Gerador de HTMLs usando IA (Gemini)
 * Baseado no Plano 2: AI fornece HTML, Node processa
 */
class AIHtmlGenerator {
  constructor({ apiKey, model = 'gemini-1.5-flash' } = {}) {
    this.gemini = new GeminiAdapter({ apiKey, model });
  }

  /**
   * Gera template de prompt otimizado para HTMLs
   * @param {Object} config - Configuração do prompt
   * @returns {string} Template do prompt
   */
  getPromptTemplate({ prompt, count = 6, preset = 'instagram' }) {
    const presets = {
      instagram: { width: 1080, height: 1440, suffix: '-instagram', name: 'Instagram' },
      stories: { width: 1920, height: 1080, suffix: '-story', name: 'Stories' },
      ppt: { width: 1920, height: 1080, suffix: '-ppt', name: 'PowerPoint' },
      generic: { width: 1200, height: 800, suffix: '', name: 'Genérico' }
    };
    
    const p = presets[preset] || presets.instagram;

    return `Gere ${count} páginas HTML autônomas para ${p.name} (${p.width}x${p.height}px).

REQUISITOS OBRIGATÓRIOS:
- Cada HTML deve ter estrutura completa: <!DOCTYPE html>, <html>, <head>, <body>
- SEM dependências externas (CSS/JS/Imagens externas)
- Use apenas estilos inline ou <style> interno
- Use SVGs inline para ícones/gráficos
- Fontes: use fallbacks seguros (system-ui, -apple-system, sans-serif)

CONFIGURAÇÃO INLINE (obrigatória em cada HTML):
<script id="h2i-config" type="application/json">
{
  "format": "png",
  "width": ${p.width},
  "height": ${p.height},
  "quality": 95,
  "background": "transparent",
  "suffix": "${p.suffix}"
}
</script>

ESTRUTURA SUGERIDA:
- Container principal com dimensões fixas ${p.width}px x ${p.height}px
- Layout responsivo dentro do container
- Conteúdo limpo e profissional
- Sem watermarks ou elementos desnecessários

TEMA/PEDIDO:
${prompt}

FORMATO DE SAÍDA:
Devolva CADA HTML separado por uma linha contendo apenas:
---HTML---

NÃO inclua explicações fora dos blocos HTML.`;
  }

  /**
   * Gera HTMLs usando Gemini
   * @param {Object} options - Opções de geração
   * @returns {Promise<Array>} Array de {filename, html}
   */
  async generateHtmls({ prompt, count = 6, preset = 'instagram', model } = {}) {
    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    const promptTemplate = this.getPromptTemplate({ prompt, count, preset });
    
    console.log(`🧠 Gerando ${count} HTMLs via Gemini (${model || 'gemini-1.5-flash'})...`);
    
    const response = await this.gemini.generateContent(promptTemplate);
    
    if (!response || !response.trim()) {
      throw new Error('Resposta vazia do Gemini');
    }

    // Parse dos blocos HTML usando delimiter ---HTML---
    const parts = response
      .split(/^---HTML---$/m)
      .map(s => s.trim())
      .filter(Boolean);

    if (!parts.length) {
      throw new Error('Nenhum bloco HTML encontrado. Verifique o delimiter ---HTML---');
    }

    // Processar e validar cada HTML
    const htmls = parts.slice(0, count).map((html, index) => {
      const filename = `ai-slide-${String(index + 1).padStart(2, '0')}.html`;
      
      // Garantir estrutura básica
      let processedHtml = html;
      if (!/<!DOCTYPE html>/i.test(processedHtml)) {
        processedHtml = `<!DOCTYPE html>\n${processedHtml}`;
      }
      
      // Validar se tem configuração inline
      if (!processedHtml.includes('id="h2i-config"')) {
        console.warn(`⚠️  HTML ${filename} sem configuração inline - adicionando padrão`);
        const configBlock = `<script id="h2i-config" type="application/json">
{
  "format": "png",
  "width": 1080,
  "height": 1440,
  "quality": 95,
  "background": "transparent",
  "suffix": "-ai"
}
</script>`;
        
        processedHtml = processedHtml.replace('</head>', `  ${configBlock}\n</head>`);
      }

      return { filename, html: processedHtml };
    });

    console.log(`✅ ${htmls.length} HTMLs gerados com sucesso`);
    return htmls;
  }

  /**
   * Salva HTMLs na pasta de trabalho
   * @param {Array} htmls - Array de {filename, html}
   * @param {string} baseDir - Diretório base
   * @returns {Promise<string>} Caminho da pasta criada
   */
  async writeToWorkFolder(htmls, baseDir = path.join(process.cwd(), 'html-files', 'work', 'ai')) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(baseDir, timestamp);
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    for (const { filename, html } of htmls) {
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`📄 Salvo: ${filename}`);
    }
    
    console.log(`📁 HTMLs salvos em: ${outputDir}`);
    return outputDir;
  }

  /**
   * Gera e salva HTMLs em uma operação
   * @param {Object} options - Opções de geração
   * @returns {Promise<string>} Caminho da pasta criada
   */
  async generateAndSave(options = {}) {
    const htmls = await this.generateHtmls(options);
    return await this.writeToWorkFolder(htmls);
  }
}

module.exports = AIHtmlGenerator;
