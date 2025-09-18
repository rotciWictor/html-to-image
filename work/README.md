# 🏗️ Pasta de Trabalho Unificada

Esta é sua pasta de trabalho principal - tudo que você precisa para criar e converter HTMLs em imagens.

## 📁 Estrutura:

```
work/
├── htmls/              # 📄 Seus arquivos HTML para conversão
├── prompts/            # 📝 Prompts grandes e complexos
├── assets/             # 🎨 Imagens, CSS, JS compartilhados
└── README.md           # Este arquivo
```

## 🚀 Como usar:

### 1. **Criar HTMLs:**
```bash
# Criar HTML vazio
node magic.js --create-html "meu-slide" --work-dir work/htmls

# Editar work/htmls/meu-slide.html
```

### 2. **Usar Prompts Grandes:**
```bash
# Usar prompt de arquivo
node magic.js --ai --prompt "$(cat work/prompts/marketing.txt)" --preset instagram
```

### 3. **Converter para Imagens:**
```bash
# Converter pasta inteira
node magic.js work/htmls --preset instagram

# Converter arquivo específico
node magic.js work/htmls/meu-slide.html --preset stories
```

### 4. **Assets Compartilhados:**
- Coloque imagens em `work/assets/images/`
- Coloque CSS em `work/assets/css/`
- Coloque JS em `work/assets/js/`
- Use caminhos relativos nos HTMLs: `../assets/images/logo.png`

## 🎯 Vantagens:
- ✅ **Tudo em um lugar** - HTMLs, prompts e assets organizados
- ✅ **Fácil de navegar** - estrutura clara e lógica
- ✅ **Flexível** - pode usar prompts ou criar HTMLs manualmente
- ✅ **Escalável** - fácil de expandir com novos tipos de conteúdo

## 📋 Próximos passos:
1. Coloque seus HTMLs em `work/htmls/`
2. Crie prompts em `work/prompts/`
3. Adicione assets em `work/assets/`
4. Execute `node magic.js work/htmls --preset instagram`

