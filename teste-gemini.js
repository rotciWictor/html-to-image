#!/usr/bin/env node

/**
 * 🧠 Teste de Integração com Gemini
 * 
 * Script para testar a geração de conteúdo usando prompts com Gemini
 * Execute: node teste-gemini.js
 */

require('dotenv').config();
const AIHtmlGenerator = require('./lib/AIHtmlGenerator');

async function testarGemini() {
  console.log('🧠 Testando Integração com Gemini...\n');
  
  // Verificar se a chave está configurada
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY não encontrada!');
    console.log('💡 Crie um arquivo .env com: GEMINI_API_KEY=sua_chave_aqui');
    process.exit(1);
  }
  
  try {
    // Inicializar o gerador
    const generator = new AIHtmlGenerator({
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY
    });
    
    console.log('✅ Gerador inicializado com sucesso');
    
    // Teste 1: Health check
    console.log('\n🔍 Testando conexão com Gemini...');
    const isHealthy = await generator.adapter.healthCheck();
    
    if (isHealthy) {
      console.log('✅ Conexão com Gemini OK');
    } else {
      console.log('❌ Problema na conexão com Gemini');
      return;
    }
    
    // Teste 2: Geração simples
    console.log('\n🎨 Testando geração de conteúdo...');
    
    const prompt = "Crie 3 posts do Instagram sobre dicas de produtividade para empreendedores, com design moderno e cores profissionais";
    
    console.log(`📝 Prompt: ${prompt}`);
    console.log('⏳ Gerando conteúdo...');
    
    const htmls = await generator.generateHtmls({
      prompt: prompt,
      count: 3,
      preset: 'instagram'
    });
    
    console.log(`✅ ${htmls.length} HTMLs gerados com sucesso!`);
    
    // Mostrar informações dos arquivos gerados
    htmls.forEach((html, index) => {
      console.log(`📄 ${html.filename} (${html.html.length} caracteres)`);
    });
    
    // Teste 3: Salvar na pasta de trabalho
    console.log('\n💾 Salvando arquivos...');
    
    const outputDir = await generator.writeToWorkFolder(htmls, undefined, {
      prompt: 'teste-produtividade',
      preset: 'instagram',
      slides: htmls.length
    });
    
    console.log(`✅ Arquivos salvos em: ${outputDir}`);
    
    // Teste 4: Listar documentos da base de conhecimento
    console.log('\n📚 Testando base de conhecimento...');
    
    const documents = generator.listAvailableDocuments();
    console.log(`📖 Documentos disponíveis: ${documents.length}`);
    
    if (documents.length > 0) {
      console.log('📋 Lista de documentos:');
      documents.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc}`);
      });
    }
    
    // Teste 5: Busca na base de conhecimento
    console.log('\n🔍 Testando busca na base de conhecimento...');
    
    const searchResults = generator.searchDocuments('marketing');
    console.log(`🔎 Resultados para "marketing": ${searchResults.length}`);
    
    if (searchResults.length > 0) {
      console.log('📋 Documentos encontrados:');
      searchResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name} (relevância: ${result.relevance})`);
      });
    }
    
    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Revise os HTMLs gerados na pasta de trabalho');
    console.log('   2. Converta para imagens: node magic.js [pasta-gerada]');
    console.log('   3. Use as imagens em seus projetos!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('💡 Verifique se sua chave da API Gemini está correta');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('💡 Cota da API excedida, tente novamente mais tarde');
    } else if (error.message.includes('SAFETY')) {
      console.log('💡 Conteúdo bloqueado por filtros de segurança');
    }
  }
}

// Executar teste
if (require.main === module) {
  testarGemini().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = testarGemini;
