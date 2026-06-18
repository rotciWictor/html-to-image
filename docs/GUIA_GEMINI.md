# 🧠 Guia Completo: Trabalhando com a IA (Gema)

## 📋 Visão Geral

Este projeto possui uma Inteligência Artificial integrada (apelidada de **Gema**) que atua como uma Designer Editorial. Em vez de você escrever HTML manualmente, você conversa com a Gema através do **Wizard Interativo**, e ela escreve, ajusta e gera as imagens para você.

A Gema pode usar:
- **Ollama** (Local, totalmente gratuito e offline)
- **Google Gemini** (API via nuvem)
- **OpenAI** (ChatGPT)

## 🚀 Como Iniciar

A forma correta de usar a IA no projeto v2.0 é através do menu interativo:

```bash
npm start
```

No menu, escolha a opção:
**🤖 3. Gerar novos HTMLs com IA**

## 💬 O Fluxo de Chat Iterativo

Diferente de sistemas antigos onde você mandava um prompt e torcia para dar certo, a Gema funciona em um loop de feedback:

1. **Seu Pedido Inicial**: "Faça um post de Instagram sobre 3 dicas de IA"
2. **Geração**: A Gema cria o código HTML e salva na pasta `work/htmls/`.
3. **Feedback**: O console vai te perguntar se está bom. Você pode dizer: "Aumente o tamanho da fonte do título e mude o fundo para azul escuro".
4. **Ajuste**: A Gema reescreve apenas o necessário.
5. **Finalização**: Quando estiver perfeito, digite `converter` e o Puppeteer transformará o HTML em imagem final.

## 📚 RAG: O "Bibliotecário" (Uso de Documentos Base)

Você não precisa colar textos longos no chat. A Gema possui um agente auxiliar chamado "Bibliotecário".

**Como funciona:**
1. Coloque seus PDFs, arquivos TXT (manuais, guias da sua marca, e-books) dentro da pasta `knowledge/documents/`.
2. No chat, se você enviar uma mensagem longa (mais de 80 caracteres) ou usar palavras-chave como *“referência”, “guia”, “baseado no documento”*, o Bibliotecário é ativado.
3. Ele lê sua pasta `knowledge/`, encontra o documento mais relevante para o que você pediu, e injeta o texto silenciosamente no cérebro da Gema.
4. A Gema então gera o HTML usando as informações exatas do seu manual/guia.

## 🖼️ Geração de Imagens Artísticas

Se o seu design precisar de uma imagem que não dá para fazer só com CSS (ex: "um fundo futurista", "uma foto realista de um café"), a Gema pode gerar essa imagem para você.

**Como usar:**
Durante o chat, basta pedir para ela:
*"Faça o design com um background realista de uma cidade cyberpunk."*

A Gema usará o marcador interno `[GERAR_IMAGEM: cyberpunk city realistic background]`. O sistema intercepta isso, chama o **Gemini Imagen** ou o **ComfyUI Local** (dependendo de como você configurou o `.env`), salva a imagem em `assets/` e linka no HTML.

## ⚙️ Configuração (.env)

Para usar a Gema e seus recursos, seu arquivo `.env` deve estar configurado:

```env
# Necessário se quiser usar Gemini ou Imagen
GEMINI_API_KEY=sua_chave_aqui

# Se for usar Ollama local (offline)
OLLAMA_BASE_URL=http://localhost:11434

# Qual IA vai gerar as imagens (gemini ou comfyui)
IMAGE_PROVIDER=gemini
```

## 🌍 Tradução Multi-Agente (Texto)

Se você tem HTMLs prontos e quer traduzi-los, o projeto possui um pipeline de Agentes Especialistas:
- **O Linguista (gemma2)**: Traduz mantendo fluência.
- **O Engenheiro (qwen2.5-coder)**: Reconstrói o HTML em volta da tradução.

Para ativar a tradução (fora do menu do chat):
```bash
h2i --translate en --provider ollama
```
