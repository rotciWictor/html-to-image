const fs = require('fs');
const path = require('path');
const OllamaAdapter = require('./ai/OllamaAdapter');
const CacheManager = require('./CacheManager');

/**
 * Tradutor de HTML Híbrido (V16 - GLOBAL CONTEXT)
 * - Lê TODOS os arquivos antes para entender o contexto da história.
 * - Injeta o contexto no prompt para desambiguar termos (Brasa = Ember vs Grill).
 * - Mantém JSON + Qwen 2.5 7B.
 */
class TextTranslator {
  constructor({ baseUrl } = {}) {
    this.providerName = 'ollama';
    const effectiveBaseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    const modelName = process.env.OLLAMA_TRANSLATE_MODEL || 'qwen2.5:7b';

    console.log(`🔌 TextTranslator Contextual Iniciado:`);
    console.log(`   🤖 Modelo: ${modelName}`);

    this.adapter = new OllamaAdapter({
      baseUrl: effectiveBaseUrl,
      model: modelName
    });

    const safeModelName = modelName.replace(/:/g, '-');
    this.cache = new CacheManager(`translator-context-${safeModelName}`);
  }

  /**
   * Gera um "Resumão" de texto de todos os arquivos para dar contexto à IA
   */
  generateGlobalContext(htmlFiles) {
    console.log(`   📖 Lendo contexto global de ${htmlFiles.length} arquivos...`);
    let fullText = "";
    
    // Lê os primeiros 5KB de texto de cada arquivo para não estourar o prompt
    // Isso geralmente é suficiente para pegar o tom e vocabulário
    for (const file of htmlFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        // Remove tags HTML simples para economizar tokens
        const textOnly = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (textOnly) {
          fullText += textOnly + "\n";
        }
      } catch (e) {
        // Ignora erros de leitura no contexto
      }
    }
    
    // Limita o contexto a ~2000 caracteres para não deixar o prompt gigante
    // Se a história for muito longa, pegamos o início (introdução) e partes do meio
    return fullText.substring(0, 3000);
  }

  async translateHtmlFiles(htmlFiles, targetLang, sourceLang = 'auto', options = {}) {
    // 1. GERAR CONTEXTO GLOBAL
    // Antes de traduzir qualquer coisa, lemos tudo para a IA "entender a história"
    const globalContext = this.generateGlobalContext(htmlFiles);
    console.log(`   🧠 Contexto carregado (${globalContext.length} chars).`);

    const results = [];
    for (const file of htmlFiles) {
      try {
        // Passamos o globalContext para cada arquivo
        const newPath = await this.translateHtmlFile(file, targetLang, sourceLang, options, globalContext);
        results.push(newPath);
      } catch (e) {
        console.error(`   ❌ Erro em ${path.basename(file)}: ${e.message}`);
        results.push(file);
      }
    }
    return results;
  }

  async translateHtmlFile(htmlFilePath, targetLang, sourceLang = 'auto', options = {}, globalContext = '') {
    try {
      console.log(`\n=== 🌍 Processando: ${path.basename(htmlFilePath)} ===`);
      
      const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
      const extraction = this.extractContentBlocks(htmlContent);
      
      if (extraction.segments.length === 0) {
        return this.saveTranslation(htmlFilePath, htmlContent, targetLang, options);
      }

      console.log(`   📝 Segmentos: ${extraction.segments.length}`);

      // 1. Tradução (COM CONTEXTO GLOBAL)
      const cleanTexts = extraction.segments.map(s => s.cleanText);
      console.log(`   🗣️ Iniciando tradução contextual...`);
      
      const translatedTexts = await this.translateViaJson(cleanTexts, targetLang, globalContext);

      // 2. Reconstrução
      console.log(`   🧠 Reconstruindo estrutura...`);
      const originalHtmls = extraction.segments.map(s => s.innerHtml);
      const finalHtmlBlocks = await this.reconstructHtmlBlocks(originalHtmls, translatedTexts);

      // 3. Substituição
      let finalHtml = extraction.maskedHtml;
      extraction.segments.forEach((seg, index) => {
        let finalBlock = finalHtmlBlocks[index];
        if (!finalBlock || finalBlock.trim() === '') finalBlock = seg.innerHtml;
        finalHtml = finalHtml.replace(seg.placeholder, finalBlock);
      });

      return this.saveTranslation(htmlFilePath, finalHtml, targetLang, options);

    } catch (error) {
      throw new Error(`Erro ao traduzir: ${error.message}`);
    }
  }

  extractContentBlocks(html) {
    const segments = [];
    let maskedHtml = html;
    let counter = 0;

    const blockTags = [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'li', 'figcaption', 'blockquote', 'th', 'td', 
      'label', 'legend', 'option', 'button'
    ];

    const pattern = new RegExp(`(<(${blockTags.join('|')})\\b[^>]*>)([\\s\\S]*?)(<\\/\\2>)`, 'gi');

    maskedHtml = maskedHtml.replace(pattern, (match, openTag, tagName, innerContent, closeTag) => {
      const cleanText = innerContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (!cleanText || cleanText.length < 2 || /^\d+$/.test(cleanText) || /<(div|table|ul|ol)/i.test(innerContent)) {
        return match;
      }

      const placeholder = `__H2I_BLOCK_${counter++}__`;
      
      segments.push({
        placeholder,
        innerHtml: innerContent.trim(),
        cleanText: cleanText
      });

      return `${openTag}${placeholder}${closeTag}`;
    });

    return { maskedHtml, segments };
  }

  async translateViaJson(texts, targetLang, globalContext) {
    const BATCH_SIZE = 10; 
    const translations = [];
    const langMap = { 'en': 'English', 'pt': 'Portuguese', 'es': 'Spanish' };
    const tLang = langMap[targetLang] || targetLang;

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      
      // Cache Key inclui o contexto global?
      // Melhor não incluir o texto todo na key para não ficar gigante, 
      // mas idealmente se o contexto muda, a tradução muda.
      // Vamos adicionar um hash simples do contexto.
      const contextHash = globalContext.length; 
      const cacheKey = this.cache.generateKey(JSON.stringify(batch) + targetLang + contextHash + 'v16-context');
      
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`   ⚡ [Cache] Lote recuperado.`);
        translations.push(...cached);
        continue;
      }

      console.log(`   📨 [Qwen] Traduzindo lote ${Math.ceil((i+1)/BATCH_SIZE)} com contexto...`);

      // PROMPT COM CONTEXTO DA HISTÓRIA
      const prompt = `You are a professional translator for a literary work.
      
STORY CONTEXT (Use this to understand tone and vocabulary):
"""
${globalContext}
"""

TASK: Translate the specific array of strings below to ${tLang}.

SPECIFIC RULES:
1. Use the CONTEXT above to disambiguate words (e.g., if the story is about fire, "Brasa" -> "Ember", not "Grill").
2. Return ONLY a valid JSON array of strings.
3. Translate everything including uppercase.
4. Keep numbers exactly as they are.

INPUT JSON:
${JSON.stringify(batch)}

OUTPUT JSON:`;

      try {
        const response = await this.adapter.generateContent(prompt, { temperature: 0.1 });
        
        const jsonStr = response.trim().replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*?$/, ']');
        let resultBatch;
        
        try {
          resultBatch = JSON.parse(jsonStr);
        } catch (e) {
          resultBatch = batch; 
        }

        if (!Array.isArray(resultBatch) || resultBatch.length !== batch.length) {
           resultBatch = batch;
        }

        this.cache.set(cacheKey, resultBatch);
        translations.push(...resultBatch);

      } catch (err) {
        console.error(`   ❌ Erro Tradução: ${err.message}`);
        translations.push(...batch);
      }
    }
    return translations;
  }

  async reconstructHtmlBlocks(originalHtmls, translatedTexts) {
    const finalHtmls = [];

    for (let i = 0; i < originalHtmls.length; i++) {
      const original = originalHtmls[i];
      const translated = translatedTexts[i];

      if (!original.includes('<')) {
        finalHtmls.push(translated);
        continue;
      }

      const itemKey = this.cache.generateKey(original + translated + 'recon_v16');
      const cachedItem = this.cache.get(itemKey);
      if (cachedItem) {
        finalHtmls.push(cachedItem);
        process.stdout.write('c');
        continue;
      }

      const prompt = `Role: HTML Expert.
Task: Apply the structure (tags) from ORIGINAL to the TRANSLATED text.

ORIGINAL: "${original}"
TRANSLATED: "${translated}"

Rules:
1. Re-insert tags (<b>, <br>, <span>) into the TRANSLATED text where they make sense logically.
2. Return ONLY the final string.

RESULT:`;

      try {
        const result = await this.adapter.generateContent(prompt, { temperature: 0.0 });
        const cleanResult = this.cleanAIResponse(result, translated);
        
        this.cache.set(itemKey, cleanResult);
        finalHtmls.push(cleanResult);
        process.stdout.write('.');
      } catch (err) {
        finalHtmls.push(translated);
      }
    }
    console.log('');
    return finalHtmls;
  }

  cleanAIResponse(response, fallback) {
    let clean = response.trim();
    clean = clean.replace(/```(?:html)?/g, '').replace(/```/g, '');
    clean = clean.replace(/^(Here is|Sure|Output|Result).*?:/i, '');
    clean = clean.trim().replace(/^"|"$/g, '');
    return clean || fallback;
  }

  adjustAssetPaths(htmlContent) {
    return htmlContent.replace(/((?:src|href)=["']|url\(['"]?)(?:\.\/)?assets\//gi, '$1../../assets/');
  }

  saveTranslation(originalPath, content, lang, options) {
    const dir = path.dirname(originalPath);
    const filename = path.basename(originalPath);
    
    let targetDir = options.outputDir 
      ? path.join(options.outputDir, lang) 
      : path.join(dir, lang);

    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const fixedContent = this.adjustAssetPaths(content);
    const outputPath = path.join(targetDir, filename);
    
    fs.writeFileSync(outputPath, fixedContent, 'utf-8');
    
    console.log(`   💾 Salvo em: .../${lang}/${filename}`);
    return outputPath;
  }

  getOutputPath(htmlFilePath, targetLang, options = {}) {
    return this.saveTranslation(htmlFilePath, '', targetLang, options);
  }
}

module.exports = TextTranslator;