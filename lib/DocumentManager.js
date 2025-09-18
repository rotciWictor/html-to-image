const fs = require('fs');
const path = require('path');

/**
 * Gerenciador de base de conhecimento pessoal
 * Permite consultar documentos, prompts e conhecimento estruturado
 */
class DocumentManager {
  constructor() {
    this.knowledgeDir = path.join(process.cwd(), 'knowledge');
    this.documentsDir = path.join(this.knowledgeDir, 'documents');
    this.promptsDir = path.join(this.knowledgeDir, 'prompts');
  }

  /**
   * Lista todos os documentos disponíveis
   * @returns {Array<Object>} Lista de documentos com metadados
   */
  listDocuments() {
    const documents = [];
    
    if (fs.existsSync(this.documentsDir)) {
      const files = this.scanDirectory(this.documentsDir);
      files.forEach(file => {
        documents.push({
          type: 'document',
          name: path.basename(file),
          path: file,
          relativePath: path.relative(this.documentsDir, file),
          extension: path.extname(file),
          size: fs.statSync(file).size,
          modified: fs.statSync(file).mtime
        });
      });
    }
    
    return documents;
  }

  /**
   * Lista todos os prompts disponíveis
   * @returns {Array<Object>} Lista de prompts
   */
  listPrompts() {
    const prompts = [];
    
    if (fs.existsSync(this.promptsDir)) {
      const files = this.scanDirectory(this.promptsDir);
      files.forEach(file => {
        if (['.md', '.txt'].includes(path.extname(file))) {
          prompts.push({
            type: 'prompt',
            name: path.basename(file, path.extname(file)),
            path: file,
            relativePath: path.relative(this.promptsDir, file),
            modified: fs.statSync(file).mtime
          });
        }
      });
    }
    
    return prompts;
  }

  /**
   * Lista base de conhecimento
   * @returns {Array<Object>} Lista de conhecimento estruturado
   */
  listKnowledge() {
    const knowledge = [];
    
    if (fs.existsSync(this.knowledgeDir)) {
      const files = this.scanDirectory(this.knowledgeDir);
      files.forEach(file => {
        knowledge.push({
          type: 'knowledge',
          name: path.basename(file),
          path: file,
          relativePath: path.relative(this.knowledgeDir, file),
          extension: path.extname(file),
          category: this.extractCategory(file),
          modified: fs.statSync(file).mtime
        });
      });
    }
    
    return knowledge;
  }

  /**
   * Carrega um prompt específico
   * @param {string} promptName - Nome do prompt (sem extensão)
   * @returns {string} Conteúdo do prompt
   */
  loadPrompt(promptName) {
    const prompts = this.listPrompts();
    const prompt = prompts.find(p => p.name === promptName);
    
    if (!prompt) {
      throw new Error(`Prompt '${promptName}' não encontrado. Prompts disponíveis: ${prompts.map(p => p.name).join(', ')}`);
    }
    
    return fs.readFileSync(prompt.path, 'utf8');
  }

  /**
   * Carrega conteúdo de documentos específicos
   * @param {Array<string>} documentNames - Nomes dos documentos
   * @returns {Array<Object>} Documentos carregados com conteúdo
   */
  loadDocuments(documentNames) {
    const documents = this.listDocuments();
    const loadedDocs = [];
    
    documentNames.forEach(docName => {
      const doc = documents.find(d => 
        d.name === docName || 
        d.relativePath === docName ||
        d.name.includes(docName)
      );
      
      if (doc) {
        const content = this.readFileContent(doc.path, doc.extension);
        loadedDocs.push({
          ...doc,
          content: content
        });
      } else {
        console.warn(`⚠️  Documento '${docName}' não encontrado`);
      }
    });
    
    return loadedDocs;
  }

  /**
   * Carrega conhecimento de uma categoria específica
   * @param {string} category - Categoria do conhecimento
   * @returns {Array<Object>} Conhecimento da categoria
   */
  loadKnowledgeByCategory(category) {
    const knowledge = this.listKnowledge();
    const categoryKnowledge = knowledge.filter(k => k.category === category);
    
    return categoryKnowledge.map(k => ({
      ...k,
      content: this.readFileContent(k.path, k.extension)
    }));
  }

  /**
   * Constrói contexto para o prompt baseado em documentos e conhecimento
   * @param {Object} options - Opções de contexto
   * @returns {string} Contexto formatado
   */
  buildContext(options = {}) {
    const { documents = [], knowledge = [], includeMetadata = false } = options;
    let context = '';
    
    // Adicionar documentos
    if (documents.length > 0) {
      const loadedDocs = this.loadDocuments(documents);
      context += '\n## 📄 Documentos de Referência:\n\n';
      
      loadedDocs.forEach(doc => {
        context += `### ${doc.name}\n`;
        if (includeMetadata) {
          context += `- **Tipo**: ${doc.extension}\n`;
          context += `- **Modificado**: ${doc.modified.toLocaleDateString()}\n`;
        }
        context += `\`\`\`\n${doc.content}\n\`\`\`\n\n`;
      });
    }
    
    // Adicionar conhecimento
    if (knowledge.length > 0) {
      context += '\n## 🧠 Base de Conhecimento:\n\n';
      
      knowledge.forEach(category => {
        const categoryData = this.loadKnowledgeByCategory(category);
        categoryData.forEach(item => {
          context += `### ${item.name} (${category})\n`;
          context += `\`\`\`\n${item.content}\n\`\`\`\n\n`;
        });
      });
    }
    
    return context;
  }

  /**
   * Escaneia diretório recursivamente
   * @param {string} dir - Diretório para escanear
   * @returns {Array<string>} Lista de arquivos
   */
  scanDirectory(dir) {
    const files = [];
    
    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          scan(itemPath);
        } else if (stats.isFile() && !item.startsWith('.')) {
          files.push(itemPath);
        }
      });
    };
    
    scan(dir);
    return files;
  }

  /**
   * Extrai categoria do caminho do arquivo
   * @param {string} filePath - Caminho do arquivo
   * @returns {string} Categoria extraída
   */
  extractCategory(filePath) {
    const relativePath = path.relative(this.knowledgeDir, filePath);
    const parts = relativePath.split(path.sep);
    return parts.length > 1 ? parts[0] : 'geral';
  }

  /**
   * Lê conteúdo do arquivo baseado na extensão
   * @param {string} filePath - Caminho do arquivo
   * @param {string} extension - Extensão do arquivo
   * @returns {string} Conteúdo processado
   */
  readFileContent(filePath, extension) {
    try {
      switch (extension.toLowerCase()) {
        case '.json':
          const jsonContent = fs.readFileSync(filePath, 'utf8');
          return JSON.stringify(JSON.parse(jsonContent), null, 2);
        
        case '.yaml':
        case '.yml':
          return fs.readFileSync(filePath, 'utf8');
        
        case '.md':
        case '.txt':
          return fs.readFileSync(filePath, 'utf8');
        
        case '.csv':
          return fs.readFileSync(filePath, 'utf8');
        
        default:
          return `[Arquivo ${extension} - conteúdo não suportado para leitura automática]`;
      }
    } catch (error) {
      return `[Erro ao ler arquivo: ${error.message}]`;
    }
  }

  /**
   * Cria índice de todos os recursos disponíveis
   * @returns {Object} Índice completo
   */
  createIndex() {
    return {
      documents: this.listDocuments(),
      prompts: this.listPrompts(),
      knowledge: this.listKnowledge(),
      summary: {
        totalDocuments: this.listDocuments().length,
        totalPrompts: this.listPrompts().length,
        totalKnowledge: this.listKnowledge().length,
        knowledgeCategories: [...new Set(this.listKnowledge().map(k => k.category))]
      }
    };
  }
}

module.exports = DocumentManager;
