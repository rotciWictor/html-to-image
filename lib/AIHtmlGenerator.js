const fs = require('fs');
const path = require('path');
const OllamaAdapter = require('./ai/OllamaAdapter');
const KnowledgeManager = require('./KnowledgeManager');
const FolderNameGenerator = require('./FolderNameGenerator');

/**
 * AI Content Factory V4 (Fixed)
 * - Corrige chamada ao KnowledgeManager (getDesignerContext).
 * - Mantém fluxo Designer -> Cache -> Coder.
 */
class AIHtmlGenerator {
  constructor() {
    this.providerName = 'ollama';
    this.knowledgeManager = new KnowledgeManager();

    // Modelos
    const designerModel = process.env.AI_DESIGNER_MODEL || 'qwen2.5:14b-instruct'; 
    const coderModel = process.env.AI_CODER_MODEL || 'qwen2.5-coder:14b';

    console.log(`🏭 Fábrica de Conteúdo Iniciada:`);
    console.log(`   🎨 Designer: ${designerModel}`);
    console.log(`   👨‍💻 Coder:    ${coderModel}`);

    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    this.designerAdapter = new OllamaAdapter({ baseUrl, model: designerModel });
    this.coderAdapter = new OllamaAdapter({ baseUrl, model: coderModel });
  }

  async generateAndSave({ prompt, count = 5, preset = 'instagram', relevantDocs = null } = {}) {
    if (!prompt) throw new Error('Prompt é obrigatório');

    console.log(`\n🚀 Novo Projeto: "${prompt}"`);

    // 1. Setup de Pastas
    const baseDir = path.join(process.cwd(), 'work', 'htmls', 'ai');
    const friendlyName = FolderNameGenerator.generateThemedName(
      prompt,
      preset,
      count
    );
    const outputDir = path.join(baseDir, friendlyName);
    const blueprintPath = path.join(outputDir, 'blueprint.txt');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 2. Blueprint (Cache ou Novo)
    let blueprint;
    
    if (fs.existsSync(blueprintPath)) {
      console.log(`   📂 Blueprint encontrado em cache! Pulando etapa de Design.`);
      console.log(`   📄 Lendo: ${blueprintPath}`);
      blueprint = fs.readFileSync(blueprintPath, 'utf8');
    } else {
      console.log(`   🎨 [1/2] Designer: Criando novo blueprint...`);
      
      const context = this.buildProjectContext({ prompt, count, preset, relevantDocs });
      blueprint = await this.runDesignerStep(context);
      
      fs.writeFileSync(blueprintPath, blueprint, 'utf8');
      console.log(`   💾 Blueprint salvo em: ${blueprintPath}`);
    }

    // 3. Coder
    console.log(`   👨‍💻 [2/2] Coder: Convertendo blueprint em código...`);
    const rawHtmlResponse = await this.runCoderStep(blueprint, count);

    // 4. Parse e Salvar
    const htmls = this.parseCoderResponse(rawHtmlResponse, count, preset);
    
    for (const { filename, html } of htmls) {
      fs.writeFileSync(path.join(outputDir, filename), html, 'utf8');
    }
    
    console.log(`✅ ${htmls.length} HTMLs gerados em: ${outputDir}`);
    return outputDir;
  }

  // --- CORREÇÃO AQUI ---
  buildProjectContext({ prompt, count, preset, relevantDocs }) {
    const presets = {
      instagram: { width: 1080, height: 1440, name: 'Instagram Post' },
      stories: { width: 1080, height: 1920, name: 'Instagram Stories' },
      ppt: { width: 1920, height: 1080, name: 'PowerPoint Slide' },
      generic: { width: 1200, height: 800, name: 'Genérico' }
    };
    const p = presets[preset] || presets.instagram;

    // CORRIGIDO: Usa o método correto do KnowledgeManager atualizado
    const designContext = this.knowledgeManager.getDesignerContext();

    return `PROJETO / TEMA:
"${prompt}"

REGRAS DE DESIGN E INSPIRAÇÃO:
${designContext}

ESPECIFICAÇÕES TÉCNICAS:
- Formato: ${p.name}
- Dimensões: ${p.width}x${p.height}px
- Quantidade: ${count} slides
- Objetivo: Blueprint detalhado para produção de HTML.`;
  }

  async runDesignerStep(projectContext) {
    const designerSystemPrompt = `=== AI-DESIGNER (Blueprint Generator) ===
Você é um Arquiteto Editorial.
Sua tarefa: Gerar um BLUEPRINT DETALHADO (plano de texto) para um projeto visual.
NÃO ESCREVA CÓDIGO HTML/CSS. Apenas planeje.

REGRAS:
1. Use as Regras de Design fornecidas para definir o estilo.
2. Defina o TEXTO FINAL de cada slide.
3. Defina a PALETA DE CORES (Hex) e TIPOGRAFIA.

FORMATO DE SAÍDA:
1. METADATA (Tema, Dimensões)
2. ESTILO (Cores, Fontes)
3. ROTEIRO (Para CADA slide):
   - SLIDE X:
     - Título: "..."
     - Texto: "..."
     - Visual: Descrição do layout
4. CHECKLIST TÉCNICO

Contexto:
---
${projectContext}
---`;

    return await this.designerAdapter.generateContent(designerSystemPrompt, { temperature: 0.7 });
  }

  async runCoderStep(blueprint, count) {
    const coderSystemPrompt = `=== AI-CODER (HTML Builder) ===
Você é um Desenvolvedor Front-end.
Tarefa: Converter o BLUEPRINT em HTML5/CSS puro.

REGRAS CRÍTICAS:
1. Use APENAS CSS INLINE (style="...").
2. Siga as dimensões e cores do Blueprint.
3. Container fixo: <div style="width:[W]px; height:[H]px; position:relative; overflow:hidden;">
4. Inclua a assinatura: <div style="position:absolute; bottom:40px; right:40px; opacity:0.6; z-index:99; font-family:sans-serif;">@era.outro.meu.plano</div>
5. SEPARE OS ARQUIVOS COM: ---FILE_START---

Blueprint:
---
${blueprint}
---

Gere os ${count} arquivos HTML agora:`;

    return await this.coderAdapter.generateContent(coderSystemPrompt, { temperature: 0.1 });
  }

  parseCoderResponse(rawResponse, count, preset) {
    const parts = rawResponse
      .split(/---FILE_START---/g)
      .map(s => s.trim())
      .filter(s => s.toLowerCase().includes('<!doctype html>'));

    if (parts.length === 0) {
      // Fallback
      const codeBlocks = rawResponse.match(/```html([\s\S]*?)```/g);
      if (codeBlocks) {
        return codeBlocks.map((block, i) => ({
          filename: `ai-slide-${String(i + 1).padStart(2, '0')}.html`,
          html: block.replace(/```html|```/g, '').trim()
        })).slice(0, count);
      }
      throw new Error('O Coder não gerou blocos HTML válidos.');
    }

    return parts.slice(0, count).map((html, index) => {
      let cleanHtml = html.replace(/```html|```/g, '').trim();
      
      if (!cleanHtml.includes('id="h2i-config"')) {
        const presets = { instagram: { w: 1080, h: 1440 }, ppt: { w: 1920, h: 1080 } };
        const p = presets[preset] || presets.instagram;
        const configScript = `<script id="h2i-config" type="application/json">{ "width": ${p.w}, "height": ${p.h}, "format": "png", "deviceScaleFactor": 2 }</script>`;
        cleanHtml = cleanHtml.replace('<head>', `<head>\n${configScript}`);
      }

      return {
        filename: `ai-slide-${String(index + 1).padStart(2, '0')}.html`,
        html: cleanHtml
      };
    });
  }

  listAvailableDocuments() { return this.knowledgeManager.listAvailableDocuments(); }
  searchDocuments(keyword) { return this.knowledgeManager.searchDocuments(keyword); }
}

module.exports = AIHtmlGenerator;