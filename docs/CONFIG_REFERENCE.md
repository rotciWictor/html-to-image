# ⚙️ Guia de Referência de Comandos (CLI)

Embora a forma recomendada de usar o sistema seja através do Wizard Interativo (`npm start`), o projeto ainda mantém suporte total a comandos diretos (CLI) para automação e uso em scripts.

## Comando Base
O atalho do CLI é `h2i` (HTML to Image).
Se o atalho não estiver funcionando globalmente, você pode rodar `node bin/html-to-image.js` ou `npm run h2i --`.

---

## 📸 1. Conversão Básica (HTML para Imagem)

Processa arquivos HTML e converte usando o Puppeteer.

- **Processar toda a pasta padrão (`work/htmls/`)**:
  ```bash
  h2i
  ```
- **Processar um arquivo específico**:
  ```bash
  h2i work/htmls/meu_arquivo.html
  ```
- **Mudar formato para JPEG (Padrão é PNG)**:
  ```bash
  h2i --format jpeg --quality 95
  ```

### 📐 Presets de Tamanho
Por padrão o layout é 1200x800. Use presets para mudar as dimensões:
- `--preset instagram` → 1080x1440
- `--preset stories` → 1920x1080
- `--preset ppt` → 1920x1080

```bash
h2i --preset instagram
```

---

## 🌍 2. Tradução Automática Multi-Agente

Traduz o texto de arquivos HTML usando IA local (Ollama).

- **Traduzir para Inglês**:
  ```bash
  h2i --translate en
  ```
- **Traduzir e Converter para imagem logo em seguida**:
  ```bash
  h2i --translate es --preset instagram
  ```
- **Trocar o Provider (Padrão Ollama)**:
  ```bash
  h2i --translate fr --provider openai --model gpt-4o-mini
  ```

*(Para os códigos de idioma disponíveis, consulte `ISO_639_LANG_CODES.md`)*

---

## 🧠 3. Geração de Conteúdo IA (Modo Legado)

*(Nota: É altamente recomendado usar o Chat Interativo via `npm start` em vez desta opção).*

Se você precisar automatizar a geração de HTMLs num script, pode passar o prompt diretamente:

```bash
h2i --ai --prompt "Crie 3 slides corporativos sobre métricas do Q1" --preset ppt
```

### Consultando a Base de Conhecimento (RAG)
Para ver quais documentos o "Bibliotecário" RAG tem acesso em `knowledge/documents/`:

- **Listar todos os documentos**:
  ```bash
  h2i --list-docs
  ```
- **Pesquisar na base**:
  ```bash
  h2i --search-docs "manual"
  ```
