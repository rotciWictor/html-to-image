const CliParser = require('../lib/CliParser');

describe('CliParser', () => {
  let parser;

  beforeEach(() => {
    parser = new CliParser();
  });

  describe('validateAndNormalizeOptions', () => {
    test('deve validar formato válido', () => {
      const options = { format: 'png', quality: '90', width: '1200', height: '800', scale: '2' };
      const result = parser.validateAndNormalizeOptions(options);
      expect(result.format).toBe('png');
    });

    test('deve normalizar jpg para jpeg', () => {
      const options = { format: 'jpg', quality: '90', width: '1200', height: '800', scale: '2' };
      const result = parser.validateAndNormalizeOptions(options);
      expect(result.format).toBe('jpeg');
    });

    test('deve rejeitar formato inválido', () => {
      const options = { format: 'gif', quality: '90', width: '1200', height: '800', scale: '2' };
      expect(() => parser.validateAndNormalizeOptions(options)).toThrow('Formato inválido');
    });

    test('deve validar qualidade dentro do range', () => {
      const options = { format: 'jpeg', quality: '150', width: '1200', height: '800', scale: '2' };
      expect(() => parser.validateAndNormalizeOptions(options)).toThrow('Qualidade deve estar entre 1 e 100');
    });

    test('deve validar dimensões válidas', () => {
      const options = { format: 'png', quality: '90', width: '0', height: '800', scale: '2' };
      expect(() => parser.validateAndNormalizeOptions(options)).toThrow('Largura deve estar entre 1 e 8000 pixels');
    });

    test('deve validar escala válida', () => {
      const options = { format: 'png', quality: '90', width: '1200', height: '800', scale: '10' };
      expect(() => parser.validateAndNormalizeOptions(options)).toThrow('Escala deve estar entre 0.1 e 5');
    });

    test('deve aplicar preset instagram', () => {
      const options = { format: 'png', quality: '90', width: '1200', height: '800', scale: '2', preset: 'instagram' };
      const result = parser.validateAndNormalizeOptions(options);
      expect(result.width).toBe(1080);
      expect(result.height).toBe(1080);
      expect(result.background).toBe('transparent');
    });

    test('deve aplicar preset ppt', () => {
      const options = { format: 'png', quality: '90', width: '1200', height: '800', scale: '2', preset: 'ppt' };
      const result = parser.validateAndNormalizeOptions(options);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.background).toBe('#ffffff');
    });
  });

  describe('getPresets', () => {
    test('deve retornar presets válidos', () => {
      const presets = parser.getPresets();
      expect(presets).toHaveProperty('instagram');
      expect(presets).toHaveProperty('ppt');
      expect(presets).toHaveProperty('generic');
      expect(presets.instagram.width).toBe(1080);
      expect(presets.ppt.width).toBe(1920);
      expect(presets.generic.width).toBe(1200);
    });
  });

  describe('getUsageExamples', () => {
    test('deve retornar string com exemplos', () => {
      const examples = parser.getUsageExamples();
      expect(examples).toContain('Exemplos de uso');
      expect(examples).toContain('--preset instagram');
      expect(examples).toContain('--preset ppt');
    });
  });
});
