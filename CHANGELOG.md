# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2025-01-18

### 🚀 Major Release - CLI Enhancement & Major Improvements

### Adicionado
- **Novo comando CLI `h2i`** - Comando muito mais curto e intuitivo
- Suporte completo a arquivos ZIP/RAR com extração automática
- Descoberta recursiva de arquivos HTML em subdiretórios
- Fallback gracioso para prompt mestre ausente
- Arquivo `CHANGELOG.md` completo para histórico de versões
- Resumo executivo em `docs/RESUMO_EXECUTIVO.md`

### Corrigido
- **Processamento de assets CSS** via atributos `href`
- Servidor de assets restrito apenas a diretórios seguros
- Implementação correta da API assíncrona do `node-stream-zip`
- Limpeza automática de diretórios temporários de extração
- Lógica de detecção de presets (Instagram vs Stories vs PPT)
- Uso consistente de `effectiveConfig` em todo o processamento
- Verificação de existência de arquivos antes do processamento
- Mocks de testes atualizados para `jest.spyOn`
- Handles abertos do Jest resolvidos com cleanup adequado

### Alterado
- **BREAKING CHANGE**: CLI mudou de `html-to-image` para `h2i`
- Node.js mínimo atualizado para >=18.18.0
- `dotenv` atualizado para ^16.4.5
- Exemplos de uso atualizados no README
- Configuração do Jest otimizada com `forceExit: true`

### Removido
- Dependência `yauzl` substituída por `node-stream-zip`
- Referência a `index.js` removida do `package.json`

### Performance
- Carregamento de assets melhorado com processamento correto de `href`
- Melhor gerenciamento de memória com limpeza automática
- Execução de testes mais rápida com mocks otimizados

### Segurança
- Servidor de assets restrito apenas a diretórios seguros
- Melhor tratamento de erros e validação

---

## [1.1.0] - 2025-01-18

### Adicionado
- Suporte completo a arquivos ZIP e RAR com extração automática
- Busca recursiva de arquivos HTML em subdiretórios
- Processamento de assets CSS via `href` (além de `src`)
- Servidor de assets restrito a diretórios seguros (`work/`, `examples/`, `output/`)
- Fallback gracioso no KnowledgeManager quando prompt mestre não existe
- Suíte de testes expandida para 49 testes unitários
- Suporte a override de configuração no `ImageProcessor.init()`

### Corrigido
- API async do `node-stream-zip` implementada corretamente
- Limpeza automática de diretórios temporários após extração
- Detecção de preset corrigida (Instagram vs Stories vs PPT)
- Uso consistente de `effectiveConfig` em todo o processamento
- Verificação de existência de arquivos antes do processamento
- Mocks de testes atualizados para `jest.spyOn`
- Handles abertos do Jest resolvidos com cleanup adequado

### Alterado
- Node.js mínimo atualizado para >=18.18.0
- `dotenv` atualizado para ^16.4.5
- CLI atualizado para usar `h2i` (comando curto e intuitivo)
- Exemplos de uso atualizados no README
- Configuração do Jest otimizada com `forceExit: true`

### Removido
- Dependência `yauzl` substituída por `node-stream-zip`
- Referência a `index.js` removida do `package.json`

## [1.0.0] - 2025-01-16

### Adicionado
- Versão inicial do HTML to Image Converter
- Arquitetura modular com classes separadas
- CLI robusto com Commander.js
- Presets para Instagram, Stories, PowerPoint e Genérico
- Modo AI com integração Gemini
- Configuração inline via JSON ou meta tags
- 34 testes unitários iniciais
- Documentação completa
