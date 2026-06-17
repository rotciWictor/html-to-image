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
          title: `🚀 Converter HTMLs agora (${numFiles} arquivo${numFiles !== 1 ? 's' : ''} em work/htmls)`, 
          value: 'convert',
          description: 'Modo expresso: lê a pasta padrão e converte imediatamente'
        },
        { 
          title: '🤖 Gerar novos HTMLs com IA (Gemini/Ollama)', 
          value: 'ai',
          description: 'Cria novos templates conversando com uma Inteligência Artificial'
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

      while (true) {
        console.log(`\n⏳ A Gema está pensando... (via ${aiResponse.provider})`);
        
        try {
          const reply = await chat.sendMessage(userMsg);
          
          const htmlMatches = reply.match(/```html([\s\S]*?)```/gi) || [];
          
          let cleanReply = reply;
          if (htmlMatches.length > 0) {
            cleanReply = cleanReply.replace(/```html[\s\S]*?```/gi, '\n[📄 HTML GERADO E SALVO NA PASTA WORK]\n');
            
            if (!fs.existsSync(this.workFolder)) fs.mkdirSync(this.workFolder, { recursive: true });
            
            htmlMatches.forEach((block, index) => {
              const htmlCode = block.replace(/```html|```/gi, '').trim();
              const filename = `gema-design-${Date.now()}-${index}.html`;
              fs.writeFileSync(path.join(this.workFolder, filename), htmlCode, 'utf8');
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
