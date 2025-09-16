# Pasta de Trabalho - html-files

Esta é sua pasta de trabalho para arquivos HTML que serão convertidos para imagens.

## Como usar:

### Opção 1: Arquivos Soltos
1. **Coloque seus arquivos HTML na pasta `work/`**
2. **Coloque seus assets (imagens/CSS/JS) em `assets/`**
   - Dentro de `work/`, referencie como `./assets/...` (ou `assets/...`) — o conversor resolve para `../assets/...` automaticamente
3. **Execute o conversor:**
   ```bash
   # Padrão: processa html-files/work e salva as imagens em html-files/
   node index.js --preset instagram
   ```

### Opção 2: Arquivo Compactado (MAIS FÁCIL! 🎯)
1. **Compacte seus HTMLs e assets em um ZIP ou RAR**
2. **Jogue o arquivo na pasta `work/`**
3. **Execute o conversor:**
   ```bash
   # Processa o arquivo compactado automaticamente
   node index.js html-files/work/meus-slides.zip --preset instagram
   ```

4. **As imagens serão geradas em `output/` (pasta dedicada)**

## Estrutura organizada:

```
html-files/
├── README.md          # Este arquivo
├── work/              # Pasta para seus HTMLs
│   ├── meu-slide.html
│   └── outro-slide.html
├── assets/            # Pasta para assets compartilhados
│   ├── imagens.png
│   ├── estilos.css
│   └── scripts.js
└── examples/          # Exemplos do projeto

output/                # Pasta para imagens geradas
├── meu-slide.png
└── outro-slide.png
```

## Comandos úteis:

```bash
# Converter todos os HTMLs da pasta work (saída em output/)
node index.js --preset instagram

# Converter arquivo compactado (ZIP/RAR)
node index.js html-files/work/meus-slides.zip --preset instagram

# Converter com preset PowerPoint
node index.js --preset ppt

# Converter para JPEG
node index.js --format jpeg --quality 95

# Converter arquivo HTML específico
node index.js html-files/work/meu-slide.html
```

**Versionamento (Git):** Apenas `html-files/README.md`, `html-files/examples/**` e os `.gitkeep` de `work/` e `assets/` são versionados. Seus HTMLs e assets locais são ignorados para não vazar conteúdo privado.
