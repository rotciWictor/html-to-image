const ConfigManager = require('../lib/ConfigManager');
const fs = require('fs');
const path = require('path');

// Mock fs para testes
jest.mock('fs');

describe('ConfigManager', () => {
  let configManager;

  beforeEach(() => {
    configManager = new ConfigManager();
    jest.clearAllMocks();
  });

  describe('extractInlineConfig', () => {
    test('deve extrair configuração JSON inline', () => {
      const htmlContent = `
        <html>
        <head>
          <script id="h2i-config" type="application/json">
          {
            "format": "jpeg",
            "quality": 85,
            "width": 1920
          }
          </script>
        </head>
        </html>
      `;

      const config = configManager.extractInlineConfig(htmlContent);
      expect(config.format).toBe('jpeg');
      expect(config.quality).toBe(85);
      expect(config.width).toBe(1920);
    });

    test('deve extrair configuração de meta tags', () => {
      const htmlContent = `
        <html>
        <head>
          <meta name="h2i:format" content="png">
          <meta name="h2i:quality" content="90">
          <meta name="h2i:width" content="1080">
          <meta name="h2i:fullPage" content="true">
        </head>
        </html>
      `;

      const config = configManager.extractInlineConfig(htmlContent);
      expect(config.format).toBe('png');
      expect(config.quality).toBe(90);
      expect(config.width).toBe(1080);
      expect(config.fullPage).toBe(true);
    });

    test('deve converter valores string para tipos apropriados', () => {
      const htmlContent = `
        <html>
        <head>
          <meta name="h2i:width" content="1920">
          <meta name="h2i:scale" content="2.5">
          <meta name="h2i:fullPage" content="false">
        </head>
        </html>
      `;

      const config = configManager.extractInlineConfig(htmlContent);
      expect(typeof config.width).toBe('number');
      expect(typeof config.scale).toBe('number');
      expect(typeof config.fullPage).toBe('boolean');
      expect(config.width).toBe(1920);
      expect(config.scale).toBe(2.5);
      expect(config.fullPage).toBe(false);
    });

    test('deve retornar objeto vazio para HTML sem configuração', () => {
      const htmlContent = '<html><head></head><body></body></html>';
      const config = configManager.extractInlineConfig(htmlContent);
      expect(config).toEqual({});
    });
  });

  describe('mergeConfigs', () => {
    test('deve mesclar configurações simples', () => {
      const base = { a: 1, b: 2 };
      const override = { b: 3, c: 4 };
      const result = configManager.mergeConfigs(base, override);
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    test('deve mesclar objetos aninhados', () => {
      const base = { 
        viewport: { width: 1200, height: 800 },
        output: { format: 'png' }
      };
      const override = { 
        viewport: { width: 1920 },
        output: { quality: 90 }
      };
      const result = configManager.mergeConfigs(base, override);
      
      expect(result.viewport.width).toBe(1920);
      expect(result.viewport.height).toBe(800);
      expect(result.output.format).toBe('png');
      expect(result.output.quality).toBe(90);
    });
  });

  describe('validateConfig', () => {
    test('deve validar configuração válida', () => {
      const config = {
        viewport: { width: 1200, height: 800, deviceScaleFactor: 2 },
        output: { format: 'png', quality: 90, fullPage: true },
        timeouts: { pageLoad: 30000, assetLoad: 2000 },
        processing: { maxConcurrent: 3 }
      };

      expect(() => configManager.validateConfig(config)).not.toThrow();
    });

    test('deve rejeitar dimensões inválidas', () => {
      const config = {
        viewport: { width: 0, height: 800, deviceScaleFactor: 2 },
        output: { format: 'png', quality: 90, fullPage: true },
        timeouts: { pageLoad: 30000, assetLoad: 2000 },
        processing: { maxConcurrent: 3 }
      };

      expect(() => configManager.validateConfig(config)).toThrow('Largura do viewport');
    });

    test('deve rejeitar formato inválido', () => {
      const config = {
        viewport: { width: 1200, height: 800, deviceScaleFactor: 2 },
        output: { format: 'gif', quality: 90, fullPage: true },
        timeouts: { pageLoad: 30000, assetLoad: 2000 },
        processing: { maxConcurrent: 3 }
      };

      expect(() => configManager.validateConfig(config)).toThrow('Formato inválido');
    });

    test('deve rejeitar qualidade inválida', () => {
      const config = {
        viewport: { width: 1200, height: 800, deviceScaleFactor: 2 },
        output: { format: 'jpeg', quality: 150, fullPage: true },
        timeouts: { pageLoad: 30000, assetLoad: 2000 },
        processing: { maxConcurrent: 3 }
      };

      expect(() => configManager.validateConfig(config)).toThrow('Qualidade deve estar entre');
    });
  });

  describe('loadConfig', () => {
    test('deve carregar configuração de arquivo existente', () => {
      const mockConfig = { viewport: { width: 1920 } };
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));

      const result = configManager.loadConfig('test-config.json');
      
      expect(result.viewport.width).toBe(1920);
      expect(fs.readFileSync).toHaveBeenCalledWith('test-config.json', 'utf8');
    });

    test('deve retornar configuração padrão se arquivo não existir', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = configManager.loadConfig('non-existent.json');
      
      expect(result).toEqual(configManager.defaultConfig);
    });
  });
});
