# 🚀 **Resumo Executivo - Projeto HTML to Image com IA**

## 🎯 **O que é:**
Ferramenta profissional que transforma HTMLs em imagens (PNG/JPEG/WebP) usando **Node.js + Puppeteer + IA (Google Gemini)**. 

## ✨ **Principais funcionalidades:**

### 📱 **Presets Inteligentes:**
- **Instagram**: 1080x1440px (posts)
- **Stories**: 1920x1080px (stories)
- **PowerPoint**: 1920x1080px (apresentações)
- **Genérico**: Dimensões customizáveis

### 🧠 **Modo IA (Novidade!):**
```bash
node magic.js --ai --prompt "Criar slides sobre produtividade" --preset instagram
```
- **Gera HTMLs automaticamente** via Google Gemini
- **Consulta base de conhecimento** pessoal para contexto
- **Nomes de pasta inteligentes**: `produtividade-ig-6slides-T2120`
- **Processa automaticamente** para imagens

### 📚 **Base de Conhecimento:**
- `knowledge/prompts/` - Prompts mestres personalizados
- `knowledge/documents/` - Documentos de referência (não versionados)
- **IA usa automaticamente** para gerar conteúdo mais preciso

## 🛠️ **Como usar:**

### **Método Tradicional:**
```bash
# 1. Criar HTML
node magic.js --create-html "meu-slide"

# 2. Editar work/htmls/meu-slide.html

# 3. Converter
node magic.js --preset instagram
# → Resultado: output/meu-slide.png
```

### **Método IA (Novo):**
```bash
node magic.js --ai --prompt "Slides sobre marketing digital" --preset instagram
# → IA gera HTMLs + converte automaticamente
# → Resultado: output/ai/marketing-digital-ig-6slides-TXXXX/
```

### **Comandos Úteis:**
```bash
# Listar documentos da base de conhecimento
node magic.js --list-docs

# Buscar documentos por palavra-chave
node magic.js --search-docs "marketing"

# Usar documentos específicos
node magic.js --ai --prompt "Criar slides" --relevant-docs "metodo-ffc,manual-comunicador"
```

## 🏗️ **Arquitetura:**
- **CLI robusto** (Commander.js)
- **Classes modulares** (SOLID)
- **34 testes unitários**
- **Configuração flexível** (JSON + meta tags)
- **Assets locais** servidos automaticamente

## 🎨 **Diferenciais:**
- **Nomes amigáveis** em vez de timestamps
- **Base de conhecimento** para IA contextualizada  
- **Pipeline completo**: Prompt → HTML → Imagem
- **Estrutura organizada** (sem arquivos soltos)
- **Encoding UTF-8** corrigido (problema Windows)

## 📁 **Estrutura final:**
```
html-to-image/
├── magic.js              # 🎭 Comando principal
├── knowledge/            # 🧠 Base de conhecimento
│   ├── prompts/         # Prompts mestres
│   └── documents/       # Docs pessoais
├── work/htmls/          # 📄 HTMLs de entrada
└── output/              # 🖼️ Imagens geradas
```

## 🚀 **Status atual:**
**✅ WIP commitado** - Sistema funcionando, pronto para testes finais amanhã!

## 🎯 **Resumo em uma linha:**
**Transformei um conversor HTML→Imagem em uma ferramenta de criação de conteúdo visual com IA!**

---

*Desenvolvido com arquitetura enterprise, seguindo princípios SOLID e boas práticas de desenvolvimento.*
