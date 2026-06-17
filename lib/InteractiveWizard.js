const prompts = require('prompts');
const fs = require('fs');
const path = require('path');

class InteractiveWizard {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.workFolder = path.resolve(process.cwd(), 'work', 'htmls');
  }

  async run() {
    console.log('\n✨ Bem-vindo ao HTML to Image Converter ✨');
    
    let numFiles = 0;
    if (fs.existsSync(this.workFolder)) {
      const files = fs.readdirSync(this.workFolder).filter(f => f.endsWith('.html'));
      numFiles = files.length;
    }

    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'O que você deseja fazer?',
      choices: [
        { 
          title: `🚀 Converter TODOS os HTMLs (${numFiles} arquivo${numFiles !== 1 ? 's' : ''} em work/htmls)`, 
          value: 'convert',
          description: 'Modo expresso: lê a pasta padrão e converte tudo imediatamente'
        },
        { 
          title: '🎯 Converter HTMLs específicos', 
          value: 'convert_specific',
          description: 'Escolha exatamente quais arquivos HTML você quer converter'
        },
        { 
          title: '🤖 Gerar novos HTMLs com IA (Gemini/Ollama)', 
          value: 'ai',
          description: 'Cria novos templates conversando com uma Inteligência Artificial'
        },
        { 
          title: '🌍 Traduzir TODOS os HTMLs (Multi-Agente)', 
          value: 'translate',
          description: 'Traduz TODOS os textos da pasta para outro idioma mantendo o código'
        },
        { 
          title: '🌐 Traduzir HTMLs específicos', 
          value: 'translate_specific',
          description: 'Escolha exatamente quais arquivos você quer traduzir'
        },
        { 
          title: '📝 Criar um arquivo HTML vazio (Template Base)', 
          value: 'create',
          description: 'Gera um arquivo limpo e estruturado para você editar manualmente'
        },
        { 
          title: '❌ Sair', 
          value: 'exit' 
        }
      ],
      initial: 0
    });

    if (!response.action || response.action === 'exit') {
      console.log('👋 Até logo!');
      process.exit(0);
    }

    if (response.action === 'convert') {
      console.log(`\nIniciando conversão da pasta: ${this.workFolder}`);
      const stats = await this.orchestrator.processFolder(this.workFolder, {});
      return stats;
    }

    if (response.action === 'convert_specific') {
      if (!fs.existsSync(this.workFolder)) {
        console.log('❌ Pasta work/htmls não encontrada. Nenhum arquivo para converter.');
        process.exit(0);
      }
      const htmlFiles = fs.readdirSync(this.workFolder).filter(f => f.endsWith('.html'));
      if (htmlFiles.length === 0) {
        console.log('❌ Nenhum arquivo .html encontrado em work/htmls.');
        process.exit(0);
      }

      const selectResponse = await prompts({
        type: 'multiselect',
        name: 'files',
        message: 'Selecione os arquivos para converter (Espaço para marcar, Enter para confirmar):',
        choices: htmlFiles.map(f => ({ title: f, value: f })),
        hint: '- Espaço para selecionar, Enter para confirmar'
      });

      if (!selectResponse.files || selectResponse.files.length === 0) {
        console.log('Nenhum arquivo selecionado.');
        process.exit(0);
      }

      console.log(`\n🎯 Convertendo ${selectResponse.files.length} arquivo(s) selecionado(s)...`);
      const filePaths = selectResponse.files.map(f => path.join(this.workFolder, f));
      return await this.orchestrator.convertFiles(filePaths, {});
    }

    if (response.action === 'translate' || response.action === 'translate_specific') {
      let filesToTranslate = [];
      
      if (response.action === 'translate_specific') {
        if (!fs.existsSync(this.workFolder)) {
          console.log('❌ Pasta work/htmls não encontrada.');
          process.exit(0);
        }
        const htmlFiles = fs.readdirSync(this.workFolder).filter(f => f.endsWith('.html') && !f.endsWith('_preview.html'));
        if (htmlFiles.length === 0) {
          console.log('❌ Nenhum arquivo .html encontrado.');
          process.exit(0);
        }

        const selectResponse = await prompts({
          type: 'multiselect',
          name: 'files',
          message: 'Selecione os arquivos para traduzir (Espaço marca, Enter confirma):',
          choices: htmlFiles.map(f => ({ title: f, value: f })),
          hint: '- Espaço seleciona, Enter confirma'
        });

        if (!selectResponse.files || selectResponse.files.length === 0) {
          console.log('Operação cancelada.');
          process.exit(0);
        }
        filesToTranslate = selectResponse.files.map(f => path.join(this.workFolder, f));
      }

      const transResponse = await prompts([
        {
          type: 'text',
          name: 'targetLang',
          message: 'Para qual idioma você quer traduzir? (ex: en, es, fr, pt):',
          initial: 'en',
          validate: text => text.length >= 2 ? true : 'Digite um código válido (ex: en)'
        },
        {
          type: 'select',
          name: 'provider',
          message: 'Qual provedor de IA você deseja usar?',
          choices: [
            { title: 'Ollama (Local / Gratuito - Recomendado)', value: 'ollama' },
            { title: 'Google Gemini', value: 'gemini' },
            { title: 'OpenAI (ChatGPT)', value: 'openai' }
          ],
          initial: 0
        }
      ]);

      if (!transResponse.targetLang) {
        console.log('Operação cancelada.');
        process.exit(0);
      }

      if (response.action === 'translate') {
        console.log(`\n🌍 Iniciando tradução de TODOS os arquivos para '${transResponse.targetLang}' usando ${transResponse.provider}...`);
        return await this.orchestrator.processFolder(this.workFolder, {
          translate: transResponse.targetLang,
          provider: transResponse.provider
        });
      } else {
        console.log(`\n🌐 Traduzindo ${filesToTranslate.length} arquivo(s) para '${transResponse.targetLang}'...`);
        const translatedFiles = await this.orchestrator.translateHtmlFiles(filesToTranslate, {
          translate: transResponse.targetLang,
          provider: transResponse.provider
        });
        
        console.log(`\n📸 Gerando imagens para os arquivos traduzidos...`);
        return await this.orchestrator.convertFiles(translatedFiles, {});
      }
    }

    if (response.action === 'ai') {
      const aiResponse = await prompts([
        {
          type: 'select',
          name: 'provider',
          message: 'Qual provedor de IA você deseja usar?',
          choices: [
            { title: 'Ollama (Local / Gratuito)', value: 'ollama' },
            { title: 'Gemini (Google)', value: 'gemini' },
            { title: 'OpenAI (ChatGPT)', value: 'openai' }
          ],
          initial: 0
        },
        {
          type: 'text',
          name: 'promptText',
          message: 'Descreva como você quer o HTML (ex: "Post de instagram sobre Dicas de IA"):',
          validate: text => text.length < 5 ? 'Por favor, detalhe um pouco mais' : true
        }
      ]);

      if (!aiResponse.promptText) {
        console.log('Operação cancelada.');
        process.exit(0);
      }

      const AIChatSession = require('./ai/AIChatSession');
      const OllamaAdapter = require('./ai/OllamaAdapter');
      const GeminiAdapter = require('./ai/GeminiAdapter');
      
      // OpenAIAdapter pode não estar criado ainda, trataremos os que temos:
      let adapter;
      if (aiResponse.provider === 'ollama') adapter = new OllamaAdapter();
      else if (aiResponse.provider === 'gemini') adapter = new GeminiAdapter();
      else {
        console.log('Provider temporariamente não suportado neste teste. Usando Ollama.');
        adapter = new OllamaAdapter();
      }

      // Ler system prompt
      const systemPromptPath = path.join(process.cwd(), 'config', 'prompts', 'prompt.txt');
      let systemPrompt = '';
      if (fs.existsSync(systemPromptPath)) {
        systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');
      }

      const chat = new AIChatSession(adapter, systemPrompt);
      let userMsg = aiResponse.promptText;
      const sessionFiles = [];

      // Inicializar gerador de imagens (se configurado)
      let imageService = null;
      try {
        const ImageGenerationService = require('./ai/ImageGenerationService');
        imageService = new ImageGenerationService();
      } catch (e) {
        // Se não tiver API key ou provider, segue sem geração de imagem
      }

      while (true) {
        console.log(`\n⏳ A Gema está pensando... (via ${aiResponse.provider})`);
        
        try {
          const reply = await chat.sendMessage(userMsg);

          // Interceptar marcadores de geração de imagem: [GERAR_IMAGEM: prompt]
          let processedReply = reply;
          if (imageService) {
            const imgMatches = reply.match(/\[GERAR_IMAGEM:\s*(.+?)\]/gi) || [];
            for (const match of imgMatches) {
              const imgPrompt = match.replace(/\[GERAR_IMAGEM:\s*/i, '').replace(/\]$/, '').trim();
              try {
                const imgPath = await imageService.generate(imgPrompt);
                processedReply = processedReply.replace(match, `[🖼️ IMAGEM GERADA: ${imgPath}]`);
              } catch (imgErr) {
                console.error(`❌ Falha ao gerar imagem: ${imgErr.message}`);
                processedReply = processedReply.replace(match, `[⚠️ IMAGEM NÃO GERADA: ${imgErr.message}]`);
              }
            }
          }

          const htmlMatches = processedReply.match(/```html([\s\S]*?)```/gi) || [];
          
          let cleanReply = processedReply;
          if (htmlMatches.length > 0) {
            cleanReply = cleanReply.replace(/```html[\s\S]*?```/gi, '\n[📄 HTML GERADO E SALVO NA PASTA WORK]\n');
            
            if (!fs.existsSync(this.workFolder)) fs.mkdirSync(this.workFolder, { recursive: true });
            
            htmlMatches.forEach((block, index) => {
              const htmlCode = block.replace(/```html|```/gi, '').trim();
              const filename = `gema-design-${Date.now()}-${index}.html`;
              const filePath = path.join(this.workFolder, filename);
              fs.writeFileSync(filePath, htmlCode, 'utf8');
              sessionFiles.push(filePath);
            });
          }

          console.log(`\n💎 Gema:`);
          console.log('\x1b[36m%s\x1b[0m', cleanReply);

          const nextAction = await prompts({
            type: 'text',
            name: 'feedback',
            message: 'O que achou? (Escreva alterações, ou deixe em branco e aperte Enter para GERAR A IMAGEM):'
          });

          if (!nextAction.feedback || nextAction.feedback.trim() === '') {
             console.log('\n✅ Chat encerrado. Iniciando conversão...');
             if (sessionFiles.length > 0) {
               console.log(`🎯 Convertendo apenas os ${sessionFiles.length} HTML(s) desta sessão...`);
               return await this.orchestrator.convertFiles(sessionFiles, {});
             }
             return await this.orchestrator.processFolder(this.workFolder, {});
          }
          
          userMsg = nextAction.feedback;

        } catch (err) {
          console.error('❌ Erro na comunicação com a IA:', err.message);
          break;
        }
      }
      return null;
    }

    if (response.action === 'create') {
      const createResponse = await prompts([
        {
          type: 'text',
          name: 'filename',
          message: 'Qual o nome do arquivo? (sem .html)',
          initial: 'meu-template'
        },
        {
          type: 'select',
          name: 'preset',
          message: 'Qual formato?',
          choices: [
            { title: 'Instagram (1080x1350)', value: 'instagram' },
            { title: 'Stories/TikTok (1080x1920)', value: 'stories' },
            { title: 'Apresentação PPT (1920x1080)', value: 'ppt' },
            { title: 'Genérico', value: 'generic' }
          ]
        }
      ]);

      if (!createResponse.filename) {
        console.log('Operação cancelada.');
        process.exit(0);
      }

      return await this.orchestrator.createEmptyHtml(this.workFolder, createResponse.filename, {
        preset: createResponse.preset
      });
    }
  }
}

module.exports = InteractiveWizard;
