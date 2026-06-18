# HTML to Image Converter v2.0.0 🚀

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/html-to-image-converter/html-to-image)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.18.0-brightgreen.svg)](https://nodejs.org/)

Conversor profissional de arquivos HTML para imagens (PNG, JPEG) usando Puppeteer. Agora com **Inteligência Artificial Integrada** para criação de layouts, tradução multi-agente e geração de imagens artísticas!

## 🎯 Características Principais

- 🤖 **Wizard Interativo (CLI)**: Interface guiada fácil de usar.
- 🎨 **Chat com a Gema (IA)**: Assistente IA que cria HTMLs iterativamente junto com você.
- 🧠 **RAG Integrado (Bibliotecário)**: A IA consulta automaticamente a pasta `knowledge/` para usar seus documentos de referência.
- 🌍 **Tradução Multi-Agente**: Traduz seus HTMLs mantendo o código intacto, usando modelos separados para linguagem (ex: Gemma) e código (ex: Qwen).
- 🖼️ **Geração de Imagens (Imagen/ComfyUI)**: A IA pode gerar imagens sob demanda e embuti-las direto no HTML.
- ⚡ **Conversão em Massa**: Processa centenas de arquivos rapidamente usando Puppeteer headless.

---

## ⚡ Quick Start (Modo Fácil)

O jeito mais fácil de usar o programa é através do menu interativo:

### 1️⃣ Instalar
```bash
git clone https://github.com/rotciWictor/html-to-image.git
cd html-to-image
npm install
```

### 2️⃣ Iniciar o Assistente
```bash
npm start
```

### 3️⃣ Menu Principal
Ao iniciar, você verá as opções:
1. **🚀 Converter TODOS os HTMLs**: Converte tudo que está na pasta `work/htmls/`.
2. **🎯 Converter HTMLs específicos**: Permite escolher arquivos específicos com a barra de espaço.
3. **🤖 Gerar novos HTMLs com IA**: Abre o chat com a Gema para criar designs do zero.
4. **📝 Criar um arquivo HTML vazio**: Cria um template básico no tamanho certo.
5. **❌ Sair**

---

## 🤖 Como funciona a Gema (Assistente IA)?

A Gema é uma designer editorial impulsionada por IA (Gemini, Ollama ou OpenAI).

1. Escolha a opção **3** no menu (`Gerar novos HTMLs`).
2. Digite o que você precisa (ex: *"Crie um post de Instagram sobre Dicas de Produtividade"*).
3. A Gema irá gerar o código e **salvar automaticamente** em `work/htmls/`.
4. Você pode ver o código, dar feedback ("Mude a cor de fundo para azul"), e ela ajusta iterativamente.
5. Quando estiver satisfeito, digite `converter` para transformar o HTML final em imagem!

### 📚 RAG Integrado (O Bibliotecário)
Se você mencionar palavras como "referência", "guia", ou digitar mensagens longas, o sistema entra em modo RAG. O "Bibliotecário" vai procurar o documento mais relevante na pasta `knowledge/documents/` e enviar para a Gema usar como base.

### 🖼️ Geração de Imagens
A Gema pode gerar imagens artísticas para o seu layout. Se ela precisar de uma foto de uma "cidade cyberpunk", o sistema chamará o **Gemini Imagen API** ou seu **ComfyUI local** para gerar a imagem, salvar na pasta `assets/` e linkar no HTML gerado.

---

## 🌍 Tradução Multi-Agente (Local/Gratuita)

Traduz seus HTMLs inteiros de uma vez, mantendo as tags perfeitas. Otimizado para rodar em GPUs como a RTX 3060 12GB sem estourar a VRAM.

Usa **dois modelos** separadamente em lote:
1. **Linguista (gemma2:9b)**: Lê os textos e cria uma base de vocabulário global, traduzindo com fluência natural.
2. **Engenheiro (qwen2.5-coder:7b)**: Pega as traduções do Linguista e reconstrói as tags HTML em torno do texto novo.

Para traduzir via linha de comando:
```bash
h2i --translate en --provider ollama
```

---

## ⚙️ Configuração (.env)

Copie o arquivo `.env.example` para `.env` e configure conforme sua necessidade. Nenhuma chave é obrigatória se for usar tudo localmente com o Ollama.

```env
# Google Gemini (Usado pela Gema e Imagen)
GEMINI_API_KEY=sua_chave_aqui

# Modelos Locais (Ollama)
OLLAMA_TRANSLATE_MODEL=gemma2:9b
OLLAMA_LOGIC_MODEL=qwen2.5-coder:7b

# Gerador de Imagens (gemini ou comfyui)
IMAGE_PROVIDER=gemini
COMFYUI_URL=http://127.0.0.1:8188
```

---

## 📁 Estrutura de Pastas de Trabalho

Coloque seus arquivos nestas pastas:

- `work/htmls/`: Seus arquivos HTML para conversão.
- `assets/`: Imagens (geradas pela IA ou suas), fontes, CSS extra. A Gema lê o que tem aqui.
- `knowledge/documents/`: Seus PDFs, TXTs de manuais, guias e referências para a IA usar (RAG).
- `output/`: Onde as imagens finais PNG/JPEG vão parar.

---

## 💻 Modo CLI Legado (Avançado)

Se preferir usar diretamente pelo terminal sem o menu:

```bash
# Converter HTML específico usando preset de Instagram
h2i work/htmls/meu_post.html --preset instagram

# Traduzir para espanhol via OpenAI
h2i --translate es --provider openai --model gpt-4o-mini

# Ver documentos disponíveis no RAG
h2i --list-docs
```

## 📄 Licença
MIT License - Use livremente em projetos pessoais e comerciais.
