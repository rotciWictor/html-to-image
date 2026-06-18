const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const express = require('express');
const ArchiveProcessor = require('./ArchiveProcessor');

class ImageProcessor {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.activePage = null;
    this.server = null;
    this.serverPort = 0;
    this.archiveProcessor = new ArchiveProcessor();
  }

  async init(overrideConfig = null) {
    // Aplicar override de configuração, se fornecido
    if (overrideConfig && typeof overrideConfig === 'object') {
      const deepMerge = (target, source) => {
        for (const key of Object.keys(source)) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = deepMerge(target[key] ? { ...target[key] } : {}, source[key]);
          } else {
            target[key] = source[key];
          }
        }
        return target;
      };
      this.config = deepMerge({ ...this.config }, overrideConfig);
    }
    if (!this.browser) {
      console.log('🚀 Iniciando navegador...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }

    // Iniciar servidor local para assets
    await this.startAssetServer();
  }

  async startAssetServer() {
    if (!this.server) {
      const app = express();

      // Servir assets com filtro de segurança para pastas conhecidas
      const allowedPrefixes = ['work/', 'examples/', 'output/', 'assets/'];
      app.use('/assets', (req, res, next) => {
        const reqPath = decodeURIComponent(req.path).replace(/\\/g, '/').substring(1);
        if (!allowedPrefixes.some(prefix => reqPath.startsWith(prefix)) && !reqPath.startsWith('assets/')) {
          return res.status(403).send('Acesso negado');
        }
        next();
      }, express.static('.', {
        setHeaders: (res, path) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache');
        }
      }));

      // Rota de Preview: serve o HTML diretamente no navegador
      app.get('/preview', (req, res) => {
        const filePath = req.query.file;
        if (!filePath) return res.status(400).send('Parâmetro ?file= obrigatório');
        
        const absolutePath = path.resolve(filePath);
        if (!fs.existsSync(absolutePath)) return res.status(404).send('Arquivo não encontrado');
        
        let html = fs.readFileSync(absolutePath, 'utf8');
        
        // Resolver caminhos relativos de assets para URLs do servidor local
        html = html.replace(/(src|href)\s*=\s*(["'])\.\/(assets\/[^"']+)\2/gi, (match, attr, quote, assetPath) => {
          return `${attr}=${quote}http://localhost:${this.serverPort}/assets/${assetPath}${quote}`;
        });
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      });

      // Rota de Galeria: serve uma UI para navegar entre vários HTMLs gerados
      app.get('/gallery', (req, res) => {
        const filesParam = req.query.files;
        if (!filesParam) return res.status(400).send('Parâmetro ?files= obrigatório');
        
        const files = filesParam.split(',').map(f => decodeURIComponent(f));
        if (files.length === 0) return res.status(400).send('Nenhum arquivo especificado');

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gema Preview</title>
  <style>
    :root { --panel-width: 320px; --bg: #0f172a; --panel: #111827; --text: #e5e7eb; --accent: #22c55e; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; background: var(--bg); color: var(--text); display: grid; grid-template-columns: var(--panel-width) 1fr; height: 100vh; overflow: hidden; }
    aside { background: var(--panel); border-right: 1px solid #1f2937; display: flex; flex-direction: column; min-width: var(--panel-width); height: 100vh; }
    header { padding: 12px 16px; border-bottom: 1px solid #1f2937; display: flex; gap: 8px; align-items: center; }
    header input { flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid #374151; background: #0b1220; color: var(--text); }
    ul { list-style: none; padding: 8px; margin: 0; overflow-y: auto; flex: 1; }
    li { margin: 4px 0; }
    a.item { display: flex; gap: 8px; padding: 8px 10px; color: var(--text); border-radius: 6px; border: 1px solid transparent; text-decoration: none; word-break: break-all; }
    a.item:hover { background: #0b1220; border-color: #1f2937; }
    a.item.active { background: #0b1220; border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
    main { display: flex; flex-direction: column; min-width: 0; height: 100vh; }
    .toolbar { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid #1f2937; flex-wrap: wrap; }
    .toolbar button, .toolbar select { background: #111827; color: var(--text); border: 1px solid #374151; border-radius: 6px; padding: 8px 10px; cursor: pointer; white-space: nowrap; }
    .toolbar .spacer { flex: 1; min-width: 10px; }
    .viewer { flex: 1; display: grid; place-items: center; overflow: hidden; background: radial-gradient(60% 60% at 50% 50%, #0b1220 0%, #0a0f1c 100%); width: 100%; position: relative; }
    .frame-wrap { width: 1080px; height: 1080px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,.35); transform-origin: center center; transition: transform 0.2s ease-out; position: absolute; }
    iframe { width: 100%; height: 100%; border: none; }
    .hint { font-size: 12px; opacity: .8; white-space: nowrap; }
    
    /* Responsividade */
    @media (max-width: 768px) {
      body { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
      aside { min-width: 100%; height: auto; max-height: 30vh; border-right: none; border-bottom: 1px solid #1f2937; }
      main { height: 70vh; }
      .toolbar { padding: 6px; justify-content: center; }
      .frame-wrap { box-shadow: 0 4px 15px rgba(0,0,0,.25); }
    }
  </style>
  <script>
    const files = ${JSON.stringify(files)};
    let baseW = 1080; let baseH = 1080;
    
    function byId(id){ return document.getElementById(id); }
    function currentIndex(){ 
      const active = document.querySelector('a.item.active');
      return active ? parseInt(active.dataset.index) : 0;
    }
    
    function load(index){
      if(index < 0 || index >= files.length) return;
      document.querySelectorAll('a.item').forEach(a => a.classList.toggle('active', parseInt(a.dataset.index) === index));
      byId('counter').textContent = (index+1) + ' / ' + files.length;
      
      const file = files[index];
      const iframe = byId('slideInner');
      
      // Quando o iframe terminar de carregar, vamos tentar descobrir o tamanho real dele
      iframe.onload = function() {
        try {
          const doc = iframe.contentWindow.document;
          let w = 1080, h = 1080;
          
          // 1. Tentar h2i-config
          const cfgEl = doc.getElementById('h2i-config');
          if (cfgEl && cfgEl.textContent) {
            const cfg = JSON.parse(cfgEl.textContent);
            if (cfg.width && cfg.height) { w = Number(cfg.width); h = Number(cfg.height); }
          } else if (doc.body && doc.body.firstElementChild) {
            // 2. Tentar estilo inline do primeiro elemento
            const root = doc.body.firstElementChild;
            const rw = parseInt(root.style.width);
            const rh = parseInt(root.style.height);
            if (rw > 0 && rh > 0) { w = rw; h = rh; }
          }
          
          baseW = w; baseH = h;
          const wrap = byId('wrap');
          wrap.style.width = baseW + 'px';
          wrap.style.height = baseH + 'px';
          
          // Desabilitar o scroll no body do iframe para evitar barrinhas chatas
          doc.body.style.overflow = 'hidden';
          doc.body.style.margin = '0';
          doc.body.style.padding = '0';
          
          applyZoom(byId('zoomSelect').value);
        } catch (e) {
          console.error("Erro ao ler iframe:", e);
        }
      };

      // Carrega o iframe usando a rota /preview
      iframe.src = '/preview?file=' + encodeURIComponent(file);
    }
    
    function prev(){ load(currentIndex()-1); }
    function next(){ load(currentIndex()+1); }
    
    function viewerSize(){ const v = byId('viewer'); return { w: v.clientWidth, h: v.clientHeight }; }
    function fitScale(){ 
      const { w, h } = viewerSize(); 
      const pad = 40; // margem para não encostar na borda
      const zw = (w - pad) / baseW; 
      const zh = (h - pad) / baseH; 
      return Math.max(0.1, Math.min(1.5, Math.min(zw, zh))); 
    }
    
    function applyZoom(val){ 
      const wrap = byId('wrap'); 
      const select = byId('zoomSelect');
      if(val === 'fit'){ 
        const z = fitScale(); 
        wrap.style.transform = 'scale(' + z + ')'; 
        byId('zoomVal').textContent = (z*100).toFixed(0)+'%'; 
        if(select && select.value !== 'fit') select.value='fit'; 
        return; 
      }
      const z = Number(val); 
      wrap.style.transform = 'scale(' + z + ')'; 
      byId('zoomVal').textContent = (z*100).toFixed(0)+'%'; 
    }
    
    function onResize(){ if(byId('zoomSelect').value === 'fit') applyZoom('fit'); }
    function filterList(q){ q=q.toLowerCase(); document.querySelectorAll('a.item').forEach(a=>{ const show=a.dataset.name.toLowerCase().includes(q); a.parentElement.style.display = show? 'block':'none';}); }
    
    window.addEventListener('DOMContentLoaded', ()=>{
      const list=byId('list');
      files.forEach((f, idx)=>{
        const li=document.createElement('li');
        const a=document.createElement('a');
        a.href='#'; a.className='item'; 
        a.dataset.index=idx; 
        const name = f.split(/[/\\\\]/).pop();
        a.dataset.name = name;
        a.innerHTML = '<strong>'+ (idx+1).toString().padStart(2,'0') + '</strong> <span>'+ name +'</span>';
        a.addEventListener('click', (e)=>{ e.preventDefault(); load(idx); });
        li.appendChild(a); list.appendChild(li);
      });
      
      load(0);
      byId('search').addEventListener('input', (e)=>filterList(e.target.value));
      document.addEventListener('keydown', (e)=>{
        if(e.target.tagName === 'INPUT') return;
        if(e.key==='ArrowLeft') prev();
        if(e.key==='ArrowRight') next();
      });
      window.addEventListener('resize', onResize);
    });
  </script>
</head>
<body>
  <aside>
    <header>
      <input id="search" type="search" placeholder="Filtrar slides..." />
    </header>
    <ul id="list"></ul>
  </aside>
  <main>
    <div class="toolbar">
      <button onclick="prev()">◀ Anterior</button>
      <button onclick="next()">Próximo ▶</button>
      <span id="counter" class="hint"></span>
      <div class="spacer"></div>
      <label class="hint">Zoom:</label>
      <select id="zoomSelect" onchange="applyZoom(this.value)">
        <option value="fit" selected>Ajustar</option>
        <option value="0.5">50%</option>
        <option value="0.75">75%</option>
        <option value="1">100%</option>
      </select>
      <span id="zoomVal" class="hint">Auto</span>
    </div>
    <div id="viewer" class="viewer">
      <div id="wrap" class="frame-wrap">
        <iframe id="slideInner"></iframe>
      </div>
    </div>
  </main>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      });

      // Encontrar porta livre
      this.serverPort = await this.findFreePort();

      return new Promise((resolve) => {
        this.server = app.listen(this.serverPort, () => {
          console.log(`🌐 Servidor de assets iniciado na porta ${this.serverPort}`);
          resolve();
        });
      });
    }
  }

  async findFreePort() {
    const net = require('net');
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(0, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
    });
  }

  async createPage() {
    if (!this.browser) {
      await this.init();
    }

    const page = await this.browser.newPage();

    // Configurar viewport
    await page.setViewport({
      width: this.config.viewport.width,
      height: this.config.viewport.height,
      deviceScaleFactor: this.config.viewport.deviceScaleFactor
    });

    // Configurar timeouts
    page.setDefaultTimeout(this.config.timeouts.pageLoad);
    page.setDefaultNavigationTimeout(this.config.timeouts.pageLoad);

    return page;
  }

  async processHtmlFile(htmlPath, outputDir = null, suffix = '') {
    const fileName = path.basename(htmlPath, '.html');
    let page = null;

    try {
      console.log(`📄 Processando: ${htmlPath}`);
      // Verificar existência do arquivo
      if (!fs.existsSync(htmlPath)) {
        throw new Error('Arquivo não encontrado');
      }

      // Ler HTML
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      // Extrair configuração inline
      const ConfigManager = require('./ConfigManager');
      const configManager = new ConfigManager();
      const inlineConfig = configManager.extractInlineConfig(htmlContent);

      // Criar configuração efetiva para este arquivo
      const effectiveConfig = configManager.createEffectiveConfig(
        this.config,
        {},
        inlineConfig
      );

      // Validar HTML básico
      if (!this.validateHtml(htmlContent)) {
        throw new Error('HTML inválido: deve conter tags <html> e <body>');
      }

      // Processar assets relativos
      const processedHtml = this.processAssetPaths(htmlContent, htmlPath);

      // Criar página
      page = await this.createPage();
      // Aplicar viewport e timeouts conforme configuração efetiva
      await page.setViewport({
        width: effectiveConfig.viewport.width,
        height: effectiveConfig.viewport.height,
        deviceScaleFactor: effectiveConfig.viewport.deviceScaleFactor
      });
      page.setDefaultTimeout(effectiveConfig.timeouts.pageLoad);
      page.setDefaultNavigationTimeout(effectiveConfig.timeouts.pageLoad);

      // Configurar fundo se especificado
      if (effectiveConfig.output.background && effectiveConfig.output.background !== 'transparent') {
        await page.evaluateOnNewDocument((bgColor) => {
          document.documentElement.style.background = bgColor;
          document.body.style.background = bgColor;
        }, effectiveConfig.output.background);
      }

      // Carregar HTML
      await page.setContent(processedHtml, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: effectiveConfig.timeouts.pageLoad
      });

      // Aguardar carregamento adicional
      if (effectiveConfig.timeouts.assetLoad > 0) {
        await new Promise(resolve => setTimeout(resolve, effectiveConfig.timeouts.assetLoad));
      }

      // Aguardar fontes carregarem
      await page.evaluate(() => {
        return document.fonts ? document.fonts.ready : Promise.resolve();
      });

      // Aguardar todas as imagens carregarem completamente
      const imageInfo = await page.evaluate(async () => {
        const images = Array.from(document.images);
        return images.map((img, index) => ({
          index: index + 1,
          src: img.src || img.getAttribute('src') || 'SEM SRC',
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          width: img.width,
          height: img.height
        }));
      });

      if (imageInfo.length > 0) {
        console.log(`🖼️  Encontradas ${imageInfo.length} imagem(ns) no HTML:`);
        imageInfo.forEach(info => {
          console.log(`   ${info.index}. ${info.src}`);
          console.log(`      Status: complete=${info.complete}, naturalSize=${info.naturalWidth}x${info.naturalHeight}, displaySize=${info.width}x${info.height}`);
        });
        
        console.log(`\n⏳ Aguardando todas as imagens carregarem...`);
        
        const loadResults = await page.evaluate(async () => {
          const images = Array.from(document.images);
          const results = [];

          // Função para verificar se uma imagem está realmente carregada
          const isImageLoaded = (img) => {
            return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
          };

          // Aguardar cada imagem individualmente
          const imagePromises = images.map((img, index) => {
            const imgSrc = img.src || img.getAttribute('src') || 'DESCONHECIDO';
            const startTime = Date.now();
            
            // Se já está carregada, retornar imediatamente
            if (isImageLoaded(img)) {
              results.push({
                index: index + 1,
                src: imgSrc,
                status: 'já carregada',
                time: 0,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
              });
              return Promise.resolve();
            }

            // Caso contrário, aguardar o carregamento
            return new Promise((resolve) => {
              let resolved = false;
              let checkInterval = null;
              let loadEventFired = false;
              let errorEventFired = false;
              
              const resolveOnce = (reason) => {
                if (!resolved) {
                  resolved = true;
                  const elapsed = Date.now() - startTime;
                  if (checkInterval) {
                    clearInterval(checkInterval);
                  }
                  
                  const finalStatus = isImageLoaded(img) 
                    ? (loadEventFired ? 'carregada (onload)' : 'carregada (verificação)')
                    : (errorEventFired ? 'erro ao carregar' : 'timeout');
                  
                  results.push({
                    index: index + 1,
                    src: imgSrc,
                    status: finalStatus,
                    time: elapsed,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    complete: img.complete,
                    reason: reason
                  });
                  
                  resolve();
                }
              };

              // Aguardar evento onload
              img.addEventListener('load', () => {
                loadEventFired = true;
                resolveOnce('load event');
              }, { once: true });
              
              // Aguardar evento onerror (também resolve para não travar)
              img.addEventListener('error', (e) => {
                errorEventFired = true;
                resolveOnce('error event');
              }, { once: true });

              // Timeout de segurança: 10 segundos por imagem
              const timeoutId = setTimeout(() => {
                resolveOnce('timeout');
              }, 10000);

              // Verificar periodicamente se a imagem carregou
              checkInterval = setInterval(() => {
                if (isImageLoaded(img)) {
                  clearTimeout(timeoutId);
                  resolveOnce('periodic check');
                }
              }, 100);
            });
          });

          // Aguardar todas as imagens
          await Promise.all(imagePromises);

          // Aguardar um pouco mais para garantir que tudo está renderizado
          await new Promise(resolve => setTimeout(resolve, 200));
          
          return results;
        });
        
        console.log(`\n📊 Resultado do carregamento:`);
        loadResults.forEach(result => {
          const statusIcon = result.status.includes('carregada') ? '✅' : '❌';
          console.log(`   ${statusIcon} Imagem ${result.index}: ${result.src}`);
          console.log(`      Status: ${result.status} (${result.time}ms)`);
          console.log(`      Dimensões: ${result.naturalWidth}x${result.naturalHeight}`);
          if (result.reason) {
            console.log(`      Motivo: ${result.reason}`);
          }
        });
        
        const loadedCount = loadResults.filter(r => r.status.includes('carregada')).length;
        const failedCount = loadResults.length - loadedCount;
        
        if (failedCount > 0) {
          console.log(`\n⚠️  Atenção: ${failedCount} de ${loadResults.length} imagem(ns) não carregaram completamente!`);
        } else {
          console.log(`\n✅ Todas as ${loadResults.length} imagem(ns) carregaram com sucesso!`);
        }
      }

      // Aguardar tempo adicional para assets carregarem
      await new Promise(resolve => setTimeout(resolve, effectiveConfig.timeouts.assetLoad));

      // Determinar pasta de saída
      let finalOutputDir = outputDir || inlineConfig.outDir || path.dirname(htmlPath);

      // Usamos estritamente o outputDir ou a pasta do HTML caso não seja fornecido
      if (!outputDir && !inlineConfig.outDir) {
        console.log(`📁 Redirecionando saída para a mesma pasta do HTML: ${finalOutputDir}`);
      }

      const finalSuffix = suffix || inlineConfig.suffix || '';

      // Garantir que a pasta de saída existe
      if (!fs.existsSync(finalOutputDir)) {
        fs.mkdirSync(finalOutputDir, { recursive: true });
        console.log(`📁 Criando pasta: ${finalOutputDir}`);
      }

      // Gerar screenshot
      const imagePath = path.join(
        finalOutputDir,
        `${fileName}${finalSuffix}.${effectiveConfig.output.format}`
      );

      const screenshotOptions = {
        path: imagePath,
        type: effectiveConfig.output.format,
        fullPage: effectiveConfig.output.fullPage
      };

      // Adicionar qualidade para JPEG
      if (effectiveConfig.output.format === 'jpeg') {
        screenshotOptions.quality = effectiveConfig.output.quality;
      }

      // Configurar fundo transparente para PNG/WebP
      if (['png', 'webp'].includes(effectiveConfig.output.format) &&
        effectiveConfig.output.background === 'transparent') {
        screenshotOptions.omitBackground = true;
      }

      await page.screenshot(screenshotOptions);

      const relativePath = path.relative(process.cwd(), imagePath);
      console.log(`✅ Salvo: ${relativePath}`);
      return {
        success: true,
        inputFile: htmlPath,
        outputFile: imagePath,
        config: effectiveConfig
      };

    } catch (error) {
      console.error(`❌ Erro ao processar ${htmlPath}:`, error.message);
      return {
        success: false,
        inputFile: htmlPath,
        error: error.message
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async processMultipleFiles(htmlFiles, options = {}) {
    const { concurrency = this.config.processing.maxConcurrent, outputDir, suffix } = options;
    const results = [];

    console.log(`🔄 Processando ${htmlFiles.length} arquivo(s) com concorrência ${concurrency}`);

    // Processar em lotes
    for (let i = 0; i < htmlFiles.length; i += concurrency) {
      const batch = htmlFiles.slice(i, i + concurrency);
      const batchPromises = batch.map(file =>
        this.processHtmlFile(file, outputDir, suffix)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Processa arquivo compactado (ZIP/RAR) e converte HTMLs encontrados
   * @param {string} archivePath - Caminho do arquivo compactado
   * @param {string} outputDir - Pasta de saída
   * @returns {Promise<Array>} - Resultados da conversão
   */
  async processArchive(archivePath, outputDir = null) {
    console.log(`📦 Processando arquivo compactado: ${archivePath}`);

    try {
      // Verificar se é um arquivo compactado suportado
      if (!this.archiveProcessor.isArchive(archivePath)) {
        throw new Error(`Formato de arquivo não suportado. Use .zip ou .rar`);
      }

      // Extrair diretamente na pasta work
      const workDir = path.join(process.cwd(), 'work', 'htmls');
      const { htmlFiles } = await this.archiveProcessor.processArchive(archivePath, workDir);

      if (htmlFiles.length === 0) {
        console.log('⚠️  Nenhum arquivo HTML encontrado no arquivo compactado');
        return [];
      }

      console.log(`📄 Encontrados ${htmlFiles.length} arquivo(s) HTML no arquivo compactado`);

      // Processar HTMLs encontrados
      const results = await this.processMultipleFiles(htmlFiles, { outputDir: outputDir || path.join(process.cwd(), 'output') });

      console.log(`✅ Processamento do arquivo compactado concluído: ${results.length} imagem(ns) gerada(s)`);

      return results;

    } catch (error) {
      console.error(`❌ Erro ao processar arquivo compactado: ${error.message}`);
      throw error;
    }
  }

  validateHtml(htmlContent) {
    const hasHtmlTag = /<html[^>]*>/i.test(htmlContent);
    const hasBodyTag = /<body[^>]*>/i.test(htmlContent);
    return hasHtmlTag && hasBodyTag;
  }

  processAssetPaths(htmlContent, htmlFilePath) {
    const htmlDir = path.dirname(htmlFilePath);
    console.log(`\n🔍 Processando assets do arquivo: ${path.basename(htmlFilePath)}`);
    console.log(`   Diretório HTML: ${htmlDir}`);

    const stats = {
      assetCount: 0,
      processedCount: 0,
      notFoundCount: 0
    };

    // Função auxiliar para processar um caminho de asset
    const processAssetPath = (assetPath, originalMatch) => {
      stats.assetCount++;
      
      // Pular URLs absolutas e data URIs
      if (assetPath.startsWith('http') ||
        assetPath.startsWith('//') ||
        assetPath.startsWith('data:') ||
        assetPath.startsWith('file:')) {
        return originalMatch;
      }

      // Resolver caminho absoluto base
      let absolutePath = path.resolve(htmlDir, assetPath);
      let foundExtension = '';

      // --- 1. Lógica de "Detetive de Extensão" ---
      // Se o arquivo não existe exatamente como escrito, tentamos adicionar extensões comuns
      if (!fs.existsSync(absolutePath)) {
        const commonExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
        
        for (const ext of commonExtensions) {
          if (fs.existsSync(absolutePath + ext)) {
            absolutePath = absolutePath + ext;
            foundExtension = ext; // Guardamos a extensão encontrada
            console.log(`      ✨ Extensão descoberta automaticamente: ${ext}`);
            break;
          }
        }
      }

      console.log(`      Caminho absoluto final: ${absolutePath}`);

      // Verificar se arquivo existe (agora com a extensão correta se foi encontrada)
      if (fs.existsSync(absolutePath)) {
        const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
        // O servidor de assets precisa saber o caminho exato
        const serverUrl = `http://localhost:${this.serverPort}/assets/${relativePath}`;
        
        console.log(`      ✅ Arquivo encontrado`);
        console.log(`      🔄 Convertendo: ${assetPath} → ${serverUrl}`);
        stats.processedCount++;
        
        // Substituímos o caminho original pela URL do servidor local
        return originalMatch.replace(assetPath, serverUrl);

      } else {
        // Fallback: se estiver em work/htmls e o caminho for ./assets/... ou assets/...
        const isWorkDir = /\\work\\htmls|\/work\/htmls/.test(htmlDir);
        const matchesWorkAssets = /^(\.\/)?assets[\/]\/?.*/i.test(assetPath);
        
        if (isWorkDir && matchesWorkAssets) {
          const stripped = assetPath.replace(/^(\.\/)?assets[\/]/i, '');
          let parentAssetsCandidate = path.join(path.dirname(htmlDir), 'assets', stripped);
          
          // Tentar também com extensões no fallback
          if (!fs.existsSync(parentAssetsCandidate)) {
            const commonExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
            for (const ext of commonExtensions) {
              if (fs.existsSync(parentAssetsCandidate + ext)) {
                parentAssetsCandidate = parentAssetsCandidate + ext;
                console.log(`      ✨ Extensão descoberta no fallback: ${ext}`);
                break;
              }
            }
          }
          
          if (fs.existsSync(parentAssetsCandidate)) {
            absolutePath = parentAssetsCandidate;
            const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
            const serverUrl = `http://localhost:${this.serverPort}/assets/${relativePath}`;
            console.log(`      ✅ Encontrado no caminho pai`);
            console.log(`      🔄 Convertendo: ${assetPath} → ${serverUrl}`);
            stats.processedCount++;
            return originalMatch.replace(assetPath, serverUrl);
          }
        }

        console.warn(`      ⚠️  Asset não encontrado: ${assetPath}`);
        stats.notFoundCount++;
        return originalMatch;
      }
    };

    let processed = htmlContent;

    // --- 2. Regex Relaxada ---
    // Removemos a obrigatoriedade da extensão (\.(?:png|jpg...))
    // Agora pegamos TUDO que não seja aspas: ([^"']+)
    processed = processed.replace(/<img\s*([^>]*?)>/gi, (match, attributes) => {
      
      // Regex alterada: pega qualquer coisa dentro das aspas do src
      const srcMatch = attributes.match(/src\s*=\s*(["'])([^"']+)\1/i);
      
      if (srcMatch && srcMatch[2]) {
        const assetPath = srcMatch[2];
        // Filtro extra: ignorar se for muito curto ou parecer código inválido
        if(assetPath.trim().length > 1) {
            console.log(`\n   🖼️  Processando IMG: ${assetPath}`);
            const newMatch = processAssetPath(assetPath, match);
            return newMatch;
        }
      }
      return match;
    });

    // Processar tags <link> e <script> (Mantive similar, mas relaxei a regex também)
    processed = processed.replace(/<(link|script)\s+([^>]*?)>/gi, (match, tag, attributes) => {
      const attrName = tag === 'link' ? 'href' : 'src';
      // Regex relaxada também aqui
      const attrMatch = attributes.match(new RegExp(`${attrName}\\s*=\\s*(["'])([^"']+)\\1`, 'i'));
      
      if (attrMatch && attrMatch[2]) {
        // Verificamos se parece um arquivo de estilo ou script antes de processar
        const path = attrMatch[2];
        if (path.match(/\.(css|js|woff|ttf|otf)/i) || !path.includes('.')) { 
            const newMatch = processAssetPath(path, match);
            return newMatch;
        }
      }
      return match;
    });

    // Processar background-image inline
    processed = processed.replace(/background(-image)?:\s*url\((["']?)([^"')]+)\2\)/gi, (match, prop, quote, assetPath) => {
      if (assetPath) {
        const newMatch = processAssetPath(assetPath, match);
        return newMatch;
      }
      return match;
    });
    
    console.log(`\n📊 Resumo do processamento de assets:`);
    console.log(`   Total encontrados: ${stats.assetCount}`);
    console.log(`   ✅ Processados com sucesso: ${stats.processedCount}`);
    if (stats.notFoundCount > 0) {
      console.log(`   ❌ Não encontrados: ${stats.notFoundCount}`);
    }
    
    return processed;
  }

  generateReport(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n📊 Relatório de Conversão:');
    console.log('='.repeat(50));
    console.log(`✅ Sucessos: ${successful.length}`);
    console.log(`❌ Falhas: ${failed.length}`);
    console.log(`📈 Taxa de sucesso: ${((successful.length / results.length) * 100).toFixed(1)}%`);

    if (successful.length > 0) {
      console.log('\n✅ Arquivos convertidos:');
      successful.forEach(result => {
        console.log(`  ${path.basename(result.inputFile)} → ${path.basename(result.outputFile)}`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Falhas:');
      failed.forEach(result => {
        console.log(`  ${path.basename(result.inputFile)}: ${result.error}`);
      });
    }

    return { successful: successful.length, failed: failed.length };
  }

  async close() {
    if (this.browser) {
      console.log('🔄 Fechando navegador...');
      await this.browser.close();
      this.browser = null;
    }

    if (this.server) {
      console.log('🔄 Fechando servidor de assets...');
      return new Promise((resolve) => {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      });
    }
  }
}

module.exports = ImageProcessor;
