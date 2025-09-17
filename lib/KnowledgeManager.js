const fs = require('fs');
const path = require('path');

/**
 * Gerenciador da base de conhecimento
 * Carrega e combina prompts e documentos para enriquecer a geração de HTMLs
 */
class KnowledgeManager {
  constructor() {
    this.knowledgeDir = path.join(process.cwd(), 'knowledge');
    this.promptsDir = path.join(this.knowledgeDir, 'prompts');
    this.documentsDir = path.join(this.knowledgeDir, 'documents');
  }

  /**
   * Carrega o prompt mestre
   * @returns {string} Conteúdo do prompt mestre
   */
  loadMasterPrompt() {
    const promptFile = path.join(this.promptsDir, 'prompt-gerador-html-premium.txt');
    if (fs.existsSync(promptFile)) {
      return fs.readFileSync(promptFile, 'utf8');
    }
    throw new Error('Prompt mestre não encontrado: prompt-gerador-html-premium.txt');
  }

  /**
   * Carrega todos os documentos de conhecimento
   * @returns {Array<Object>} Array de documentos com nome e conteúdo
   */
  loadKnowledgeDocuments() {
    const documents = [];
    
    if (!fs.existsSync(this.documentsDir)) {
      return documents;
    }

    const files = fs.readdirSync(this.documentsDir);
    
    for (const file of files) {
      if (file.endsWith('.txt') && !file.startsWith('.')) {
        const filePath = path.join(this.documentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const name = path.basename(file, '.txt');
        
        const stats = fs.statSync(filePath);
        documents.push({
          name: name,
          content: content,
          filename: file,
          size: stats.size
        });
      }
    }

    return documents;
  }

  /**
   * Cria um prompt enriquecido combinando o prompt mestre com documentos relevantes
   * @param {string} userPrompt - Prompt do usuário
   * @param {Array<string>} relevantDocs - Nomes dos documentos relevantes (opcional)
   * @returns {string} Prompt completo para a IA
   */
  createEnrichedPrompt(userPrompt, relevantDocs = null) {
    const masterPrompt = this.loadMasterPrompt();
    const documents = this.loadKnowledgeDocuments();
    
    // Se não especificou documentos, usa todos
    let selectedDocs = documents;
    if (relevantDocs && relevantDocs.length > 0) {
      selectedDocs = documents.filter(doc => 
        relevantDocs.some(relDoc => doc.name.includes(relDoc))
      );
    }

    // Construir contexto dos documentos
    let contextSection = '';
    if (selectedDocs.length > 0) {
      contextSection = '\n\n## 📚 CONTEXTO ADICIONAL - BASE DE CONHECIMENTO\n\n';
      contextSection += 'Use as seguintes informações como referência para criar HTMLs mais precisos e contextualizados:\n\n';
      
      selectedDocs.forEach((doc, index) => {
        contextSection += `### ${doc.name}\n`;
        contextSection += doc.content.substring(0, 2000) + '...\n\n';
      });
    }

    // Combinar tudo
    const enrichedPrompt = `${masterPrompt}

${contextSection}

## 🎯 PROMPT DO USUÁRIO

${userPrompt}

## 📋 INSTRUÇÕES FINAIS

1. Use o contexto da base de conhecimento para criar HTMLs mais precisos
2. Aplique as metodologias e princípios mencionados nos documentos
3. Mantenha a consistência com o prompt mestre
4. Gere HTMLs que reflitam o conhecimento especializado disponível`;

    return enrichedPrompt;
  }

  /**
   * Lista todos os documentos disponíveis
   * @returns {Array<string>} Lista de nomes dos documentos
   */
  listAvailableDocuments() {
    const documents = this.loadKnowledgeDocuments();
    return documents.map(doc => doc.name);
  }

  /**
   * Busca documentos por palavras-chave
   * @param {string} keyword - Palavra-chave para busca
   * @returns {Array<Object>} Documentos que contêm a palavra-chave
   */
  searchDocuments(keyword) {
    const documents = this.loadKnowledgeDocuments();
    const keywordLower = keyword.toLowerCase();
    
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(keywordLower) ||
      doc.content.toLowerCase().includes(keywordLower)
    );
  }
}

module.exports = KnowledgeManager;
