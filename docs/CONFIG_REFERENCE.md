# Guia de Configuração e CLI

Este documento lista todas as opções disponíveis via CLI e orienta como configurar presets para Instagram (carrossel) e PowerPoint (slides).

## Opções atuais (CLI)

- `--format png|jpeg|webp`
  - Formato de saída da imagem
  - Padrão: `png`
  - Observação: `jpeg` não suporta transparência

- `--quality 1..100`
  - Qualidade da imagem (apenas para `jpeg`)
  - Padrão: `90`

- `--width N` / `--height N`
  - Dimensões da viewport, em pixels
  - Padrão: `1200x800`

- `--scale N`
  - Device scale factor (DPI virtual). Ex.: 2 para alta definição
  - Padrão: `2`

- `--fullpage` / `--no-fullpage`
  - Capturar página inteira ou apenas a viewport
  - Padrão: `--fullpage`

## Presets sugeridos (como usar hoje)

Embora ainda não exista a flag `--preset` no CLI, você pode obter o mesmo efeito definindo largura/altura conforme abaixo:

- Instagram Carrossel: `--width 1080 --height 1080`
- PowerPoint Slide: `--width 1920 --height 1080`

Exemplos:

```bash
# Instagram (PNG)
node html-to-image.js --width 1080 --height 1080 --format png

# PowerPoint (PNG)
node html-to-image.js --width 1920 --height 1080 --format png

# JPEG (qualidade 90%)
node html-to-image.js --format jpeg --quality 90
```

## Boas práticas (resumo)

- Coloque todos os assets em `html-files/assets/` e referencie com caminhos relativos (`./assets/...`).
- Para fontes, use `@font-face` e aguarde `document.fonts.ready` antes do screenshot.
- Use unidades responsivas (`rem`, `em`, `vw`, `vh`) onde possível.
- Evite animações em andamento no momento do screenshot; se necessário, aumente o tempo de espera.
- Para JPEG (sem transparência), defina um fundo sólido no HTML.

## Opções futuras (planejadas)

Estas opções são propostas e podem ser implementadas sob demanda:

- `--preset instagram|ppt` aplica dimensões automaticamente
- `--generate N` cria N HTMLs base (ex.: `ig-slide-1.html`, `ig-slide-2.html`, ...)
- `--out-dir ./saidas` define diretório de saída das imagens
- `--suffix "-slide1"` adiciona sufixo ao nome do arquivo de saída
- `--wait-ms 2000` aguarda N ms adicionais antes do screenshot
- `--wait-for "#root"` aguarda seletor existir antes do screenshot
- `--background "#fff|transparent"` define fundo (útil para PNG/WebP)
- `--pattern "{name}-{width}x{height}.{ext}"` padrão para o nome do arquivo
- `--concurrency 3` define conversões em paralelo

Se quiser priorizar alguma, avise que implemento na sequência.

## Configuração inline no HTML (IMPLEMENTADO)

O conversor agora pode ler configurações diretamente dos arquivos HTML, sobrescrevendo as flags da CLI. Isso permite que cada HTML tenha suas próprias configurações específicas.

### Método 1: JSON embutido (recomendado)

Inclua no `<head>` do HTML:

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

### Método 2: Meta tags

```html
<meta name="h2i:format" content="jpeg">
<meta name="h2i:quality" content="85">
<meta name="h2i:width" content="1920">
<meta name="h2i:height" content="1080">
<meta name="h2i:fullPage" content="true">
<meta name="h2i:background" content="#ffffff">
<meta name="h2i:outDir" content="./slides">
<meta name="h2i:suffix" content="-final">
```

### Opções suportadas

- `format`: "png" | "jpeg" | "webp"
- `quality`: 1-100 (apenas para JPEG)
- `width`, `height`: dimensões em pixels
- `deviceScaleFactor`: escala (1, 2, 3, 4...)
- `fullPage`: true | false (página completa ou apenas viewport)
- `background`: "transparent" (PNG/WebP) ou cor (#ffffff, rgb(255,255,255), etc.)
- `outDir`: pasta de destino (ex.: "./export", "../images")
- `suffix`: sufixo no nome do arquivo (ex.: "-v1", "-final")

### Prioridade de configuração

1. **Configuração inline no HTML** (maior prioridade)
2. Flags da linha de comando
3. Configurações padrão

### Exemplos práticos

**Instagram com config inline:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Slide 1</title>
    
    <script id="h2i-config" type="application/json">
    {
      "format": "png",
      "width": 1080,
      "height": 1080,
      "background": "transparent",
      "outDir": "./instagram-export",
      "suffix": "-slide1"
    }
    </script>
</head>
<body>
    <!-- conteúdo do slide -->
</body>
</html>
```

**PowerPoint com meta tags:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PPT Slide 1</title>
    
    <meta name="h2i:format" content="jpeg">
    <meta name="h2i:quality" content="95">
    <meta name="h2i:width" content="1920">
    <meta name="h2i:height" content="1080">
    <meta name="h2i:background" content="#ffffff">
    <meta name="h2i:outDir" content="./presentation">
    <meta name="h2i:suffix" content="-slide1">
</head>
<body>
    <!-- conteúdo do slide -->
</body>
</html>
```

Com configuração inline, você pode simplesmente executar:
```bash
node html-to-image.js
```

E cada HTML será processado com suas próprias configurações específicas.


