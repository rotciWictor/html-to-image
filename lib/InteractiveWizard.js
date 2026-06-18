const prompts = require('prompts');
const fs = require('fs');
const path = require('path');

class InteractiveWizard {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    // Os diretórios serão definidos no selectProject()
    this.workFolder = null;
    this.outputFolder = null;
    this.projectName = null;
  }

  async selectProject() {
    const workRoot = path.resolve(process.cwd(), 'work');
    const sessionsRoot = path.join(workRoot, 'sessions');
    const projectsRoot = path.join(workRoot, 'projects');
    
    if (!fs.existsSync(workRoot)) fs.mkdirSync(workRoot, { recursive: true });
    if (!fs.existsSync(sessionsRoot)) fs.mkdirSync(sessionsRoot, { recursive: true });
    if (!fs.existsSync(projectsRoot)) fs.mkdirSync(projectsRoot, { recursive: true });

    const projectItems = fs.readdirSync(projectsRoot, { withFileTypes: true });
    const projects = projectItems
      .filter(item => item.isDirectory() && !item.name.startsWith('.'))
      .map(item => `projects/${item.name}`);

    const sessionItems = fs.readdirSync(sessionsRoot, { withFileTypes: true });
    const sessions = sessionItems
      .filter(item => item.isDirectory() && !item.name.startsWith('.'))
      .map(item => `sessions/${item.name}`);

    const projectChoices = [
      { title: '⚡ Modo Rápido (Nova Sessão Automática)', value: '_auto' },
      { title: '➕ Criar Novo Projeto', value: '_new' },
      ...projects.map(p => ({ title: `📂 ${p.replace('projects/', '')}`, value: p })),
      ...sessions.map(s => ({ title: `🕒 ${s.replace('sessions/', '')}`, value: s }))
    ];

    const { projectChoice } = await prompts({
      type: 'select',
      name: 'projectChoice',
      message: 'Em qual projeto / sessão você deseja trabalhar?',
      choices: projectChoices
    });

    if (!projectChoice) {
      console.log('Operação cancelada.');
      process.exit(0);
    }

    let projectName = projectChoice;

    if (projectChoice === '_auto') {
      const ts = new Date().toISOString().replace(/[:T-]/g, '').slice(0, 14);
      projectName = `sessions/sessao_${ts}`;
      console.log(`\nCriando sessão: sessao_${ts}`);
    } else if (projectChoice === '_new') {
      const { newName } = await prompts({
        type: 'text',
        name: 'newName',
        message: 'Digite o nome do novo projeto (use apenas letras, números, hífen ou underline):',
        validate: text => /^[a-zA-Z0-9_-]+$/.test(text) ? true : 'Nome inválido.'
      });
      if (!newName) process.exit(0);
      projectName = `projects/${newName}`;
    }

    this.projectName = projectName;
    this.projectRoot = path.join(workRoot, projectName);
    this.workFolder = path.join(this.projectRoot, 'htmls');
    this.outputFolder = path.join(this.projectRoot, 'output');

    fs.mkdirSync(this.workFolder, { recursive: true });
    fs.mkdirSync(this.outputFolder, { recursive: true });
  }

  async run() {
    console.log('\n✨ Bem-vindo ao HTML to Image Converter ✨');
    
    await this.selectProject();
    console.log(`\n📁 PROJETO ATUAL: ${this.projectName}`);
    
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
          title: `🚀 Converter TODOS os HTMLs (${numFiles} arquivo${numFiles !== 1 ? 's' : ''})`, 
          value: 'convert',
          description: 'Modo expresso: lê a pasta do projeto e converte tudo imediatamente'
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
      console.log(`\nIniciando conversão do projeto: ${this.projectName}`);
      const stats = await this.orchestrator.processFolder(this.workFolder, { outDir: this.outputFolder });
      return stats;
    }

    if (response.action === 'convert_specific') {
      if (!fs.existsSync(this.workFolder)) {
        console.log(`❌ Pasta htmls não encontrada no projeto ${this.projectName}.`);
        process.exit(0);
      }
      const htmlFiles = fs.readdirSync(this.workFolder).filter(f => f.endsWith('.html'));
      if (htmlFiles.length === 0) {
        console.log(`❌ Nenhum arquivo .html encontrado no projeto ${this.projectName}.`);
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
      return await this.orchestrator.convertFiles(filePaths, { outDir: this.outputFolder });
    }

    if (response.action === 'translate' || response.action === 'translate_specific') {
      let filesToTranslate = [];
      
      if (response.action === 'translate_specific') {
        if (!fs.existsSync(this.workFolder)) {
          console.log(`❌ Pasta htmls não encontrada no projeto ${this.projectName}.`);
          process.exit(0);
        }
        const htmlFiles = fs.readdirSync(this.workFolder).filter(f => f.endsWith('.html') && !f.endsWith('_preview.html'));
        if (htmlFiles.length === 0) {
          console.log(`❌ Nenhum arquivo .html encontrado no projeto ${this.projectName}.`);
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
          provider: transResponse.provider,
          outDir: this.outputFolder
        });
      } else {
        console.log(`\n🌐 Traduzindo ${filesToTranslate.length} arquivo(s) para '${transResponse.targetLang}'...`);
        const translatedFiles = await this.orchestrator.translateHtmlFiles(filesToTranslate, {
          translate: transResponse.targetLang,
          provider: transResponse.provider,
          outDir: this.outputFolder
        });
        
        console.log(`\n📸 Gerando imagens para os arquivos traduzidos...`);
        return await this.orchestrator.convertFiles(translatedFiles, { outDir: this.outputFolder });
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
      if (aiResponse.provider === 'gemini') {
        const { geminiModel } = await prompts({
          type: 'select',
          name: 'geminiModel',
          message: 'Qual modelo do Gemini você deseja usar?',
          choices: [
            { title: 'Gemini 3.5 Flash (Mais inteligente e Rápido - RECOMENDADO)', value: 'gemini-3.5-flash' },
            { title: 'Gemini 3.1 Pro Preview (Mais avançado, para problemas complexos)', value: 'gemini-3.1-pro-preview' },
            { title: 'Gemini 3.1 Flash-Lite (Ultrarrápido, menor custo)', value: 'gemini-3.1-flash-lite' },
            { title: 'Gemini 2.5 Flash (Padrão, Estável)', value: 'gemini-2.5-flash' },
            { title: 'Gemini 2.5 Pro (Antigo, Raciocínio profundo)', value: 'gemini-2.5-pro' }
          ]
        });
        if (!geminiModel) process.exit(0);
        adapter = new GeminiAdapter({ model: geminiModel });
      } else if (aiResponse.provider === 'ollama') {
        let ollamaModels = [];
        try {
          const { execSync } = require('child_process');
          const output = execSync('ollama list').toString();
          const lines = output.trim().split('\n').slice(1);
          ollamaModels = lines.map(line => {
             const name = line.split(/\s+/)[0];
             return name ? { title: name, value: name } : null;
          }).filter(Boolean);
        } catch(e) {}
        
        if (ollamaModels.length > 0) {
          const { ollamaModel } = await prompts({
            type: 'select',
            name: 'ollamaModel',
            message: 'Qual modelo local do Ollama você deseja usar?',
            choices: ollamaModels
          });
          if (!ollamaModel) process.exit(0);
          adapter = new OllamaAdapter({ model: ollamaModel });
        } else {
          adapter = new OllamaAdapter();
        }
      } else {
        console.log('Provider temporariamente não suportado neste teste. Usando Ollama.');
        adapter = new OllamaAdapter();
      }

      // Ler system prompt
      const systemPromptPath = path.join(process.cwd(), 'config', 'prompts', 'prompt.txt');
      let systemPrompt = '';
      if (fs.existsSync(systemPromptPath)) {
        systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');
      }

      const chat = new AIChatSession(adapter, systemPrompt, this.workFolder);
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

      // Inicializar servidor de preview para visualizar HTMLs no navegador
      const ImageProcessor = require('./ImageProcessor');
      const previewServer = new ImageProcessor({});
      await previewServer.init();
      const previewPort = previewServer.serverPort;

      while (true) {
        console.log(`\n⏳ A Gema está pensando... (via ${aiResponse.provider})`);
        
        try {
          const reply = await chat.sendMessage(userMsg);

          // Interceptar marcadores de geração de imagem: [GERAR_IMAGEM: prompt]
          let processedReply = reply;
          if (imageService) {
            const imgMatches = reply.match(/\[GERAR_IMAGEM:\s*(.+?)\]/gi) || [];
            for (const match of imgMatches) {
              let imgPrompt = match.replace(/\[GERAR_IMAGEM:\s*/i, '').replace(/\]$/, '').trim();
              let width = 1024;
              let height = 1024;
              
              // Extrair dimensões se houver (ex: "um gato fofo | 1920x1080")
              const dimMatch = imgPrompt.match(/\|\s*(\d+)x(\d+)\s*$/i);
              if (dimMatch) {
                width = parseInt(dimMatch[1], 10);
                height = parseInt(dimMatch[2], 10);
                imgPrompt = imgPrompt.replace(dimMatch[0], '').trim();
              }

              try {
                const imgPath = await imageService.generate(imgPrompt, { width, height });
                // Substituir a tag magicamente pelo caminho relativo limpo pra não quebrar a sintaxe de onde ela estiver (html/css)
                processedReply = processedReply.replace(match, `../assets/${path.basename(imgPath)}`);
                console.log(`✅ [Imagem Anexada]: ../assets/${path.basename(imgPath)}`);
              } catch (imgErr) {
                console.error(`❌ Falha ao gerar imagem: ${imgErr.message}`);
                // Em caso de falha, deixa um caminho falso para não corromper o HTML/CSS
                processedReply = processedReply.replace(match, `../assets/error-generating.png`);
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

            // Abrir preview no navegador automaticamente
            const filesParam = encodeURIComponent(sessionFiles.join(','));
            const previewUrl = `http://localhost:${previewPort}/gallery?files=${filesParam}`;
            console.log(`\n👁️  Preview: ${previewUrl}`);
            try {
              const { exec } = require('child_process');
              exec(`start "" "${previewUrl}"`);
            } catch (e) { /* fallback: usuário clica no link */ }
          }

          console.log(`\n💎 Gema:`);
          console.log('\x1b[36m%s\x1b[0m', cleanReply);

          const nextAction = await prompts({
            type: 'select',
            name: 'action',
            message: 'O que deseja fazer?',
            choices: [
              { title: '✏️  Pedir alterações (escrever feedback)', value: 'feedback' },
              { title: '✅ Aprovar e converter para imagem', value: 'convert' },
              { title: '👁️  Abrir preview no navegador novamente', value: 'preview' },
              { title: '❌ Descartar e sair', value: 'exit' }
            ]
          });

          if (!nextAction.action || nextAction.action === 'exit') {
            await previewServer.close();
            break;
          }

          if (nextAction.action === 'preview') {
            if (sessionFiles.length > 0) {
              const filesParam = encodeURIComponent(sessionFiles.join(','));
              const previewUrl = `http://localhost:${previewPort}/gallery?files=${filesParam}`;
              try {
                const { exec } = require('child_process');
                exec(`start "" "${previewUrl}"`);
              } catch (e) { /* fallback */ }
            }
            // Voltar para o menu de ações
            const retryAction = await prompts({
              type: 'select',
              name: 'action',
              message: 'O que deseja fazer agora?',
              choices: [
                { title: '✏️  Pedir alterações (escrever feedback)', value: 'feedback' },
                { title: '✅ Aprovar e converter para imagem', value: 'convert' },
                { title: '❌ Descartar e sair', value: 'exit' }
              ]
            });
            if (!retryAction.action || retryAction.action === 'exit') {
              await previewServer.close();
              break;
            }
            if (retryAction.action === 'convert') {
              console.log('\n✅ Chat encerrado. Iniciando conversão...');
              await previewServer.close();
              if (sessionFiles.length > 0) {
                console.log(`🎯 Convertendo apenas os ${sessionFiles.length} HTML(s) desta sessão...`);
                return await this.orchestrator.convertFiles(sessionFiles, { outputDir: this.outputFolder });
              }
              return await this.orchestrator.processFolder(this.workFolder, { outputDir: this.outputFolder });
            }
            // feedback: pedir texto
            const feedbackInput = await prompts({
              type: 'text',
              name: 'text',
              message: 'Descreva as alterações que deseja:'
            });
            if (!feedbackInput.text) { await previewServer.close(); break; }
            userMsg = feedbackInput.text;
            continue;
          }

          if (nextAction.action === 'convert') {
             console.log('\n✅ Chat encerrado. Iniciando conversão...');
             await previewServer.close();
             if (sessionFiles.length > 0) {
               console.log(`🎯 Convertendo apenas os ${sessionFiles.length} HTML(s) desta sessão...`);
               return await this.orchestrator.convertFiles(sessionFiles, { outputDir: this.outputFolder });
             }
             return await this.orchestrator.processFolder(this.workFolder, { outputDir: this.outputFolder });
          }
          
          // feedback
          const feedbackInput = await prompts({
            type: 'text',
            name: 'text',
            message: 'Descreva as alterações que deseja:'
          });
          if (!feedbackInput.text) { await previewServer.close(); break; }
          userMsg = feedbackInput.text;

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
