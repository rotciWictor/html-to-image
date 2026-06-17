module.exports = {
  // Diretório raiz dos testes
  testMatch: [
    '**/tests/**/*.test.js'
  ],

  // Cobertura de código
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'lib/**/*.js',
    'bin/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Ambiente de teste
  testEnvironment: 'node',

  // Timeout para testes longos (Puppeteer)
  testTimeout: 10000,

  // Configurações de verbose
  verbose: true,

  // Setup files
  setupFilesAfterEnv: [],

  // Transformações
  transform: {},

  // Ignorar arquivos
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/examples/',
    '/work/'
  ],

  // Configurações específicas do projeto
  displayName: {
    name: 'HTML to Image Converter',
    color: 'blue'
  },

  // Limpar mocks automaticamente
  clearMocks: true,

  // Restaurar mocks automaticamente
  restoreMocks: true,

  // Forçar saída do Jest após testes
  forceExit: true
};
