# Especificação de UI para Chat - HTML to Image Converter v2.0

## 📋 Visão Geral do Sistema

O **HTML to Image Converter** é uma ferramenta enterprise que converte arquivos HTML para imagens (PNG, JPEG, WebP) usando Puppeteer, com suporte a IA para geração automática de conteúdo e múltiplos presets para diferentes plataformas.

### Funcionalidades Principais
- **Conversão HTML → Imagem**: Suporte a PNG, JPEG, WebP
- **Presets Inteligentes**: Instagram (1080x1440), Stories (1920x1080), PowerPoint (1920x1080), Genérico
- **IA Integrada**: Gemini, Ollama, OpenAI para geração automática de HTMLs
- **Base de Conhecimento**: Sistema de documentos para contextualizar a IA
- **CLI Robusto**: Interface de linha de comando com validação rigorosa
- **Processamento em Lote**: Conversão paralela de múltiplos arquivos
- **Configuração Flexível**: JSON, meta tags ou parâmetros inline

---

## 🎯 Objetivo da UI de Chat

Criar uma interface conversacional que permita aos usuários interagir com o sistema de forma intuitiva, substituindo a necessidade de comandos CLI complexos por uma experiência de chat natural e guiada.

---

## 🏗️ Arquitetura da UI de Chat

### Componentes Principais

#### 1. **Chat Interface**
- **Área de Mensagens**: Histórico da conversa com scroll infinito
- **Input de Mensagem**: Campo de texto com suporte a multiline
- **Botões de Ação**: Enviar, anexar arquivos, limpar conversa
- **Indicadores de Status**: Typing, processando, erro, sucesso

#### 2. **Sidebar de Controles**
- **Presets Rápidos**: Botões para Instagram, Stories, PowerPoint, Genérico
- **Configurações**: Painel expansível com opções avançadas
- **Histórico de Projetos**: Lista de conversões anteriores
- **Base de Conhecimento**: Acesso aos documentos disponíveis

#### 3. **Painel de Resultados**
- **Preview das Imagens**: Galeria com thumbnails
- **Download**: Botões para baixar imagens individuais ou em lote
- **Metadados**: Informações sobre cada conversão (dimensões, formato, qualidade)
- **Logs de Processamento**: Detalhes técnicos da conversão

---

## 💬 Fluxos de Conversa

### 1. **Fluxo de Conversão Básica**

```
Usuário: "Quero converter meus HTMLs para imagens do Instagram"
Bot: "Perfeito! Vou configurar para o preset Instagram (1080x1440px). 
     Onde estão seus arquivos HTML?"
Usuário: [Anexa pasta ou especifica caminho]
Bot: "Encontrei 5 arquivos HTML. Iniciando conversão..."
     [Mostra progresso em tempo real]
Bot: "✅ Conversão concluída! 5 imagens PNG geradas em output/"
     [Exibe preview das imagens]
```

### 2. **Fluxo de Geração com IA**

```
Usuário: "Crie slides sobre marketing digital para Instagram"
Bot: "Vou gerar slides usando IA. Quantos slides você quer? (padrão: 6)"
Usuário: "8 slides"
Bot: "Qual modelo de IA prefere? Gemini, Ollama ou OpenAI?"
Usuário: "Gemini"
Bot: "🧠 Gerando 8 slides com Gemini...
     [Mostra progresso]
Bot: "✅ 8 HTMLs gerados! Convertendo para imagens..."
     [Mostra preview final]
```

### 3. **Fluxo de Configuração Avançada**

```
Usuário: "Quero JPEG com qualidade 95%"
Bot: "Configurando formato JPEG com qualidade 95%. 
     Qual preset você quer usar?"
Usuário: "PowerPoint"
Bot: "Perfeito! Configuração: PowerPoint (1920x1080), JPEG 95%
     Pronto para processar seus HTMLs."
```

---

## 🎨 Elementos de Interface

### **Cores e Tema**
- **Primária**: #2c5aa0 (azul corporativo)
- **Secundária**: #667eea (azul gradiente)
- **Sucesso**: #28a745 (verde)
- **Aviso**: #ffc107 (amarelo)
- **Erro**: #dc3545 (vermelho)
- **Fundo**: #f8f9fa (cinza claro)
- **Texto**: #333333 (cinza escuro)

### **Tipografia**
- **Títulos**: Inter, 700, 24px
- **Subtítulos**: Inter, 600, 18px
- **Corpo**: Inter, 400, 14px
- **Código**: JetBrains Mono, 400, 13px

### **Componentes Visuais**

#### **Cards de Mensagem**
```
┌─────────────────────────────────────┐
│ 👤 Usuário                          │
│ Quero converter para Instagram      │
│ ─────────────────────────────────── │
│ 🤖 Bot                             │
│ Perfeito! Configurando preset...   │
│ [Progress Bar: ████████░░ 80%]     │
└─────────────────────────────────────┘
```

#### **Botões de Preset**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 📱 Instagram│ │ 📺 Stories  │ │ 📊 PowerPoint│
│ 1080x1440   │ │ 1920x1080   │ │ 1920x1080   │
└─────────────┘ └─────────────┘ └─────────────┘
```

#### **Preview de Imagens**
```
┌─────────────────────────────────────┐
│ 📸 Imagens Geradas (5)              │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │img1 │ │img2 │ │img3 │ │img4 │    │
│ │1080 │ │1080 │ │1080 │ │1080 │    │
│ │x1440│ │x1440│ │x1440│ │x1440│    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
│ [📥 Download All] [🔄 Regenerate]   │
└─────────────────────────────────────┘
```

---

## 🔧 Funcionalidades Detalhadas

### **1. Reconhecimento de Intenções**

O sistema deve reconhecer automaticamente:

#### **Conversão de Arquivos**
- "Converter meus HTMLs"
- "Transformar em imagens"
- "Gerar PNGs do Instagram"
- "Criar slides para apresentação"

#### **Geração com IA**
- "Criar slides sobre [tema]"
- "Gerar conteúdo para [plataforma]"
- "Fazer posts do Instagram sobre [assunto]"
- "Criar apresentação de [tema]"

#### **Configurações**
- "Mudar para JPEG"
- "Qualidade 95%"
- "Dimensões 1600x900"
- "Fundo transparente"

### **2. Comandos de Chat**

#### **Comandos Básicos**
- `/help` - Mostra ajuda e comandos disponíveis
- `/preset [nome]` - Define preset (instagram, stories, ppt, generic)
- `/format [tipo]` - Define formato (png, jpeg, webp)
- `/quality [1-100]` - Define qualidade JPEG
- `/dimensions [w]x[h]` - Define dimensões customizadas

#### **Comandos de IA**
- `/ai [prompt]` - Gera HTMLs via IA
- `/model [nome]` - Define modelo (gemini, ollama, openai)
- `/slides [número]` - Define quantidade de slides
- `/docs [palavra-chave]` - Busca na base de conhecimento

#### **Comandos de Arquivo**
- `/upload` - Abre seletor de arquivos
- `/folder [caminho]` - Define pasta de trabalho
- `/output [caminho]` - Define pasta de saída
- `/clear` - Limpa conversa atual

### **3. Estados da Interface**

#### **Estado Inicial**
- Mensagem de boas-vindas
- Botões de preset principais
- Campo de input com placeholder sugestivo
- Link para documentação

#### **Estado de Processamento**
- Indicador de progresso animado
- Logs em tempo real
- Botão de cancelar
- Estimativa de tempo restante

#### **Estado de Resultado**
- Preview das imagens geradas
- Botões de download
- Opções de reprocessamento
- Compartilhamento

#### **Estado de Erro**
- Mensagem de erro clara
- Sugestões de correção
- Botão de tentar novamente
- Link para suporte

---

## 📱 Responsividade

### **Desktop (1200px+)**
- Layout em 3 colunas: Chat | Controles | Resultados
- Sidebar fixa com controles avançados
- Preview de imagens em grid 4x4

### **Tablet (768px - 1199px)**
- Layout em 2 colunas: Chat + Controles | Resultados
- Sidebar colapsável
- Preview de imagens em grid 3x3

### **Mobile (320px - 767px)**
- Layout em 1 coluna com abas
- Controles em drawer inferior
- Preview de imagens em carrossel

---

## 🔌 Integrações

### **APIs Externas**
- **Gemini API**: Geração de conteúdo via Google AI
- **OpenAI API**: Geração via GPT models
- **Ollama API**: Geração local via modelos OSS

### **Sistemas de Arquivo**
- **Upload de Arquivos**: Drag & drop, seletor nativo
- **Acesso a Pastas**: Navegador de diretórios
- **Download**: Geração de ZIPs, download individual

### **Notificações**
- **Desktop**: Notificações nativas do sistema
- **Web**: Push notifications (se PWA)
- **Email**: Opcional para conversões longas

---

## 🎯 Casos de Uso Específicos

### **1. Agência de Marketing**
```
Usuário: "Preciso de 10 posts para Instagram sobre Black Friday"
Bot: "Vou gerar 10 slides com tema Black Friday para Instagram"
     [Gera conteúdo + converte + organiza em pasta]
```

### **2. Apresentações Corporativas**
```
Usuário: "Criar slides de resultados Q4 para apresentação"
Bot: "Configurando preset PowerPoint. Quantos slides?"
Usuário: "15 slides com métricas e gráficos"
Bot: "Gerando apresentação completa..."
```

### **3. Documentação Técnica**
```
Usuário: "Converter capturas de UI para documentação"
Bot: "Qual formato prefere? PNG para transparência ou JPEG?"
Usuário: "PNG, 1600x900"
Bot: "Processando capturas em alta resolução..."
```

---

## 🚀 Funcionalidades Avançadas

### **1. Templates Inteligentes**
- Sugestão de templates baseado no conteúdo
- Preview de templates antes da aplicação
- Personalização de cores e fontes

### **2. Batch Processing**
- Processamento em lote com fila
- Priorização de tarefas
- Notificação de conclusão

### **3. Colaboração**
- Compartilhamento de projetos
- Comentários em conversões
- Histórico de versões

### **4. Analytics**
- Estatísticas de uso
- Tempos de processamento
- Taxa de sucesso

---

## 📋 Checklist para o Designer

### **Interface Principal**
- [ ] Layout responsivo em 3 breakpoints
- [ ] Área de chat com scroll infinito
- [ ] Input de mensagem com suporte a multiline
- [ ] Botões de ação principais (enviar, anexar, limpar)
- [ ] Indicadores de status (typing, processando, erro)

### **Sidebar de Controles**
- [ ] Botões de preset (Instagram, Stories, PowerPoint, Genérico)
- [ ] Painel de configurações expansível
- [ ] Seletor de formato e qualidade
- [ ] Configurações de dimensões
- [ ] Histórico de projetos

### **Painel de Resultados**
- [ ] Galeria de preview de imagens
- [ ] Botões de download (individual e em lote)
- [ ] Metadados das imagens
- [ ] Logs de processamento
- [ ] Opções de reprocessamento

### **Estados e Feedback**
- [ ] Estado inicial com boas-vindas
- [ ] Estado de processamento com progresso
- [ ] Estado de resultado com preview
- [ ] Estado de erro com sugestões
- [ ] Animações de transição suaves

### **Responsividade**
- [ ] Desktop: 3 colunas
- [ ] Tablet: 2 colunas com sidebar colapsável
- [ ] Mobile: 1 coluna com abas
- [ ] Touch-friendly em mobile

### **Acessibilidade**
- [ ] Contraste adequado (WCAG AA)
- [ ] Navegação por teclado
- [ ] Screen reader friendly
- [ ] Textos alternativos em imagens

---

## 🎨 Referências Visuais

### **Inspiração de Design**
- **Discord**: Interface de chat moderna e funcional
- **Slack**: Botões de ação e organização clara
- **Figma**: Preview de imagens e controles
- **GitHub**: Interface técnica e profissional

### **Padrões de UX**
- **Material Design**: Para componentes e animações
- **Human Interface Guidelines**: Para feedback e estados
- **Ant Design**: Para layouts e grids

---

## 📊 Métricas de Sucesso

### **Usabilidade**
- Tempo para primeira conversão: < 2 minutos
- Taxa de conclusão de fluxos: > 90%
- Satisfação do usuário: > 4.5/5

### **Performance**
- Tempo de resposta do chat: < 500ms
- Tempo de processamento: < 30s por imagem
- Uptime: > 99.9%

### **Adoção**
- Usuários ativos mensais: Meta de crescimento
- Conversões por usuário: > 10 por mês
- Retenção: > 70% após 30 dias

---

Este documento serve como especificação completa para o desenvolvimento da UI de chat do HTML to Image Converter. O designer deve usar estas informações para criar uma interface intuitiva, funcional e alinhada com as necessidades dos usuários.
