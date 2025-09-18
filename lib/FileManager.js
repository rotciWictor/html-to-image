const fs = require('fs');
const path = require('path');

/**
 * Gerenciador de arquivos e operações do sistema de arquivos
 */
class FileManager {
  /**
   * Encontra arquivos HTML em uma pasta
   * @param {string} folder - Pasta para buscar
   * @returns {Array<string>} Lista de caminhos de arquivos HTML
   */
  findHtmlFiles(folder) {
    const files = fs.readdirSync(folder);
    return files
      .filter(file => file.toLowerCase().endsWith('.html'))
      .map(file => path.join(folder, file))
      .sort();
  }

  /**
   * Encontra arquivos HTML recursivamente em uma pasta
   * @param {string} folder - Pasta para buscar
   * @returns {Array<string>} Lista de caminhos de arquivos HTML
   */
  findHtmlFilesRecursive(folder) {
    const results = [];
    const items = fs.readdirSync(folder, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(folder, item.name);
      if (item.isDirectory()) {
        results.push(...this.findHtmlFilesRecursive(fullPath));
      } else if (item.isFile() && item.name.toLowerCase().endsWith('.html')) {
        results.push(fullPath);
      }
    }
    return results.sort();
  }

  /**
   * Encontra arquivos ZIP/RAR em uma pasta
   * @param {string} folder - Pasta para buscar
   * @returns {Array<string>} Lista de caminhos de arquivos compactados
   */
  findZipFiles(folder) {
    const files = fs.readdirSync(folder);
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.zip', '.rar'].includes(ext);
      })
      .map(file => path.join(folder, file))
      .sort();
  }

  /**
   * Cria pasta de assets com arquivos de exemplo
   * @param {string} folder - Pasta base
   * @returns {string} Caminho da pasta assets criada
   */
  createAssetsFolder(folder) {
    const assetsPath = path.join(folder, 'assets');
    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
      this.createSampleAssets(assetsPath);
      console.log('📁 Pasta assets criada com arquivos de exemplo');
    }
    return assetsPath;
  }

  /**
   * Cria arquivos de exemplo na pasta assets
   * @param {string} assetsPath - Caminho da pasta assets
   */
  createSampleAssets(assetsPath) {
    // CSS de exemplo
    const cssContent = `/* Estilos de exemplo */
.slide {
    padding: 2rem;
    text-align: center;
}

.title {
    font-size: 2rem;
    color: #333;
    margin-bottom: 1rem;
}

.content {
    font-size: 1.2rem;
    line-height: 1.6;
    color: #666;
}`;

    // JS de exemplo
    const jsContent = `// Script de exemplo
console.log('HTML to Image Converter - Script carregado');

// Adicionar interatividade se necessário
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada e pronta para conversão');
});`;

    // SVG de exemplo
    const svgContent = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#4CAF50"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="20">✓</text>
</svg>`;

    fs.writeFileSync(path.join(assetsPath, 'style.css'), cssContent, 'utf8');
    fs.writeFileSync(path.join(assetsPath, 'script.js'), jsContent, 'utf8');
    fs.writeFileSync(path.join(assetsPath, 'icon-check.svg'), svgContent, 'utf8');
  }

  /**
   * Verifica se um caminho existe
   * @param {string} path - Caminho para verificar
   * @returns {boolean} True se existe
   */
  exists(path) {
    return fs.existsSync(path);
  }

  /**
   * Cria diretório recursivamente
   * @param {string} dirPath - Caminho do diretório
   */
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Escreve arquivo com encoding UTF-8
   * @param {string} filePath - Caminho do arquivo
   * @param {string} content - Conteúdo do arquivo
   */
  writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Lê arquivo com encoding UTF-8
   * @param {string} filePath - Caminho do arquivo
   * @returns {string} Conteúdo do arquivo
   */
  readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Obtém estatísticas de um arquivo/pasta
   * @param {string} path - Caminho para analisar
   * @returns {fs.Stats} Estatísticas do arquivo
   */
  getStats(path) {
    return fs.statSync(path);
  }
}

module.exports = FileManager;
