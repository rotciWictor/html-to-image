# Base de Conhecimento

Esta pasta contém sua base de conhecimento pessoal - documentos, prompts e informações que o sistema pode consultar.

## Estrutura organizada:

```
knowledge/
├── README.md              # Este arquivo
├── documents/             # Seus documentos pessoais
│   ├── projetos/
│   ├── referencias/
│   └── temporarios/
├── prompts/               # Seus prompts mestres
│   ├── slides-corporativos.md
│   ├── posts-instagram.md
│   └── relatorios.md
├── empresa/               # Informações da empresa
│   ├── valores.md
│   ├── produtos.json
│   └── equipe.yaml
├── projetos/              # Dados específicos de projetos
│   ├── projeto-a/
│   └── projeto-b/
├── referencias/           # Material de referência
│   ├── design-systems.md
│   └── templates/
└── pessoal/              # Conhecimento pessoal
    ├── objetivos-2025.md
    └── aprendizados.md
```

## Como usar:

1. **Coloque documentos** em `knowledge/documents/`
2. **Crie prompts mestres** em `knowledge/prompts/`
3. **Organize conhecimento** por categoria nas outras pastas
4. **O sistema consulta automaticamente** baseado no seu prompt

## Tipos de conteúdo:

### 📊 **Dados Estruturados** (.json, .yaml)
```json
{
  "produtos": [
    {
      "nome": "Produto A",
      "categoria": "Software",
      "publico_alvo": "Desenvolvedores",
      "preco": "R$ 99/mês"
    }
  ]
}
```

### 📝 **Documentação** (.md)
```markdown
# Valores da Empresa

## Missão
Democratizar o acesso à tecnologia...

## Visão
Ser referência em inovação...

## Valores
- Transparência
- Inovação
- Colaboração
```

### ⚙️ **Configurações** (.yaml)
```yaml
projeto_a:
  inicio: "2025-01-01"
  fim: "2025-06-30"
  equipe:
    - nome: "João Silva"
      papel: "Tech Lead"
    - nome: "Maria Santos"
      papel: "Designer"
```

## Comandos de exemplo:

```bash
# Consultar base de conhecimento
node index.js --ai --prompt "Com base no conhecimento sobre nossos produtos, crie 4 slides de apresentação comercial" --preset ppt

# Usar conhecimento específico
node index.js --ai --prompt "Usando dados do projeto-a, crie status report" --knowledge "projetos/projeto-a/" --preset instagram
```

## ⚠️ Importante:
- Esta pasta é **ignorada pelo Git** - sua base de conhecimento não será commitada
- Mantenha informações atualizadas
- Use estrutura consistente para facilitar consultas
- Documente mudanças importantes
