const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');

class ArchiveProcessor {
  constructor() {
    this.supportedFormats = ['.zip', '.rar'];
  }

  /**
   * Verifica se o arquivo é um arquivo compactado suportado
   * @param {string} filePath - Caminho do arquivo
   * @returns {boolean}
   */
  isArchive(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * Extrai arquivo ZIP para uma pasta temporária
   * @param {string} archivePath - Caminho do arquivo ZIP
   * @param {string} extractPath - Pasta de destino
   * @returns {Promise<string>} - Caminho da pasta extraída
   */
  async extractZip(archivePath, extractPath) {
    return new Promise((resolve, reject) => {
      yauzl.open(archivePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) return reject(err);

        const extractedFiles = [];
        let processedEntries = 0;

        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // É uma pasta, criar diretório
            const dirPath = path.join(extractPath, entry.fileName);
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            zipfile.readEntry();
          } else {
            // É um arquivo, extrair
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) return reject(err);

              const filePath = path.join(extractPath, entry.fileName);
              const dir = path.dirname(filePath);
              
              // Criar diretório se não existir
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }

              const writeStream = fs.createWriteStream(filePath);
              readStream.pipe(writeStream);
              
              writeStream.on('close', () => {
                extractedFiles.push(filePath);
                processedEntries++;
                
                if (processedEntries === zipfile.entryCount) {
                  zipfile.close();
                  resolve(extractPath);
                }
              });
              
              writeStream.on('error', reject);
            });
          }
        });

        zipfile.on('end', () => {
          if (processedEntries === 0) {
            resolve(extractPath);
          }
        });

        zipfile.on('error', reject);
      });
    });
  }

  /**
   * Processa arquivo RAR (requer unrar instalado)
   * @param {string} archivePath - Caminho do arquivo RAR
   * @param {string} extractPath - Pasta de destino
   * @returns {Promise<string>} - Caminho da pasta extraída
   */
  async extractRar(archivePath, extractPath) {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      // Verificar se unrar está disponível
      await execAsync('unrar');
    } catch (error) {
      throw new Error('unrar não encontrado. Instale o WinRAR ou unrar para suportar arquivos RAR.');
    }

    // Extrair RAR
    await execAsync(`unrar x "${archivePath}" "${extractPath}"`);
    return extractPath;
  }

  /**
   * Extrai arquivo compactado (ZIP ou RAR)
   * @param {string} archivePath - Caminho do arquivo
   * @param {string} extractPath - Pasta de destino
   * @returns {Promise<string>} - Caminho da pasta extraída
   */
  async extract(archivePath, extractPath) {
    const ext = path.extname(archivePath).toLowerCase();
    
    if (ext === '.zip') {
      return await this.extractZip(archivePath, extractPath);
    } else if (ext === '.rar') {
      return await this.extractRar(archivePath, extractPath);
    } else {
      throw new Error(`Formato de arquivo não suportado: ${ext}`);
    }
  }

  /**
   * Encontra arquivos HTML em uma pasta (incluindo subpastas)
   * @param {string} folderPath - Caminho da pasta
   * @returns {string[]} - Array de caminhos de arquivos HTML
   */
  findHtmlFiles(folderPath) {
    const htmlFiles = [];
    
    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDirectory(itemPath);
        } else if (path.extname(item).toLowerCase() === '.html') {
          htmlFiles.push(itemPath);
        }
      }
    }
    
    scanDirectory(folderPath);
    return htmlFiles;
  }

  /**
   * Processa arquivo compactado e retorna lista de HTMLs
   * @param {string} archivePath - Caminho do arquivo compactado
   * @returns {Promise<{htmlFiles: string[], extractPath: string}>}
   */
  async processArchive(archivePath) {
    const tempDir = path.join(path.dirname(archivePath), 'temp_' + Date.now());
    
    try {
      // Criar pasta temporária
      fs.mkdirSync(tempDir, { recursive: true });
      
      // Extrair arquivo
      const extractPath = await this.extract(archivePath, tempDir);
      
      // Encontrar arquivos HTML
      const htmlFiles = this.findHtmlFiles(extractPath);
      
      return {
        htmlFiles,
        extractPath
      };
    } catch (error) {
      // Limpar pasta temporária em caso de erro
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      throw error;
    }
  }

  /**
   * Limpa pasta temporária
   * @param {string} extractPath - Caminho da pasta temporária
   */
  cleanup(extractPath) {
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
  }
}

module.exports = ArchiveProcessor;
