const path = require('path');
const FileManager = require('./FileManager');
const ImageProcessor = require('./ImageProcessor');
const ConfigManager = require('./ConfigManager');
const AIHtmlGenerator = require('./AIHtmlGenerator');
const HtmlGenerator = require('./HtmlGenerator');
const TemplateGenerator = require('./TemplateGenerator');
const TextTranslator = require('./TextTranslator');

// Logger com contexto de arquivo:linha para ajudar na depuração
function orchestratorLog(level, message) {
  const err = new Error();
  const stackLine = (err.stack || '').split('\n')[2] || '';
  const match = stackLine.match(/\((.*[\\/])?([^\\/]+):(\d+):\d+\)/);
  const location = match ? `${match[2]}:${match[3]}` : 'ProcessingOrchestrator';
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
 * Orquestrador principal do processamento
 * Coordena todas as operações de conversão
 */
class ProcessingOrchestrator {
  constructor() {
    this.fileManager = new FileManager();
    this.configManager = new ConfigManager();
    this.htmlGenerator = new HtmlGenerator();
    this.templateGenerator = new TemplateGenerator();
    this.imageProcessor = null;
  }

  /**
   * Processa pasta de trabalho principal
   * @param {string} folder - Pasta de trabalho
   * @param {Object} options - Opções da CLI
   * @returns {Object} Estatísticas do processamento
   */
  async processFolder(folder, options) {
    // Carregar configuração do arquivo
    const fileConfig = this.configManager.loadConfig();
    
    // Criar configuração efetiva
    const effectiveConfig = this.configManager.createEffectiveConfig(
      fileConfig,
      options
    );
    
    // Validar configuração
    this.configManager.validateConfig(effectiveConfig);
    
    // Log da configuração
    this.configManager.logConfig(effectiveConfig, options.verbose);
    
    // Inicializar processador de imagens
    this.imageProcessor = new ImageProcessor(effectiveConfig);
    await this.imageProcessor.init();
    
    // Verificar se caminho existe
    if (!this.fileManager.exists(folder)) {
      throw new Error(`Caminho não encontrado: ${folder}`);
    }
    
    // Detectar se é arquivo ou pasta
    const pathStats = this.fileManager.getStats(folder);
    let htmlFiles;
    
    if (pathStats.isFile()) {
      htmlFiles = await this.processSingleFile(folder);
    } else {
      htmlFiles = await this.processDirectory(folder);
    }
    
    // Aplicar filtro de intervalo se especificado
    if (options.range && htmlFiles.length > 0) {
      htmlFiles = this.filterByRange(htmlFiles, options.range);
      if (htmlFiles.length === 0) {
      orchestratorLog('warn', `⚠️ Nenhum arquivo encontrado no intervalo especificado: ${options.range}`);
        return;
      }
      orchestratorLog('log', `📋 Filtrado para intervalo ${options.range}: ${htmlFiles.length} arquivo(s)`);
    }
    
    if (htmlFiles.length === 0) {
      orchestratorLog('warn', '⚠️ Nenhum arquivo HTML encontrado.');
      orchestratorLog('log', '💡 Dica: use --generate N para criar templates de exemplo');
      return;
    }
    
    orchestratorLog('log', `📄 Encontrados ${htmlFiles.length} arquivo(s) HTML`);

    // Traduzir arquivos se solicitado
    if (options.translate) {
      htmlFiles = await this.translateHtmlFiles(htmlFiles, options);
    }
    
    // Processar arquivos
    const results = await this.imageProcessor.processMultipleFiles(htmlFiles, {
      concurrency: effectiveConfig.processing.maxConcurrent,
      outputDir: options.outDir,
      suffix: options.suffix
    });
    
    // Gerar relatório
    const stats = this.imageProcessor.generateReport(results);
    
    return stats;
  }

  /**
   * Processa um arquivo único
   * @param {string} filePath - Caminho do arquivo
   * @returns {Array<string>} Lista com o arquivo ou resultado do processamento
   */
  async processSingleFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.html') {
      // É um arquivo HTML específico
      console.log(`📄 Processando arquivo: ${path.basename(filePath)}`);
      return [filePath];
    } else if (['.zip', '.rar'].includes(ext)) {
      // É um arquivo compactado - processar diretamente
      console.log(`📦 Processando arquivo compactado: ${path.basename(filePath)}`);
        const results = await this.imageProcessor.processArchive(filePath, path.join(process.cwd(), 'output'));
      console.log(`✅ Conversão concluída: ${results.length} imagem(ns) gerada(s)`);
      return [];
    } else {
      throw new Error(`Formato de arquivo não suportado: ${ext}. Use .html, .zip ou .rar`);
    }
  }

  /**
   * Processa um diretório
   * @param {string} folder - Caminho do diretório
   * @returns {Array<string>} Lista de arquivos HTML encontrados
   */
  async processDirectory(folder) {
    // É uma pasta - encontrar arquivos HTML
    let htmlFiles = this.fileManager.findHtmlFiles(folder);
    
    // Se não encontrou HTMLs, verificar se tem ZIPs para descompactar
    if (htmlFiles.length === 0) {
      const zipFiles = this.fileManager.findZipFiles(folder);
      if (zipFiles.length > 0) {
        console.log(`📦 Encontrados ${zipFiles.length} arquivo(s) compactado(s). Descompactando...`);
        
        for (const zipFile of zipFiles) {
          try {
            const workDir = path.join(process.cwd(), 'work', 'htmls');
            // Usar fluxo unificado que já retorna HTMLs encontrados
            const { htmlFiles: extractedHtmls, extractPath } = await this.imageProcessor.archiveProcessor.processArchive(zipFile, workDir);
            console.log(`✅ Descompactado: ${path.basename(zipFile)}`);
            if (extractedHtmls && extractedHtmls.length > 0) {
              htmlFiles.push(...extractedHtmls);
            }
          } catch (error) {
            console.error(`❌ Erro ao descompactar ${path.basename(zipFile)}: ${error.message}`);
          }
        }
      }
    }
    
    return htmlFiles;
  }

  /**
   * Gera templates base
   * @param {string} folder - Pasta de destino
   * @param {Object} options - Opções de geração
   * @returns {Object} Resultado da geração
   */
  async generateTemplates(folder, options) {
    const { preset = 'generic', generate: count, width, height, format, quality, background } = options;
    
    console.log(`🎨 Gerando ${count} template(s) do tipo: ${preset}`);
    
    const templateOptions = {
      width: width || (preset === 'instagram' ? 1080 : preset === 'stories' ? 1920 : preset === 'ppt' ? 1920 : 1200),
      height: height || (preset === 'instagram' ? 1350 : preset === 'stories' ? 1080 : preset === 'ppt' ? 1080 : 800),
      format: format || 'png',
      quality: quality || 90,
      background: background || (preset === 'ppt' ? '#ffffff' : 'transparent')
    };
    
    const generatedFiles = this.templateGenerator.generateTemplates(
      preset,
      count,
      folder,
      templateOptions
    );
    
    console.log(`\n✅ ${generatedFiles.length} template(s) criado(s) com sucesso!`);
    console.log('\n💡 Para converter para imagens, execute:');
    console.log(`node index.js "${folder}"`);
    
    return { generated: generatedFiles.length };
  }

  /**
   * Gera HTMLs via AI
   * @param {string} folder - Pasta de trabalho
   * @param {Object} options - Opções da CLI
   * @returns {Object} Resultado do processamento
   */
  async generateWithAI(folder, options) {
    try {
      console.log('🧠 Modo AI ativado - Gerando HTMLs...');
      
      // Validar prompt
      if (!options.prompt) {
        throw new Error('--prompt é obrigatório quando usar --ai');
      }

      // Criar gerador AI
      const aiGenerator = new AIHtmlGenerator({ 
        provider: options.provider || process.env.AI_PROVIDER || 'gemini',
        model: options.model,
        apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL || process.env.OLLAMA_BASE_URL
      });

      // Mostrar documentos disponíveis se solicitado
      if (options.listDocs) {
        const docs = aiGenerator.listAvailableDocuments();
        console.log('\n📚 Documentos disponíveis na base de conhecimento:');
        docs.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc}`);
        });
        console.log('');
      }

      // Buscar documentos relevantes se especificado
      let relevantDocs = null;
      if (options.relevantDocs) {
        relevantDocs = options.relevantDocs.split(',').map(doc => doc.trim());
        console.log(`📖 Usando documentos específicos: ${relevantDocs.join(', ')}`);
      }

      // Gerar e salvar HTMLs
      const aiFolder = await aiGenerator.generateAndSave({
        prompt: options.prompt,
        count: Number(options.slides || 6),
        preset: options.preset || 'instagram',
        model: options.model,
        relevantDocs: relevantDocs
      });

      console.log(`✅ HTMLs gerados em: ${aiFolder}`);
      console.log('🔄 Processando com pipeline normal...');

      // Redirecionar processamento para a pasta AI
      const newOptions = { ...options };
      newOptions.ai = false; // Evitar loop infinito
      newOptions.prompt = null;

      // Usar a pasta AI como entrada
      return await this.processFolder(aiFolder, newOptions);

    } catch (error) {
      console.error('❌ Erro na geração AI:', error.message);
      throw error;
    }
  }

  /**
   * Cria HTML vazio
   * @param {string} folder - Pasta de destino
   * @param {string} fileName - Nome do arquivo
   * @param {Object} options - Opções de configuração
   * @returns {Object} Resultado da operação
   */
  async createEmptyHtml(folder, fileName, options) {
    return await this.htmlGenerator.createEmptyHtml(folder, fileName, options);
  }

  /**
   * Cria múltiplos HTMLs vazios
   * @param {string} folder - Pasta de destino
   * @param {number} count - Quantidade de arquivos
   * @param {Object} options - Opções de configuração
   * @returns {Object} Resultado da operação
   */
  async createMultipleEmptyHtmls(folder, count, options) {
    return await this.htmlGenerator.createMultipleEmptyHtmls(folder, count, options);
  }

  /**
   * Converte um arquivo HTML específico (uso programático)
   * @param {string} htmlPath - Caminho do arquivo HTML
   * @param {Object} options - Opções de configuração
   * @returns {Object} Resultado da conversão
   */
  async convertFile(htmlPath, options = {}) {
    const fileConfig = this.configManager.loadConfig();
    const effectiveConfig = this.configManager.createEffectiveConfig(
      fileConfig,
      options
    );
    
    this.configManager.validateConfig(effectiveConfig);
    
    this.imageProcessor = new ImageProcessor(effectiveConfig);
    await this.imageProcessor.init();
    
    try {
      const result = await this.imageProcessor.processHtmlFile(
        htmlPath,
        options.outputDir,
        options.suffix
      );
      return result;
    } finally {
      await this.imageProcessor.close();
    }
  }

  /**
   * Converte múltiplos arquivos HTML (uso programático)
   * @param {Array<string>} htmlPaths - Lista de caminhos de arquivos HTML
   * @param {Object} options - Opções de configuração
   * @returns {Array<Object>} Resultados das conversões
   */
  async convertFiles(htmlPaths, options = {}) {
    const fileConfig = this.configManager.loadConfig();
    const effectiveConfig = this.configManager.createEffectiveConfig(
      fileConfig,
      options
    );
    
    this.configManager.validateConfig(effectiveConfig);
    
    this.imageProcessor = new ImageProcessor(effectiveConfig);
    await this.imageProcessor.init();
    
    try {
      const results = await this.imageProcessor.processMultipleFiles(htmlPaths, options);
      return results;
    } finally {
      await this.imageProcessor.close();
    }
  }

  /**
   * Lista documentos da base de conhecimento
   * @returns {Object} Lista de documentos
   */
  async listKnowledgeDocuments() {
    const knowledgeManager = new (require('./KnowledgeManager'))();
    const docs = knowledgeManager.listAvailableDocuments();
    
    console.log('\n📚 Documentos disponíveis na base de conhecimento:');
    if (docs.length === 0) {
      console.log('   Nenhum documento encontrado.');
      console.log('   Adicione arquivos .txt em knowledge/documents/');
    } else {
      docs.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc}`);
      });
    }
    console.log('');
    
    return { documents: docs };
  }

  /**
   * Busca documentos por palavra-chave
   * @param {string} keyword - Palavra-chave
   * @returns {Object} Documentos encontrados
   */
  async searchKnowledgeDocuments(keyword) {
    const knowledgeManager = new (require('./KnowledgeManager'))();
    const results = knowledgeManager.searchDocuments(keyword);
    
    console.log(`\n🔍 Busca por "${keyword}":`);
    if (results.length === 0) {
      console.log('   Nenhum documento encontrado.');
    } else {
      results.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.name} (${doc.filename})`);
        console.log(`      Tamanho: ${doc.size} bytes`);
      });
    }
    console.log('');
    
    return { results: results, keyword: keyword };
  }

  /**
   * Filtra arquivos HTML baseado em um intervalo
   * @param {Array<string>} htmlFiles - Lista de arquivos HTML
   * @param {string} range - Intervalo no formato "1-5", "01-10", "1,3,5", "1-3,5-7"
   * @returns {Array<string>} Arquivos filtrados
   */
  filterByRange(htmlFiles, range) {
    // Função para extrair número do nome do arquivo
    // IMPORTANTE: Extrai TODOS os dígitos do início, então:
    // - "01.html" -> 1 (parseInt remove zeros à esquerda)
    // - "10.html" -> 10 (número completo)
    // - "11.html" -> 11 (número completo)
    // Isso garante que --range 1 pega apenas "01.html" ou "1.html", NÃO "10.html" ou "11.html"
    const getFileNumber = (filePath) => {
      const fileName = path.basename(filePath, '.html');
      // Regex pega TODOS os dígitos consecutivos do início: ^(\d+)
      // Exemplos:
      //   "01.html" -> match[1] = "01" -> parseInt("01", 10) = 1
      //   "10.html" -> match[1] = "10" -> parseInt("10", 10) = 10
      //   "11.html" -> match[1] = "11" -> parseInt("11", 10) = 11
      const match = fileName.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    // Parsear o intervalo
    const parseRange = (rangeStr) => {
      const numbers = new Set();
      const parts = rangeStr.split(',').map(p => p.trim());
      
      for (const part of parts) {
        if (part.includes('-')) {
          // É um intervalo (ex: "1-5")
          const [start, end] = part.split('-').map(s => parseInt(s.trim(), 10));
          if (isNaN(start) || isNaN(end)) {
            throw new Error(`Intervalo inválido: ${part}`);
          }
          if (start > end) {
            throw new Error(`Intervalo inválido: início (${start}) maior que fim (${end})`);
          }
          for (let i = start; i <= end; i++) {
            numbers.add(i);
          }
        } else {
          // É um número único (ex: "5")
          const num = parseInt(part, 10);
          if (isNaN(num)) {
            throw new Error(`Número inválido: ${part}`);
          }
          numbers.add(num);
        }
      }
      
      return numbers;
    };

    try {
      const targetNumbers = parseRange(range);
      
      // Log para debug: mostrar mapeamento de arquivos
      const fileMapping = htmlFiles.map(filePath => {
        const fileNumber = getFileNumber(filePath);
        const fileName = path.basename(filePath);
        return { file: fileName, number: fileNumber };
      });
      
      console.log(`\n📋 Mapeamento de arquivos:`);
      fileMapping.forEach(({ file, number }) => {
        const isIncluded = number !== null && targetNumbers.has(number);
        const icon = isIncluded ? '✅' : '⏭️';
        console.log(`   ${icon} ${file} → número: ${number !== null ? number : 'N/A'}`);
      });
      
      const filtered = htmlFiles.filter(filePath => {
        const fileNumber = getFileNumber(filePath);
        return fileNumber !== null && targetNumbers.has(fileNumber);
      });
      
      return filtered;
    } catch (error) {
      throw new Error(`Erro ao processar intervalo "${range}": ${error.message}`);
    }
  }

  /**
   * Traduz arquivos HTML usando IA
   * @param {Array<string>} htmlFiles - Lista de arquivos HTML
   * @param {Object} options - Opções da CLI
   * @returns {Promise<Array<string>>} Lista de arquivos traduzidos (ou originais se não traduzir)
   */
  async translateHtmlFiles(htmlFiles, options) {
    try {
      const targetLang = options.translate;
      const sourceLang = options.sourceLang || 'auto';

      orchestratorLog('log', '🌍 Modo tradução ativado');
      orchestratorLog('log', `   Idioma de destino: ${targetLang}`);
      orchestratorLog('log', `   Idioma de origem: ${sourceLang === 'auto' ? 'auto-detectado' : sourceLang}`);

      // Para tradução, forçamos SEMPRE uso do Ollama local com modelo fixo de tradução
      const effectiveProvider = 'ollama';
      const effectiveModel =
        process.env.OLLAMA_TRANSLATE_MODEL ||
        'llama3.2:3b';

      orchestratorLog('log', `   Provider IA (tradução): ${effectiveProvider} (fixo para tradução)`);
      orchestratorLog('log', `   Modelo IA (tradução): ${effectiveModel} (fixo para tradução)`);
      orchestratorLog('log', `   Arquivos HTML a traduzir: ${htmlFiles.length}`);
      htmlFiles.forEach((file, idx) => {
        orchestratorLog('log', `     [${idx + 1}/${htmlFiles.length}] ${file}`);
      });

      // Criar tradutor (sempre Ollama, independente de qualquer config de geração)
      const translator = new TextTranslator({
        model: effectiveModel,
        baseUrl: process.env.OLLAMA_BASE_URL
      });

      // Traduzir arquivos
      const translatedFiles = await translator.translateHtmlFiles(
        htmlFiles,
        targetLang,
        sourceLang,
        { outputDir: options.outDir }
      );

      orchestratorLog('log', `✅ ${translatedFiles.length} arquivo(s) traduzido(s) com sucesso!`);
      translatedFiles.forEach((file, idx) => {
        orchestratorLog('log', `   [OK ${idx + 1}] ${file}`);
      });
      
      // Retornar arquivos traduzidos para processamento
      return translatedFiles;
    } catch (error) {
      orchestratorLog('error', `❌ Erro na tradução: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fecha recursos abertos
   */
  async close() {
    if (this.imageProcessor) {
      await this.imageProcessor.close();
    }
  }
}

module.exports = ProcessingOrchestrator;
