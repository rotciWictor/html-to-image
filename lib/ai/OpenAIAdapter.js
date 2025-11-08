/**
 * Adapter para provedores compatíveis com OpenAI (OpenAI, LocalAI, etc.)
 * Usa o endpoint /v1/chat/completions
 * 
 * TODO: WIP - Implementação básica, precisa testar com API real
 * TODO: Adicionar suporte a max_tokens, top_p, etc.
 * TODO: Melhorar tratamento de erros específicos da OpenAI
 */
class OpenAIAdapter {
  constructor({ apiKey = process.env.OPENAI_API_KEY, baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', model = process.env.OPENAI_MODEL || 'gpt-4o-mini' } = {}) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não encontrada. Configure no .env ou use OLLAMA_* para Ollama');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.modelName = model;
  }

  async generateContent(contents, config = {}) {
    try {
      const prompt = Array.isArray(contents) ? contents.join('\n') : String(contents);

      const body = {
        model: this.modelName,
        messages: [
          { role: 'system', content: 'Você é um gerador de HTMLs para conversão em imagens. Use o delimitador ---HTML--- para separar cada bloco HTML.' },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature ?? 0.7,
        max_tokens: config.max_tokens ?? 4000, // TODO: ajustar conforme necessário
        top_p: config.topP ?? 1.0
      };

      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        let errorMsg = `Erro OpenAI-compatible (${res.status})`;
        
        // Tratamento básico de erros comuns
        if (res.status === 401) {
          errorMsg = 'API Key inválida ou expirada (401)';
        } else if (res.status === 429) {
          errorMsg = 'Rate limit excedido (429) - tente novamente em alguns segundos';
        } else if (res.status === 500) {
          errorMsg = 'Erro interno do servidor OpenAI (500)';
        }
        
        throw new Error(`${errorMsg}: ${errorText}`);
      }

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta inválida do provedor OpenAI-compatível - sem conteúdo');
      }
      return content;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de rede ao conectar com OpenAI - verifique a URL base e conectividade');
      }
      throw error;
    }
  }

  /**
   * Health check básico - TODO: implementar teste real
   */
  async healthCheck() {
    try {
      // TODO: fazer um teste real com a API quando tiver chave para testar
      const testUrl = `${this.baseUrl}/models`;
      const res = await fetch(testUrl, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return res.ok;
    } catch (error) {
      console.warn('OpenAI health check falhou:', error.message);
      return false;
    }
  }
}

module.exports = OpenAIAdapter;

