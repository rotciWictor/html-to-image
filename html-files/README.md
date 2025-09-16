# Pasta de Trabalho - html-files

Esta é sua pasta de trabalho para arquivos HTML que serão convertidos para imagens.

## Como usar:

1. **Coloque seus arquivos HTML na pasta `work/`**
2. **Coloque seus assets (imagens/CSS/JS) em `assets/`**
   - Dentro de `work/`, referencie como `./assets/...` (ou `assets/...`) — o conversor resolve para `../assets/...` automaticamente
3. **Execute o conversor:**
   ```bash
   # Padrão: processa html-files/work e salva as imagens em html-files/
   node index.js --preset instagram
   ```
4. **As imagens serão geradas em `html-files/` (fora de `work/`)**

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
├── examples/          # Exemplos do projeto
├── meu-slide.png      # Imagens geradas (fora de work/)
└── outro-slide.png
```

## Comandos úteis:

```bash
# Converter todos os HTMLs da pasta work (saída em html-files/)
node index.js --preset instagram

# Converter com preset PowerPoint
node index.js --preset ppt

# Converter para JPEG
node index.js --format jpeg --quality 95

# Converter arquivo específico
node index.js html-files/work/meu-slide.html
```

**Versionamento (Git):** Apenas `html-files/README.md`, `html-files/examples/**` e os `.gitkeep` de `work/` e `assets/` são versionados. Seus HTMLs e assets locais são ignorados para não vazar conteúdo privado.
