const fs = require('fs');
const path = require('path');

/**
 * Gerenciador de Sessão de Chat Interativo
 * Atende ao princípio SRP e OCP: isola o estado do chat de qualquer Adapter específico de IA.
 */
class AIChatSession {
  constructor(aiAdapter, systemPrompt = '', workFolder = null) {
    this.adapter = aiAdapter;
    this.systemPrompt = systemPrompt;
    this.workFolder = workFolder || path.resolve(process.cwd(), 'work', 'htmls');
    this.history = [];
    this.assetsContext = this._getAssetsContext();
    
    // RAG state
    this.ragContext = '';
    this.ragCurrentDoc = null;
    this.ragTriggerKeywords = [
      'referência', 'referencia', 'guia', 'documento', 'manual',
      'exemplo', 'pesquisa', 'consulta', 'consulte', 'conhecimento',
      'template', 'modelo', 'padrão', 'padrao', 'estilo',
      'ebook', 'e-book', 'livro', 'cartografia', 'mapa',
      'ilustração', 'ilustracao', 'comunicação', 'comunicacao',
      'precificação', 'precificacao', 'estratégia', 'estrategia', 'ffc'
    ];
  }

  _getAssetsContext() {
    const assetsDir = path.resolve(process.cwd(), 'assets');
    if (!fs.existsSync(assetsDir)) return '';
    try {
      const files = fs.readdirSync(assetsDir).filter(f => !f.startsWith('.') && fs.statSync(path.join(assetsDir, f)).isFile());
      if (files.length === 0) return '';
      return `[CONTEXTO TÉCNICO - ARQUIVOS LOCAIS DISPONÍVEIS]\nO usuário possui as seguintes imagens na pasta './assets/'. Se ele pedir para usar uma imagem ou fundo local, use os caminhos abaixo no seu código HTML/CSS:\n` + files.map(f => `- ./assets/${f}`).join('\n');
    } catch (e) {
      return '';
    }
  }

  /**
   * Verifica se a mensagem do usuário justifica uma nova consulta ao RAG.
   * Retorna true se for a primeira mensagem, se for longa, ou se contiver palavras-gatilho.
   */
  _shouldRunRAG(userMessage) {
    // Primeira mensagem: sempre roda
    if (this.history.length <= 1) return true;
    
    // Mensagens longas indicam um novo pedido complexo, não um ajuste fino
    if (userMessage.length > 80) return true;
    
    // Palavras-gatilho indicam que o usuário quer referência de algum doc
    const lowerMsg = userMessage.toLowerCase();
    return this.ragTriggerKeywords.some(kw => lowerMsg.includes(kw));
  }

  /**
   * Adiciona mensagem e envia para a IA mantendo o contexto iterativo.
   * @param {string} userMessage 
   * @returns {Promise<string>} Resposta crua do modelo
   */
  async sendMessage(userMessage) {
    this.history.push(`Usuário: ${userMessage}`);

    // === RAG (Sub-Agente Bibliotecário) com gatilho inteligente ===
    if (this._shouldRunRAG(userMessage)) {
      await this._runRAG(userMessage);
    }
    
    // Concatenação de histórico universal (fallback seguro para qualquer adapter sem memória nativa)
    const fullContext = [
      this.systemPrompt,
      this.assetsContext,
      this.ragContext,
      ...this.history,
      'Gema (Assistente Especialista):'
    ].filter(Boolean).join('\n\n---\n\n');

    // Temperatura mais baixa por padrão para garantir precisão técnica (HTML)
    const response = await this.adapter.generateContent(fullContext, { temperature: 0.4 });
    
    this.history.push(`Gema (Assistente Especialista): ${response}`);
    return response;
  }

  async _runRAG(userMessage) {
    const docsDir = path.resolve(process.cwd(), 'knowledge', 'documents');
    if (!fs.existsSync(docsDir)) return;

    try {
      const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
      if (files.length === 0) return;

      console.log('📚 [Bibliotecário] Pesquisando na base de conhecimento local...');

      const catalog = files.map((f, i) => `[${i}] ${f}`).join('\n');
      const ragPrompt = `Role: Librarian Classifier.
Task: Select the most relevant document for the user's request.
Catalog:
${catalog}

User request: "${userMessage}"

Respond ONLY with the exact [ID] number of the most relevant document (e.g. 0, 1, 2). If NONE are related to the request, respond with NONE. Do not explain.`;

      const ragChoice = await this.adapter.generateContent(ragPrompt, { temperature: 0.0 });
      const match = ragChoice.match(/(?:\[)?(\d+)(?:\])?/);
      
      if (match && match[1] && !ragChoice.includes('NONE')) {
        const index = parseInt(match[1]);
        if (index >= 0 && index < files.length) {
          const selectedFile = files[index];
          
          // Se é o mesmo doc que já temos carregado, não recarrega
          if (selectedFile === this.ragCurrentDoc) {
            console.log(`📚 [Bibliotecário] Mantendo guia já carregado: '${selectedFile}'`);
            return;
          }
          
          let docContent = fs.readFileSync(path.join(docsDir, selectedFile), 'utf-8');
          
          // Trunca documentos grandes para não estourar a context window
          const MAX_RAG_CHARS = 6000;
          if (docContent.length > MAX_RAG_CHARS) {
            docContent = docContent.substring(0, MAX_RAG_CHARS) + '\n[... documento truncado para otimização ...]';
          }
          
          this.ragContext = `[INFORMAÇÃO EXTRAÍDA DO DOCUMENTO DE SUPORTE: ${selectedFile}]\n${docContent}\n[FIM DA INFORMAÇÃO DE SUPORTE]\n`;
          this.ragCurrentDoc = selectedFile;
          console.log(`📚 [Bibliotecário] Gema leu o guia relevante: '${selectedFile}'`);
        }
      } else {
        console.log(`📚 [Bibliotecário] Nenhum guia local parece cobrir este assunto. Seguindo apenas com a Gema...`);
      }
    } catch(e) {
      console.log(`📚 [Bibliotecário] Erro silencioso na pesquisa: ${e.message}`);
    }
  }

  getHistory() {
    return this.history;
  }
}

module.exports = AIChatSession;
