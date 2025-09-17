const { Command } = require('commander');
const path = require('path');

class CliParser {
  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('html-to-image')
      .description('Converte arquivos HTML para imagens (PNG, JPEG, WebP)')
      .version('2.1.0')
      .argument('[path]', 'Pasta com arquivos HTML ou arquivo HTML específico', 'html-files/work')
      .option('-f, --format <type>', 'Formato de saída (png|jpeg|webp)', 'png')
      .option('-q, --quality <number>', 'Qualidade JPEG (1-100)', '90')
      .option('-w, --width <number>', 'Largura da viewport em pixels', '1200')
      .option('-h, --height <number>', 'Altura da viewport em pixels', '800')
      .option('-s, --scale <number>', 'Device scale factor', '2')
      .option('--fullpage', 'Capturar página completa (padrão)')
      .option('--no-fullpage', 'Capturar apenas viewport')
      .option('--preset <type>', 'Preset predefinido (instagram|ppt|generic)')
      .option('--out-dir <path>', 'Pasta de saída das imagens')
      .option('--suffix <text>', 'Sufixo para nomes dos arquivos')
      .option('--wait-ms <number>', 'Tempo adicional de espera em ms', '2000')
      .option('--background <color>', 'Cor de fundo (transparent|#ffffff|rgb(...))')
      .option('--concurrency <number>', 'Conversões paralelas', '3')
      .option('--generate <number>', 'Gerar N templates base')
      .option('--create-html <name>', 'Criar arquivo HTML vazio para edição')
      .option('--verbose', 'Log detalhado');
  }

  parse(args = process.argv) {
    this.program.parse(args);
    const options = this.program.opts();
    const inputPath = this.program.args[0] || 'html-files/work';

    return {
      folder: path.resolve(inputPath),
      options: this.validateAndNormalizeOptions(options)
    };
  }

  validateAndNormalizeOptions(options) {
    const validated = { ...options };

    // Validar formato
    const validFormats = ['png', 'jpeg', 'jpg', 'webp'];
    if (!validFormats.includes(validated.format.toLowerCase())) {
      throw new Error(`Formato inválido: ${validated.format}. Use: ${validFormats.join(', ')}`);
    }
    validated.format = validated.format.toLowerCase();
    if (validated.format === 'jpg') validated.format = 'jpeg';

    // Validar qualidade
    validated.quality = parseInt(validated.quality);
    if (validated.quality < 1 || validated.quality > 100) {
      throw new Error('Qualidade deve estar entre 1 e 100');
    }

    // Validar dimensões
    validated.width = parseInt(validated.width);
    validated.height = parseInt(validated.height);
    if (validated.width < 1 || validated.width > 8000) {
      throw new Error('Largura deve estar entre 1 e 8000 pixels');
    }
    if (validated.height < 1 || validated.height > 8000) {
      throw new Error('Altura deve estar entre 1 e 8000 pixels');
    }

    // Validar escala
    validated.scale = parseFloat(validated.scale);
    if (validated.scale < 0.1 || validated.scale > 5) {
      throw new Error('Escala deve estar entre 0.1 e 5');
    }

    // Validar concorrência
    if (validated.concurrency) {
      validated.concurrency = parseInt(validated.concurrency);
      if (validated.concurrency < 1 || validated.concurrency > 10) {
        throw new Error('Concorrência deve estar entre 1 e 10');
      }
    }

    // Validar tempo de espera
    if (validated.waitMs) {
      validated.waitMs = parseInt(validated.waitMs);
      if (validated.waitMs < 0 || validated.waitMs > 30000) {
        throw new Error('Tempo de espera deve estar entre 0 e 30000ms');
      }
    }

    // Aplicar presets
    if (validated.preset) {
      const presets = this.getPresets();
      if (!presets[validated.preset]) {
        throw new Error(`Preset inválido: ${validated.preset}. Use: ${Object.keys(presets).join(', ')}`);
      }
      Object.assign(validated, presets[validated.preset]);
    }

    return validated;
  }

  getPresets() {
    return {
      instagram: {
        width: 1080,
        height: 1080,
        format: 'png',
        background: 'transparent'
      },
      ppt: {
        width: 1920,
        height: 1080,
        format: 'png',
        background: '#ffffff'
      },
      generic: {
        width: 1200,
        height: 800,
        format: 'png',
        background: '#ffffff'
      }
    };
  }

  showHelp() {
    this.program.help();
  }

  getUsageExamples() {
    return `
📖 Exemplos de uso:

  Básico:
    node html-to-image.js

  Instagram (1080x1080, PNG):
    node html-to-image.js --preset instagram

  PowerPoint (1920x1080, PNG):
    node html-to-image.js --preset ppt

  JPEG com qualidade específica:
    node html-to-image.js --format jpeg --quality 85

  Dimensões customizadas:
    node html-to-image.js --width 1600 --height 900 --scale 1

  Pasta específica:
    node html-to-image.js ./meus-htmls --format webp

  Gerar 5 templates Instagram:
    node html-to-image.js --preset instagram --generate 5
`;
  }
}

module.exports = CliParser;
