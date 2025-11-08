const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const express = require('express');
const ArchiveProcessor = require('./ArchiveProcessor');

class ImageProcessor {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.activePage = null;
    this.server = null;
    this.serverPort = 0;
    this.archiveProcessor = new ArchiveProcessor();
  }

  async init(overrideConfig = null) {
    // Aplicar override de configuração, se fornecido
    if (overrideConfig && typeof overrideConfig === 'object') {
      const deepMerge = (target, source) => {
        for (const key of Object.keys(source)) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = deepMerge(target[key] ? { ...target[key] } : {}, source[key]);
          } else {
            target[key] = source[key];
          }
        }
        return target;
      };
      this.config = deepMerge({ ...this.config }, overrideConfig);
    }
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
    
    // Iniciar servidor local para assets
    await this.startAssetServer();
  }

  async startAssetServer() {
    if (!this.server) {
      const app = express();
      
      // Servir assets com filtro de segurança para pastas conhecidas
      const allowedPrefixes = ['work/', 'examples/', 'output/'];
      app.use('/assets', (req, res, next) => {
        const normalized = decodeURIComponent(req.path).replace(/^\/+/, '');
        if (!allowedPrefixes.some(prefix => normalized.startsWith(prefix))) {
          return res.status(403).send('Forbidden');
        }
        next();
      }, express.static('.', {
        setHeaders: (res, path) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache');
        }
      }));
      
      // Encontrar porta livre
      this.serverPort = await this.findFreePort();
      
      return new Promise((resolve) => {
        this.server = app.listen(this.serverPort, () => {
          console.log(`🌐 Servidor de assets iniciado na porta ${this.serverPort}`);
          resolve();
        });
      });
    }
  }

  async findFreePort() {
    const net = require('net');
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(0, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
    });
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
      // Verificar existência do arquivo
      if (!fs.existsSync(htmlPath)) {
        throw new Error('Arquivo não encontrado');
      }
      
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
      // Aplicar viewport e timeouts conforme configuração efetiva
      await page.setViewport({
        width: effectiveConfig.viewport.width,
        height: effectiveConfig.viewport.height,
        deviceScaleFactor: effectiveConfig.viewport.deviceScaleFactor
      });
      page.setDefaultTimeout(effectiveConfig.timeouts.pageLoad);
      page.setDefaultNavigationTimeout(effectiveConfig.timeouts.pageLoad);
      
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

      // Aguardar imagens carregarem
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = resolve; // Não falhar se imagem não carregar
              // Timeout de 5 segundos
              setTimeout(resolve, 5000);
            });
          })
        );
      });

      // Aguardar tempo adicional para assets carregarem
      await new Promise(resolve => setTimeout(resolve, effectiveConfig.timeouts.assetLoad));

      // Determinar pasta de saída
      let finalOutputDir = outputDir || inlineConfig.outDir || path.dirname(htmlPath);
      
      // Se o HTML está na pasta work, preservar estrutura de pastas no output/
      if (finalOutputDir.includes('work')) {
        // Obter o caminho relativo dentro de work/
        const workPath = path.join(process.cwd(), 'work', 'htmls');
        const relativePath = path.relative(workPath, path.dirname(htmlPath));
        
        if (relativePath && relativePath !== '.') {
          // Se está em uma subpasta, reproduzir estrutura no output/
          finalOutputDir = path.join(process.cwd(), 'output', relativePath);
          console.log(`📁 Preservando estrutura: ${relativePath} → ${finalOutputDir}`);
        } else {
          // Se está diretamente em work/, salvar em output/
          finalOutputDir = path.join(process.cwd(), 'output');
          console.log(`📁 Redirecionando saída para: ${finalOutputDir}`);
        }
      }
      
      const finalSuffix = suffix || inlineConfig.suffix || '';
      
      // Garantir que a pasta de saída existe
      if (!fs.existsSync(finalOutputDir)) {
        fs.mkdirSync(finalOutputDir, { recursive: true });
        console.log(`📁 Criando pasta: ${finalOutputDir}`);
      }

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

  /**
   * Processa arquivo compactado (ZIP/RAR) e converte HTMLs encontrados
   * @param {string} archivePath - Caminho do arquivo compactado
   * @param {string} outputDir - Pasta de saída
   * @returns {Promise<Array>} - Resultados da conversão
   */
  async processArchive(archivePath, outputDir = null) {
    console.log(`📦 Processando arquivo compactado: ${archivePath}`);
    
    try {
      // Verificar se é um arquivo compactado suportado
      if (!this.archiveProcessor.isArchive(archivePath)) {
        throw new Error(`Formato de arquivo não suportado. Use .zip ou .rar`);
      }

      // Extrair diretamente na pasta work
      const workDir = path.join(process.cwd(), 'work', 'htmls');
      const { htmlFiles } = await this.archiveProcessor.processArchive(archivePath, workDir);
      
      if (htmlFiles.length === 0) {
        console.log('⚠️  Nenhum arquivo HTML encontrado no arquivo compactado');
        return [];
      }

      console.log(`📄 Encontrados ${htmlFiles.length} arquivo(s) HTML no arquivo compactado`);

      // Processar HTMLs encontrados
      const results = await this.processMultipleFiles(htmlFiles, { outputDir: outputDir || path.join(process.cwd(), 'output') });
      
      console.log(`✅ Processamento do arquivo compactado concluído: ${results.length} imagem(ns) gerada(s)`);
      
      return results;
      
    } catch (error) {
      console.error(`❌ Erro ao processar arquivo compactado: ${error.message}`);
      throw error;
    }
  }

  validateHtml(htmlContent) {
    const hasHtmlTag = /<html[^>]*>/i.test(htmlContent);
    const hasBodyTag = /<body[^>]*>/i.test(htmlContent);
    return hasHtmlTag && hasBodyTag;
  }

  processAssetPaths(htmlContent, htmlFilePath) {
    const htmlDir = path.dirname(htmlFilePath);
    
    // Regex para src de imagens/scripts e href de CSS/fonts
    const srcRegex = /src=["']([^"']+\.(js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|otf))["']/gi;
    const hrefRegex = /href=["']([^"']+\.(css|woff|woff2|ttf|otf))["']/gi;
    // Regex para background-image em CSS inline
    const backgroundImageRegex = /background-image:\s*url\(["']?([^"')]+\.(png|jpg|jpeg|gif|svg|webp))["']?\)/gi;
    
    const replaceHandler = (match, assetPath) => {
      // Pular URLs absolutas e data URIs
      if (assetPath.startsWith('http') || 
          assetPath.startsWith('//') || 
          assetPath.startsWith('data:') ||
          assetPath.startsWith('file:')) {
        return match;
      }
      
      // Resolver caminho relativo
      let absolutePath = path.resolve(htmlDir, assetPath);
      
      // Verificar se arquivo existe
      if (fs.existsSync(absolutePath)) {
        // Usar servidor local em vez de file://
        const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
        const serverUrl = `http://localhost:${this.serverPort}/assets/${relativePath}`;
        console.log(`🔄 Processando asset: ${assetPath} → ${serverUrl}`);
        return match.replace(assetPath, serverUrl);
      } else {
        // Fallback: se estiver em work/htmls e o caminho for ./assets/... ou assets/...
        const isWorkDir = /\\work\\htmls|\/work\/htmls/.test(htmlDir);
        const matchesWorkAssets = /^(\.\/)?assets[\/]\/?.*/i.test(assetPath);
        if (isWorkDir && matchesWorkAssets) {
          const stripped = assetPath.replace(/^(\.\/)?assets[\/]/i, '');
          const parentAssetsCandidate = path.join(path.dirname(htmlDir), 'assets', stripped);
          if (fs.existsSync(parentAssetsCandidate)) {
            absolutePath = parentAssetsCandidate;
            const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
            const serverUrl = `http://localhost:${this.serverPort}/assets/${relativePath}`;
            console.log(`🔁 Fallback asset: ${assetPath} → ${serverUrl}`);
            return match.replace(assetPath, serverUrl);
          }
        }

        console.warn(`⚠️ Asset não encontrado: ${assetPath} (${absolutePath})`);
        return match;
      }
    };

    // Primeiro tratar src=*
    let processed = htmlContent.replace(srcRegex, replaceHandler);
    // Depois tratar href=*
    processed = processed.replace(hrefRegex, replaceHandler);
    // Por último tratar background-image em CSS inline
    processed = processed.replace(backgroundImageRegex, replaceHandler);
    return processed;
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
    
    if (this.server) {
      console.log('🔄 Fechando servidor de assets...');
      return new Promise((resolve) => {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      });
    }
  }
}

module.exports = ImageProcessor;
