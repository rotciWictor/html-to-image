/**
 * Adapter para integração com Ollama (local)
 * Usa a API HTTP do Ollama: POST /api/generate
 * Requer Node >=18 (fetch global disponível)
 */
class OllamaAdapter {
  constructor({ baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434', model = process.env.OLLAMA_MODEL || 'gpt-oss:latest', apiKey } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.modelName = model;
    this.apiKey = apiKey; // não é usado no Ollama, mas mantido pela interface comum
  }

  /**
   * Gera conteúdo usando o Ollama
   * @param {string|Array} contents - Conteúdo (string preferencial)
   * @param {Object} config - Configurações adicionais (temperature, etc.)
   * @returns {Promise<string>} Texto de resposta
   */
  async generateContent(contents, config = {}) {
    const prompt = Array.isArray(contents) ? contents.join('\n') : String(contents);

    const body = {
      model: this.modelName,
      prompt,
      stream: false,
      options: {
        temperature: config.temperature ?? 0.7
      }
    };

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Erro Ollama (${res.status}): ${text}`);
    }

    const json = await res.json();
    if (!json || typeof json.response !== 'string') {
      throw new Error('Resposta inválida do Ollama');
    }
    return json.response;
  }

  async healthCheck() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

module.exports = OllamaAdapter;

