const path = require('path');
const FileManager = require('./FileManager');
const ImageProcessor = require('./ImageProcessor');
const ConfigManager = require('./ConfigManager');
const AIHtmlGenerator = require('./AIHtmlGenerator');
const HtmlGenerator = require('./HtmlGenerator');
const TemplateGenerator = require('./TemplateGenerator');

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
    
    if (htmlFiles.length === 0) {
      console.log('⚠️ Nenhum arquivo HTML encontrado.');
      console.log('💡 Dica: use --generate N para criar templates de exemplo');
      return;
    }
    
    console.log(`📄 Encontrados ${htmlFiles.length} arquivo(s) HTML`);
    
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
            const workDir = path.join(process.cwd(), 'html-files', 'work');
            await this.imageProcessor.archiveProcessor.extract(zipFile, workDir);
            console.log(`✅ Descompactado: ${path.basename(zipFile)}`);
          } catch (error) {
            console.error(`❌ Erro ao descompactar ${path.basename(zipFile)}: ${error.message}`);
          }
        }
        
        // Buscar HTMLs novamente após descompactar
        htmlFiles = this.fileManager.findHtmlFiles(folder);
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
      height: height || (preset === 'instagram' ? 1440 : preset === 'stories' ? 1080 : preset === 'ppt' ? 1080 : 800),
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
      console.log('🧠 Modo AI ativado - Gerando HTMLs via Gemini...');
      
      // Validar prompt
      if (!options.prompt) {
        throw new Error('--prompt é obrigatório quando usar --ai');
      }

      // Criar gerador AI
      const aiGenerator = new AIHtmlGenerator({ 
        model: options.model || 'gemini-2.5-flash' 
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
   * Fecha recursos abertos
   */
  async close() {
    if (this.imageProcessor) {
      await this.imageProcessor.close();
    }
  }
}

module.exports = ProcessingOrchestrator;
