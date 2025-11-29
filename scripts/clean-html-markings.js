const fs = require('fs');
const path = require('path');

function cleanHtmlMarkings(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remover marcações [cite_start]
    content = content.replace(/\[cite_start\]/g, '');
    
    // Remover marcações [cite: número]
    content = content.replace(/\[cite:\s*\d+\]/g, '');
    
    // Remover marcações [cite: número] com espaços extras
    content = content.replace(/\[\s*cite:\s*\d+\s*\]/g, '');
    
    // Remover marcações cite init cite número
    content = content.replace(/cite\s+init\s+cite\s+\d+/gi, '');
    
    // Remover marcações cite número
    content = content.replace(/cite\s+\d+/gi, '');
    
    // Limpar espaços extras que podem ter sobrado
    content = content.replace(/\s+/g, ' ');
    content = content.replace(/>\s+</g, '><');
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function processHtmlFiles() {
  const htmlsDir = path.join(__dirname, '..', 'work', 'htmls');
  
  if (!fs.existsSync(htmlsDir)) {
    console.error('Pasta work/htmls não encontrada!');
    return;
  }
  
  const files = fs.readdirSync(htmlsDir)
    .filter(file => file.endsWith('.html') && file !== '_preview.html')
    .map(file => path.join(htmlsDir, file));
  
  console.log('🧹 Limpando marcações de texto dos arquivos HTML...');
  console.log(`📁 Processando ${files.length} arquivos...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  files.forEach(file => {
    const fileName = path.basename(file);
    if (cleanHtmlMarkings(file)) {
      console.log(`✅ ${fileName} - Limpo`);
      successCount++;
    } else {
      console.log(`❌ ${fileName} - Erro`);
      errorCount++;
    }
  });
  
  console.log('\n📊 Resumo:');
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📄 Total: ${files.length}`);
  
  if (successCount > 0) {
    console.log('\n🎯 Marcações removidas:');
    console.log('   - [cite_start]');
    console.log('   - [cite: número]');
    console.log('   - cite init cite número');
    console.log('   - cite número');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  processHtmlFiles();
}

module.exports = { cleanHtmlMarkings, processHtmlFiles };

























