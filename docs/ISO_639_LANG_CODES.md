## 🌍 Guia Rápido de Códigos de Idioma (ISO 639‑1)

Esta tabela ajuda a escolher o valor para as flags `--translate` e `--source-lang`.

- **Formato esperado:** código ISO 639‑1 (2 letras, minúsculas), por exemplo: `en`, `es`, `pt`.
- **Regra geral:** se o modelo (Gemini/Ollama/OpenAI) entende o idioma, o conversor consegue traduzir para ele.

### Idiomas mais comuns

| Código | Idioma            |
|--------|-------------------|
| `pt`   | Português         |
| `en`   | Inglês            |
| `es`   | Espanhol          |
| `fr`   | Francês           |
| `de`   | Alemão            |
| `it`   | Italiano          |
| `nl`   | Holandês          |
| `sv`   | Sueco             |
| `no`   | Norueguês         |
| `da`   | Dinamarquês       |
| `fi`   | Finlandês         |
| `ru`   | Russo             |
| `pl`   | Polonês           |
| `cs`   | Tcheco            |
| `tr`   | Turco             |
| `el`   | Grego             |

### Idiomas asiáticos comuns

| Código | Idioma            |
|--------|-------------------|
| `zh`   | Chinês (genérico) |
| `zh-cn`| Chinês (China)    |
| `zh-tw`| Chinês (Taiwan)   |
| `ja`   | Japonês           |
| `ko`   | Coreano           |
| `hi`   | Hindi             |
| `th`   | Tailandês         |

### Outros exemplos úteis

| Código | Idioma            |
|--------|-------------------|
| `ar`   | Árabe             |
| `he`   | Hebraico          |
| `ro`   | Romeno            |
| `hu`   | Húngaro           |
| `uk`   | Ucraniano         |

### Como usar com o conversor

```bash
# Traduzir de português para inglês
h2i --translate en --source-lang pt

# Traduzir para alemão (de qualquer idioma detectado automaticamente)
h2i --translate de

# Traduzir para japonês
h2i --translate ja
```

> **Dica:** se você usar um código que não está na tabela mas é ISO 639‑1 válido
> (por exemplo `bg` para búlgaro), o sistema ainda funciona — o importante é o
> modelo de IA suportar aquele idioma.


