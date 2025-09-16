const TemplateGenerator = require('../lib/TemplateGenerator');
const fs = require('fs');
const path = require('path');

// Mock fs para testes
jest.mock('fs');

describe('TemplateGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new TemplateGenerator();
    jest.clearAllMocks();
  });

  describe('generateTemplates', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});
    });

    test('deve gerar templates Instagram', () => {
      const result = generator.generateTemplates('instagram', 2, './test-output');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toContain('instagram-01.html');
      expect(result[1]).toContain('instagram-02.html');
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    test('deve gerar templates PowerPoint', () => {
      const result = generator.generateTemplates('ppt', 3, './test-output');
      
      expect(result).toHaveLength(3);
      expect(result[0]).toContain('ppt-01.html');
      expect(result[2]).toContain('ppt-03.html');
      expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
    });

    test('deve gerar templates genéricos', () => {
      const result = generator.generateTemplates('generic', 1, './test-output');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('generic-01.html');
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    test('deve rejeitar tipo de template inválido', () => {
      expect(() => {
        generator.generateTemplates('invalid', 1, './test-output');
      }).toThrow('Tipo de template inválido');
    });

    test('deve criar pasta de saída se não existir', () => {
      fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);
      
      generator.generateTemplates('generic', 1, './new-folder');
      
      expect(fs.mkdirSync).toHaveBeenCalledWith('./new-folder', { recursive: true });
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.join('./new-folder', 'assets'), { recursive: true });
    });
  });

  describe('getInstagramTemplate', () => {
    test('deve gerar HTML válido para Instagram', () => {
      const config = { 
        width: 1080, 
        height: 1080, 
        format: 'png', 
        slideNumber: 1, 
        totalSlides: 5 
      };
      
      const html = generator.getInstagramTemplate(config);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('1080px');
      expect(html).toContain('h2i-config');
      expect(html).toContain('"format": "png"');
      expect(html).toContain('1/5');
    });

    test('deve incluir CTA no último slide', () => {
      const config = { 
        slideNumber: 5, 
        totalSlides: 5,
        width: 1080,
        height: 1080
      };
      
      const html = generator.getInstagramTemplate(config);
      
      expect(html).toContain('Siga para mais dicas!');
    });

    test('não deve incluir CTA em slides intermediários', () => {
      const config = { 
        slideNumber: 2, 
        totalSlides: 5,
        width: 1080,
        height: 1080
      };
      
      const html = generator.getInstagramTemplate(config);
      
      expect(html).not.toContain('Siga para mais dicas!');
    });
  });

  describe('getPowerPointTemplate', () => {
    test('deve gerar HTML válido para PowerPoint', () => {
      const config = { 
        width: 1920, 
        height: 1080, 
        format: 'png', 
        slideNumber: 1, 
        totalSlides: 3 
      };
      
      const html = generator.getPowerPointTemplate(config);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('1920px');
      expect(html).toContain('1080px');
      expect(html).toContain('h2i-config');
      expect(html).toContain('Slide 1 de 3');
    });

    test('deve gerar conteúdo diferente por slide', () => {
      const config1 = { slideNumber: 1, totalSlides: 3, width: 1920, height: 1080 };
      const config2 = { slideNumber: 2, totalSlides: 3, width: 1920, height: 1080 };
      const config3 = { slideNumber: 3, totalSlides: 3, width: 1920, height: 1080 };
      
      const html1 = generator.getPowerPointTemplate(config1);
      const html2 = generator.getPowerPointTemplate(config2);
      const html3 = generator.getPowerPointTemplate(config3);
      
      expect(html1).toContain('Resultados Q4');
      expect(html2).toContain('Principais Conquistas');
      expect(html2).toContain('bullet-list');
      expect(html3).toContain('metrics-grid');
      expect(html3).toContain('€2.5M');
    });
  });

  describe('getGenericTemplate', () => {
    test('deve gerar HTML válido genérico', () => {
      const config = { 
        width: 1200, 
        height: 800, 
        format: 'jpeg', 
        quality: 85 
      };
      
      const html = generator.getGenericTemplate(config);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('1200px');
      expect(html).toContain('800px');
      expect(html).toContain('h2i-config');
      expect(html).toContain('"format": "jpeg"');
      expect(html).toContain('"quality": 85');
      expect(html).toContain('Template Genérico');
    });
  });

  describe('createSampleAssets', () => {
    test('deve criar arquivos de assets', () => {
      generator.createSampleAssets('./test-assets');
      
      expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('./test-assets', 'style.css'), 
        expect.stringContaining('/* Estilos globais'), 
        'utf8'
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('./test-assets', 'script.js'), 
        expect.stringContaining('document.addEventListener'), 
        'utf8'
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('./test-assets', 'icon-check.svg'), 
        expect.stringContaining('<svg'), 
        'utf8'
      );
    });
  });
});
