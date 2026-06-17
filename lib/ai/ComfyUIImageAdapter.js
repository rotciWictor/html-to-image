/**
 * Adapter para geração de imagens via ComfyUI local
 * Conecta ao servidor HTTP do ComfyUI (porta padrão: 8188)
 * 
 * Pré-requisitos:
 *   1. ComfyUI instalado e rodando: python main.py --listen
 *   2. Modelo Stable Diffusion baixado (ex: sd_xl_base_1.0.safetensors)
 *   3. Workflow exportado em formato API (Dev Mode > Save API Format)
 */
class ComfyUIImageAdapter {
  constructor({ baseUrl = process.env.COMFYUI_URL || 'http://127.0.0.1:8188' } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.clientId = `h2i-${Date.now()}`;
  }

  /**
   * Gera uma imagem a partir de um prompt textual usando ComfyUI
   * @param {string} prompt - Descrição da imagem desejada
   * @param {Object} config - Configurações (width, height, steps, etc.)
   * @returns {Promise<Buffer>} Buffer da imagem PNG gerada
   */
  async generateImage(prompt, config = {}) {
    const width = config.width || 1024;
    const height = config.height || 1024;
    const steps = config.steps || 20;
    const cfgScale = config.cfgScale || 7;
    const checkpoint = config.checkpoint || 'sd_xl_base_1.0.safetensors';

    // Workflow mínimo SDXL para text-to-image
    const workflow = {
      "3": {
        "class_type": "KSampler",
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000000),
          "steps": steps,
          "cfg": cfgScale,
          "sampler_name": "euler",
          "scheduler": "normal",
          "denoise": 1,
          "model": ["4", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": ["5", 0]
        }
      },
      "4": {
        "class_type": "CheckpointLoaderSimple",
        "inputs": { "ckpt_name": checkpoint }
      },
      "5": {
        "class_type": "EmptyLatentImage",
        "inputs": { "width": width, "height": height, "batch_size": 1 }
      },
      "6": {
        "class_type": "CLIPTextEncode",
        "inputs": { "text": prompt, "clip": ["4", 1] }
      },
      "7": {
        "class_type": "CLIPTextEncode",
        "inputs": { "text": "blurry, bad quality, distorted, ugly, text, watermark", "clip": ["4", 1] }
      },
      "8": {
        "class_type": "VAEDecode",
        "inputs": { "samples": ["3", 0], "vae": ["4", 2] }
      },
      "9": {
        "class_type": "SaveImage",
        "inputs": { "filename_prefix": "h2i-gen", "images": ["8", 0] }
      }
    };

    try {
      console.log(`[ComfyUI] Gerando imagem ${width}x${height} (${steps} steps)...`);

      // 1. Enfileirar o prompt
      const queueRes = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: workflow, client_id: this.clientId })
      });

      if (!queueRes.ok) {
        const errText = await queueRes.text().catch(() => '');
        throw new Error(`ComfyUI rejeitou o workflow: ${queueRes.status} - ${errText}`);
      }

      const { prompt_id } = await queueRes.json();
      console.log(`[ComfyUI] Job enfileirado: ${prompt_id}. Aguardando processamento...`);

      // 2. Polling do histórico até a imagem ficar pronta
      const imageBuffer = await this._waitForResult(prompt_id);
      return imageBuffer;

    } catch (error) {
      if (error.cause && error.cause.code === 'ECONNREFUSED') {
        throw new Error('Não foi possível conectar ao ComfyUI. Verifique se ele está rodando (python main.py --listen).');
      }
      throw new Error(`Erro no ComfyUI: ${error.message}`);
    }
  }

  async _waitForResult(promptId, timeoutMs = 120000) {
    const start = Date.now();
    const pollInterval = 2000;

    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, pollInterval));
      
      try {
        const histRes = await fetch(`${this.baseUrl}/history/${promptId}`);
        if (!histRes.ok) continue;
        
        const history = await histRes.json();
        const job = history[promptId];
        
        if (job && job.outputs) {
          // Encontrar o nó de SaveImage e pegar o filename
          for (const nodeId of Object.keys(job.outputs)) {
            const output = job.outputs[nodeId];
            if (output.images && output.images.length > 0) {
              const { filename, type } = output.images[0];
              console.log(`[ComfyUI] Imagem gerada! Baixando: ${filename}`);
              
              const imgRes = await fetch(`${this.baseUrl}/view?filename=${filename}&type=${type || 'output'}`);
              if (!imgRes.ok) throw new Error('Falha ao baixar imagem do ComfyUI');
              
              const arrayBuffer = await imgRes.arrayBuffer();
              return Buffer.from(arrayBuffer);
            }
          }
        }
      } catch (e) {
        // Continua tentando até o timeout
      }
      
      process.stdout.write('.');
    }

    throw new Error(`Timeout: ComfyUI não terminou a geração em ${timeoutMs / 1000}s`);
  }

  async healthCheck() {
    try {
      const res = await fetch(`${this.baseUrl}/system_stats`);
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

module.exports = ComfyUIImageAdapter;
