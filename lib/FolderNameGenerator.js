/**
 * Gerador de nomes de pasta amigáveis
 * Cria títulos baseados no prompt da IA + timestamp
 */
class FolderNameGenerator {
  /**
   * Gera um nome de pasta amigável baseado no prompt
   * @param {string} prompt - Prompt do usuário
   * @param {string} preset - Preset usado (instagram, stories, etc.)
   * @param {number} slides - Quantidade de slides
   * @returns {string} Nome da pasta amigável
   */
  static generateFriendlyName(prompt, preset = 'instagram', slides = 6) {
    // Limpar e normalizar o prompt
    let cleanPrompt = prompt
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .substring(0, 50); // Limita a 50 caracteres

    // Se o prompt for muito curto ou vazio, usar um nome genérico
    if (cleanPrompt.length < 3) {
      cleanPrompt = 'conteudo-gerado';
    }

    // Adicionar informações do preset
    const presetNames = {
      instagram: 'ig',
      stories: 'stories',
      ppt: 'ppt',
      generic: 'gen'
    };
    const presetSuffix = presetNames[preset] || 'gen';

    // Adicionar quantidade de slides
    const slidesSuffix = `${slides}slides`;

    // Gerar timestamp curto (apenas data e hora)
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .substring(0, 13); // YYYYMMDDTHHMM

    // Montar nome final
    const friendlyName = `${cleanPrompt}-${presetSuffix}-${slidesSuffix}-${timestamp}`;

    return friendlyName;
  }

  /**
   * Gera um nome de pasta com base em palavras-chave extraídas do prompt
   * @param {string} prompt - Prompt do usuário
   * @param {string} preset - Preset usado
   * @param {number} slides - Quantidade de slides
   * @returns {string} Nome da pasta baseado em palavras-chave
   */
  static generateKeywordBasedName(prompt, preset = 'instagram', slides = 6) {
    // Palavras-chave comuns para identificar o tema
    const keywords = this.extractKeywords(prompt);
    
    // Preset names
    const presetNames = {
      instagram: 'ig',
      stories: 'stories', 
      ppt: 'ppt',
      generic: 'gen'
    };

    // Montar nome baseado nas palavras-chave
    let baseName = keywords.length > 0 ? keywords.join('-') : 'conteudo';
    
    // Limitar tamanho
    if (baseName.length > 30) {
      baseName = baseName.substring(0, 30);
    }

    const presetSuffix = presetNames[preset] || 'gen';
    const slidesSuffix = `${slides}slides`;
    
    // Timestamp curto
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .substring(8, 13); // HHMM

    return `${baseName}-${presetSuffix}-${slidesSuffix}-${timestamp}`;
  }

  /**
   * Extrai palavras-chave relevantes do prompt
   * @param {string} prompt - Prompt do usuário
   * @returns {Array<string>} Array de palavras-chave
   */
  static extractKeywords(prompt) {
    const text = prompt.toLowerCase();
    
    // Palavras-chave comuns em marketing/conteúdo
    const commonKeywords = [
      'produtividade', 'marketing', 'vendas', 'comunicacao', 'gestao',
      'lideranca', 'inovacao', 'criatividade', 'estrategia', 'negocios',
      'carreira', 'sucesso', 'motivacao', 'aprendizado', 'desenvolvimento',
      'tecnologia', 'digital', 'social', 'conteudo', 'apresentacao',
      'dicas', 'guia', 'tutorial', 'curso', 'treinamento'
    ];

    const keywords = [];
    
    // Buscar palavras-chave conhecidas
    for (const keyword of commonKeywords) {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    }

    // Se não encontrou palavras-chave conhecidas, extrair palavras importantes
    if (keywords.length === 0) {
      const words = text
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !this.isStopWord(word))
        .slice(0, 3); // Máximo 3 palavras
      
      keywords.push(...words);
    }

    return keywords.slice(0, 3); // Máximo 3 palavras-chave
  }

  /**
   * Verifica se uma palavra é uma stop word (palavra comum sem significado)
   * @param {string} word - Palavra para verificar
   * @returns {boolean} True se for stop word
   */
  static isStopWord(word) {
    const stopWords = [
      'para', 'com', 'sobre', 'como', 'quando', 'onde', 'porque',
      'criar', 'fazer', 'gerar', 'slides', 'conteudo', 'sobre',
      'dicas', 'guia', 'tutorial', 'curso', 'apresentacao'
    ];
    return stopWords.includes(word);
  }

  /**
   * Gera nome de pasta com tema específico
   * @param {string} prompt - Prompt do usuário
   * @param {string} preset - Preset usado
   * @param {number} slides - Quantidade de slides
   * @returns {string} Nome da pasta com tema
   */
  static generateThemedName(prompt, preset = 'instagram', slides = 6) {
    const theme = this.detectTheme(prompt);
    const keywords = this.extractKeywords(prompt);
    
    const presetNames = {
      instagram: 'ig',
      stories: 'stories',
      ppt: 'ppt', 
      generic: 'gen'
    };

    // Montar nome base evitando duplicação
    let baseName = theme;
    const uniqueKeywords = keywords.filter(keyword => keyword !== theme);
    
    if (uniqueKeywords.length > 0) {
      baseName += '-' + uniqueKeywords.slice(0, 2).join('-');
    }

    // Limitar tamanho total
    if (baseName.length > 40) {
      baseName = baseName.substring(0, 40);
    }

    const presetSuffix = presetNames[preset] || 'gen';
    const slidesSuffix = `${slides}slides`;
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .substring(8, 13);

    return `${baseName}-${presetSuffix}-${slidesSuffix}-${timestamp}`;
  }

  /**
   * Detecta o tema principal do prompt
   * @param {string} prompt - Prompt do usuário
   * @returns {string} Tema detectado
   */
  static detectTheme(prompt) {
    const text = prompt.toLowerCase();
    
    if (text.includes('produtividade') || text.includes('eficiencia')) return 'produtividade';
    if (text.includes('marketing') || text.includes('vendas')) return 'marketing';
    if (text.includes('comunicacao') || text.includes('apresentacao')) return 'comunicacao';
    if (text.includes('gestao') || text.includes('lideranca')) return 'gestao';
    if (text.includes('criatividade') || text.includes('inovacao')) return 'criatividade';
    if (text.includes('tecnologia') || text.includes('digital')) return 'tecnologia';
    if (text.includes('carreira') || text.includes('sucesso')) return 'carreira';
    
    return 'conteudo';
  }
}

module.exports = FolderNameGenerator;
