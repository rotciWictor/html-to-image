const ImageProcessor = require('../lib/ImageProcessor');
const fs = require('fs');
const path = require('path');

// Mock fs e puppeteer para testes
jest.mock('fs');
jest.mock('puppeteer');

describe('ImageProcessor', () => {
  let processor;
  let mockPage;
  let mockBrowser;

  beforeEach(() => {
    processor = new ImageProcessor();
    
    // Mock do Puppeteer
    mockPage = {
      setViewport: jest.fn(),
      goto: jest.fn(),
      evaluate: jest.fn(),
      screenshot: jest.fn(),
      close: jest.fn()
    };
    
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn()
    };
    
    // Mock do require('puppeteer')
    const puppeteer = require('puppeteer');
    puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);
    
    jest.clearAllMocks();
  });

  describe('init', () => {
    test('deve inicializar com configuração padrão', async () => {
      await processor.init();
      
      expect(processor.browser).toBe(mockBrowser);
      expect(processor.config).toBeDefined();
      expect(processor.config.viewport.width).toBe(1200);
    });

    test('deve inicializar com configuração customizada', async () => {
      const customConfig = {
        viewport: { width: 1920, height: 1080 },
        output: { format: 'jpeg', quality: 95 }
      };
      
      await processor.init(customConfig);
      
      expect(processor.config.viewport.width).toBe(1920);
      expect(processor.config.output.format).toBe('jpeg');
    });
  });

  describe('processHtmlFile', () => {
    beforeEach(async () => {
      await processor.init();
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('<html><body>Test</body></html>');
      fs.writeFileSync.mockImplementation(() => {});
      fs.mkdirSync.mockImplementation(() => {});
    });

    test('deve processar arquivo HTML válido', async () => {
      const htmlPath = 'test.html';
      const outputDir = './output';
      
      mockPage.screenshot.mockResolvedValue(Buffer.from('fake-image-data'));
      
      const result = await processor.processHtmlFile(htmlPath, outputDir);
      
      expect(result).toBeDefined();
      expect(mockPage.setViewport).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalled();
      expect(mockPage.screenshot).toHaveBeenCalled();
    });

    test('deve rejeitar arquivo HTML inválido', async () => {
      fs.readFileSync.mockReturnValue('<div>Invalid HTML</div>');
      
      await expect(processor.processHtmlFile('invalid.html', './output'))
        .rejects.toThrow('HTML inválido');
    });

    test('deve rejeitar arquivo inexistente', async () => {
      fs.existsSync.mockReturnValue(false);
      
      await expect(processor.processHtmlFile('nonexistent.html', './output'))
        .rejects.toThrow('Arquivo não encontrado');
    });
  });

  describe('processFolder', () => {
    beforeEach(async () => {
      await processor.init();
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ isDirectory: () => true });
      fs.readdirSync.mockReturnValue(['test1.html', 'test2.html']);
      fs.readFileSync.mockReturnValue('<html><body>Test</body></html>');
      fs.writeFileSync.mockImplementation(() => {});
    });

    test('deve processar pasta com arquivos HTML', async () => {
      mockPage.screenshot.mockResolvedValue(Buffer.from('fake-image-data'));
      
      const result = await processor.processFolder('./test-folder', './output');
      
      expect(result).toHaveLength(2);
      expect(mockPage.screenshot).toHaveBeenCalledTimes(2);
    });

    test('deve rejeitar pasta inexistente', async () => {
      fs.existsSync.mockReturnValue(false);
      
      await expect(processor.processFolder('nonexistent', './output'))
        .rejects.toThrow('Pasta não encontrada');
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
