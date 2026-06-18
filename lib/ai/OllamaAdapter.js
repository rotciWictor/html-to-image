/**
 * Adapter para integração com Ollama (local)
 * Usa a API HTTP do Ollama: POST /api/generate
 * Requer Node >=18 (fetch global disponível)
 *
 * Focado em estabilidade para uso com Llama 3.2 em tradução.
 */
class OllamaAdapter {
  constructor({ baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434', model } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '').trim() || 'http://localhost:11434';
    // Modelo padrão e único usado em tradução neste projeto
    this.modelName = model || process.env.OLLAMA_TRANSLATE_MODEL || 'llama3.2:3b';
  }

  /**
   * Gera conteúdo usando o Ollama
   * @param {string|Array} contents - Conteúdo (string preferencial)
   * @param {Object} config - Configurações adicionais (temperature, images, etc.)
   * @returns {Promise<string>} Texto de resposta
   */
  async generateContent(contents, config = {}) {
    try {
      const prompt = Array.isArray(contents) ? contents.join('\n') : String(contents);
      const url = `${this.baseUrl}/api/generate`;

      const payload = {
        model: this.modelName,
        prompt,
        stream: !!config.onChunk,
        options: {
          temperature: config.temperature ?? 0.3,
          num_ctx: 8192
        }
      };

      if (config.images) {
        payload.images = config.images;
      }

      if (config.format) {
        payload.format = config.format;
      }

      console.log(`\n🦙 [Ollama] Disparando modelo local: ${this.modelName}`);
      console.log(`   ├─ Servidor: ${this.baseUrl}`);
      console.log(`   ├─ Contexto: ${payload.options.num_ctx} tokens`);
      if (config.format) console.log(`   ├─ Formato restrito: ${config.format}`);
      if (config.images) console.log(`   ├─ Visão computacional: Ativada (${config.images.length} imagem)`);
      console.log(`   └─ Temperatura: ${payload.options.temperature}`);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Ollama API Error: ${res.status} ${res.statusText} - ${text}`);
      }

      if (!config.onChunk) {
        const json = await res.json();
        if (!json) throw new Error('Ollama respondeu com JSON vazio');
        if (json.error) throw new Error(`Ollama Server Error: ${json.error}`);
        if (typeof json.response !== 'string') throw new Error('Resposta inválida do Ollama: campo "response" ausente');
        return json.response;
      }

      // Leitura via Stream (muito mais rápido para UX)
      let fullText = '';
      const decoder = new TextDecoder('utf-8');
      
      for await (const chunk of res.body) {
        const chunkStr = decoder.decode(chunk, { stream: true });
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.error) throw new Error(`Ollama Stream Error: ${data.error}`);
            if (data.response) {
              fullText += data.response;
              config.onChunk(data.response);
            }
          } catch(e) {
            // ignorar parse errors de chunks quebrados
          }
        }
      }
      return fullText;
    } catch (error) {
      // Melhorar mensagem em caso de problemas de conexão
      if (error.cause && error.cause.code === 'ECONNREFUSED') {
        throw new Error('Não foi possível conectar ao Ollama. Verifique se o servidor está rodando.');
      }
      throw error;
    }
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

