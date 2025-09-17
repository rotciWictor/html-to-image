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
      
      // Criar HTML vazio se solicitado
      if (options.createHtml) {
        return await this.createEmptyHtml(folder, options.createHtml, options);
      }
      
      // Criar múltiplos HTMLs vazios se solicitado
      if (options.createMultiple) {
        return await this.createMultipleEmptyHtmls(folder, options.createMultiple, options);
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
      
      // Verificar se caminho existe
      if (!fs.existsSync(folder)) {
        throw new Error(`Caminho não encontrado: ${folder}`);
      }
      
      // Detectar se é arquivo ou pasta
      const pathStats = fs.statSync(folder);
      let htmlFiles;
      
      if (pathStats.isFile()) {
        const ext = path.extname(folder).toLowerCase();
        
        if (ext === '.html') {
          // É um arquivo HTML específico
          htmlFiles = [folder];
          console.log(`📄 Processando arquivo: ${path.basename(folder)}`);
        } else if (['.zip', '.rar'].includes(ext)) {
          // É um arquivo compactado - processar diretamente
          console.log(`📦 Processando arquivo compactado: ${path.basename(folder)}`);
          const results = await this.imageProcessor.processArchive(folder, path.join(process.cwd(), 'output'));
          console.log(`✅ Conversão concluída: ${results.length} imagem(ns) gerada(s)`);
          return;
        } else {
          throw new Error(`Formato de arquivo não suportado: ${ext}. Use .html, .zip ou .rar`);
        }
      } else {
        // É uma pasta - encontrar arquivos HTML
        htmlFiles = this.findHtmlFiles(folder);
        
        // Se não encontrou HTMLs, verificar se tem ZIPs para descompactar
        if (htmlFiles.length === 0) {
          const zipFiles = this.findZipFiles(folder);
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
            htmlFiles = this.findHtmlFiles(folder);
          }
        }
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

  findZipFiles(folder) {
    const files = fs.readdirSync(folder);
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.zip', '.rar'].includes(ext);
      })
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

  async createEmptyHtml(folder, fileName, options) {
    console.log(`📝 Criando arquivo HTML vazio: ${fileName}`);
    
    // Garantir que a pasta existe
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    // Adicionar extensão .html se não tiver
    if (!fileName.toLowerCase().endsWith('.html')) {
      fileName += '.html';
    }
    
    const filePath = path.join(folder, fileName);
    
    // Verificar se arquivo já existe
    if (fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo já existe: ${fileName}`);
      console.log('💡 Use um nome diferente ou delete o arquivo existente');
      return;
    }
    
    // Determinar preset baseado nas opções
    let preset = 'generic';
    if (options.preset) {
      preset = options.preset;
    } else if (options.width === 1080 && options.height === 1080) {
      preset = 'instagram';
    } else if (options.width === 1920 && options.height === 1080) {
      preset = 'ppt';
    }
    
    // Criar HTML baseado no preset
    const htmlContent = this.generateEmptyHtml(preset, options);
    
    // Salvar arquivo
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    
    console.log(`✅ Arquivo criado: ${filePath}`);
    console.log(`📝 Preset aplicado: ${preset}`);
    console.log(`📐 Dimensões: ${options.width}x${options.height}`);
    console.log('');
    console.log('🎨 Próximos passos:');
    console.log('1. Abra o arquivo HTML no seu editor');
    console.log('2. Cole seu conteúdo entre as tags <body> e </body>');
    console.log('3. Execute: node index.js --preset ' + preset);
    console.log('');
    console.log('💡 Dica: Você pode copiar HTML de qualquer site e colar aqui!');
    
    return { created: fileName };
  }

  async createMultipleEmptyHtmls(folder, count, options) {
    console.log(`📝 Criando ${count} arquivos HTML vazios...`);
    
    // Garantir que a pasta existe
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    const createdFiles = [];
    const preset = options.preset || 'generic';
    
    for (let i = 1; i <= count; i++) {
      const fileName = `slide-${i.toString().padStart(2, '0')}.html`;
      const filePath = path.join(folder, fileName);
      
      // Verificar se arquivo já existe
      if (fs.existsSync(filePath)) {
        console.log(`⚠️  Arquivo já existe: ${fileName} (pulando)`);
        continue;
      }
      
      // Criar HTML baseado no preset
      const htmlContent = this.generateEmptyHtml(preset, options, i);
      
      // Salvar arquivo
      fs.writeFileSync(filePath, htmlContent, 'utf8');
      createdFiles.push(fileName);
      
      console.log(`✅ Criado: ${fileName}`);
    }
    
    console.log('');
    console.log(`🎉 ${createdFiles.length} arquivo(s) criado(s) com sucesso!`);
    console.log(`📝 Preset aplicado: ${preset}`);
    console.log(`📐 Dimensões: ${options.width}x${options.height}`);
    console.log('');
    console.log('🎨 Próximos passos:');
    console.log('1. Abra os arquivos HTML no seu editor');
    console.log('2. Cole seu conteúdo em cada arquivo');
    console.log('3. Execute: node index.js --preset ' + preset);
    console.log('');
    console.log('💡 Dica: Você pode copiar HTML de qualquer site e colar aqui!');
    console.log('📁 Arquivos criados:');
    createdFiles.forEach(file => console.log(`   - ${file}`));
    
    return { created: createdFiles };
  }

  generateEmptyHtml(preset, options, slideNumber = 1) {
    const baseHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slide ${slideNumber}</title>
    
    <!-- Configuração inline para o conversor -->
    <script id="h2i-config" type="application/json">
    {
      "format": "${options.format || 'png'}",
      "quality": ${options.quality || 90},
      "width": ${options.width || 1200},
      "height": ${options.height || 800},
      "background": "${options.background || 'transparent'}",
      "deviceScaleFactor": ${options.scale || 2},
      "fullPage": ${options.fullpage !== false}
    }
    </script>
    
    <style>
        /* Estilos globais */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            text-align: center;
            max-width: 90%;
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        p {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .content {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        /* Estilos específicos por preset */
        ${this.getPresetStyles(preset)}
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <!-- COLE SEU CONTEÚDO AQUI -->
            <h1>Slide ${slideNumber}</h1>
            <p>Cole seu conteúdo HTML aqui...</p>
            
            <!-- Exemplo de como colar conteúdo de sites: -->
            <!-- 
            <div class="exemplo">
                <h2>Exemplo de conteúdo</h2>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            </div>
            -->
        </div>
    </div>
</body>
</html>`;

    return baseHtml;
  }

  getPresetStyles(preset) {
    switch (preset) {
      case 'instagram':
        return `
        .container {
            width: 1080px;
            height: 1080px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .content {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }`;
        
      case 'ppt':
        return `
        .container {
            width: 1920px;
            height: 1080px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .content {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }`;
        
      default:
        return `
        .container {
            width: 1200px;
            height: 800px;
            display: flex;
            align-items: center;
            justify-content: center;
        }`;
    }
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
