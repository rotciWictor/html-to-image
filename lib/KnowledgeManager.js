const fs = require('fs');
const path = require('path');

class KnowledgeManager {
  constructor() {
    this.knowledgeDir = path.join(process.cwd(), 'knowledge');
    // Prioridade: prompt.txt na raiz (seu arquivo mestre)
    this.masterPromptPath = path.join(process.cwd(), 'prompt.txt'); 
    this.documentsDir = path.join(this.knowledgeDir, 'documents');
  }

  /**
   * Carrega as REGRAS MESTRAS de Design (seu arquivo prompt.txt)
   */
  loadMasterDesignRules() {
    if (fs.existsSync(this.masterPromptPath)) {
      console.log(`   📄 Regras de Design carregadas de: prompt.txt`);
      return fs.readFileSync(this.masterPromptPath, 'utf8');
    }
    
    // Fallback se não achar o arquivo
    console.warn('⚠️  prompt.txt não encontrado na raiz. Usando regras básicas.');
    return `REGRAS BÁSICAS: Crie designs limpos, profissionais e responsivos. Use fontes grandes.`;
  }

  /**
   * Carrega inspirações/templates extras da pasta knowledge
   */
  loadDesignInspirations() {
    let context = "";
    if (fs.existsSync(this.documentsDir)) {
      const files = fs.readdirSync(this.documentsDir);
      for (const file of files) {
        if (file.endsWith('.txt') || file.endsWith('.md')) {
          const content = fs.readFileSync(path.join(this.documentsDir, file), 'utf8');
          context += `\n--- REFERÊNCIA: ${file} ---\n${content}\n`;
        }
      }
    }
    return context;
  }

  /**
   * Monta o pacote completo para o Designer
   */
  getDesignerContext() {
    const masterRules = this.loadMasterDesignRules();
    const inspirations = this.loadDesignInspirations();
    return `${masterRules}\n\n${inspirations}`;
  }
}

module.exports = KnowledgeManager;