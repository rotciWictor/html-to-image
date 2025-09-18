const fs = require('fs');
const path = require('path');

// Mock node-stream-zip (API async) deve vir antes de requerer o módulo testado
jest.mock('node-stream-zip', () => {
  return {
    async: class MockStreamZipAsync {
      constructor() {}
      extract() { return Promise.resolve(2); }
      close() { return Promise.resolve(); }
    }
  };
});

const ArchiveProcessor = require('../lib/ArchiveProcessor');

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
      jest.spyOn(fs, 'readdirSync').mockImplementation((dir) => {
        if (dir.includes('subfolder')) {
          return ['nested.html'];
        }
        return ['file1.html', 'file2.txt', 'subfolder'];
      });
      
      jest.spyOn(fs, 'statSync').mockImplementation((filePath) => {
        if (filePath.includes('subfolder') && !filePath.endsWith('.html')) {
          return { isDirectory: () => true };
        }
        return { isDirectory: () => false };
      });
    });

    test('deve encontrar arquivos HTML em pasta e subpastas', () => {
      const htmlFiles = processor.findHtmlFiles('/test/folder');
      const norm = p => p.replace(/\\/g, '/');
      const normalized = htmlFiles.map(norm);
      
      expect(normalized).toContain('/test/folder/file1.html');
      expect(normalized).toContain('/test/folder/subfolder/nested.html');
      expect(normalized).not.toContain('/test/folder/file2.txt');
    });
  });

  describe('extractZip', () => {
    test('deve extrair arquivo ZIP', async () => {
      const result = await processor.extractZip('test.zip', '/extract');
      
      expect(result).toBe('/extract');
    });
  });

  describe('processArchive', () => {
    beforeEach(() => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
      jest.spyOn(fs, 'rmSync').mockImplementation(() => {});
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
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'rmSync').mockImplementation(() => {});

      processor.cleanup('/temp/folder');
      
      expect(fs.rmSync).toHaveBeenCalledWith('/temp/folder', { recursive: true, force: true });
    });

    test('não deve falhar se pasta não existir', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      expect(() => processor.cleanup('/temp/folder')).not.toThrow();
    });
  });
});
