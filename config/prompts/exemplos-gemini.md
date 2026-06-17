# 🎯 Exemplos Práticos: Usando Gemini para Gerar Conteúdo

## 🚀 Configuração Rápida

### 1. Criar arquivo .env
```bash
# Crie o arquivo .env na raiz do projeto
echo "GEMINI_API_KEY=sua_chave_aqui" > .env
echo "AI_PROVIDER=gemini" >> .env
```

### 2. Instalar dependências (se necessário)
```bash
npm install
```

## 📱 Exemplos por Tipo de Conteúdo

### 1. Posts para Instagram

```bash
# Posts sobre produtividade
node magic.js --ai --prompt "Crie posts do Instagram sobre dicas de produtividade para empreendedores" --preset instagram --count 5

# Posts sobre tecnologia
node magic.js --ai --prompt "Gere posts sobre tendências de IA para 2025, com design moderno e cores vibrantes" --preset instagram --count 6

# Posts educativos
node magic.js --ai --prompt "Crie posts educativos sobre sustentabilidade, com dicas práticas e infográficos" --preset instagram --count 4
```

### 2. Stories para Redes Sociais

```bash
# Stories promocionais
node magic.js --ai --prompt "Crie stories promocionais para lançamento de produto, com call-to-action forte" --preset stories --count 8

# Stories educativos
node magic.js --ai --prompt "Gere stories sobre receitas saudáveis, com passo a passo visual" --preset stories --count 6

# Stories motivacionais
node magic.js --ai --prompt "Crie stories motivacionais para empreendedores, com frases inspiradoras" --preset stories --count 5
```

### 3. Slides para Apresentações

```bash
# Apresentação corporativa
node magic.js --ai --prompt "Crie slides para apresentação corporativa sobre resultados do trimestre, com gráficos e dados" --preset ppt --count 10

# Apresentação educativa
node magic.js --ai --prompt "Gere slides educativos sobre marketing digital, com conceitos e exemplos práticos" --preset ppt --count 12

# Pitch de startup
node magic.js --ai --prompt "Crie slides para pitch de startup de fintech, com problema, solução e modelo de negócio" --preset ppt --count 8
```

### 4. Conteúdo Genérico

```bash
# Banners promocionais
node magic.js --ai --prompt "Crie banners promocionais para black friday, com descontos e urgência" --preset generic --count 4

# Cards informativos
node magic.js --ai --prompt "Gere cards informativos sobre benefícios de exercícios físicos, com ícones e estatísticas" --preset generic --count 6

# Infográficos
node magic.js --ai --prompt "Crie infográficos sobre estatísticas de redes sociais em 2025, com dados e gráficos" --preset generic --count 5
```

## 🎨 Exemplos por Setor

### E-commerce
```bash
# Produtos de moda
node magic.js --ai --prompt "Crie posts para loja de moda feminina, destacando tendências de verão e cores vibrantes" --preset instagram --count 6

# Produtos eletrônicos
node magic.js --ai --prompt "Gere posts para loja de eletrônicos, destacando recursos técnicos e benefícios dos produtos" --preset instagram --count 5

# Produtos de beleza
node magic.js --ai --prompt "Crie stories para marca de cosméticos, com tutoriais de maquiagem e dicas de beleza" --preset stories --count 8
```

### Educação
```bash
# Cursos online
node magic.js --ai --prompt "Crie slides para curso de programação, com conceitos básicos e exemplos de código" --preset ppt --count 10

# Tutoriais
node magic.js --ai --prompt "Gere posts educativos sobre matemática, com fórmulas e exercícios práticos" --preset instagram --count 6

# Workshops
node magic.js --ai --prompt "Crie slides para workshop de design, com princípios e ferramentas" --preset ppt --count 8
```

### Saúde e Bem-estar
```bash
# Dicas de saúde
node magic.js --ai --prompt "Crie posts sobre dicas de saúde mental, com conselhos práticos e design acolhedor" --preset instagram --count 5

# Exercícios
node magic.js --ai --prompt "Gere stories sobre exercícios em casa, com ilustrações e instruções" --preset stories --count 6

# Nutrição
node magic.js --ai --prompt "Crie slides sobre alimentação saudável, com pirâmide alimentar e receitas" --preset ppt --count 7
```

### Tecnologia
```bash
# Notícias de tech
node magic.js --ai --prompt "Crie posts sobre novidades em IA, com explicações técnicas e impactos" --preset instagram --count 4

# Tutoriais de programação
node magic.js --ai --prompt "Gere slides sobre JavaScript moderno, com exemplos de código e boas práticas" --preset ppt --count 9

# Reviews de produtos
node magic.js --ai --prompt "Crie posts sobre review de smartphones, com especificações e comparações" --preset instagram --count 5
```

## 🎯 Exemplos por Ocasão

### Datas Comemorativas
```bash
# Natal
node magic.js --ai --prompt "Crie posts natalinos para e-commerce, com promoções e decoração festiva" --preset instagram --count 6

# Dia das Mães
node magic.js --ai --prompt "Gere stories para Dia das Mães, com homenagens e produtos especiais" --preset stories --count 5

# Black Friday
node magic.js --ai --prompt "Crie banners para Black Friday, com descontos e urgência" --preset generic --count 4
```

### Campanhas Especiais
```bash
# Lançamento de produto
node magic.js --ai --prompt "Crie slides para lançamento de app, com features e benefícios" --preset ppt --count 8

# Campanha de conscientização
node magic.js --ai --prompt "Gere posts sobre sustentabilidade, com dicas e estatísticas" --preset instagram --count 6

# Evento corporativo
node magic.js --ai --prompt "Crie slides para evento corporativo, com agenda e palestrantes" --preset ppt --count 10
```

## 🔧 Comandos Avançados

### Usando Base de Conhecimento
```bash
# Listar documentos disponíveis
node magic.js --list-docs

# Buscar documentos específicos
node magic.js --search-docs "marketing"

# Usar documentos específicos
node magic.js --ai --prompt "Crie conteúdo sobre vendas" --docs "vendas,marketing" --preset instagram --count 5
```

### Configurações Personalizadas
```bash
# Usar modelo específico
node magic.js --ai --prompt "Conteúdo técnico complexo" --model "gemini-2.5-pro" --preset ppt --count 8

# Gerar mais conteúdo
node magic.js --ai --prompt "Série completa sobre marketing" --count 15 --preset instagram

# Conteúdo para diferentes formatos
node magic.js --ai --prompt "Campanha de marketing" --preset instagram --count 6
node magic.js --ai --prompt "Campanha de marketing" --preset stories --count 6
node magic.js --ai --prompt "Campanha de marketing" --preset ppt --count 8
```

## 📊 Fluxo Completo de Trabalho

### 1. Gerar Conteúdo
```bash
node magic.js --ai --prompt "Crie posts sobre sustentabilidade para empresa de energia" --preset instagram --count 6
```

### 2. Verificar Resultados
```bash
# Os HTMLs são salvos em work/htmls/ai/[pasta-gerada]/
ls work/htmls/ai/
```

### 3. Converter para Imagens
```bash
# Converter os HTMLs gerados em imagens
node magic.js work/htmls/ai/[pasta-gerada]/
```

### 4. Usar as Imagens
```bash
# As imagens ficam em output/
ls output/
```

## 🎨 Dicas para Melhores Resultados

### Prompts Eficazes
- **Específico**: "Posts sobre marketing digital para pequenas empresas"
- **Visual**: "Design moderno com cores vibrantes"
- **Contexto**: "Para público jovem empreendedor"
- **Ação**: "Com call-to-action forte"

### Prompts a Evitar
- ❌ "Crie algo bonito" (muito vago)
- ❌ "Faça posts" (sem especificação)
- ❌ "Conteúdo sobre tudo" (muito amplo)

### Estrutura de Prompt Ideal
```
[Contexto] + [Tipo de Conteúdo] + [Público-Alvo] + [Especificações Visuais] + [Objetivo]
```

**Exemplo:**
```
"Crie posts do Instagram sobre dicas de produtividade para empreendedores, com design moderno e cores profissionais, para aumentar engajamento"
```

## 🚀 Próximos Passos

1. **Configure sua chave do Gemini** no arquivo `.env`
2. **Teste com um prompt simples** primeiro
3. **Experimente diferentes presets** e formatos
4. **Use a base de conhecimento** para melhorar resultados
5. **Converta para imagens** e use em seus projetos!

---

**🎉 Agora você tem exemplos práticos para começar a usar o Gemini imediatamente!**
