const ArchiveProcessor = require('../lib/ArchiveProcessor');
const fs = require('fs');
const path = require('path');

// Mock fs para testes
jest.mock('fs');

describe('ArchiveProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new ArchiveProcessor();
    jest.clearAllMocks();
  });

  describe('isArchive', () => {
    test('deve identificar arquivos ZIP', () => {
      expect(processor.isArchive('test.zip')).toBe(true);
      expect(processor.isArchive('test.ZIP')).toBe(true);
      expect(processor.isArchive('/path/to/file.zip')).toBe(true);
    });

    test('deve identificar arquivos RAR', () => {
      expect(processor.isArchive('test.rar')).toBe(true);
      expect(processor.isArchive('test.RAR')).toBe(true);
      expect(processor.isArchive('/path/to/file.rar')).toBe(true);
    });

    test('deve rejeitar outros formatos', () => {
      expect(processor.isArchive('test.html')).toBe(false);
      expect(processor.isArchive('test.txt')).toBe(false);
      expect(processor.isArchive('test')).toBe(false);
    });
  });

  describe('findHtmlFiles', () => {
    beforeEach(() => {
      fs.readdirSync.mockImplementation((dir) => {
        if (dir.includes('subfolder')) {
          return ['nested.html'];
        }
        return ['file1.html', 'file2.txt', 'subfolder'];
      });
      
      fs.statSync.mockImplementation((filePath) => {
        if (filePath.includes('subfolder')) {
          return { isDirectory: () => true };
        }
        return { isDirectory: () => false };
      });
    });

    test('deve encontrar arquivos HTML em pasta e subpastas', () => {
      const htmlFiles = processor.findHtmlFiles('/test/folder');
      
      expect(htmlFiles).toContain('/test/folder/file1.html');
      expect(htmlFiles).toContain('/test/folder/subfolder/nested.html');
      expect(htmlFiles).not.toContain('/test/folder/file2.txt');
    });
  });

  describe('extractZip', () => {
    test('deve extrair arquivo ZIP', async () => {
      const mockZipfile = {
        lazyEntries: true,
        entryCount: 2,
        readEntry: jest.fn(),
        openReadStream: jest.fn(),
        close: jest.fn(),
        on: jest.fn()
      };

      const yauzl = require('yauzl');
      yauzl.open = jest.fn((path, options, callback) => {
        callback(null, mockZipfile);
      });

      // Mock do evento 'entry'
      mockZipfile.on.mockImplementation((event, callback) => {
        if (event === 'entry') {
          // Simular duas entradas
          setTimeout(() => {
            callback({ fileName: 'test1.html' });
            callback({ fileName: 'test2.html' });
          }, 0);
        }
      });

      // Mock do openReadStream
      mockZipfile.openReadStream.mockImplementation((entry, callback) => {
        const mockStream = {
          pipe: jest.fn(),
          on: jest.fn()
        };
        callback(null, mockStream);
      });

      const result = await processor.extractZip('/test.zip', '/extract');
      
      expect(result).toBe('/extract');
      expect(yauzl.open).toHaveBeenCalledWith('/test.zip', { lazyEntries: true }, expect.any(Function));
    });
  });

  describe('processArchive', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync.mockImplementation(() => {});
      fs.rmSync.mockImplementation(() => {});
    });

    test('deve processar arquivo ZIP e encontrar HTMLs', async () => {
      // Mock do extractZip
      jest.spyOn(processor, 'extractZip').mockResolvedValue('/temp/extract');
      
      // Mock do findHtmlFiles
      jest.spyOn(processor, 'findHtmlFiles').mockReturnValue([
        '/temp/extract/file1.html',
        '/temp/extract/file2.html'
      ]);

      const result = await processor.processArchive('/test.zip', '/extract');
      
      expect(result.htmlFiles).toHaveLength(2);
      expect(result.extractPath).toBe('/temp/extract');
    });

    test('deve rejeitar formato não suportado', async () => {
      await expect(processor.processArchive('/test.txt', '/extract'))
        .rejects.toThrow('Formato de arquivo não suportado');
    });
  });

  describe('cleanup', () => {
    test('deve remover pasta temporária', () => {
      fs.existsSync.mockReturnValue(true);
      fs.rmSync.mockImplementation(() => {});

      processor.cleanup('/temp/folder');
      
      expect(fs.rmSync).toHaveBeenCalledWith('/temp/folder', { recursive: true, force: true });
    });

    test('não deve falhar se pasta não existir', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => processor.cleanup('/temp/folder')).not.toThrow();
    });
  });
});
