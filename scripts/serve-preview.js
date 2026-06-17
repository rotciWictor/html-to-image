const express = require('express');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 3000;

// Servir arquivos estáticos da pasta work
app.use('/work', express.static(path.join(__dirname, '..', 'work')));

// Rota principal - redireciona para o preview
app.get('/', (req, res) => {
  res.redirect('/work/htmls/_preview.html');
});

// Rota para regenerar o preview
app.get('/regenerate', (req, res) => {
  try {
    execSync('npm run preview', { stdio: 'inherit' });
    res.json({ success: true, message: 'Preview regenerado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao regenerar preview: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Servidor de Preview iniciado!');
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log('🔄 Para regenerar: http://localhost:3000/regenerate');
  console.log('⏹️  Pressione Ctrl+C para parar');
});































