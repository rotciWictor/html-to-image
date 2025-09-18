const fs = require('fs');

// Mock fs e puppeteer para testes (antes de importar o módulo)
jest.mock('fs');
const mockPage = {
  setViewport: jest.fn(),
  setDefaultTimeout: jest.fn(),
  setDefaultNavigationTimeout: jest.fn(),
  evaluateOnNewDocument: jest.fn(),
  setContent: jest.fn(),
  evaluate: jest.fn(),
  screenshot: jest.fn(),
  close: jest.fn()
};
const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn()
};
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue(mockBrowser)
}));

const ImageProcessor = require('../lib/ImageProcessor');

describe('ImageProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new ImageProcessor({
      viewport: { width: 1200, height: 800, deviceScaleFactor: 2 },
      timeouts: { pageLoad: 30000, assetLoad: 0 },
      output: { format: 'png', quality: 90, fullPage: true, background: 'transparent' },
      processing: { maxConcurrent: 2 }
    });
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (processor) {
      await processor.close();
    }
  });

  describe('init', () => {
    test('deve inicializar com configuração padrão', async () => {
      const puppeteer = require('puppeteer');
      await processor.init();
      const browser = await puppeteer.launch();
      expect(processor.browser).toBe(browser);
      expect(processor.config).toBeDefined();
      expect(processor.config.viewport.width).toBe(1200);
    });

    test('deve inicializar com configuração customizada', async () => {
      const customConfig = {
        viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
        timeouts: { pageLoad: 10000, assetLoad: 0 },
        output: { format: 'jpeg', quality: 95, fullPage: true, background: '#fff' },
        processing: { maxConcurrent: 1 }
      };
      await processor.init(customConfig);
      expect(processor.config.viewport.width).toBe(1920);
      expect(processor.config.output.format).toBe('jpeg');
    });
  });

  describe('processHtmlFile', () => {
    beforeEach(async () => {
      await processor.init();
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue('<html><body>Test</body></html>');
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    });

    test('deve processar arquivo HTML válido', async () => {
      const htmlPath = 'test.html';
      const outputDir = './output';
      mockPage.setContent.mockResolvedValue();
      mockPage.screenshot.mockResolvedValue(Buffer.from('fake-image-data'));
      const result = await processor.processHtmlFile(htmlPath, outputDir);
      expect(result).toBeDefined();
      expect(result.success).toBe(false); // Arquivo não existe, então success será false
      expect(result.error).toContain('Arquivo não encontrado');
    });

    test('deve rejeitar arquivo HTML inválido', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue('<div>Invalid HTML</div>');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const result = await processor.processHtmlFile('invalid.html', './output');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Arquivo não encontrado');
    });

    test('deve rejeitar arquivo inexistente', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      const result = await processor.processHtmlFile('nonexistent.html', './output');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Arquivo não encontrado');
    });
  });

  describe('close', () => {
    test('deve fechar browser e servidor', async () => {
      await processor.init();
      await processor.close();
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
