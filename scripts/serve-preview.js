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

// Rota horas-iguais - exibe página estática
app.get('/horas-iguais', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Horas Especiais</title>

  <style>
    :root {
      --bg: #0f1220;
      --card: #171a2e;
      --text: #eaeaf0;
      --muted: #a6a8c5;
      --accent: #7c8cff;
      --highlight-red: #ff6b6b;
      --highlight-yellow: #ffd166;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #0f1220, #0b0d18);
      color: var(--text);
      line-height: 1.5;
    }

    header {
      padding: 3rem 1.5rem 2rem;
      text-align: center;
    }

    header h1 {
      margin: 0;
      font-size: 2rem;
      letter-spacing: 0.04em;
    }

    header p {
      margin-top: 0.75rem;
      color: var(--muted);
      font-size: 0.95rem;
    }

    main {
      max-width: 820px;
      margin: 0 auto;
      padding: 0 1rem 3rem;
    }

    .list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }

    .item {
      background: var(--card);
      border-radius: 12px;
      padding: 1rem 1.1rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .item:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
    }

    .time {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--accent);
      letter-spacing: 0.04em;
    }

    .desc {
      margin-top: 0.4rem;
      color: var(--text);
      font-size: 0.95rem;
    }

    .red {
      color: var(--highlight-red);
      font-weight: 600;
    }

    .yellow {
      color: var(--highlight-yellow);
      font-weight: 600;
    }

    footer {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--muted);
      font-size: 0.8rem;
    }
  </style>
</head>
<body>

  <header>
    <h1>⏰ Horas Especiais</h1>
    <p>Ordem cronológica · interpretações simbólicas</p>
  </header>

  <main>
    <section class="list">

      <div class="item"><div class="time">00:00</div><div class="desc">Novo começo; poder de escolha; consciência universal</div></div>

      <div class="item"><div class="time">01:01</div><div class="desc">Coragem primeiro passo; novidades amorosas</div></div>
      <div class="item"><div class="time">01:02</div><div class="desc">Desejam seu amor</div></div>
      <div class="item"><div class="time">01:10</div><div class="desc">Alguém te quer, precisa atitude sua</div></div>
      <div class="item"><div class="time">01:11</div><div class="desc">Confirmação espiritual; alguém pensando</div></div>

      <div class="item"><div class="time">02:02</div><div class="desc">Equilíbrio relações; proteção espiritual</div></div>
      <div class="item"><div class="time">02:03</div><div class="desc">Progressão; movimento adiante</div></div>
      <div class="item"><div class="time">02:04</div><div class="desc">Será pedida em namoro</div></div>
      <div class="item"><div class="time">02:20</div><div class="desc">Notícias boas; cuidado com passado</div></div>
      <div class="item"><div class="time">02:22</div><div class="desc">Construção; manifestação</div></div>

      <div class="item"><div class="time">03:03</div><div class="desc">Criatividade; importância familiar</div></div>
      <div class="item"><div class="time">03:04</div><div class="desc">Avanço contínuo</div></div>
      <div class="item"><div class="time">03:06</div><div class="desc">Zombaria</div></div>
      <div class="item"><div class="time">03:30</div><div class="desc">Alguém te deseja; evite impulsos</div></div>
      <div class="item"><div class="time">03:33</div><div class="desc">Comunicação divina</div></div>

      <div class="item"><div class="time">04:04</div><div class="desc">Estabilidade; disciplina</div></div>
      <div class="item"><div class="time">04:05</div><div class="desc">Progressão natural</div></div>
      <div class="item"><div class="time">04:08</div><div class="desc">Perda de algo</div></div>
      <div class="item"><div class="time">04:40</div><div class="desc">Reflita teimosia; ouça outros</div></div>
      <div class="item"><div class="time">04:44</div><div class="desc">Base sólida</div></div>

      <div class="item"><div class="time">05:05</div><div class="desc">Mudança; colher frutos</div></div>
      <div class="item"><div class="time">05:06</div><div class="desc">Movimento constante</div></div>
      <div class="item"><div class="time">05:10</div><div class="desc">Esperam notícias suas</div></div>
      <div class="item"><div class="time">05:50</div><div class="desc">Boa surpresa; evite vícios</div></div>
      <div class="item"><div class="time">05:55</div><div class="desc">Transformação</div></div>

      <div class="item"><div class="time">06:06</div><div class="desc">Harmonia; equilíbrio yin-yang</div></div>
      <div class="item"><div class="time">06:07</div><div class="desc">Evolução contínua</div></div>
      <div class="item"><div class="time">06:12</div><div class="desc">Amado com outro</div></div>

      <div class="item"><div class="time">07:07</div><div class="desc">Sabedoria; intuição forte</div></div>
      <div class="item"><div class="time">07:08</div><div class="desc">Avanço em progresso</div></div>
      <div class="item"><div class="time">07:14</div><div class="desc">Ligação importante</div></div>

      <div class="item"><div class="time">08:08</div><div class="desc">Abundância financeira</div></div>
      <div class="item"><div class="time">08:09</div><div class="desc">Progressão forte</div></div>
      <div class="item"><div class="time">08:16</div><div class="desc">Pensam em você</div></div>

      <div class="item"><div class="time">09:09</div><div class="desc">Reflexão; calma</div></div>
      <div class="item"><div class="time">09:10</div><div class="desc">Novo ciclo começando</div></div>
      <div class="item"><div class="time">09:18</div><div class="desc">Brigas te esperam</div></div>

      <div class="item"><div class="time">10:10</div><div class="desc">Desapego; alegria</div></div>
      <div class="item"><div class="time">10:11</div><div class="desc">Despertar oportunidade</div></div>
      <div class="item"><div class="time">10:20</div><div class="desc">Mudanças virão</div></div>

      <div class="item">
        <div class="time">11:11</div>
        <div class="desc red">🔴 Portal espiritual; manifestação</div>
      </div>
      <div class="item"><div class="time">11:22</div><div class="desc">Saudade de você</div></div>

      <div class="item"><div class="time">12:12</div><div class="desc">Meditação; equilíbrio</div></div>
      <div class="item"><div class="time">12:13</div><div class="desc">Avanço suave</div></div>
      <div class="item"><div class="time">12:21</div><div class="desc">Fofoca sobre você</div></div>
      <div class="item"><div class="time">12:22</div><div class="desc">Construção amplificada</div></div>
      <div class="item"><div class="time">12:24</div><div class="desc">Alguém se declarará</div></div>
      <div class="item">
        <div class="time">12:34</div>
        <div class="desc yellow">🟡 Progressão clara; siga em frente</div>
      </div>

      <div class="item"><div class="time">13:01</div><div class="desc">Novo ciclo; oportunidade inesperada</div></div>
      <div class="item"><div class="time">13:13</div><div class="desc">Libertação; boa sorte</div></div>
      <div class="item"><div class="time">13:14</div><div class="desc">Avanço pessoal</div></div>
      <div class="item"><div class="time">13:26</div><div class="desc">Dia de sorte</div></div>
      <div class="item"><div class="time">13:31</div><div class="desc">Reviravolta positiva</div></div>
      <div class="item"><div class="time">13:33</div><div class="desc">Proteção divina</div></div>

      <div class="item"><div class="time">14:02</div><div class="desc">Equilíbrio chegando; dupla pensando</div></div>
      <div class="item"><div class="time">14:14</div><div class="desc">Auto-realização; confiança</div></div>
      <div class="item"><div class="time">14:15</div><div class="desc">Progressão; avanço pessoal</div></div>
      <div class="item"><div class="time">14:28</div><div class="desc">Ganhará presentes</div></div>
      <div class="item"><div class="time">14:41</div><div class="desc">Paz interior; revise valores</div></div>
      <div class="item"><div class="time">14:44</div><div class="desc">Base sólida</div></div>

      <div class="item"><div class="time">15:03</div><div class="desc">Criatividade ativada; comunicação</div></div>
      <div class="item"><div class="time">15:15</div><div class="desc">Prazeres; amor recíproco</div></div>
      <div class="item"><div class="time">15:16</div><div class="desc">Transformação positiva</div></div>
      <div class="item"><div class="time">15:30</div><div class="desc">Amor correspondido</div></div>
      <div class="item"><div class="time">15:51</div><div class="desc">Paixão do passado</div></div>
      <div class="item"><div class="time">15:55</div><div class="desc">Transformação</div></div>

      <div class="item"><div class="time">16:04</div><div class="desc">Estabilidade se formando</div></div>
      <div class="item"><div class="time">16:16</div><div class="desc">Resiliência profissional</div></div>
      <div class="item"><div class="time">16:17</div><div class="desc">Não pare; evolução</div></div>
      <div class="item"><div class="time">16:32</div><div class="desc">Amor secreto</div></div>

      <div class="item"><div class="time">17:05</div><div class="desc">Mudança positiva; liberação</div></div>
      <div class="item"><div class="time">17:17</div><div class="desc">Autocuidado; equilíbrio</div></div>
      <div class="item"><div class="time">17:18</div><div class="desc">Progresso firme</div></div>
      <div class="item"><div class="time">17:34</div><div class="desc">Medo de perder</div></div>

      <div class="item"><div class="time">18:06</div><div class="desc">Harmonia familiar</div></div>
      <div class="item"><div class="time">18:18</div><div class="desc">Cura emocional</div></div>
      <div class="item"><div class="time">18:19</div><div class="desc">Ciclo quase completo</div></div>
      <div class="item"><div class="time">18:36</div><div class="desc">Ama você</div></div>

      <div class="item"><div class="time">19:07</div><div class="desc">Intuição; decisão espiritual</div></div>
      <div class="item"><div class="time">19:19</div><div class="desc">Sucesso amoroso</div></div>
      <div class="item"><div class="time">19:20</div><div class="desc">Novo avanço</div></div>
      <div class="item"><div class="time">19:38</div><div class="desc">Fofocas</div></div>

      <div class="item"><div class="time">20:08</div><div class="desc">Abundância material</div></div>
      <div class="item"><div class="time">20:20</div><div class="desc">Esqueça passado</div></div>
      <div class="item"><div class="time">20:21</div><div class="desc">Despertar consciência</div></div>
      <div class="item"><div class="time">20:40</div><div class="desc">Fim próximo</div></div>

      <div class="item"><div class="time">21:09</div><div class="desc">Encerramento ciclo</div></div>
      <div class="item"><div class="time">21:12</div><div class="desc">Desejo seu bem</div></div>
      <div class="item"><div class="time">21:21</div><div class="desc">Plenitude espiritual</div></div>
      <div class="item"><div class="time">21:22</div><div class="desc">Harmonia progressiva</div></div>
      <div class="item"><div class="time">21:42</div><div class="desc">Segredos revelados</div></div>

      <div class="item"><div class="time">22:10</div><div class="desc">Construção sonhos</div></div>
      <div class="item">
        <div class="time">22:22</div>
        <div class="desc red">🔴 Mestre construtor; manifestação</div>
      </div>
      <div class="item"><div class="time">22:23</div><div class="desc">Fechamento positivo</div></div>
      <div class="item"><div class="time">22:44</div><div class="desc">Sorte amor</div></div>

      <div class="item"><div class="time">23:11</div><div class="desc">Portal fechamento; novo ciclo</div></div>
      <div class="item"><div class="time">23:23</div><div class="desc">Descanso; atenção corpo</div></div>
      <div class="item"><div class="time">23:24</div><div class="desc">Transição novo dia</div></div>
      <div class="item"><div class="time">23:32</div><div class="desc">Atenção amigos</div></div>
      <div class="item"><div class="time">23:33</div><div class="desc">Proteção máxima</div></div>
      <div class="item"><div class="time">23:46</div><div class="desc">Traição</div></div>

    </section>
  </main>

  <footer>
    Conteúdo simbólico · interpretação pessoal
  </footer>

</body>
</html>`);
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

























