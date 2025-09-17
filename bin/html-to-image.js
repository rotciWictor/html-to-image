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

// Carregar variáveis de ambiente primeiro
require('dotenv').config();

// Importar classes refatoradas
const CliParser = require('../lib/CliParser');
const ProcessingOrchestrator = require('../lib/ProcessingOrchestrator');

class HtmlToImageConverter {
  constructor() {
    this.cliParser = new CliParser();
    this.orchestrator = new ProcessingOrchestrator();
  }

  async run() {
    try {
      // Parse CLI arguments
      const { folder, options } = this.cliParser.parse();
      
      console.log('🎯 HTML to Image Converter v1.0');
      console.log('='.repeat(50));
      console.log(`📁 Pasta de trabalho: ${folder}`);
      
      // Delegar operações específicas para o orquestrador
      if (options.generate) {
        return await this.orchestrator.generateTemplates(folder, options);
      }
      
      if (options.createHtml) {
        return await this.orchestrator.createEmptyHtml(folder, options.createHtml, options);
      }
      
      if (options.createMultiple) {
        return await this.orchestrator.createMultipleEmptyHtmls(folder, options.createMultiple, options);
      }
      
      if (options.ai || options.prompt) {
        return await this.orchestrator.generateWithAI(folder, options);
      }
      
      if (options.listDocs) {
        return await this.orchestrator.listKnowledgeDocuments();
      }
      
      if (options.searchDocs) {
        return await this.orchestrator.searchKnowledgeDocuments(options.searchDocs);
      }
      
      // Processamento normal de pasta/arquivo
      const stats = await this.orchestrator.processFolder(folder, options);
      
      // Mostrar exemplos de uso se for primeira execução
      if (stats && stats.successful > 0 && !options.verbose) {
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
      await this.orchestrator.close();
    }
  }

  // Métodos para uso programático (não CLI)
  async convertFile(htmlPath, options = {}) {
    return await this.orchestrator.convertFile(htmlPath, options);
  }

  async convertFiles(htmlPaths, options = {}) {
    return await this.orchestrator.convertFiles(htmlPaths, options);
  }
}

// Executar se chamado diretamente ou via require
if (require.main === module || process.argv[1].includes('index.js')) {
  const converter = new HtmlToImageConverter();
  converter.run().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = HtmlToImageConverter;
