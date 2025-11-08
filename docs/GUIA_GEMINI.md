# 🧠 Guia Completo: Usando Prompts com Gemini

## 📋 Visão Geral

Este projeto já está configurado para usar o **Google Gemini** como provedor de IA para gerar conteúdo HTML automaticamente. O sistema usa prompts inteligentes para criar slides, posts do Instagram, apresentações PowerPoint e muito mais.

## 🚀 Configuração Inicial

### 1. Obter Chave da API do Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Configuração da API do Google Gemini
GEMINI_API_KEY=sua_chave_da_api_gemini_aqui

# Provider padrão (gemini, openai, ollama)
AI_PROVIDER=gemini
```

## 🎯 Como Usar Prompts com Gemini

### Comando Básico

```bash
# Gerar conteúdo usando prompt
node magic.js --ai --prompt "Crie slides sobre marketing digital" --count 5

# Ou usando o comando direto
h2i --ai --prompt "Crie slides sobre marketing digital" --count 5
```

### Parâmetros Disponíveis

- `--ai` ou `--prompt`: Ativa geração com IA
- `--count N`: Número de slides/HTMLs a gerar (padrão: 6)
- `--preset TIPO`: Tipo de conteúdo (instagram, stories, ppt, generic)
- `--model MODELO`: Modelo específico do Gemini (opcional)
- `--docs DOCUMENTOS`: Usar documentos específicos da base de conhecimento

### Exemplos Práticos

#### 1. Posts para Instagram
```bash
node magic.js --ai --prompt "Crie posts sobre dicas de produtividade" --preset instagram --count 4
```

#### 2. Stories para Redes Sociais
```bash
node magic.js --ai --prompt "Crie stories sobre receitas saudáveis" --preset stories --count 6
```

#### 3. Slides para PowerPoint
```bash
node magic.js --ai --prompt "Crie slides sobre inteligência artificial" --preset ppt --count 8
```

#### 4. Conteúdo Genérico
```bash
node magic.js --ai --prompt "Crie banners promocionais para e-commerce" --preset generic --count 3
```

## 🧠 Sistema de Prompts Inteligentes

### Base de Conhecimento

O sistema inclui uma base de conhecimento com templates e padrões:

```bash
# Listar documentos disponíveis
node magic.js --list-docs

# Buscar documentos por palavra-chave
node magic.js --search-docs "marketing"
```

### Prompts Enriquecidos

O sistema automaticamente enriquece seus prompts com:
- Especificações técnicas (dimensões, formato)
- Templates de design
- Padrões de layout
- Configurações de conversão

### Exemplo de Prompt Enriquecido

**Seu prompt:**
```
"Crie slides sobre sustentabilidade"
```

**Prompt enviado ao Gemini:**
```
Crie slides sobre sustentabilidade

ESPECIFICAÇÕES TÉCNICAS:
- Formato: Instagram (1080x1440px)
- Quantidade: 6 HTMLs
- Configuração inline obrigatória com dimensões 1080x1440

[Base de conhecimento: templates de design, padrões de layout, etc.]
```

## 📁 Estrutura de Saída

Os HTMLs gerados são salvos em:
```
work/htmls/ai/[nome-temático-gerado]/
├── ai-slide-01.html
├── ai-slide-02.html
├── ai-slide-03.html
└── images-prompts.txt (se houver prompts de imagens)
```

## 🎨 Presets Disponíveis

### Instagram (1080x1440px)
- Otimizado para posts do Instagram
- Layout vertical
- Design moderno e atrativo

### Stories (1920x1080px)
- Formato horizontal
- Ideal para stories do Instagram/Facebook
- Elementos grandes e legíveis

### PowerPoint (1920x1080px)
- Formato de apresentação
- Layout profissional
- Elementos corporativos

### Generic (1200x800px)
- Formato flexível
- Para banners, cards, etc.
- Design adaptável

## 🔧 Configurações Avançadas

### Usando Modelos Específicos

```bash
node magic.js --ai --prompt "Conteúdo técnico" --model "gemini-2.5-pro"
```

### Usando Documentos Específicos

```bash
node magic.js --ai --prompt "Crie conteúdo sobre vendas" --docs "vendas,marketing"
```

### Configuração de Qualidade

O sistema usa configurações otimizadas:
- Temperature: 0.7 (criatividade balanceada)
- Top-P: 0.8 (diversidade controlada)
- Top-K: 40 (qualidade de tokens)

## 🚨 Solução de Problemas

### Erro: "GEMINI_API_KEY não encontrada"
- Verifique se o arquivo `.env` existe
- Confirme se a chave está correta
- Reinicie o terminal após criar o `.env`

### Erro: "Cota da API Gemini excedida"
- Aguarde alguns minutos
- Verifique seu limite de uso no Google AI Studio
- Considere usar um modelo diferente

### Erro: "Conteúdo bloqueado por filtros de segurança"
- Reformule o prompt para ser mais neutro
- Evite termos que possam ser considerados sensíveis
- Use linguagem mais técnica

### HTMLs sem configuração inline
- O sistema adiciona automaticamente configurações padrão
- Verifique se o HTML gerado tem o bloco `h2i-config`

## 📊 Monitoramento e Logs

O sistema mostra logs detalhados:
- Status da conexão com Gemini
- Documentos da base de conhecimento utilizados
- Número de HTMLs gerados
- Localização dos arquivos salvos

## 🔄 Fluxo Completo

1. **Prompt**: Você fornece o prompt
2. **Enriquecimento**: Sistema adiciona especificações técnicas
3. **Base de Conhecimento**: Aplica templates e padrões
4. **Geração**: Gemini cria os HTMLs
5. **Validação**: Sistema verifica estrutura e configurações
6. **Salvamento**: HTMLs são salvos na pasta de trabalho
7. **Conversão**: Pronto para converter em imagens!

## 💡 Dicas para Melhores Resultados

### Prompts Eficazes
- Seja específico sobre o tema
- Mencione o público-alvo
- Inclua detalhes visuais desejados
- Use termos técnicos quando apropriado

### Exemplos de Bons Prompts
```
✅ "Crie slides sobre marketing digital para pequenas empresas, com foco em redes sociais e orçamento limitado"

✅ "Gere posts do Instagram sobre sustentabilidade, com dicas práticas e design moderno"

✅ "Crie apresentação sobre inteligência artificial para executivos, com dados e gráficos"
```

### Exemplos de Prompts Evitar
```
❌ "Crie slides" (muito genérico)

❌ "Faça algo bonito" (sem especificações)

❌ "Conteúdo sobre tudo" (muito amplo)
```

## 🎯 Próximos Passos

Após gerar os HTMLs com Gemini:
1. Revise os arquivos gerados
2. Ajuste se necessário
3. Converta para imagens: `node magic.js work/htmls/ai/[pasta-gerada]`
4. Use as imagens em seus projetos!

---

**🎉 Agora você está pronto para usar o poder do Gemini para gerar conteúdo HTML automaticamente!**
