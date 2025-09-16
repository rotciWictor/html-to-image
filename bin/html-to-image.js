#!/usr/bin/env node

/**
 * HTML to Image Converter v1.0
 * 
 * Converte arquivos HTML para imagens (PNG, JPEG, WebP) usando Puppeteer
 * com arquitetura enterprise, CLI robusto e configuração flexível.
 * 
 * @author HTML to Image Converter Team
 * @version 1.0.0
 * @year 2025
 */

const fs = require('fs');
const path = require('path');

// Importar classes refatoradas
const CliParser = require('../lib/CliParser');
const ConfigManager = require('../lib/ConfigManager');
const ImageProcessor = require('../lib/ImageProcessor');
const TemplateGenerator = require('../lib/TemplateGenerator');

class HtmlToImageConverter {
  constructor() {
    this.cliParser = new CliParser();
    this.configManager = new ConfigManager();
    this.imageProcessor = null;
    this.templateGenerator = new TemplateGenerator();
  }

  async run() {
    try {
      // Parse CLI arguments
      const { folder, options } = this.cliParser.parse();
      
      console.log('🎯 HTML to Image Converter v2.1');
      console.log('='.repeat(50));
      console.log(`📁 Pasta de trabalho: ${folder}`);
      
      // Gerar templates se solicitado
      if (options.generate) {
        return await this.generateTemplates(folder, options);
      }
      
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
      
      // Verificar se pasta existe
      if (!fs.existsSync(folder)) {
        throw new Error(`Pasta não encontrada: ${folder}`);
      }
      
      // Encontrar arquivos HTML
      const htmlFiles = this.findHtmlFiles(folder);
      
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
      
      // Mostrar exemplos de uso se for primeira execução
      if (stats.successful > 0 && !options.verbose) {
        console.log('\n' + this.cliParser.getUsageExamples());
      }
      
      return stats;
      
    } catch (error) {
      console.error('💥 Erro:', error.message);
      
      if (error.message.includes('Configuração inválida') || 
          error.message.includes('inválido')) {
        console.log('\n💡 Use --help para ver opções disponíveis');
      }
      
      process.exit(1);
    } finally {
      if (this.imageProcessor) {
        await this.imageProcessor.close();
      }
    }
  }

  async generateTemplates(folder, options) {
    const { preset = 'generic', generate: count, width, height, format, quality, background } = options;
    
    console.log(`🎨 Gerando ${count} template(s) do tipo: ${preset}`);
    
    const templateOptions = {
      width: width || (preset === 'instagram' ? 1080 : preset === 'ppt' ? 1920 : 1200),
      height: height || (preset === 'instagram' ? 1080 : preset === 'ppt' ? 1080 : 800),
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
    console.log(`node html-to-image-v2.js "${folder}"`);
    
    return { generated: generatedFiles.length };
  }

  findHtmlFiles(folder) {
    const files = fs.readdirSync(folder);
    return files
      .filter(file => file.toLowerCase().endsWith('.html'))
      .map(file => path.join(folder, file))
      .sort();
  }

  createAssetsFolder(folder) {
    const assetsPath = path.join(folder, 'assets');
    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
      this.templateGenerator.createSampleAssets(assetsPath);
      console.log('📁 Pasta assets criada com arquivos de exemplo');
    }
    return assetsPath;
  }

  // Método para uso programático (não CLI)
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

  // Método para converter múltiplos arquivos programaticamente
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
}

// Executar se chamado diretamente
if (require.main === module) {
  const converter = new HtmlToImageConverter();
  converter.run().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = HtmlToImageConverter;
