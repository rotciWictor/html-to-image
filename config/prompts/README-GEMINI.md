# 🧠 HTML-to-Image com Gemini AI

## 🚀 Início Rápido

### 1. Configuração (2 minutos)

```bash
# 1. Obter chave da API do Gemini
# Acesse: https://makersuite.google.com/app/apikey

# 2. Criar arquivo .env
echo "GEMINI_API_KEY=sua_chave_aqui" > .env
echo "AI_PROVIDER=gemini" >> .env

# 3. Instalar dependências
npm install
```

### 2. Primeiro Teste

```bash
# Testar integração
node teste-gemini.js

# Gerar conteúdo
node magic.js --ai --prompt "Crie posts sobre marketing digital" --count 3
```

## 🎯 Comandos Essenciais

### Geração Básica
```bash
# Posts Instagram
node magic.js --ai --prompt "Seu prompt aqui" --preset instagram --count 6

# Stories
node magic.js --ai --prompt "Seu prompt aqui" --preset stories --count 6

# Slides PowerPoint
node magic.js --ai --prompt "Seu prompt aqui" --preset ppt --count 8

# Conteúdo genérico
node magic.js --ai --prompt "Seu prompt aqui" --preset generic --count 4
```

### Comandos Avançados
```bash
# Usar base de conhecimento
node magic.js --ai --prompt "Conteúdo sobre vendas" --docs "vendas,marketing"

# Listar documentos disponíveis
node magic.js --list-docs

# Buscar na base de conhecimento
node magic.js --search-docs "palavra-chave"
```

## 📁 Estrutura de Saída

```
work/htmls/ai/[nome-temático]/
├── ai-slide-01.html
├── ai-slide-02.html
├── ai-slide-03.html
└── images-prompts.txt (se houver)
```

## 🎨 Presets Disponíveis

| Preset | Dimensões | Uso |
|--------|-----------|-----|
| `instagram` | 1080x1440px | Posts do Instagram |
| `stories` | 1920x1080px | Stories redes sociais |
| `ppt` | 1920x1080px | Slides PowerPoint |
| `generic` | 1200x800px | Banners, cards, etc. |

## 💡 Exemplos de Prompts

### Eficazes ✅
```
"Crie posts do Instagram sobre dicas de produtividade para empreendedores, com design moderno e cores profissionais"

"Gere slides sobre marketing digital, com conceitos básicos e exemplos práticos para iniciantes"

"Crie stories promocionais para lançamento de produto, com call-to-action forte e design atrativo"
```

### Evitar ❌
```
"Crie posts" (muito genérico)
"Faça algo bonito" (sem especificações)
"Conteúdo sobre tudo" (muito amplo)
```

## 🔧 Solução de Problemas

### Erro: "GEMINI_API_KEY não encontrada"
```bash
# Verificar se o arquivo .env existe
ls -la .env

# Criar se não existir
echo "GEMINI_API_KEY=sua_chave_aqui" > .env
```

### Erro: "Cota da API excedida"
- Aguarde alguns minutos
- Verifique limite no Google AI Studio
- Use modelo diferente: `--model "gemini-2.5-flash"`

### Erro: "Conteúdo bloqueado por segurança"
- Reformule o prompt
- Use linguagem mais técnica
- Evite termos sensíveis

## 📊 Fluxo Completo

1. **Gerar**: `node magic.js --ai --prompt "..." --count 6`
2. **Revisar**: Verificar HTMLs em `work/htmls/ai/`
3. **Converter**: `node magic.js work/htmls/ai/[pasta]`
4. **Usar**: Imagens em `output/`

## 🎯 Casos de Uso

### E-commerce
```bash
# Produtos de moda
node magic.js --ai --prompt "Posts para loja de moda feminina, tendências de verão" --preset instagram --count 6

# Produtos eletrônicos
node magic.js --ai --prompt "Posts para loja de eletrônicos, destacando recursos técnicos" --preset instagram --count 5
```

### Educação
```bash
# Cursos online
node magic.js --ai --prompt "Slides para curso de programação, conceitos básicos" --preset ppt --count 10

# Tutoriais
node magic.js --ai --prompt "Posts educativos sobre matemática, fórmulas e exercícios" --preset instagram --count 6
```

### Marketing
```bash
# Campanhas promocionais
node magic.js --ai --prompt "Banners para black friday, descontos e urgência" --preset generic --count 4

# Conteúdo educativo
node magic.js --ai --prompt "Posts sobre sustentabilidade, dicas e estatísticas" --preset instagram --count 6
```

## 🚀 Próximos Passos

1. **Configure sua chave** do Gemini
2. **Execute o teste**: `node teste-gemini.js`
3. **Experimente** diferentes prompts
4. **Use a base de conhecimento** para melhores resultados
5. **Converta para imagens** e use!

---

**🎉 Agora você está pronto para usar o Gemini para gerar conteúdo HTML automaticamente!**
