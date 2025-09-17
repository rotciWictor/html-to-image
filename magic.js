#!/usr/bin/env node

/**
 * ✨ Magic - HTML to Image Converter v1.0 ✨
 * 
 * Transforme seus HTMLs em imagens com a magia da IA!
 * 
 * @author HTML to Image Converter Team
 * @version 1.0.0
 * @year 2025
 */

const { spawn } = require('child_process');
const path = require('path');

// Executar o arquivo principal passando todos os argumentos
const mainScript = path.join(__dirname, 'bin', 'html-to-image.js');
const child = spawn('node', [mainScript, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: __dirname
});

// Propagar o código de saída
child.on('exit', (code) => {
  process.exit(code);
});
