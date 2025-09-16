const fs = require('fs');
const path = require('path');

class TemplateGenerator {
  constructor() {
    this.templates = {
      instagram: this.getInstagramTemplate.bind(this),
      ppt: this.getPowerPointTemplate.bind(this),
      generic: this.getGenericTemplate.bind(this)
    };
  }

  generateTemplates(type, count = 1, outputDir = './html-files', options = {}) {
    const {
      width = 1200,
      height = 800,
      format = 'png',
      quality = 90,
      background = 'transparent'
    } = options;

    if (!this.templates[type]) {
      throw new Error(`Tipo de template inválido: ${type}. Use: ${Object.keys(this.templates).join(', ')}`);
    }

    const generated = [];
    
    // Criar pasta se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Criar pasta de assets se não existir
    const assetsDir = path.join(outputDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      this.createSampleAssets(assetsDir);
    }

    for (let i = 1; i <= count; i++) {
      const fileName = `${type}-${i.toString().padStart(2, '0')}.html`;
      const filePath = path.join(outputDir, fileName);
      
      const templateConfig = {
        width,
        height,
        format,
        quality,
        background,
        slideNumber: i,
        totalSlides: count
      };

      const htmlContent = this.templates[type](templateConfig);
      
      fs.writeFileSync(filePath, htmlContent, 'utf8');
      generated.push(filePath);
      
      console.log(`📄 Template criado: ${fileName}`);
    }

    return generated;
  }

  getInstagramTemplate(config) {
    const { width = 1080, height = 1080, format = 'png', quality = 90, background = 'transparent', slideNumber = 1, totalSlides = 1 } = config;
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Slide ${slideNumber}</title>
    
    <!-- Configuração inline para conversão -->
    <script id="h2i-config" type="application/json">
    {
      "format": "${format}",
      "quality": ${quality},
      "width": ${width},
      "height": ${height},
      "background": "${background}",
      "deviceScaleFactor": 2,
      "fullPage": true
    }
    </script>
    
    <link rel="stylesheet" href="./assets/style.css">
    <style>
        .instagram-container {
            width: ${width}px;
            height: ${height}px;
            margin: 0;
            padding: 120px 80px; /* Zona segura Instagram */
            box-sizing: border-box;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Arial', sans-serif;
            color: white;
            text-align: center;
            position: relative;
        }
        
        .slide-number {
            position: absolute;
            top: 40px;
            right: 40px;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
        }
        
        .title {
            font-size: 3.5rem;
            font-weight: 900;
            margin-bottom: 2rem;
            line-height: 1.1;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            font-size: 1.8rem;
            font-weight: 400;
            margin-bottom: 3rem;
            opacity: 0.9;
            line-height: 1.3;
        }
        
        .highlight-box {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            width: 100%;
            max-width: 600px;
        }
        
        .highlight-text {
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .highlight-desc {
            font-size: 1.2rem;
            opacity: 0.8;
        }
        
        .cta {
            background: #ff6b6b;
            color: white;
            padding: 1rem 2.5rem;
            border-radius: 50px;
            font-size: 1.3rem;
            font-weight: 700;
            text-decoration: none;
            display: inline-block;
            margin-top: 2rem;
            box-shadow: 0 8px 20px rgba(255,107,107,0.3);
            transition: transform 0.2s ease;
        }
        
        .cta:hover {
            transform: translateY(-2px);
        }
        
        .decorative-element {
            position: absolute;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
            top: -100px;
            left: -100px;
        }
    </style>
</head>
<body>
    <div class="instagram-container">
        <div class="decorative-element"></div>
        <div class="slide-number">${slideNumber}/${totalSlides}</div>
        
        <h1 class="title">Dica ${slideNumber}</h1>
        <p class="subtitle">Produtividade em foco</p>
        
        <div class="highlight-box">
            <div class="highlight-text">🚀 Técnica Pomodoro</div>
            <div class="highlight-desc">25 min trabalho + 5 min pausa</div>
        </div>
        
        ${slideNumber === totalSlides ? '<a href="#" class="cta">Siga para mais dicas!</a>' : ''}
    </div>
    
    <script src="./assets/script.js"></script>
</body>
</html>`;
  }

  getPowerPointTemplate(config) {
    const { width = 1920, height = 1080, format = 'png', quality = 90, background = '#ffffff', slideNumber = 1, totalSlides = 1 } = config;
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PowerPoint Slide ${slideNumber}</title>
    
    <!-- Configuração inline para conversão -->
    <script id="h2i-config" type="application/json">
    {
      "format": "${format}",
      "quality": ${quality},
      "width": ${width},
      "height": ${height},
      "background": "${background}",
      "deviceScaleFactor": 2,
      "fullPage": true
    }
    </script>
    
    <link rel="stylesheet" href="./assets/style.css">
    <style>
        .ppt-container {
            width: ${width}px;
            height: ${height}px;
            margin: 0;
            padding: 80px;
            box-sizing: border-box;
            background: ${background};
            display: grid;
            grid-template-rows: auto 1fr auto;
            font-family: 'Arial', sans-serif;
            color: #333;
            position: relative;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 2rem;
            margin-bottom: 3rem;
        }
        
        .logo {
            width: 120px;
            height: 60px;
            background: #2c5aa0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .slide-info {
            text-align: right;
            color: #666;
            font-size: 1.1rem;
        }
        
        .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: start;
        }
        
        .main-title {
            font-size: 3.5rem;
            font-weight: 700;
            color: #2c5aa0;
            margin-bottom: 2rem;
            line-height: 1.2;
            grid-column: 1 / -1;
        }
        
        .subtitle {
            font-size: 1.8rem;
            color: #666;
            margin-bottom: 3rem;
            grid-column: 1 / -1;
        }
        
        .bullet-list {
            list-style: none;
            padding: 0;
        }
        
        .bullet-list li {
            margin-bottom: 1.5rem;
            font-size: 1.4rem;
            display: flex;
            align-items: center;
            line-height: 1.4;
        }
        
        .bullet-list li::before {
            content: "▶";
            color: #2c5aa0;
            font-size: 1.2rem;
            margin-right: 1rem;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            grid-column: 1 / -1;
            margin-top: 2rem;
        }
        
        .metric-card {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .metric-number {
            font-size: 3rem;
            font-weight: 900;
            color: #2c5aa0;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            font-size: 1.2rem;
            color: #666;
            font-weight: 600;
        }
        
        .footer {
            text-align: center;
            color: #999;
            font-size: 1rem;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="ppt-container">
        <div class="header">
            <div class="logo">LOGO</div>
            <div class="slide-info">
                Slide ${slideNumber} de ${totalSlides}<br>
                <small>Resultados Q4 2024</small>
            </div>
        </div>
        
        <div class="content">
            ${slideNumber === 1 ? `
                <h1 class="main-title">Resultados Q4</h1>
                <p class="subtitle">Apresentação dos principais indicadores</p>
            ` : slideNumber === 2 ? `
                <div>
                    <h2 style="font-size: 2.5rem; color: #2c5aa0; margin-bottom: 2rem;">Principais Conquistas</h2>
                    <ul class="bullet-list">
                        <li>Aumento de 25% nas vendas</li>
                        <li>Expansão para 3 novos mercados</li>
                        <li>Redução de 15% nos custos</li>
                        <li>Implementação de nova plataforma</li>
                        <li>Contratação de 50 novos colaboradores</li>
                    </ul>
                </div>
                <div style="display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 12px;">
                    <div style="text-align: center; color: #666; font-size: 1.2rem;">
                        📊<br>Gráfico ou<br>Imagem aqui
                    </div>
                </div>
            ` : `
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-number">125%</div>
                        <div class="metric-label">Crescimento</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-number">89%</div>
                        <div class="metric-label">Satisfação</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-number">€2.5M</div>
                        <div class="metric-label">Receita</div>
                    </div>
                </div>
            `}
        </div>
        
        <div class="footer">
            Apresentação confidencial • ${new Date().getFullYear()}
        </div>
    </div>
    
    <script src="./assets/script.js"></script>
</body>
</html>`;
  }

  getGenericTemplate(config) {
    const { width = 1200, height = 800, format = 'png', quality = 90, background = '#ffffff' } = config;
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Genérico</title>
    
    <!-- Configuração inline para conversão -->
    <script id="h2i-config" type="application/json">
    {
      "format": "${format}",
      "quality": ${quality},
      "width": ${width},
      "height": ${height},
      "background": "${background}",
      "deviceScaleFactor": 2,
      "fullPage": true
    }
    </script>
    
    <link rel="stylesheet" href="./assets/style.css">
    <style>
        .container {
            width: ${width}px;
            height: ${height}px;
            margin: 0;
            padding: 4rem;
            box-sizing: border-box;
            background: ${background};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Arial', sans-serif;
            color: #333;
            text-align: center;
        }
        
        .title {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 2rem;
            color: #2c5aa0;
        }
        
        .content {
            font-size: 1.5rem;
            line-height: 1.6;
            max-width: 800px;
        }
        
        .highlight {
            background: #f8f9fa;
            border-left: 4px solid #2c5aa0;
            padding: 2rem;
            margin: 2rem 0;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">Template Genérico</h1>
        <div class="content">
            <p>Este é um template genérico que pode ser personalizado conforme sua necessidade.</p>
            <div class="highlight">
                <strong>Dica:</strong> Edite este HTML para criar seu próprio design e depois converta para imagem!
            </div>
        </div>
    </div>
    
    <script src="./assets/script.js"></script>
</body>
</html>`;
  }

  createSampleAssets(assetsDir) {
    // Criar CSS básico
    const cssContent = `/* Estilos globais para templates */
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Utilitários */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-1 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 2rem; }
.mb-3 { margin-bottom: 3rem; }

.p-1 { padding: 1rem; }
.p-2 { padding: 2rem; }
.p-3 { padding: 3rem; }

/* Tipografia responsiva */
.title-xl { font-size: clamp(2rem, 5vw, 4rem); }
.title-lg { font-size: clamp(1.5rem, 4vw, 3rem); }
.title-md { font-size: clamp(1.2rem, 3vw, 2rem); }

/* Botões */
.btn {
    display: inline-block;
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #2c5aa0;
    color: white;
}

.btn-primary:hover {
    background: #1e3a6f;
    transform: translateY(-2px);
}
`;

    // Criar JavaScript básico
    const jsContent = `// Script básico para templates
document.addEventListener('DOMContentLoaded', function() {
    console.log('Template carregado com sucesso!');
    
    // Aguardar fontes carregarem
    if (document.fonts) {
        document.fonts.ready.then(function() {
            console.log('Fontes carregadas');
            document.body.classList.add('fonts-loaded');
        });
    }
    
    // Adicionar classe quando tudo estiver pronto
    setTimeout(function() {
        document.body.classList.add('ready');
    }, 100);
});

// Função utilitária para aguardar elemento
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(\`Elemento \${selector} não encontrado em \${timeout}ms\`));
        }, timeout);
    });
}
`;

    // Criar ícone SVG de exemplo
    const iconContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6L9 17l-5-5"/>
</svg>`;

    // Escrever arquivos
    fs.writeFileSync(path.join(assetsDir, 'style.css'), cssContent, 'utf8');
    fs.writeFileSync(path.join(assetsDir, 'script.js'), jsContent, 'utf8');
    fs.writeFileSync(path.join(assetsDir, 'icon-check.svg'), iconContent, 'utf8');
    
    console.log('📁 Assets básicos criados em:', assetsDir);
  }
}

module.exports = TemplateGenerator;
