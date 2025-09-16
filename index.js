#!/usr/bin/env node

/**
 * HTML to Image Converter v1.0 - Entry Point
 * 
 * Este é o ponto de entrada principal que delega para o executável em bin/
 * 
 * @author HTML to Image Converter Team
 * @version 1.0.0
 * @year 2025
 */

const path = require('path');

// Delegar execução para o arquivo principal em bin/
require(path.join(__dirname, 'bin', 'html-to-image.js'));
