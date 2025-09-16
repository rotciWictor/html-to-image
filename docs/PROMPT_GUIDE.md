# Guia de Prompt Estruturado (para gerar HTMLs)

Este guia entrega um prompt “cirúrgico” em 6 partes (Role, Task, Context, Reasoning, Output Format, Stop Conditions) e dois prompts prontos (Instagram e PPT) para gerar HTMLs que serão convertidos em imagens neste projeto.

## Prompt Master Template (6 passos)

```
1) Role (Função)
Aja como um gerador de HTML estático. Sua saída será salva como arquivos .html locais e depois convertida em imagens por um script headless (sem acesso à internet).

2) Task (Tarefa)
[Descreva exatamente o que gerar: quantidade de páginas/“slides”, tema, elementos obrigatórios, hierarquia visual e tipografia.]

3) Context (Contexto)
- Os assets (CSS, JS, imagens, fontes) ficam em ./assets/ e devem ser referenciados como caminhos relativos (./assets/...)
- Não use nenhum recurso externo (sem CDN, sem fontes/JS externos)
- Dimensões alvo do layout: [largura]x[altura] px (fixo no container raiz)
- Se for Instagram, respeite "zona segura": ~120 px de margem interna para textos
- OPCIONAL: incluir configuração inline no HTML para controlar formato, qualidade, dimensões, etc. (ver exemplos abaixo)

4) Reasoning (Raciocínio)
- Defina a estrutura do HTML (container raiz, seções, grid) antes de escrever
- Garanta contraste e hierarquia tipográfica claras
- Use títulos curtos, subtítulos diretos e textos enxutos
- Se usar ícones/ilustrações, referencie de ./assets/

5) Output Format (Formato de saída)
- Retorne UM BLOCO DE CÓDIGO POR PÁGINA com linguagem `html`
- Nomeie cada bloco de código no título (ex.: slide-01.html, slide-02.html)
- Nada além de código dentro de cada bloco
- Também retorne um índice em tabela Markdown com o plano dos slides (exemplo):

| Slide | Título | Subtítulo | Destaque | CTA |
| --- | --- | --- | --- | --- |
| 01 | [Título curto] | [Sub] | [Resumo do destaque] | [CTA/–] |
| 02 | [Título curto] | [Sub] | [Resumo do destaque] | [CTA/–] |
| 03 | [Título curto] | [Sub] | [Resumo do destaque] | [CTA/–] |
| ... | ... | ... | ... | ... |

6) Stop Conditions (Condições finais)
- Encerrar quando todas as páginas descritas forem geradas em blocos `html`
- Tabela índice preenchida conforme especificado
- Layout fixo nas dimensões alvo e sem recursos externos
```

---

## Prompt pronto — Carrossel Instagram (1080x1080) [copy/paste]

```
1) Role (Função)
Aja como um gerador de HTML estático. Sua saída será salva como arquivos .html locais e depois convertida em imagens por um script headless (sem acesso à internet).

2) Task (Tarefa)
Gerar 5 páginas (slides) para um carrossel do Instagram (1080x1080) com o tema “Dicas rápidas de produtividade”. Cada slide deve conter: título curto (2–5 palavras), subtítulo direto (1 linha), 1 destaque visual (box/ícone/estatística) e tipografia grande e legível. No último slide, incluir um CTA.

3) Context (Contexto)
- Assets locais em ./assets/ (CSS/JS/imagens/fontes), referenciados via caminhos relativos
- Sem recursos externos (sem CDN, sem fontes externas)
- Dimensões alvo fixas: 1080x1080 px no container raiz
- Respeitar zona segura (~120 px de margem interna) para textos e elementos principais

4) Reasoning (Raciocínio)
- Definir container raiz com 1080x1080 e margens internas
- Estabelecer hierarquia: título > subtítulo > destaque
- Garantir contraste alto e legibilidade
- Opcional: ícones/ilustrações de ./assets/ com tamanho consistente

5) Output Format (Formato de saída)
- Retorne 5 blocos `html`, nomeados: slide-01.html … slide-05.html
- Retorne também uma tabela índice em Markdown descrevendo os slides:

| Slide | Título | Subtítulo | Destaque | CTA |
| --- | --- | --- | --- | --- |
| 01 | [Título curto] | [Sub] | [Resumo do destaque] | – |
| 02 | [Título curto] | [Sub] | [Resumo do destaque] | – |
| 03 | [Título curto] | [Sub] | [Resumo do destaque] | – |
| 04 | [Título curto] | [Sub] | [Resumo do destaque] | – |
| 05 | [Título curto] | [Sub] | [Resumo do destaque] | [CTA] |

6) Stop Conditions (Condições finais)
- 5 blocos `html` válidos e completos (slide-01.html … slide-05.html)
- Tabela índice preenchida
- Todos os slides com container 1080x1080, sem dependências externas
```

---

## Prompt pronto — Slides PowerPoint (1920x1080) [copy/paste]

```
1) Role (Função)
Aja como um gerador de HTML estático. Sua saída será salva como arquivos .html locais e depois convertida em imagens por um script headless (sem acesso à internet).

2) Task (Tarefa)
Gerar 3 slides (1920x1080) para uma apresentação “Resultados Q4” com: 
- Slide 1: título + subtítulo
- Slide 2: lista de 5 bullets
- Slide 3: 3 métricas em destaque (cards)
Estilo corporativo, alto contraste, espaço para logo no topo.

3) Context (Contexto)
- Assets em ./assets/ (caminhos relativos); sem CDN/externos
- Dimensões alvo fixas: 1920x1080 px no container raiz
- Tipografia legível em tela grande; grid de 2 colunas nos slides com conteúdo

4) Reasoning (Raciocínio)
- Definir header com logo e título onde aplicável
- Usar grid de 2 colunas no(s) slide(s) com conteúdo
- Bullets com marcadores visíveis e espaçamento generoso
- Métricas em caixas destacadas com números grandes

5) Output Format (Formato de saída)
- Retorne 3 blocos `html`: ppt-slide-01.html, ppt-slide-02.html, ppt-slide-03.html
- Inclua uma tabela índice em Markdown com o plano dos slides:

| Slide | Título | Subtítulo | Estrutura | Observações |
| --- | --- | --- | --- | --- |
| 01 | [Título] | [Sub] | Header + título | Logo no topo |
| 02 | [Tópico] | – | 2 colunas + 5 bullets | Marcadores visíveis |
| 03 | [Resumo] | – | 3 cards/métricas | Números grandes |

6) Stop Conditions (Condições finais)
- 3 blocos `html` válidos e completos (ppt-slide-01.html … ppt-slide-03.html)
- Tabela índice preenchida
- Todos os slides com container 1920x1080, sem dependências externas
```

---

## Configuração inline no HTML (OPCIONAL)

O conversor pode ler configurações diretamente do HTML, sobrescrevendo as flags da CLI:

### Via JSON (recomendado):
```html
<script id="h2i-config" type="application/json">
{
  "format": "png",
  "quality": 90,
  "width": 1080,
  "height": 1080,
  "deviceScaleFactor": 2,
  "fullPage": true,
  "background": "transparent",
  "outDir": "./export",
  "suffix": "-v1"
}
</script>
```

### Via meta tags:
```html
<meta name="h2i:format" content="jpeg">
<meta name="h2i:quality" content="85">
<meta name="h2i:width" content="1920">
<meta name="h2i:height" content="1080">
<meta name="h2i:background" content="#ffffff">
```

**Opções disponíveis:**
- `format`: png|jpeg|webp
- `quality`: 1-100 (apenas JPEG)
- `width`, `height`: dimensões em pixels
- `deviceScaleFactor`: escala (1, 2, 3...)
- `fullPage`: true|false
- `background`: "transparent" (PNG/WebP) ou cor (#fff, rgb(255,255,255))
- `outDir`: pasta de saída
- `suffix`: sufixo no nome do arquivo

## Como usar com este projeto

1) Salve os arquivos gerados pelo prompt em `html-files/` (ex.: `slide-01.html`, `ppt-slide-01.html`).
2) Coloque imagens/ícones/fontes em `html-files/assets/` e referencie como `./assets/...`.
3) Converta para imagem:

- Instagram (1080x1080, PNG):
```bash
node html-to-image.js --width 1080 --height 1080 --format png
```

- PowerPoint (1920x1080, PNG):
```bash
node html-to-image.js --width 1920 --height 1080 --format png
```

- JPEG com qualidade 90%:
```bash
node html-to-image.js --format jpeg --quality 90
```

- **OU** use configuração inline no HTML e execute apenas:
```bash
node html-to-image.js
```

Dica: consulte `CONFIG_REFERENCE.md` para todas as opções e boas práticas.
