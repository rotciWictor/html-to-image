const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ImageProcessor {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.activePage = null;
  }

  async init() {
    if (!this.browser) {
      console.log('🚀 Iniciando navegador...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
  }

  async createPage() {
    if (!this.browser) {
      await this.init();
    }

    const page = await this.browser.newPage();
    
    // Configurar viewport
    await page.setViewport({
      width: this.config.viewport.width,
      height: this.config.viewport.height,
      deviceScaleFactor: this.config.viewport.deviceScaleFactor
    });

    // Configurar timeouts
    page.setDefaultTimeout(this.config.timeouts.pageLoad);
    page.setDefaultNavigationTimeout(this.config.timeouts.pageLoad);

    return page;
  }

  async processHtmlFile(htmlPath, outputDir = null, suffix = '') {
    const fileName = path.basename(htmlPath, '.html');
    let page = null;

    try {
      console.log(`📄 Processando: ${htmlPath}`);
      
      // Ler HTML
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Extrair configuração inline
      const ConfigManager = require('./ConfigManager');
      const configManager = new ConfigManager();
      const inlineConfig = configManager.extractInlineConfig(htmlContent);
      
      // Criar configuração efetiva para este arquivo
      const effectiveConfig = configManager.createEffectiveConfig(
        this.config,
        {},
        inlineConfig
      );

      // Validar HTML básico
      if (!this.validateHtml(htmlContent)) {
        throw new Error('HTML inválido: deve conter tags <html> e <body>');
      }

      // Processar assets relativos
      const processedHtml = this.processAssetPaths(htmlContent, htmlPath);
      
      // Criar página
      page = await this.createPage();
      
      // Configurar fundo se especificado
      if (effectiveConfig.output.background && effectiveConfig.output.background !== 'transparent') {
        await page.evaluateOnNewDocument((bgColor) => {
          document.documentElement.style.background = bgColor;
          document.body.style.background = bgColor;
        }, effectiveConfig.output.background);
      }

      // Carregar HTML
      await page.setContent(processedHtml, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: effectiveConfig.timeouts.pageLoad
      });

      // Aguardar carregamento adicional
      if (effectiveConfig.timeouts.assetLoad > 0) {
        await new Promise(resolve => setTimeout(resolve, effectiveConfig.timeouts.assetLoad));
      }

      // Aguardar fontes carregarem
      await page.evaluate(() => {
        return document.fonts ? document.fonts.ready : Promise.resolve();
      });

      // Determinar pasta de saída
      const finalOutputDir = outputDir || inlineConfig.outDir || path.dirname(htmlPath);
      const finalSuffix = suffix || inlineConfig.suffix || '';
      
      // Gerar screenshot
      const imagePath = path.join(
        finalOutputDir,
        `${fileName}${finalSuffix}.${effectiveConfig.output.format}`
      );

      const screenshotOptions = {
        path: imagePath,
        type: effectiveConfig.output.format,
        fullPage: effectiveConfig.output.fullPage
      };

      // Adicionar qualidade para JPEG
      if (effectiveConfig.output.format === 'jpeg') {
        screenshotOptions.quality = effectiveConfig.output.quality;
      }

      // Configurar fundo transparente para PNG/WebP
      if (['png', 'webp'].includes(effectiveConfig.output.format) && 
          effectiveConfig.output.background === 'transparent') {
        screenshotOptions.omitBackground = true;
      }

      await page.screenshot(screenshotOptions);

      console.log(`✅ Salvo: ${imagePath}`);
      return {
        success: true,
        inputFile: htmlPath,
        outputFile: imagePath,
        config: effectiveConfig
      };

    } catch (error) {
      console.error(`❌ Erro ao processar ${htmlPath}:`, error.message);
      return {
        success: false,
        inputFile: htmlPath,
        error: error.message
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async processMultipleFiles(htmlFiles, options = {}) {
    const { concurrency = this.config.processing.maxConcurrent, outputDir, suffix } = options;
    const results = [];
    
    console.log(`🔄 Processando ${htmlFiles.length} arquivo(s) com concorrência ${concurrency}`);
    
    // Processar em lotes
    for (let i = 0; i < htmlFiles.length; i += concurrency) {
      const batch = htmlFiles.slice(i, i + concurrency);
      const batchPromises = batch.map(file => 
        this.processHtmlFile(file, outputDir, suffix)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  validateHtml(htmlContent) {
    const hasHtmlTag = /<html[^>]*>/i.test(htmlContent);
    const hasBodyTag = /<body[^>]*>/i.test(htmlContent);
    return hasHtmlTag && hasBodyTag;
  }

  processAssetPaths(htmlContent, htmlFilePath) {
    const htmlDir = path.dirname(htmlFilePath);
    
    // Regex melhorada para capturar assets
    const assetRegex = /(href|src|url\()\s*["']?([^"'\s)]+\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|otf))["']?/gi;
    
    return htmlContent.replace(assetRegex, (match, attr, assetPath, ext) => {
      // Pular URLs absolutas e data URIs
      if (assetPath.startsWith('http') || 
          assetPath.startsWith('//') || 
          assetPath.startsWith('data:') ||
          assetPath.startsWith('file:')) {
        return match;
      }
      
      // Resolver caminho relativo
      const absolutePath = path.resolve(htmlDir, assetPath);
      
      // Verificar se arquivo existe
      if (fs.existsSync(absolutePath)) {
        const fileUrl = `file:///${absolutePath.replace(/\\/g, '/')}`;
        return match.replace(assetPath, fileUrl);
      } else {
        console.warn(`⚠️ Asset não encontrado: ${assetPath}`);
        return match;
      }
    });
  }

  generateReport(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n📊 Relatório de Conversão:');
    console.log('='.repeat(50));
    console.log(`✅ Sucessos: ${successful.length}`);
    console.log(`❌ Falhas: ${failed.length}`);
    console.log(`📈 Taxa de sucesso: ${((successful.length / results.length) * 100).toFixed(1)}%`);
    
    if (successful.length > 0) {
      console.log('\n✅ Arquivos convertidos:');
      successful.forEach(result => {
        console.log(`  ${path.basename(result.inputFile)} → ${path.basename(result.outputFile)}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Falhas:');
      failed.forEach(result => {
        console.log(`  ${path.basename(result.inputFile)}: ${result.error}`);
      });
    }
    
    return { successful: successful.length, failed: failed.length };
  }

  async close() {
    if (this.browser) {
      console.log('🔄 Fechando navegador...');
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = ImageProcessor;
