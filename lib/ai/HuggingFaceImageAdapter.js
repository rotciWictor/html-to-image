class HuggingFaceImageAdapter {
  constructor({ apiKey = process.env.HF_API_KEY, model = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell' } = {}) {
    this.apiKey = apiKey;
    this.modelName = model;
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.modelName}`;
  }

  async generateImage(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('HF_API_KEY não configurada no .env. (Requerida para Hugging Face)');
    }

    const payload = {
      inputs: prompt,
      parameters: {
        width: options.width || 1024,
        height: options.height || 1024
      }
    };

    console.log(`   ├─ Hugging Face: Roteando para ${this.modelName}...`);

    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'image/*'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          
          // O HF Serverless pode devolver 503 quando o modelo está a aquecer (Cold Start)
          if (response.status === 503 && attempt < maxRetries) {
             let waitTime = 15;
             try { waitTime = JSON.parse(errText).estimated_time || 15; } catch(e){}
             console.log(`   ⏳ Modelo frio. Aguardando alocação de GPU na nuvem (${Math.ceil(waitTime)}s)...`);
             await new Promise(r => setTimeout(r, waitTime * 1000));
             continue;
          }
          
          throw new Error(`Hugging Face API Error ${response.status}: ${errText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (error) {
        if (attempt >= maxRetries) throw error;
      }
    }
  }

  async healthCheck() {
    return !!this.apiKey;
  }
}

module.exports = HuggingFaceImageAdapter;
