const fs = require('fs');
const path = require('path');

function listHtmlFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  return items
    .filter((it) => it.isFile() && it.name.toLowerCase().endsWith('.html'))
    .map((it) => it.name)
    .filter((name) => name !== '_preview.html')
    .sort((a, b) => {
      // natural sort by slide number if present
      const re = /slide-(\d+)\.html/i;
      const ma = a.match(re);
      const mb = b.match(re);
      if (ma && mb) return Number(ma[1]) - Number(mb[1]);
      return a.localeCompare(b);
    });
}

function buildPreviewHtml(files) {
  const initial = files[0] || '';
  const filesJson = JSON.stringify(files);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview dos Slides</title>
  <style>
    :root { --panel-width: 320px; --bg: #0f172a; --panel: #111827; --text: #e5e7eb; --accent: #22c55e; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: var(--bg); color: var(--text); display: grid; grid-template-columns: var(--panel-width) 1fr; height: 100vh; }
    aside { background: var(--panel); border-right: 1px solid #1f2937; display: flex; flex-direction: column; min-width: var(--panel-width); }
    header { padding: 12px 16px; border-bottom: 1px solid #1f2937; display: flex; gap: 8px; align-items: center; }
    header input { flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid #374151; background: #0b1220; color: var(--text); }
    header .info { font-size: 12px; opacity: 0.8; }
    ul { list-style: none; padding: 8px; margin: 0; overflow: auto; }
    li { margin: 4px 0; }
    a.item, a.item:visited, a.item:hover, a.item:active, a.item:focus { text-decoration: none; outline: none; }
    a.item { display: flex; gap: 8px; padding: 8px 10px; color: var(--text); border-radius: 6px; border: 1px solid transparent; }
    a.item:hover { background: #0b1220; border-color: #1f2937; }
    a.item.active { background: #0b1220; border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
    main { display: grid; grid-template-rows: auto 1fr; min-width: 0; }
    .toolbar { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid #1f2937; }
    .toolbar button, .toolbar select { background: #111827; color: var(--text); border: 1px solid #374151; border-radius: 6px; padding: 8px 10px; cursor: pointer; }
    .toolbar .spacer { flex: 1; }
    .viewer { display: grid; place-items: center; overflow: hidden; background: radial-gradient(60% 60% at 50% 50%, #0b1220 0%, #0a0f1c 100%); }
    .frame-wrap { width: 1200px; height: 800px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,.35); transform-origin: top left; overflow: hidden; }
    #slideInner { width: 100%; height: 100%; overflow: hidden; }
    .hint { font-size: 12px; opacity: .8; }
  </style>
  <script>
    const files = ${filesJson};
    let baseW = 1200; let baseH = 800;
    function byId(id){ return document.getElementById(id); }
    function getParam(name){ const u=new URL(location.href); return u.searchParams.get(name); }
    function setParam(name, val){ const u=new URL(location.href); if(val==null){u.searchParams.delete(name);} else {u.searchParams.set(name,val);} history.replaceState(null, '', u.toString()); }
    function currentIndex(){ const f=getParam('file'); const i=files.indexOf(f); return i>=0?i:0; }
    // Helpers para reescrever assets relativos
    function isAbsolute(u){ const s = String(u == null ? '' : u); return /^[a-z]+:/i.test(s) || s.startsWith('/') || s.startsWith('data:') || s.startsWith('blob:'); }
    function normalizeAssetPath(src, base){
      try {
        const baseUrl = base instanceof URL ? base : new URL(base, window.location.href);
        const pathname = baseUrl.pathname || '';
        if (pathname.indexOf('/htmls/') !== -1) {
          if (src.startsWith('./assets/')) return src.replace('./assets/', '../assets/');
          if (src.startsWith('assets/')) return '../' + src;
        }
      } catch (_) {}
      return src;
    }
    function rewriteCssUrls(css, base){
      const pattern = new RegExp("url\\\\(\\\\s*(?:\\\"|\\')?([^\\\"\\'\\\\)]+)(?:\\\"|\\')?\\\\s*\\\\)", "g");
      return (css||'').replace(pattern, (m, src)=>{
        if(!src || isAbsolute(src)) return m;
        const fixed = normalizeAssetPath(src, base);
        const abs = new URL(fixed, base).toString();
        return 'url("'+abs+'")';
      });
    }
    function rewriteSrcSet(ss, base){
      return (ss||'').split(',').map(part=>{ const p = part.trim(); if(!p) return p; const seg = p.split(/\\\s+/); let u = seg.shift(); const d = seg.join(' '); if(!isAbsolute(u)) u = normalizeAssetPath(u, base); const abs = isAbsolute(u) ? u : new URL(u, base).toString(); return d ? (abs+' '+d) : abs; }).join(', ');
    }
    function rewriteDomAssets(root, base){
      root.querySelectorAll('[src]').forEach(el=>{ let s = el.getAttribute('src'); if(s && !isAbsolute(s)) { s = normalizeAssetPath(s, base); el.setAttribute('src', new URL(s, base).toString()); } });
      root.querySelectorAll('[srcset]').forEach(el=>{ const s = el.getAttribute('srcset'); if(s) el.setAttribute('srcset', rewriteSrcSet(s, base)); });
      root.querySelectorAll('link[href]').forEach(el=>{ let h = el.getAttribute('href'); if(h && !isAbsolute(h)) { h = normalizeAssetPath(h, base); el.setAttribute('href', new URL(h, base).toString()); } });
      root.querySelectorAll('[style]').forEach(el=>{ const st = el.getAttribute('style'); if(st){ const nw = rewriteCssUrls(st, base); if(nw !== st) el.setAttribute('style', nw); } });
    }
    async function load(index){ if(index<0||index>=files.length) return; const file=files[index]; setParam('file', file); highlight(file); updateCounter(index);
      try {
        const url = new URL(file, window.location.href);
        const res = await fetch(url.toString(), { cache: 'no-store' });
        if(!res.ok) throw new Error('HTTP '+res.status);
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // detectar dimensões via h2i-config ou container raiz
        try {
          const cfgEl = doc.querySelector('#h2i-config');
          if (cfgEl && cfgEl.textContent) {
            const cfg = JSON.parse(cfgEl.textContent);
            if (cfg && cfg.width && cfg.height) {
              baseW = Number(cfg.width); baseH = Number(cfg.height);
            }
          } else if (doc.body && doc.body.firstElementChild) {
            const root = doc.body.firstElementChild;
            const w = parseInt(root.style && root.style.width ? root.style.width : '0');
            const h = parseInt(root.style && root.style.height ? root.style.height : '0');
            if (w>0 && h>0) { baseW = w; baseH = h; }
          }
        } catch (_) {}
        
        const wrap = byId('wrap');
        wrap.style.width = baseW + 'px';
        wrap.style.height = baseH + 'px';
        
        // Em vez de hackear o DOM, usamos um iframe perfeitamente isolado!
        let iframe = byId('slideInner');
        if (iframe.tagName !== 'IFRAME') {
          const newIframe = document.createElement('iframe');
          newIframe.id = 'slideInner';
          newIframe.style.width = '100%';
          newIframe.style.height = '100%';
          newIframe.style.border = 'none';
          iframe.parentNode.replaceChild(newIframe, iframe);
          iframe = newIframe;
        }
        iframe.src = url.toString();
        
        // Após carregar novo conteúdo, re-aplicar zoom atual
        const z = getParam('zoom') || 'fit';
        applyZoom(z);
      } catch (e) {
        let container = byId('slideInner');
        if (container.tagName === 'IFRAME') {
            const div = document.createElement('div');
            div.id = 'slideInner';
            container.parentNode.replaceChild(div, container);
            container = div;
        }
        container.innerHTML = '<div style="padding:16px;color:#ef4444">Falha ao carregar '+ file +': '+ String(e) +'</div>';
      }
    }
    function highlight(file){ document.querySelectorAll('a.item').forEach(a=>a.classList.toggle('active', a.dataset.file===file)); }
    function updateCounter(i){ byId('counter').textContent = (i+1) + ' / ' + files.length; }
    function prev(){ load(currentIndex()-1); }
    function next(){ load(currentIndex()+1); }
    function viewerSize(){ const v = byId('viewer'); return { w: v.clientWidth, h: v.clientHeight }; }
    function fitScale(){ const { w, h } = viewerSize(); const zw = w / baseW; const zh = h / baseH; return Math.max(0.1, Math.min(2, Math.min(zw, zh))); }
    function applyZoom(val){ const wrap = byId('wrap'); const select = byId('zoomSelect');
      if(val === 'fit'){ const z = fitScale(); wrap.style.transform = 'scale(' + z + ')'; byId('zoomVal').textContent = (z*100).toFixed(0)+'%'; setParam('zoom', 'fit'); if(select && select.value !== 'fit') select.value='fit'; return; }
      const z = Number(val); wrap.style.transform = 'scale(' + z + ')'; byId('zoomVal').textContent = (z*100).toFixed(0)+'%'; setParam('zoom', z); }
    function onResize(){ if(getParam('zoom')==='fit'){ applyZoom('fit'); } }
    function filterList(q){ q=q.toLowerCase(); document.querySelectorAll('a.item').forEach(a=>{ const show=a.dataset.file.toLowerCase().includes(q); a.parentElement.style.display = show? 'block':'none';}); }
    window.addEventListener('DOMContentLoaded', ()=>{
      const list=byId('list');
      files.forEach((f, idx)=>{
        const li=document.createElement('li');
        const a=document.createElement('a');
        a.href='#'; a.className='item'; a.dataset.file=f; a.innerHTML = '<strong>'+ (idx+1).toString().padStart(2,'0') + '</strong> <span>'+ f +'</span>';
        a.addEventListener('click', (e)=>{ e.preventDefault(); load(idx); });
        li.appendChild(a); list.appendChild(li);
      });
      const start = Math.max(0, currentIndex());
      // Ajustar por padrão
      applyZoom('fit');
      load(start);
      byId('search').addEventListener('input', (e)=>filterList(e.target.value));
      document.addEventListener('keydown', (e)=>{
        if(e.target.tagName === 'INPUT') return;
        if(e.key==='ArrowLeft') prev();
        if(e.key==='ArrowRight') next();
        if(e.key==='[') applyZoom(Math.max(0.25, Number(getParam('zoom')||1) - 0.1).toFixed(2));
        if(e.key===']') applyZoom(Math.min(2, Number(getParam('zoom')||1) + 0.1).toFixed(2));
      });
      window.addEventListener('resize', onResize);
    });
  </script>
  <!-- Abra este arquivo com o Live Server para reload automático ao editar os slides -->
  <!-- Dicas: ← → para navegar | [ e ] para zoom | busca filtra a lista -->
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
        <option value="fit">Ajustar</option>
        <option value="0.5">50%</option>
        <option value="0.75">75%</option>
        <option value="1" selected>100%</option>
        <option value="1.25">125%</option>
        <option value="1.5">150%</option>
        <option value="2">200%</option>
      </select>
      <span id="zoomVal" class="hint">100%</span>
    </div>
    <div id="viewer" class="viewer">
      <div id="wrap" class="frame-wrap">
        <div id="slideInner"></div>
      </div>
    </div>
  </main>
</body>
</html>`;
}

function main() {
  const baseDir = path.resolve(process.cwd(), 'work', 'htmls');
  if (!fs.existsSync(baseDir)) {
    console.error('Pasta não encontrada:', baseDir);
    process.exit(1);
  }
  const files = listHtmlFiles(baseDir);
  const html = buildPreviewHtml(files);
  const outPath = path.join(baseDir, '_preview.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('✅ Preview gerado em', outPath);
  console.log('📄 Arquivos indexados:', files.length);
  files.forEach((f, i) => console.log(String(i+1).padStart(2,'0') + ' - ' + f));
}

main();


