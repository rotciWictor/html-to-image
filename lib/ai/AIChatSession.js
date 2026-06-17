const fs = require('fs');
const path = require('path');

/**
 * Gerenciador de Sessão de Chat Interativo
 * Atende ao princípio SRP e OCP: isola o estado do chat de qualquer Adapter específico de IA.
 */
class AIChatSession {
  constructor(aiAdapter, systemPrompt = '') {
    this.adapter = aiAdapter;
    this.systemPrompt = systemPrompt;
    this.history = [];
    this.assetsContext = this._getAssetsContext();
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
   * Adiciona mensagem e envia para a IA mantendo o contexto iterativo.
   * @param {string} userMessage 
   * @returns {Promise<string>} Resposta crua do modelo
   */
  async sendMessage(userMessage) {
    this.history.push(`Usuário: ${userMessage}`);

    // === RAG (Sub-Agente Bibliotecário) ===
    let ragContext = '';
    const docsDir = path.resolve(process.cwd(), 'knowledge', 'documents');
    if (fs.existsSync(docsDir)) {
      try {
        const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
        if (files.length > 0) {
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
              const docContent = fs.readFileSync(path.join(docsDir, selectedFile), 'utf-8');
              ragContext = `[INFORMAÇÃO EXTRAÍDA DO DOCUMENTO DE SUPORTE: ${selectedFile}]\n${docContent}\n[FIM DA INFORMAÇÃO DE SUPORTE]\n`;
              console.log(`\n📚 [RAG] A Gema encontrou um guia útil e leu o documento: '${selectedFile}'`);
            }
          }
        }
      } catch(e) {
        // Se o Bibliotecário falhar, o fluxo principal continua normalmente
      }
    }
    
    // Concatenação de histórico universal (fallback seguro para qualquer adapter sem memória nativa)
    const fullContext = [
      this.systemPrompt,
      this.assetsContext,
      ragContext,
      ...this.history,
      'Gema (Assistente Especialista):'
    ].filter(Boolean).join('\n\n---\n\n');

    // Temperatura mais baixa por padrão para garantir precisão técnica (HTML)
    const response = await this.adapter.generateContent(fullContext, { temperature: 0.4 });
    
    this.history.push(`Gema (Assistente Especialista): ${response}`);
    return response;
  }

  getHistory() {
    return this.history;
  }
}

module.exports = AIChatSession;
