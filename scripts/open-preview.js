const { execSync } = require('child_process');
const path = require('path');

console.log('🎯 HTML to Image Converter - Preview');
console.log('=====================================');

// 1. Limpar marcações de texto
console.log('🧹 Limpando marcações de texto...');
try {
  execSync('npm run clean:markings', { stdio: 'inherit' });
  console.log('✅ Marcações removidas com sucesso!');
} catch (error) {
  console.error('❌ Erro ao limpar marcações:', error.message);
  process.exit(1);
}

// 2. Gerar o preview
console.log('📄 Gerando preview...');
try {
  execSync('npm run preview', { stdio: 'inherit' });
  console.log('✅ Preview gerado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao gerar preview:', error.message);
  process.exit(1);
}

// 3. Iniciar servidor
console.log('🚀 Iniciando servidor local...');
console.log('📱 Acesse: http://localhost:3000');
console.log('⏹️  Pressione Ctrl+C para parar o servidor');
console.log('');

// Executar o servidor
execSync('node scripts/serve-preview.js', { stdio: 'inherit' });
