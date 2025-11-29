const fs = require('fs');
const path = require('path');
const OllamaAdapter = require('./ai/OllamaAdapter');

// Logger com contexto de arquivo:linha para depuração detalhada
function logWithContext(level, message) {
  const err = new Error();
  const stackLine = (err.stack || '').split('\n')[2] || '';
  // Formato típico: "    at FunctionName (C:\path\file.js:LINE:COL)"
  const match = stackLine.match(/\((.*[\\/])?([^\\/]+):(\d+):\d+\)/);
  const location = match ? `${match[2]}:${match[3]}` : 'TextTranslator';
  const prefix = `[${location}]`;

  if (level === 'warn') {
    console.warn(prefix, message);
  } else if (level === 'error') {
    console.error(prefix, message);
  } else {
    console.log(prefix, message);
  }
}

/**
 * Tradutor de textos em arquivos HTML usando IA
 * Extrai textos, traduz usando IA e substitui mantendo estrutura HTML
 */
class TextTranslator {
  constructor({ model, baseUrl } = {}) {
    /**
     * Tradutor é deliberadamente SINGLE-PROVIDER:
     * - Sempre usa Ollama
     * - Modelo padrão: OLLAMA_TRANSLATE_MODEL || 'llama3.2:3b'
     * - Base URL padrão: OLLAMA_BASE_URL || 'http://localhost:11434'
     */
    this.providerName = 'ollama';

    // CORREÇÃO AQUI:
    // Damos prioridade à variável de ambiente específica para tradução ou ao hardcoded 'llama3.2:3b'.
    // Só usamos o parâmetro 'model' se ele NÃO parecer um modelo de nuvem (como gemini ou gpt).
    
    let selectedModel = 'llama3.2:3b'; // Fallback padrão seguro
    
    // 1. Tenta pegar da variável de ambiente específica (Melhor opção)
    if (process.env.OLLAMA_TRANSLATE_MODEL) {
      selectedModel = process.env.OLLAMA_TRANSLATE_MODEL;
    } 
    // 2. Se não, verifica se o modelo passado é compatível com Ollama (evita gemini/gpt)
    else if (model && !model.includes('gemini') && !model.includes('gpt')) {
      selectedModel = model;
    }

    const effectiveBaseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    console.log(`🔌 TextTranslator inicializado com modelo: ${selectedModel}`);

    this.adapter = new OllamaAdapter({
      baseUrl: effectiveBaseUrl,
      model: selectedModel
    });
  }

  /**
   * Traduz textos de um arquivo HTML
   * @param {string} htmlFilePath - Caminho do arquivo HTML
   * @param {string} targetLang - Idioma de destino (ex: 'en', 'es', 'fr', 'pt')
   * @param {string} sourceLang - Idioma de origem (opcional, 'auto' para detectar)
   * @param {Object} options - Opções adicionais
   * @returns {Promise<string>} Caminho do arquivo traduzido
   */
  async translateHtmlFile(htmlFilePath, targetLang, sourceLang = 'auto', options = {}) {
    try {
      logWithContext('log', '🔎 Iniciando tradução de arquivo HTML');
      logWithContext('log', `   Arquivo: ${htmlFilePath}`);
      logWithContext('log', `   Idioma origem: ${sourceLang}`);
      logWithContext('log', `   Idioma destino: ${targetLang}`);
      logWithContext('log', `   Provider interno: ${this.providerName}`);

      // Ler arquivo HTML
      const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
      logWithContext('log', `   Tamanho do HTML (chars): ${htmlContent.length}`);
      
      // Extrair textos do HTML
      const textSegments = this.extractTextSegments(htmlContent);
      
      if (textSegments.length === 0) {
        logWithContext('warn', `⚠️ Nenhum texto encontrado em ${path.basename(htmlFilePath)}`);
        return htmlFilePath;
      }

      logWithContext('log', `📝 Encontrados ${textSegments.length} segmento(s) de texto para traduzir:`);
      textSegments.forEach((seg, idx) => {
        const preview = seg.text.length > 120 ? seg.text.slice(0, 117) + '...' : seg.text;
        logWithContext('log', `   [S${idx + 1}] ${preview}`);
      });

      // Traduzir textos usando IA
      const translatedSegments = await this.translateTexts(
        textSegments.map(s => s.text),
        targetLang,
        sourceLang
      );
      logWithContext('log', `   ✅ Traduções recebidas: ${translatedSegments.length} item(ns)`);

      // Substituir textos no HTML usando placeholders temporários
      let translatedHtml = htmlContent;
      const placeholders = new Map();
      
      // Primeiro passo: substituir textos originais por placeholders únicos
      textSegments.forEach((segment, index) => {
        const placeholder = `__H2I_TRANSLATE_PLACEHOLDER_${index}__`;
        placeholders.set(placeholder, translatedSegments[index]);
        
        // Substituir apenas quando estiver entre tags (preservar estrutura HTML)
        const escapedText = this.escapeRegex(segment.text);
        // Permitir espaços/quebras de linha ao redor do texto dentro da tag
        const pattern = new RegExp(`>([\\s]*)${escapedText}([\\s]*)<`, 'g');
        const before = translatedHtml;
        translatedHtml = translatedHtml.replace(pattern, `>$1${placeholder}$2<`);
        if (before !== translatedHtml) {
          logWithContext('log', `   🔁 Placeholder aplicado para segmento [S${index + 1}]`);
        } else {
          logWithContext('warn', `   ⚠️ Nenhuma ocorrência encontrada para segmento [S${index + 1}] (pode estar dentro de tag complexa)`);
        }
      });
      
      // Segundo passo: substituir placeholders por textos traduzidos
      placeholders.forEach((translated, placeholder) => {
        translatedHtml = translatedHtml.replace(new RegExp(this.escapeRegex(placeholder), 'g'), translated);
      });

      // Salvar arquivo traduzido
      const outputPath = this.getOutputPath(htmlFilePath, targetLang, options);
      fs.writeFileSync(outputPath, translatedHtml, 'utf-8');

      logWithContext('log', `✅ Traduzido: ${path.basename(htmlFilePath)} → ${path.basename(outputPath)}`);
      logWithContext('log', `   Caminho completo: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      logWithContext('error', `Erro ao traduzir ${path.basename(htmlFilePath)}: ${error.message}`);
      throw new Error(`Erro ao traduzir ${path.basename(htmlFilePath)}: ${error.message}`);
    }
  }

  /**
   * Traduz múltiplos arquivos HTML
   * @param {Array<string>} htmlFiles - Lista de caminhos de arquivos HTML
   * @param {string} targetLang - Idioma de destino
   * @param {string} sourceLang - Idioma de origem
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array<string>>} Lista de arquivos traduzidos
   */
  async translateHtmlFiles(htmlFiles, targetLang, sourceLang = 'auto', options = {}) {
    const results = [];
    
    for (let i = 0; i < htmlFiles.length; i++) {
      const htmlFile = htmlFiles[i];
      logWithContext('log', `=== 🗂️ Tradução de arquivo ${i + 1}/${htmlFiles.length}: ${htmlFile} ===`);
      try {
        const translatedPath = await this.translateHtmlFile(htmlFile, targetLang, sourceLang, options);
        results.push(translatedPath);
      } catch (error) {
        logWithContext('error', `❌ ${error.message}`);
        // Continuar com próximo arquivo mesmo se houver erro
      }
    }

    return results;
  }

  /**
   * Extrai segmentos de texto do HTML (preservando estrutura)
   * @param {string} html - Conteúdo HTML
   * @returns {Array<Object>} Array de objetos { text, original }
   */
  extractTextSegments(html) {
    const segments = [];
    const seen = new Set();

    // Trabalhar apenas dentro do <body> para evitar meta, title, etc.
    logWithContext('log', '   🔍 Extraindo textos do HTML (modo whitelist de tags)...');
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;
    const bodyOffset = bodyMatch ? bodyMatch.index || 0 : 0;

    // Tags consideradas como "tags de texto"
    const textTags = [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'strong', 'em', 'b', 'i', 'small',
      'label', 'button', 'a', 'li', 'figcaption',
      'blockquote', 'td', 'th'
    ];

    for (const tag of textTags) {
      const tagRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      let match;

      while ((match = tagRegex.exec(bodyContent)) !== null) {
        const rawInner = match[1];

        // Remover tags internas
        let text = rawInner.replace(/<[^>]+>/g, ' ');
        text = text.replace(/\s+/g, ' ').trim();

        if (
          text &&
          text.length > 1 &&
          !/^\s*$/.test(text) &&
          !/^[\d\s\.,;:!?\-_=+*\/\\|\[\]{}()]+$/.test(text) &&
          !text.trim().startsWith('@')
        ) {
          if (!seen.has(text)) {
            seen.add(text);
            segments.push({
              text,
              original: match[0],
              position: bodyOffset + match.index
            });
            logWithContext('log', `     ↳ [${tag}] "${text}"`);
          }
        }
      }
    }

    segments.sort((a, b) => a.position - b.position);
    return segments;
  }

  /**
   * Traduz array de textos usando IA
   * @param {Array<string>} texts - Array de textos para traduzir
   * @param {string} targetLang - Idioma de destino
   * @param {string} sourceLang - Idioma de origem
   * @returns {Promise<Array<string>>} Array de textos traduzidos
   */
  async translateTexts(texts, targetLang, sourceLang = 'auto') {
    try {
      // Para evitar qualquer descompasso entre entradas/saídas,
      // traduzimos CADA texto em uma chamada separada ao Ollama.
      const langNames = {
        'en': 'inglês', 'es': 'espanhol', 'fr': 'francês',
        'pt': 'português', 'de': 'alemão', 'it': 'italiano',
        'ja': 'japonês', 'zh': 'chinês', 'ru': 'russo', 'ko': 'coreano'
      };

      const targetLangName = langNames[targetLang.toLowerCase()] || targetLang;
      const sourceLangName = sourceLang === 'auto'
        ? 'detectar automaticamente'
        : (langNames[sourceLang.toLowerCase()] || sourceLang);

      const results = [];

      for (let i = 0; i < texts.length; i++) {
        const original = texts[i];

        // Evitar chamadas desnecessárias para strings muito pequenas ou vazias
        if (!original || original.trim().length === 0) {
          results.push(original);
          continue;
        }

        const prompt = `Traduza o texto abaixo do ${sourceLangName} para ${targetLangName}.

Regras:
- Responda APENAS com o texto traduzido, sem comentários ou explicações.
- Mantenha o estilo e o tom do original.

Texto:
${original}`;

        logWithContext('log', `   🧠 Traduzindo segmento ${i + 1}/${texts.length}...`);

        try {
          const response = await this.adapter.generateContent(prompt, {
            temperature: 0.2
          });

          if (response && typeof response === 'string') {
            const translated = response.trim();
            results.push(translated.length > 0 ? translated : original);
          } else {
            logWithContext('warn', `   ⚠️ Resposta vazia para segmento ${i + 1}, mantendo original.`);
            results.push(original);
          }
        } catch (err) {
          logWithContext('error', `   ❌ Erro ao traduzir segmento ${i + 1}: ${err.message}`);
          // Em caso de erro, mantém texto original para não quebrar o fluxo
          results.push(original);
        }
      }

      return results;
    } catch (error) {
      logWithContext('error', `   ❌ Erro na tradução via IA: ${error.message}`);
      throw new Error(`Erro na tradução via IA: ${error.message}`);
    }
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getOutputPath(htmlFilePath, targetLang, options = {}) {
    const dir = path.dirname(htmlFilePath);
    const basename = path.basename(htmlFilePath, '.html');
    const ext = path.extname(htmlFilePath);
    
    if (options.outputDir) {
      const outputDir = path.resolve(options.outputDir);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      return path.join(outputDir, `${basename}-${targetLang}${ext}`);
    }
    
    return path.join(dir, `${basename}-${targetLang}${ext}`);
  }

  async detectLanguage(text) {
    // Implementação simples
    return 'auto';
  }
}

module.exports = TextTranslator;