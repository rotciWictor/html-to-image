const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CacheManager {
  constructor(namespace = 'general') {
    this.cacheDir = path.join(process.cwd(), '.cache', namespace);
    this.enabled = process.env.NO_CACHE !== 'true';
    
    if (this.enabled && !fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Gera uma chave única baseada no conteúdo e opções
   */
  generateKey(content, options = {}) {
    const data = JSON.stringify({ content, options });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Tenta recuperar um valor do cache
   */
  get(content, options = {}) {
    if (!this.enabled) return null;

    const key = this.generateKey(content, options);
    const filePath = path.join(this.cacheDir, `${key}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Opcional: Adicionar expiração aqui se necessário
        return cachedData.value;
      } catch (err) {
        console.warn(`⚠️ Cache corrompido para ${key}, ignorando.`);
      }
    }
    return null;
  }

  /**
   * Salva um valor no cache
   */
  set(content, value, options = {}) {
    if (!this.enabled) return;

    const key = this.generateKey(content, options);
    const filePath = path.join(this.cacheDir, `${key}.json`);

    const data = {
      timestamp: Date.now(),
      input: content, // Útil para debug
      options: options,
      value: value
    };

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn(`⚠️ Falha ao salvar cache: ${err.message}`);
    }
  }

  /**
   * Limpa o cache
   */
  clear() {
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true, force: true });
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }
}

module.exports = CacheManager;