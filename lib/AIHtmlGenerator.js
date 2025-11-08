const fs = require('fs');
const path = require('path');
const GeminiAdapter = require('./ai/GeminiAdapter');
const OllamaAdapter = require('./ai/OllamaAdapter');
const OpenAIAdapter = require('./ai/OpenAIAdapter');
const KnowledgeManager = require('./KnowledgeManager');
const FolderNameGenerator = require('./FolderNameGenerator');

/**
 * Gerador de HTMLs usando IA (Gemini)
 * Baseado no Plano 2: AI fornece HTML, Node processa
 */
class AIHtmlGenerator {
  constructor({ provider = process.env.AI_PROVIDER || 'gemini', apiKey, model = undefined, baseUrl = undefined } = {}) {
    this.providerName = provider;
    this.knowledgeManager = new KnowledgeManager();

    // Selecionar adapter pelo provider
    if (provider === 'ollama') {
      this.adapter = new OllamaAdapter({ model, baseUrl });
    } else if (provider === 'openai') {
      this.adapter = new OpenAIAdapter({ apiKey, model, baseUrl });
    } else {
      // default gemini
      this.adapter = new GeminiAdapter({ apiKey, model: model || 'gemini-2.5-flash' });
    }
  }

  /**
   * Cria prompt enriquecido usando base de conhecimento
   * @param {Object} config - Configuração do prompt
   * @param {Array<string>} relevantDocs - Documentos relevantes (opcional)
   * @returns {string} Prompt enriquecido
   */
  createEnrichedPrompt({ prompt, count = 6, preset = 'instagram', relevantDocs = null }) {
    // Adicionar informações do preset ao prompt do usuário
    const presets = {
      instagram: { width: 1080, height: 1350, suffix: '-instagram', name: 'Instagram' },
      stories: { width: 1920, height: 1080, suffix: '-story', name: 'Stories' },
      ppt: { width: 1920, height: 1080, suffix: '-ppt', name: 'PowerPoint' },
      generic: { width: 1200, height: 800, suffix: '', name: 'Genérico' }
    };
    
    const p = presets[preset] || presets.instagram;
    
    const enhancedUserPrompt = `${prompt}

ESPECIFICAÇÕES TÉCNICAS:
- Formato: ${p.name} (${p.width}x${p.height}px)
- Quantidade: ${count} HTMLs
- Configuração inline obrigatória com dimensões ${p.width}x${p.height}`;

    return this.knowledgeManager.createEnrichedPrompt(enhancedUserPrompt, relevantDocs);
  }

  /**
   * Gera HTMLs usando Gemini com base de conhecimento
   * @param {Object} options - Opções de geração
   * @returns {Promise<Array>} Array de {filename, html}
   */
  async generateHtmls({ prompt, count = 6, preset = 'instagram', model, relevantDocs = null } = {}) {
    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    const enrichedPrompt = this.createEnrichedPrompt({ prompt, count, preset, relevantDocs });
    
    console.log(`🧠 Gerando ${count} HTMLs via ${this.providerName} (${model || 'default'})...`);
    console.log(`📚 Usando base de conhecimento: ${relevantDocs ? relevantDocs.join(', ') : 'todos os documentos'}`);
    
    const response = await this.adapter.generateContent(enrichedPrompt, {
      temperature: 0.7,
      topP: 0.8,
      topK: 40
    });
    
    if (!response || !response.trim()) {
      throw new Error(`Resposta vazia do provider ${this.providerName}`);
    }

    // Parse dos blocos HTML usando delimiter ---HTML---
    const parts = response
      .split(/^---HTML---$/m)
      .map(s => s.trim())
      .filter(Boolean);

    if (!parts.length) {
      throw new Error('Nenhum bloco HTML encontrado. Verifique o delimiter ---HTML---');
    }

    // Verificar se há bloco de prompts de imagens
    let imagesPrompts = null;
    const imagesPromptsMatch = response.match(/```text\s*# images-prompts\.txt\s*([\s\S]*?)```/);
    if (imagesPromptsMatch) {
      imagesPrompts = imagesPromptsMatch[1].trim();
      console.log('📸 Prompts de imagens encontrados');
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
    
    // Adicionar prompts de imagens se existirem
    if (imagesPrompts) {
      htmls.push({
        filename: 'images-prompts.txt',
        html: imagesPrompts,
        isTextFile: true
      });
    }
    
    return htmls;
  }

  /**
   * Salva HTMLs na pasta de trabalho
   * @param {Array} htmls - Array de {filename, html}
   * @param {string} baseDir - Diretório base
   * @param {Object} options - Opções para gerar nome da pasta
   * @returns {Promise<string>} Caminho da pasta criada
   */
  async writeToWorkFolder(htmls, baseDir = path.join(process.cwd(), 'work', 'htmls', 'ai'), options = {}) {
    // Gerar nome amigável da pasta
    const friendlyName = FolderNameGenerator.generateThemedName(
      options.prompt || 'conteudo-gerado',
      options.preset || 'instagram',
      options.slides || htmls.length
    );
    
    const outputDir = path.join(baseDir, friendlyName);
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    for (const { filename, html, isTextFile } of htmls) {
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`📄 Salvo: ${filename}${isTextFile ? ' (texto)' : ''}`);
    }
    
    console.log(`📁 HTMLs salvos em: ${outputDir}`);
    console.log(`🏷️  Pasta: ${friendlyName}`);
    return outputDir;
  }

  /**
   * Gera e salva HTMLs em uma operação
   * @param {Object} options - Opções de geração
   * @returns {Promise<string>} Caminho da pasta criada
   */
  async generateAndSave(options = {}) {
    const htmls = await this.generateHtmls(options);
    return await this.writeToWorkFolder(htmls, undefined, options);
  }

  /**
   * Lista documentos disponíveis na base de conhecimento
   * @returns {Array<string>} Lista de nomes dos documentos
   */
  listAvailableDocuments() {
    return this.knowledgeManager.listAvailableDocuments();
  }

  /**
   * Busca documentos por palavra-chave
   * @param {string} keyword - Palavra-chave
   * @returns {Array<Object>} Documentos encontrados
   */
  searchDocuments(keyword) {
    return this.knowledgeManager.searchDocuments(keyword);
  }
}

module.exports = AIHtmlGenerator;
