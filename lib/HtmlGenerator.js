const path = require('path');
const FileManager = require('./FileManager');

/**
 * Gerador de templates HTML vazios
 */
class HtmlGenerator {
  constructor() {
    this.fileManager = new FileManager();
  }

  /**
   * Cria um arquivo HTML vazio
   * @param {string} folder - Pasta de destino
   * @param {string} fileName - Nome do arquivo
   * @param {Object} options - Opções de configuração
   * @returns {Object} Resultado da operação
   */
  async createEmptyHtml(folder, fileName, options) {
    console.log(`📝 Criando arquivo HTML vazio: ${fileName}`);
    
    // Garantir que a pasta existe
    this.fileManager.ensureDir(folder);
    
    // Adicionar extensão .html se não tiver
    if (!fileName.toLowerCase().endsWith('.html')) {
      fileName += '.html';
    }
    
    const filePath = path.join(folder, fileName);
    
    // Verificar se arquivo já existe
    if (this.fileManager.exists(filePath)) {
      console.log(`⚠️  Arquivo já existe: ${fileName}`);
      console.log('💡 Use um nome diferente ou delete o arquivo existente');
      return;
    }
    
    // Determinar preset baseado nas opções
    const preset = this.determinePreset(options);
    
    // Criar HTML baseado no preset
    const htmlContent = this.generateEmptyHtml(preset, options);
    
    // Salvar arquivo
    this.fileManager.writeFile(filePath, htmlContent);
    
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

  /**
   * Cria múltiplos arquivos HTML vazios
   * @param {string} folder - Pasta de destino
   * @param {number} count - Quantidade de arquivos
   * @param {Object} options - Opções de configuração
   * @returns {Object} Resultado da operação
   */
  async createMultipleEmptyHtmls(folder, count, options) {
    console.log(`📝 Criando ${count} arquivos HTML vazios...`);
    
    // Garantir que a pasta existe
    this.fileManager.ensureDir(folder);
    
    const createdFiles = [];
    const preset = options.preset || 'generic';
    
    for (let i = 1; i <= count; i++) {
      const fileName = `slide-${i.toString().padStart(2, '0')}.html`;
      const filePath = path.join(folder, fileName);
      
      // Verificar se arquivo já existe
      if (this.fileManager.exists(filePath)) {
        console.log(`⚠️  Arquivo já existe: ${fileName} (pulando)`);
        continue;
      }
      
      // Criar HTML baseado no preset
      const htmlContent = this.generateEmptyHtml(preset, options, i);
      
      // Salvar arquivo
      this.fileManager.writeFile(filePath, htmlContent);
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

  /**
   * Determina o preset baseado nas opções
   * @param {Object} options - Opções de configuração
   * @returns {string} Nome do preset
   */
  determinePreset(options) {
    if (options.preset) {
      return options.preset;
    } else if (options.width === 1080 && options.height === 1350) {
      return 'instagram';
    } else if (options.width === 1920 && options.height === 1080) {
      // Sem distinção pelas dimensões, preferir 'ppt' por padrão e deixar 'stories' apenas via preset explícito
      return 'ppt';
    }
    return 'generic';
  }

  /**
   * Gera conteúdo HTML vazio baseado no preset
   * @param {string} preset - Nome do preset
   * @param {Object} options - Opções de configuração
   * @param {number} slideNumber - Número do slide
   * @returns {string} Conteúdo HTML
   */
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

  /**
   * Retorna estilos CSS específicos por preset
   * @param {string} preset - Nome do preset
   * @returns {string} CSS específico do preset
   */
  getPresetStyles(preset) {
    switch (preset) {
      case 'instagram':
        return `
        .container {
            width: 1080px;
            height: 1440px;
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
        
      case 'stories':
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

module.exports = HtmlGenerator;
