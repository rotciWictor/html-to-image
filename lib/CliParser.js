const { Command } = require('commander');
const path = require('path');
const fs = require('fs');

class CliParser {
  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('html-to-image')
      .description('Converte arquivos HTML para imagens (PNG, JPEG, WebP)')
      .version('1.0.0')
      .argument('[path]', 'Pasta com arquivos HTML ou arquivo HTML específico', 'work/default/htmls')
      .option('-f, --format <type>', 'Formato de saída (png|jpeg|webp)', 'png')
      .option('-q, --quality <number>', 'Qualidade JPEG (1-100)', '90')
      .option('-w, --width <number>', 'Largura da viewport em pixels', '1200')
      .option('-h, --height <number>', 'Altura da viewport em pixels', '800')
      .option('-s, --scale <number>', 'Device scale factor', '2')
      .option('--fullpage', 'Capturar página completa (padrão)')
      .option('--no-fullpage', 'Capturar apenas viewport')
      .option('--preset <type>', 'Preset predefinido (instagram|stories|ppt|generic)')
      .option('--out-dir <path>', 'Pasta de saída das imagens')
      .option('--suffix <text>', 'Sufixo para nomes dos arquivos')
      .option('--wait-ms <number>', 'Tempo adicional de espera em ms', '2000')
      .option('--background <color>', 'Cor de fundo (transparent|#ffffff|rgb(...))')
      .option('--concurrency <number>', 'Conversões paralelas', '3')
      .option('--generate <number>', 'Gerar N templates base')
      .option('--create-html <name>', 'Criar arquivo HTML vazio para edição')
      .option('--create-multiple <number>', 'Criar N arquivos HTML vazios para edição')
      .option('--ai', 'Gerar HTMLs via Gemini e processar automaticamente')
      .option('--prompt <text>', 'Prompt a ser enviado para a IA')
      .option('--provider <name>', 'Provedor de IA (gemini|ollama|openai)', 'gemini')
      .option('--slides <number>', 'Quantidade de HTMLs a gerar', '6')
      .option('--model <name>', 'Modelo LLM (ex: gemini-2.5-flash|llama3.1|gpt-4o-mini)', 'gemini-2.5-flash')
      .option('--list-docs', 'Listar documentos disponíveis na base de conhecimento')
      .option('--relevant-docs <docs>', 'Documentos específicos para usar (separados por vírgula)')
      .option('--search-docs <keyword>', 'Buscar documentos por palavra-chave')
      .option('--range <range>', 'Processar apenas arquivos no intervalo (ex: 1-5, 01-10, 1,3,5, 1-3,5-7)')
      .option('--translate <lang>', 'Traduzir textos para idioma de destino (ex: en, es, fr, pt)')
      .option('--source-lang <lang>', 'Idioma de origem (padrão: auto-detect)', 'auto')
      .option('--pdf', 'Gerar um arquivo PDF com todas as imagens resultantes')
      .option('--verbose', 'Log detalhado');
  }

  parse(args = process.argv) {
    this.program.parse(args);
    const options = this.program.opts();
    const inputPath = this.program.args[0] || 'work/default/htmls';

    let resolvedPath = path.resolve(inputPath);
    
    if (!fs.existsSync(resolvedPath)) {
      if (!inputPath.includes(path.sep) && !inputPath.includes('/') && !path.isAbsolute(inputPath)) {
        
        // Helper para testar múltiplos locais possíveis
        const tryPaths = [
          path.join(process.cwd(), 'work', 'sessions', inputPath, 'htmls'),
          path.join(process.cwd(), 'work', 'projects', inputPath, 'htmls'),
          path.join(process.cwd(), 'work', 'default', 'htmls', inputPath),
          path.join(process.cwd(), 'work', 'default', 'htmls', inputPath + '.html')
        ];

        for (const testPath of tryPaths) {
          if (fs.existsSync(testPath)) {
            resolvedPath = testPath;
            break;
          }
        }
      }
    }

    return {
      folder: resolvedPath,
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
        height: 1350,
        format: 'png',
        background: 'transparent'
      },
      tiktok: {
        width: 1080,
        height: 1920,
        format: 'png',
        background: 'transparent'
      },
      stories: {
        width: 1080,
        height: 1920,
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
       h2i

     Instagram (1080x1350, PNG):
       h2i --preset instagram

     Stories (1920x1080, PNG):
       h2i --preset stories

     PowerPoint (1920x1080, PNG):
       h2i --preset ppt

     JPEG com qualidade específica:
       h2i --format jpeg --quality 85

     Dimensões customizadas:
       h2i --width 1600 --height 900 --scale 1

     Pasta específica:
       h2i ./meus-htmls --format webp

     Gerar 5 templates Instagram:
       h2i --preset instagram --generate 5

     Processar intervalo de arquivos:
       h2i --range 1-5          # Arquivos 01.html até 05.html
       h2i --range 1,3,5       # Apenas arquivos 01, 03 e 05
       h2i --range 1-3,5-7      # Arquivos 01-03 e 05-07

     Traduzir textos para outro idioma:
       h2i --translate en       # Traduzir para inglês
       h2i --translate es       # Traduzir para espanhol
       h2i --translate fr       # Traduzir para francês
       h2i --translate en --source-lang pt  # Traduzir de português para inglês
       h2i --translate en --preset instagram  # Traduzir e converter para imagem
`;
  }
}

module.exports = CliParser;
