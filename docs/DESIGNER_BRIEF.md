# Brief para Designer - UI de Chat HTML to Image Converter

## 🎯 Resumo Executivo

O **HTML to Image Converter** é uma ferramenta enterprise que converte arquivos HTML para imagens usando Puppeteer. Atualmente funciona via CLI (linha de comando), mas precisa de uma **interface de chat intuitiva** para democratizar o uso.

### **Objetivo Principal**
Criar uma UI de chat que substitua comandos complexos por conversas naturais, permitindo que usuários não-técnicos gerem imagens profissionais facilmente.

---

## 🚀 Funcionalidades Principais

### **1. Conversão HTML → Imagem**
- **4 Presets**: Instagram (1080x1440), Stories (1920x1080), PowerPoint (1920x1080), Genérico
- **3 Formatos**: PNG, JPEG, WebP
- **Configurações**: Qualidade, dimensões, escala, fundo
- **Processamento em lote**: Múltiplos arquivos simultaneamente

### **2. Geração com IA**
- **3 Provedores**: Gemini (Google), Ollama (local), OpenAI
- **Base de Conhecimento**: Documentos para contextualizar a IA
- **Templates Inteligentes**: Geração automática de HTMLs

### **3. Gestão de Arquivos**
- **Upload**: Drag & drop, seletor nativo
- **Organização**: Pastas de trabalho estruturadas
- **Download**: Individual ou em lote (ZIP)

---

## 💬 Experiência de Chat

### **Fluxo Típico**
```
Usuário: "Quero converter meus HTMLs para Instagram"
Bot: "Perfeito! Configurando preset Instagram (1080x1440px)...
     Encontrei 5 arquivos. Iniciando conversão..."
     [Mostra progresso em tempo real]
Bot: "✅ 5 imagens PNG geradas! [Preview] [Download]"
```

### **Comandos de Chat**
- `/help` - Ajuda e comandos
- `/preset [nome]` - Define preset
- `/ai [prompt]` - Gera via IA
- `/upload` - Anexa arquivos
- `/clear` - Limpa conversa

---

## 🎨 Diretrizes de Design

### **Paleta de Cores**
- **Primária**: #2c5aa0 (azul corporativo)
- **Secundária**: #667eea (azul gradiente)
- **Sucesso**: #28a745 (verde)
- **Aviso**: #ffc107 (amarelo)
- **Erro**: #dc3545 (vermelho)
- **Fundo**: #f8f9fa (cinza claro)
- **Texto**: #333333 (cinza escuro)

### **Tipografia**
- **Fonte**: Inter (títulos e corpo), JetBrains Mono (código)
- **Hierarquia**: Títulos 24px, Subtítulos 18px, Corpo 14px

### **Layout Responsivo**
- **Desktop**: 3 colunas (Chat | Controles | Resultados)
- **Tablet**: 2 colunas (Chat+Controles | Resultados)
- **Mobile**: 1 coluna com abas

---

## 📱 Componentes Principais

### **1. Área de Chat**
- Histórico de mensagens com scroll infinito
- Input de mensagem com suporte multiline
- Botões de ação (enviar, anexar, limpar)
- Indicadores de status (typing, processando, erro)

### **2. Sidebar de Controles**
- Botões de preset (Instagram, Stories, PowerPoint, Genérico)
- Painel de configurações (formato, qualidade, dimensões)
- Base de conhecimento (documentos disponíveis)
- Histórico de projetos

### **3. Painel de Resultados**
- Galeria de preview de imagens
- Botões de download (individual e em lote)
- Metadados das imagens
- Logs de processamento

---

## 🔄 Estados da Interface

### **Estado Inicial**
- Mensagem de boas-vindas
- Botões de preset principais
- Campo de input com placeholder sugestivo

### **Estado de Processamento**
- Barra de progresso animada
- Logs em tempo real
- Botão de cancelar
- Estimativa de tempo

### **Estado de Resultado**
- Preview das imagens geradas
- Botões de download
- Opções de reprocessamento

### **Estado de Erro**
- Mensagem de erro clara
- Sugestões de correção
- Botão de tentar novamente

---

## 🎯 Casos de Uso Específicos

### **1. Agência de Marketing**
- Gerar posts para Instagram em massa
- Criar stories com templates
- Produzir slides para apresentações

### **2. Apresentações Corporativas**
- Converter HTMLs para slides PowerPoint
- Manter consistência visual
- Processar em lote

### **3. Documentação Técnica**
- Capturas de tela de interfaces
- Imagens para manuais
- Documentação visual

---

## 📋 Checklist de Entrega

### **Arquivos Necessários**
- [ ] **Figma**: Arquivo principal com todos os componentes
- [ ] **Desktop**: Layout 1200px+ com 3 colunas
- [ ] **Tablet**: Layout 768px-1199px com 2 colunas
- [ ] **Mobile**: Layout 320px-767px com 1 coluna
- [ ] **Componentes**: Biblioteca de componentes reutilizáveis
- [ ] **Estados**: Todos os estados de cada componente
- [ ] **Animações**: Transições e micro-interações
- [ ] **Prototipagem**: Fluxos interativos principais

### **Especificações Técnicas**
- [ ] **Breakpoints**: 320px, 768px, 1200px
- [ ] **Espaçamentos**: Grid system 8px
- [ ] **Cores**: Paleta completa com códigos hex
- [ ] **Tipografia**: Escalas e pesos de fonte
- [ ] **Ícones**: Set de ícones consistente
- [ ] **Assets**: Imagens e ilustrações

### **Documentação**
- [ ] **Style Guide**: Guia de estilo completo
- [ ] **Component Library**: Documentação de componentes
- [ ] **User Flows**: Fluxos de usuário principais
- [ ] **Responsive Guide**: Guia de responsividade
- [ ] **Accessibility**: Diretrizes de acessibilidade

---

## 🎨 Referências de Design

### **Inspiração**
- **Discord**: Interface de chat moderna
- **Slack**: Organização e botões de ação
- **Figma**: Preview de imagens e controles
- **GitHub**: Interface técnica profissional

### **Padrões**
- **Material Design**: Componentes e animações
- **Human Interface Guidelines**: Feedback e estados
- **Ant Design**: Layouts e grids

---

## 📊 Métricas de Sucesso

### **Usabilidade**
- Tempo para primeira conversão: < 2 minutos
- Taxa de conclusão: > 90%
- Satisfação: > 4.5/5

### **Performance**
- Tempo de resposta: < 500ms
- Processamento: < 30s por imagem
- Uptime: > 99.9%

---

## 📁 Arquivos de Referência

### **Documentação Técnica**
- `docs/UI_CHAT_SPECIFICATION.md` - Especificação completa
- `docs/WIREFRAMES_UI_CHAT.md` - Wireframes detalhados
- `README.md` - Visão geral do sistema

### **Exemplos de HTML**
- `examples/instagram/` - Templates Instagram
- `examples/powerpoint/` - Templates PowerPoint
- `examples/generic/` - Templates genéricos

### **Configurações**
- `config/config.json` - Configurações do sistema
- `package.json` - Dependências e scripts

---

## 🚀 Próximos Passos

1. **Revisar Brief**: Confirmar entendimento dos requisitos
2. **Criar Moodboard**: Explorar direções visuais
3. **Desenvolver Wireframes**: Estrutura e fluxos
4. **Design Visual**: Aplicar identidade visual
5. **Prototipagem**: Criar interações funcionais
6. **Testes**: Validar com usuários
7. **Entrega**: Arquivos finais e documentação

---

**Contato**: Para dúvidas sobre funcionalidades técnicas ou requisitos específicos, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

**Prazo**: 2 semanas para entrega completa
**Formato**: Figma + Prototipagem + Documentação
