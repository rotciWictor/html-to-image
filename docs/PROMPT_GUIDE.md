# 🗣️ Guia de Prompt (Como falar com a Gema)

Este guia ensina as melhores práticas para se comunicar com a **Gema** (nossa Designer IA) através do Wizard Interativo (`npm start`).

Diferente do sistema antigo, onde você precisava enviar um prompt gigantesco e rezar para dar certo, a Gema agora conversa com você. O segredo é saber guiá-la passo a passo.

## 🧠 Como a Gema "Pensa"

Por trás dos panos, a Gema já recebe um **System Prompt** poderoso (localizado em `config/prompts/prompt.txt`). Ela já sabe que:
1. Precisa criar um HTML para ser convertido em imagem.
2. Não tem acesso à internet (não pode usar CDNs externos).
3. Deve usar CSS inline.
4. Pode gerar imagens sob demanda se precisar.

Você **não precisa** explicar regras técnicas de HTML/CSS para ela. Foque no **Design e Conteúdo**.

---

## 🏗️ 1. O Pedido Inicial (O "Briefing")

Seu primeiro prompt no chat deve ser claro sobre o objetivo final. 

**❌ Ruim:** *"Faça um HTML verde."* (Muito vago)
**✅ Bom:** *"Preciso de um carrossel para Instagram (preset instagram) com 3 páginas sobre 'Como aumentar a produtividade'. Use um design clean com fundo escuro e fontes modernas."*

### O que incluir no pedido inicial:
- **Tema:** Do que se trata o post/apresentação?
- **Quantidade:** É uma página só? Um carrossel de 5 páginas?
- **Estilo visual:** Escuro, claro, minimalista, corporativo, "cyberpunk"?
- **Documento base (Opcional):** "Baseado no documento FFC..." (Isso ativa o RAG automaticamente).

---

## 🎨 2. Pedindo Imagens (A Mágica do Gerador)

A Gema pode gerar imagens (via Imagen API ou ComfyUI) para usar de background ou ilustração no seu HTML. Para isso funcionar bem, peça a imagem de forma explícita e descreva o estilo.

**Exemplo Prático no Chat:**
> *"Faça um post sobre o futuro do trabalho. Como background de fundo, gere uma imagem de um escritório super futurista, limpo, iluminado por luzes neon roxas, estilo realista."*

A Gema entenderá o pedido e internamente criará a tag especial `[GERAR_IMAGEM:]` em inglês. O sistema gerará o `.png` e ele aparecerá magicamente no design.

---

## 🔄 3. Dando Feedback (O Loop de Refinamento)

Depois que a Gema entrega o primeiro código, o sistema vai te perguntar se você quer fazer ajustes. É aqui que o design ganha vida.

Seja cirúrgico no seu feedback.
- **Ajustes de Cor:** *"Ficou legal, mas muda o tom de verde para algo mais pastel."*
- **Ajustes de Texto:** *"No slide 2, o texto ficou muito longo. Resuma para apenas um parágrafo."*
- **Ajustes de Layout:** *"Aumente o espaçamento (padding) do container principal, o texto está colando nas bordas."*

**Dica de Ouro:** Se o design quebrou muito, você pode dizer: *"Descarte o layout atual e tente outra abordagem, dessa vez usando Grid em vez de Flexbox"*.

---

## 📚 4. Trabalhando com Manuais Próprios (RAG)

Se você tem muito texto e quer que a Gema o transforme em slides, **não cole o texto no chat**. 

1. Salve seu texto em um arquivo (ex: `meu_metodo.txt`) dentro de `knowledge/documents/`.
2. No chat da Gema, diga: *"Crie 5 slides resumindo os pontos principais do guia Meu Metodo."*
3. O "Bibliotecário" do sistema vai achar o arquivo, ler para a Gema, e ela fará os slides com base no texto exato.

---

## 🚀 Resumo do Fluxo Perfeito

1. `npm start` -> Opção 3 (Gema)
2. **Você:** *"Quero um post sobre café. Fundo escuro. Gere uma imagem realista de uma xícara de café fumegante para o topo."*
3. *Gema pensa e cria o HTML.*
4. **Você:** *"Aumenta a fonte do título e centraliza."*
5. *Gema ajusta.*
6. **Você:** `converter`
7. *Foto salva em output/!*
