# HTML to Image Converter v2.0.0 🚀

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/html-to-image-converter/html-to-image)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.18.0-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-49%20passing-brightgreen.svg)](#testes)

Conversor profissional de arquivos HTML para imagens com arquitetura enterprise, CLI robusto e configuração flexível.

## 🎯 Características Principais

- 🏗️ **Arquitetura Profissional**: Classes separadas seguindo princípios SOLID
- ⚡ **CLI Robusto**: Commander.js com validação rigorosa
- 🎨 **Presets Inteligentes**: Instagram (1080x1440), Stories (1920x1080), PowerPoint (1920x1080), Genérico
- 🧠 **AI Mode (Gemini)**: Gera HTMLs automaticamente via IA
- 🔧 **Configuração Inline**: JSON ou meta tags diretamente no HTML
- 🧪 **49 Testes Unitários**: Cobertura completa das funcionalidades
- 📁 **Estrutura Organizada**: Sem arquivos soltos, tudo no lugar certo

## ⚡ Quick Start - Ver Resultado em 2 Minutos

### 1️⃣ Instalar (30 segundos)
```bash
# Clonar e instalar
git clone https://github.com/rotciWictor/html-to-image.git
cd html-to-image
npm install
```

### 2️⃣ Ver Resultado Imediato (30 segundos)
```bash
# Padrão: processa work/htmls e salva imagens em output/
h2i --preset instagram

# Resultado: imagens PNG (1080x1440) em output/
```

### 3️⃣ Testar com Seu HTML (1 minuto)
```bash
# Coloque seus HTMLs em work/htmls/
# Coloque imagens/CSS/JS em work/assets/

# Converter todos (saída vai para output/)
h2i --preset instagram

# Converter arquivo específico
h2i work/htmls/arquivo.html --width 1200 --height 800
```

**🎯 Pronto! Você já tem imagens geradas. Agora pode explorar mais detalhes abaixo.**

### 📸 O que você vai ver:
- **Instagram**: Imagens verticais (1080x1440) prontas para posts
- **Stories**: Imagens verticais (1920x1080) para stories do Instagram
- **PowerPoint**: Slides horizontais (1920x1080) para apresentações  
- **Genérico**: Formatos customizáveis para qualquer uso

### 🎨 Exemplos Prontos:
- `examples/instagram/` - Templates para redes sociais
- `examples/powerpoint/` - Slides para apresentações
- `examples/generic/` - Formatos flexíveis

### 📁 Onde Colocar Seus HTMLs e Assets:
- **HTMLs (padrão)**: `work/htmls/`
- **Assets compartilhados**: `work/assets/`
- **Como referenciar assets dentro de work**: use `./assets/...` ou `assets/...` e o sistema resolve para `../assets/...` automaticamente
- **Imagens externas**: URLs `https://...` são suportadas; o conversor aguarda o carregamento

### 🚀 Próximos Passos:
- **Customizar**: Ajustar dimensões, qualidade, formato
- **Automatizar**: Usar scripts para conversões em lote
- **Integrar**: Usar a API programática no seu código
- **Explorar**: Ver todos os comandos e opções disponíveis

---

## 📦 Instalação Completa

### Windows
```bash
# Clonar projeto
git clone https://github.com/rotciWictor/html-to-image.git
cd html-to-image

# Executar instalação
scripts\install.bat
```

### Linux/macOS
```bash
# Clonar projeto
git clone https://github.com/rotciWictor/html-to-image.git
cd html-to-image

# Instalar dependências
npm install
```

## 🧠 AI Mode (Gemini) - Geração Automática

### Configuração Inicial
```bash
# 1. Copiar arquivo de configuração
cp .env.example .env

# 2. Editar .env e adicionar sua chave do Gemini
# Obtenha em: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=sua_chave_aqui
```

### Comandos AI
```bash
# Gerar 6 slides para Instagram via IA
h2i --ai --prompt "Crônica 001 - Beijei, mas meu pau não quis vir" --preset instagram

# Gerar 4 slides para Stories
h2i --ai --prompt "Dicas de produtividade" --slides 4 --preset stories

# Usar modelo específico
h2i --ai --prompt "Tema X" --model gemini-1.5-pro --preset instagram

# Listar documentos da base de conhecimento
h2i --list-docs

# Buscar documentos por palavra-chave
h2i --search-docs "ebook"

# Usar documentos específicos na geração
h2i --ai --prompt "Criar slides sobre produtividade" --relevant-docs "metodo-ffc,manual-comunicador"

# Usar IA com Ollama (GPT-OSS local)
h2i --ai --provider ollama --model gpt-oss:latest --prompt "Dicas de produtividade" --preset instagram

# Ou mais simples (gpt-oss:latest é o padrão do Ollama agora)
h2i --ai --provider ollama --prompt "Dicas de produtividade" --preset instagram

# Usar IA com OpenAI-compatível (WIP - não testado)
set OPENAI_API_KEY=sk-... && h2i --ai --provider openai --model gpt-4o-mini --prompt "Marketing Digital" --preset instagram

# Exemplo com LocalAI ou outro provedor compatível
set OPENAI_API_KEY=your-key && set OPENAI_BASE_URL=http://localhost:8080/v1 && h2i --ai --provider openai --prompt "Tema"
```

### Base de Conhecimento
O sistema inclui uma base de conhecimento personalizada em `knowledge/`:
- **`knowledge/prompts/`** - Prompts mestres para geração
- **`knowledge/documents/`** - Documentos de referência

A IA usa automaticamente esses documentos para gerar HTMLs mais precisos e contextualizados.

### Como Funciona
1. **IA consulta base de conhecimento** para contexto
    2. **Gera HTMLs** baseado no seu prompt + conhecimento
    3. **Salva em** `work/htmls/ai/<nome-amigavel>/` (ex: `produtividade-ig-6slides-T2120`)
    4. **Processa automaticamente** com Puppeteer
    5. **Gera imagens** em `output/ai/<nome-amigavel>/`

### 🏷️ Nomes de Pasta Inteligentes
O sistema gera nomes de pasta descritivos baseados no seu prompt:
- **Tema detectado** + **palavras-chave** + **preset** + **quantidade** + **timestamp**
- Exemplo: `produtividade-ig-6slides-T2120` (produtividade para Instagram, 6 slides)
- Exemplo: `marketing-digital-dicas-stories-4slides-T2120` (marketing digital para Stories, 4 slides)

## 🚀 Uso Avançado

### Comandos Essenciais
```bash
# Instagram (1080x1440)
h2i --preset instagram

# Stories (1920x1080)
h2i --preset stories

# PowerPoint (1920x1080)
h2i --preset ppt

# Converter pasta específica
h2i work/htmls --format jpeg --quality 95
```

### Scripts de Conveniência (Windows)
```bash
# Executar com interface amigável
scripts\run.bat

# Executar testes
scripts\test.bat
```

## 🏗️ Estrutura do Projeto

```
html-to-image/
├── 📄 index.js                 # Ponto de entrada principal
├── 📁 bin/                     # Executáveis
│   └── html-to-image.js        # CLI principal
├── 📁 lib/                     # Bibliotecas/Classes
│   ├── CliParser.js            # Parser CLI com commander.js
│   ├── ConfigManager.js        # Gerenciamento de configurações
│   ├── ImageProcessor.js       # Processamento de imagens
│   └── TemplateGenerator.js    # Geração de templates
├── 📁 config/                  # Configurações
│   └── config.json             # Configuração principal
├── 📁 docs/                    # Documentação
│   ├── CONFIG_REFERENCE.md     # Referência de configurações
│   └── PROMPT_GUIDE.md         # Guia de prompts
├── 📁 examples/                # Templates prontos
│   ├── instagram/              # Exemplos Instagram (1080x1440)
│   ├── stories/                # Exemplos Stories (1920x1080)
│   ├── powerpoint/             # Exemplos PowerPoint (1920x1080)
│   └── generic/                # Exemplos genéricos (1200x800)
├── 📁 scripts/                 # Scripts de automação
│   ├── install.bat             # Script de instalação (Windows)
│   ├── run.bat                 # Script de execução (Windows)
│   └── test.bat                # Script de testes (Windows)
├── 📁 tests/                   # Testes unitários
│   ├── CliParser.test.js       # Testes do CLI parser
│   ├── ConfigManager.test.js   # Testes do gerenciador de config
│   └── TemplateGenerator.test.js # Testes do gerador de templates
├── 📁 work/                    # Pasta de trabalho unificada
│   ├── 📁 htmls/               # Seus HTMLs para conversão
│   ├── 📁 prompts/             # Prompts grandes e complexos
│   └── 📁 assets/              # Assets compartilhados (imagens, CSS, JS)
├── 📁 work/                    # Pasta de trabalho unificada
│   └── 📁 examples/            # Exemplos de HTMLs
├── 📁 output/                  # Imagens geradas
└── 📄 package.json             # Configuração do projeto
```

## 📖 Documentação Completa

- **[Referência de Configurações](docs/CONFIG_REFERENCE.md)** - Todas as opções disponíveis
- **[Guia de Prompts](docs/PROMPT_GUIDE.md)** - Como gerar HTMLs com IA

## 🎨 Casos de Uso

### 1. Agência de Marketing Digital
```bash
# Campanha Instagram - 10 posts
h2i campaigns/black-friday --preset instagram --generate 10
h2i campaigns/black-friday
```

### 2. Apresentações Corporativas
```bash
# Relatório mensal - 15 slides
h2i reports/q4-2024 --preset ppt --generate 15
h2i reports/q4-2024 --format jpeg --quality 95
```

### 3. Documentação Técnica
```bash
# Capturas de tela de interfaces
h2i docs/ui-components --width 1600 --height 900 --scale 1
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage report
npm run test:coverage

# Windows - Script com interface
scripts\test.bat
```

**Cobertura Atual**: 49 testes passando ✅

## 🔧 API Programática

```javascript
const HtmlToImageConverter = require('html-to-image-converter');

const converter = new HtmlToImageConverter();

// Converter arquivo único
const result = await converter.convertFile('./slide.html', {
  format: 'png',
  width: 1080,
  height: 1080
});

// Converter múltiplos arquivos
const results = await converter.convertFiles([
  './slide1.html',
  './slide2.html'
], {
  format: 'jpeg',
  quality: 95,
  concurrency: 3
});
```

## 🛠️ Desenvolvimento

### Adicionar Novo Preset
```javascript
// lib/CliParser.js
getPresets() {
  return {
    // ... presets existentes
    linkedin: {
      width: 1200,
      height: 627,
      format: 'png',
      background: '#0077b5'
    }
  };
}
```

### Extensão da Arquitetura
A estrutura modular permite fácil extensão:
- **lib/**: Adicionar novas classes
- **examples/**: Novos tipos de templates
- **tests/**: Testes para novas funcionalidades
- **scripts/**: Automações personalizadas

## 🐛 Suporte

### Problemas Comuns
- **Erro de validação**: Verificar dimensões com `--width` e `--height`
- **Template não encontrado**: Usar `instagram`, `ppt` ou `generic`
- **HTML inválido**: Verificar tags `<html>` e `<body>`

### Relatório de Bugs
Abra uma [issue](https://github.com/html-to-image-converter/html-to-image/issues) com:
- Versão do Node.js
- Comando executado
- Mensagem de erro completa
- Arquivo HTML (se possível)

## 📄 Licença

MIT License - Use livremente em projetos pessoais e comerciais.
