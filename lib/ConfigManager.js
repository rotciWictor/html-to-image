const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.defaultConfig = {
      viewport: {
        width: 1200,
        height: 800,
        deviceScaleFactor: 2
      },
      timeouts: {
        pageLoad: 30000,
        assetLoad: 2000
      },
      output: {
        format: 'png',
        quality: 90,
        fullPage: true,
        background: 'transparent'
      },
      processing: {
        parallel: true,
        maxConcurrent: 3
      },
      logging: {
        level: 'info',
        verbose: false
      }
    };
  }

  loadConfig(configPath = './config/config.json') {
    try {
      if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return this.mergeConfigs(this.defaultConfig, fileConfig);
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao carregar config.json: ${error.message}`);
    }
    
    return { ...this.defaultConfig };
  }

  extractInlineConfig(htmlContent) {
    const config = {};

    // Método 1: JSON embutido
    const jsonMatch = htmlContent.match(/<script[^>]*id=["']h2i-config["'][^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonMatch) {
      try {
        const inlineConfig = JSON.parse(jsonMatch[1].trim());
        Object.assign(config, inlineConfig);
      } catch (error) {
        console.warn('⚠️ Erro ao parsear configuração JSON inline:', error.message);
      }
    }

    // Método 2: Meta tags
    const metaMatches = htmlContent.match(/<meta[^>]+name=["']h2i:([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi);
    if (metaMatches) {
      metaMatches.forEach(match => {
        const nameMatch = match.match(/name=["']h2i:([^"']+)["']/);
        const contentMatch = match.match(/content=["']([^"']+)["']/);
        
        if (nameMatch && contentMatch) {
          const key = nameMatch[1];
          let value = contentMatch[1];
          
          // Converter valores apropriados
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (/^\d+$/.test(value)) value = parseInt(value);
          else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);
          
          config[key] = value;
        }
      });
    }

    return config;
  }

  mergeConfigs(base, override) {
    const merged = { ...base };
    
    for (const [key, value] of Object.entries(override)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = this.mergeConfigs(merged[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  createEffectiveConfig(fileConfig, cliOptions, inlineConfig = {}) {
    // Prioridade: inline > CLI > file > default
    let config = { ...this.defaultConfig };
    
    // Aplicar configuração do arquivo
    config = this.mergeConfigs(config, fileConfig);
    
    // Aplicar opções da CLI
    if (cliOptions.format) config.output.format = cliOptions.format;
    if (cliOptions.quality) config.output.quality = cliOptions.quality;
    if (cliOptions.width) config.viewport.width = cliOptions.width;
    if (cliOptions.height) config.viewport.height = cliOptions.height;
    if (cliOptions.scale) config.viewport.deviceScaleFactor = cliOptions.scale;
    if (cliOptions.fullpage !== undefined) config.output.fullPage = cliOptions.fullpage;
    if (cliOptions.background) config.output.background = cliOptions.background;
    if (cliOptions.concurrency) config.processing.maxConcurrent = cliOptions.concurrency;
    if (cliOptions.waitMs) config.timeouts.assetLoad = cliOptions.waitMs;
    if (cliOptions.verbose) config.logging.verbose = true;
    
    // Aplicar configuração inline (maior prioridade)
    if (inlineConfig.format) config.output.format = inlineConfig.format;
    if (inlineConfig.quality !== undefined) config.output.quality = inlineConfig.quality;
    if (inlineConfig.width !== undefined) config.viewport.width = inlineConfig.width;
    if (inlineConfig.height !== undefined) config.viewport.height = inlineConfig.height;
    if (inlineConfig.deviceScaleFactor !== undefined) config.viewport.deviceScaleFactor = inlineConfig.deviceScaleFactor;
    if (inlineConfig.fullPage !== undefined) config.output.fullPage = inlineConfig.fullPage;
    if (inlineConfig.background !== undefined) config.output.background = inlineConfig.background;
    
    return config;
  }

  validateConfig(config) {
    const errors = [];

    // Validar viewport
    if (config.viewport.width < 1 || config.viewport.width > 8000) {
      errors.push('Largura do viewport deve estar entre 1 e 8000 pixels');
    }
    if (config.viewport.height < 1 || config.viewport.height > 8000) {
      errors.push('Altura do viewport deve estar entre 1 e 8000 pixels');
    }
    if (config.viewport.deviceScaleFactor < 0.1 || config.viewport.deviceScaleFactor > 5) {
      errors.push('Device scale factor deve estar entre 0.1 e 5');
    }

    // Validar output
    const validFormats = ['png', 'jpeg', 'webp'];
    if (!validFormats.includes(config.output.format)) {
      errors.push(`Formato inválido: ${config.output.format}. Use: ${validFormats.join(', ')}`);
    }
    if (config.output.quality < 1 || config.output.quality > 100) {
      errors.push('Qualidade deve estar entre 1 e 100');
    }

    // Validar timeouts
    if (config.timeouts.pageLoad < 1000 || config.timeouts.pageLoad > 120000) {
      errors.push('Timeout de página deve estar entre 1000 e 120000ms');
    }
    if (config.timeouts.assetLoad < 0 || config.timeouts.assetLoad > 30000) {
      errors.push('Timeout de assets deve estar entre 0 e 30000ms');
    }

    // Validar processamento
    if (config.processing.maxConcurrent < 1 || config.processing.maxConcurrent > 10) {
      errors.push('Concorrência máxima deve estar entre 1 e 10');
    }

    if (errors.length > 0) {
      throw new Error(`Configuração inválida:\n${errors.join('\n')}`);
    }

    return true;
  }

  logConfig(config, verbose = false) {
    console.log('⚙️ Configuração efetiva:');
    console.log(`  📐 Dimensões: ${config.viewport.width}x${config.viewport.height} (escala ${config.viewport.deviceScaleFactor}x)`);
    console.log(`  🖼️  Formato: ${config.output.format.toUpperCase()}${config.output.format === 'jpeg' ? ` (qualidade ${config.output.quality}%)` : ''}`);
    console.log(`  📄 Página: ${config.output.fullPage ? 'Completa' : 'Viewport'}`);
    console.log(`  🎨 Fundo: ${config.output.background}`);
    console.log(`  ⚡ Concorrência: ${config.processing.maxConcurrent}`);
    
    if (verbose) {
      console.log(`  ⏱️  Timeout página: ${config.timeouts.pageLoad}ms`);
      console.log(`  ⏱️  Timeout assets: ${config.timeouts.assetLoad}ms`);
      console.log(`  📊 Log level: ${config.logging.level}`);
    }
    console.log('');
  }
}

module.exports = ConfigManager;
