// ============ DEMONSTRAÇÕES INTERATIVAS NAS CAPAS DOS PROJETOS ============
// Cada capa recria o visual do produto real com dados ilustrativos (nenhum dado real aparece).
// O palco tem tamanho fixo (480 × 360) e é redimensionado para caber no cartão.
(() => {
  const EN = (document.documentElement.lang || '').indexOf('en') === 0;
  const t = (pt, en) => (EN ? en : pt);
  const W = 480;

  const sorteio = (semente) => () => {
    semente = (semente + 0x6D2B79F5) | 0;
    let x = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const pct = (v) => `${Math.round(v)}%`;
  const fmt = (v) => Math.round(v).toLocaleString(EN ? 'en-US' : 'pt-BR');

  // Liga um grupo de botões: marca o ativo e chama a função com o índice escolhido
  const grupo = (raiz, seletor, aoEscolher) => {
    const bts = [...raiz.querySelectorAll(seletor)];
    bts.forEach((b, i) => b.addEventListener('click', () => {
      bts.forEach((o) => { o.classList.toggle('ativo', o === b); o.setAttribute('aria-pressed', o === b); });
      aoEscolher(i, b);
    }));
    bts.forEach((o, i) => { o.classList.toggle('ativo', i === 0); o.setAttribute('aria-pressed', i === 0); });
    aoEscolher(0, bts[0]);
  };

  // ---------- 01 · SuperAção SP: portal de painéis com menu lateral ----------
  const superacao = (p) => {
    const paineis = [t('Panorama Geral', 'Overview'), t('Trilha da Busca', 'Outreach Trail'),
      t('Jornada da Família', 'Family Journey'), t('Jornada do Agente', 'Agent Journey')];
    p.innerHTML = `
      <aside><div class="sa-logo"><i></i><i></i><i></i></div><small>${t('Painéis disponíveis', 'Dashboards')}</small>
        ${paineis.map((n) => `<button class="sa-bt">${n}</button>`).join('')}</aside>
      <section><header>${t('Painel de gestão do Programa SuperAção SP', 'SuperAção SP management dashboard')}</header>
        <h4></h4><div class="sa-corpo"></div></section>`;
    const corpo = p.querySelector('.sa-corpo'), tit = p.querySelector('h4');
    const vistas = [
      () => {
        const serie = [42, 48, 51, 57, 63, 66, 71, 76];
        const pts = serie.map((v, i) => `${10 + i * 40},${120 - v * 1.3}`).join(' ');
        return `<div class="sa-kpis"><div><b>${fmt(12480)}</b><span>${t('famílias acompanhadas', 'families followed')}</span></div>
          <div><b>76%</b><span>${t('adesão', 'enrollment')}</span></div><div><b>184</b><span>${t('agentes ativos', 'active agents')}</span></div></div>
          <svg viewBox="0 0 300 130"><polyline points="${pts}" class="sa-linha"/>${serie.map((v, i) =>
            `<circle cx="${10 + i * 40}" cy="${120 - v * 1.3}" r="4"><title>${t('Mês', 'Month')} ${i + 1}: ${v}%</title></circle>`).join('')}</svg>`;
      },
      () => {
        const etapas = [[t('Identificadas', 'Identified'), 100], [t('Localizadas', 'Located'), 78],
          [t('Atendidas', 'Assisted'), 61], [t('Aderiram', 'Enrolled'), 47]];
        return `<div class="sa-funil">${etapas.map(([n, v]) =>
          `<div style="--v:${v}%"><span>${n}</span><b>${v}%</b></div>`).join('')}</div>`;
      },
      () => {
        const etapas = [32, 24, 18, 15, 11];
        return `<div class="sa-jornada">${etapas.map((v, i) =>
          `<div><i style="height:${v * 3}px"></i><b>${v}%</b><span>${t('Etapa', 'Stage')} ${i + 1}</span></div>`).join('')}</div>`;
      },
      () => {
        const ag = [64, 51, 78, 45, 70, 58];
        const media = ag.reduce((a, b) => a + b, 0) / ag.length;
        return `<div class="sa-agentes">${ag.map((v, i) =>
          `<div><span>${t('Agente', 'Agent')} ${String.fromCharCode(65 + i)}</span><i style="width:${v}%"></i><b>${v}</b></div>`).join('')}
          <em style="left:calc(4.4rem + (100% - 6.6rem) * ${media / 100})">${t('média', 'average')}</em></div>`;
      },
    ];
    grupo(p, '.sa-bt', (i) => { tit.textContent = paineis[i]; corpo.innerHTML = vistas[i](); });
  };

  // ---------- 02 · Observatório do Piauí: índice pelos 5 componentes do Nurturing Care ----------
  const piaui = (p) => {
    const eixos = [t('Saúde', 'Health'), t('Nutrição', 'Nutrition'), t('Cuidado responsivo', 'Responsive care'),
      t('Segurança e proteção', 'Safety & security'), t('Aprendizagem', 'Early learning')];
    const r = sorteio(14);
    const terr = [1, 2, 3, 4].map(() => eixos.map(() => 0.25 + r() * 0.7));
    p.innerHTML = `
      <p class="pi-sobre">${t('Observatório da Primeira Infância', 'Early Childhood Observatory')}</p>
      <h4>${t('Índice de vulnerabilidade', 'Vulnerability index')}</h4>
      <div class="pi-terr">${terr.map((_, i) => `<button>${t('Território', 'Territory')} ${i + 1}</button>`).join('')}</div>
      <svg viewBox="-130 -112 260 224" class="pi-radar"></svg>
      <div class="pi-indice"><b></b><span>${t('índice (0 a 1)', 'index (0 to 1)')}</span><i></i></div>`;
    const svg = p.querySelector('svg'), b = p.querySelector('.pi-indice b'), barra = p.querySelector('.pi-indice i');
    const ponto = (k, v) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      return [Math.cos(a) * 80 * v, Math.sin(a) * 80 * v];
    };
    let grade = '';
    [0.25, 0.5, 0.75, 1].forEach((n) => { grade += `<polygon class="pi-grade" points="${eixos.map((_, k) => ponto(k, n).join(',')).join(' ')}"/>`; });
    eixos.forEach((nome, k) => {
      const [x, y] = ponto(k, 1);
      const [lx, ly] = ponto(k, 1.24);
      grade += `<line class="pi-grade" x1="0" y1="0" x2="${x}" y2="${y}"/><text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${nome}</text>`;
    });
    svg.innerHTML = `${grade}<polygon class="pi-forma"/>`;
    const forma = svg.querySelector('.pi-forma');
    grupo(p, '.pi-terr button', (i) => {
      forma.setAttribute('points', terr[i].map((v, k) => ponto(k, v).join(',')).join(' '));
      const ind = 1 - terr[i].reduce((a, c) => a + c, 0) / 5;
      b.textContent = ind.toFixed(2).replace('.', EN ? '.' : ',');
      barra.style.width = `${ind * 100}%`;
    });
  };

  // ---------- 03 · Observatório do Feminicídio: navegação pela rota crítica ----------
  const feminicidio = (p) => {
    const nos = [
      [t('Panorama geral', 'Overview'), t('Visão integrada de todas as etapas da rota.', 'An integrated view of every stage of the route.')],
      [t('Canais de atendimento', 'Help channels'), t('Onde a mulher busca ajuda: centrais, delegacias e centros de referência.', 'Where women seek help: hotlines, police stations and referral centers.')],
      [t('Segurança', 'Public safety'), t('Registros de ocorrência e medidas protetivas.', 'Police reports and protective orders.')],
      [t('Radar', 'Radar'), t('Leitura territorial dos indicadores.', 'A territorial reading of the indicators.')],
      [t('Justiça', 'Justice'), t('Processos e decisões no sistema de justiça.', 'Cases and rulings in the justice system.')],
      [t('Saúde', 'Health'), t('Notificações de violência nos serviços de saúde.', 'Violence reports from health services.')],
      [t('Assistência social', 'Social assistance'), t('Atendimentos na rede de proteção social.', 'Care provided by the social protection network.')],
    ];
    p.innerHTML = `<div class="fe-titulo">${t('Observatório', 'Observatory')}<b>${t('do Feminicídio', 'of Femicide')}</b></div>
      <div class="fe-roda">${nos.map(([n], i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / nos.length;
        return `<button style="left:${50 + Math.cos(a) * 41}%;top:${50 + Math.sin(a) * 41}%"><span>${n}</span></button>`;
      }).join('')}<div class="fe-centro"><b></b><span></span></div></div>
      <p class="fe-dica">${t('Toque nas etapas da rota crítica', 'Tap the stages of the critical path')}</p>`;
    const nome = p.querySelector('.fe-centro b'), desc = p.querySelector('.fe-centro span');
    let girando = true, atual = 0;
    const bts = [...p.querySelectorAll('.fe-roda button')];
    const mostrar = (i) => {
      atual = i;
      bts.forEach((o, k) => o.classList.toggle('ativo', k === i));
      nome.textContent = nos[i][0]; desc.textContent = nos[i][1];
    };
    bts.forEach((b, i) => b.addEventListener('click', () => { girando = false; mostrar(i); }));
    mostrar(0);
    setInterval(() => { if (girando && p.isConnected && !document.hidden) mostrar((atual + 1) % nos.length); }, 2600);
  };

  // ---------- 04 · Datapedia: mapa por região com troca de indicador ----------
  const datapedia = (p) => {
    const inds = [[t('Pré-natal adequado', 'Adequate prenatal care'), '%'], [t('Cobertura vacinal', 'Vaccine coverage'), '%'],
      [t('Famílias com crianças de 0 a 6 anos', 'Families with children aged 0–6'), '']];
    const r = sorteio(4);
    const hexes = [];
    const linhas = [[1, 4], [0, 6], [0, 7], [1, 6], [2, 4]];
    linhas.forEach(([ini, n], lin) => { for (let c = 0; c < n; c++) hexes.push([ini + c + (lin % 2 ? 0.5 : 0), lin]); });
    const valores = inds.map(() => hexes.map(() => r()));
    p.innerHTML = `<header><b>Datapédia</b> ${t('Primeira Infância SP', 'Early Childhood SP')}</header>
      <div class="dp-ind">${inds.map(([n]) => `<button>${n}</button>`).join('')}</div>
      <svg viewBox="-20 -24 400 230" class="dp-mapa"></svg>
      <p class="dp-dica">${t('Passe o mouse ou toque nas regiões', 'Hover or tap the regions')}</p>
      <div class="dp-leg"><span>${t('menor', 'lower')}</span><i></i><span>${t('maior', 'higher')}</span></div>
      <div class="dp-tip" hidden></div>`;
    const svg = p.querySelector('svg'), tip = p.querySelector('.dp-tip');
    const hex = (cx, cy, s) => [0, 1, 2, 3, 4, 5].map((k) => {
      const a = (Math.PI / 3) * k + Math.PI / 6;
      return `${(cx + s * Math.cos(a)).toFixed(1)},${(cy + s * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    svg.innerHTML = hexes.map(([c, l], i) => `<polygon points="${hex(c * 46, l * 40, 25)}" data-i="${i}" tabindex="0"/>`).join('');
    const polys = [...svg.querySelectorAll('polygon')];
    const cores = ['#cdebe3', '#a8e0d2', '#5cbfae', '#22918a', '#0f5e66'];
    let ind = 0;
    const dica = (poly) => {
      const i = +poly.dataset.i, v = valores[ind][i];
      const valor = inds[ind][1] ? pct(45 + v * 50) : fmt(800 + v * 9000);
      tip.innerHTML = `<b>${t('Região', 'Region')} ${i + 1}</b>${inds[ind][0]}: ${valor}`;
      const rp = p.getBoundingClientRect(), rh = poly.getBoundingClientRect(), esc = rp.width / W;
      tip.style.left = `${Math.min(W - 80, Math.max(80, (rh.left + rh.width / 2 - rp.left) / esc))}px`;
      tip.style.top = `${(rh.top - rp.top) / esc}px`;
      tip.hidden = false;
      polys.forEach((o) => o.classList.toggle('ativo', o === poly));
    };
    polys.forEach((poly) => {
      poly.addEventListener('pointerenter', () => dica(poly));
      poly.addEventListener('click', () => dica(poly));
      poly.addEventListener('focus', () => dica(poly));
    });
    svg.addEventListener('pointerleave', () => { tip.hidden = true; polys.forEach((o) => o.classList.remove('ativo')); });
    grupo(p, '.dp-ind button', (i) => {
      ind = i; tip.hidden = true;
      polys.forEach((poly, k) => { poly.style.fill = cores[Math.min(4, Math.floor(valores[i][k] * 5))]; });
    });
  };

  // ---------- 05 · Protocolo da Primeiríssima Infância: painel Power BI ----------
  const protocolo = (p) => {
    const turmas = [t('Todas', 'All'), t('Turma 1', 'Class 1'), t('Turma 2', 'Class 2'), t('Turma 3', 'Class 3')];
    const abas = [[t('Dados gerais', 'Overview'), t('Região', 'Region'), ['Leste', 'Sul', 'Norte', 'Centro-Oeste']],
      [t('Secretaria', 'Department'), t('Secretaria', 'Department'), [t('Saúde', 'Health'), t('Educação', 'Education'), t('Assistência', 'Assistance'), t('Outras', 'Other')]],
      [t('Subprefeitura', 'District'), t('Subprefeitura', 'District'), ['SP 1', 'SP 2', 'SP 3', 'SP 4']]];
    const r = sorteio(9);
    const dados = turmas.map(() => ({ status: [0.55 + r() * 0.15, 0.15 + r() * 0.1, 0.08 + r() * 0.06, 0.02 + r() * 0.03], total: 600 + Math.round(r() * 500),
      dist: abas.map(() => [0.3 + r() * 0.12, 0.22 + r() * 0.1, 0.15 + r() * 0.08, 0.05 + r() * 0.05]) }));
    dados[0].total = dados.slice(1).reduce((a, d) => a + d.total, 0);
    const st = [t('Aprovado', 'Passed'), t('Não acessou', 'No access'), t('Abandonou', 'Dropped'), t('Reprovado', 'Failed')];
    p.innerHTML = `<header><i></i>${t('Painel de análise e monitoramento', 'Analysis & monitoring dashboard')}<small>${t('Protocolo Integrado · Primeiríssima Infância', 'Integrated Protocol · Early Childhood')}</small></header>
      <div class="pr-filtros"><label>${t('Turmas', 'Classes')}<select>${turmas.map((n) => `<option>${n}</option>`).join('')}</select></label>
        <div class="pr-kpi"><span>${t('Total de participantes', 'Total participants')}</span><b></b></div></div>
      <div class="pr-graf"><div class="pr-col"><h5>${t('Análise de participação', 'Participation')}</h5><div class="pr-colunas"></div></div>
        <div class="pr-bar"><h5></h5><div class="pr-barras"></div></div></div>
      <nav class="pr-abas">${abas.map(([n]) => `<button>${n}</button>`).join('')}</nav>`;
    const sel = p.querySelector('select'), kpi = p.querySelector('.pr-kpi b');
    const colunas = p.querySelector('.pr-colunas'), barras = p.querySelector('.pr-barras'), h5 = p.querySelector('.pr-bar h5');
    let aba = 0;
    const desenhar = () => {
      const d = dados[sel.selectedIndex];
      kpi.textContent = fmt(d.total);
      colunas.innerHTML = d.status.map((v, i) => `<div title="${st[i]}: ${fmt(v * d.total)}"><b>${fmt(v * d.total)}</b><i style="height:${v * 140}%"></i><span>${st[i]}</span></div>`).join('');
      h5.textContent = `${t('Participantes por', 'Participants by')} ${abas[aba][1].toLowerCase()}`;
      barras.innerHTML = abas[aba][2].map((n, i) => `<div><span>${n}</span><i style="width:${d.dist[aba][i] * 210}%"></i><b>${pct(d.dist[aba][i] * 100)}</b></div>`).join('');
    };
    sel.addEventListener('change', desenhar);
    grupo(p, '.pr-abas button', (i) => { aba = i; desenhar(); });
  };

  // ---------- 06 · Estágio obrigatório: mapa da progressão por UF ----------
  const estagio = (p) => {
    const ufs = [['RR', 2, 0, 'N'], ['AP', 3, 0, 'N'], ['AM', 1, 1, 'N'], ['PA', 2, 1, 'N'], ['MA', 3, 1, 'NE'], ['CE', 4, 1, 'NE'], ['RN', 5, 1, 'NE'],
      ['AC', 0, 2, 'N'], ['RO', 1, 2, 'N'], ['TO', 2, 2, 'N'], ['PI', 3, 2, 'NE'], ['PB', 4, 2, 'NE'], ['PE', 5, 2, 'NE'],
      ['MT', 1, 3, 'CO'], ['GO', 2, 3, 'CO'], ['BA', 3, 3, 'NE'], ['SE', 4, 3, 'NE'], ['AL', 5, 3, 'NE'],
      ['MS', 1, 4, 'CO'], ['DF', 2, 4, 'CO'], ['MG', 3, 4, 'SE'], ['ES', 4, 4, 'SE'], ['PR', 1, 5, 'S'], ['SP', 2, 5, 'SE'], ['RJ', 3, 5, 'SE'],
      ['RS', 0, 6, 'S'], ['SC', 1, 6, 'S']];
    const escala = [t('Inexistente', 'None'), t('Baixa', 'Low'), t('Intermediária', 'Medium'), t('Alta', 'High'), t('Avançada', 'Advanced')];
    const cores = ['#eef3f2', '#f39b4d', '#f2d06b', '#4fb3a6', '#1f6f8b'];
    const r = sorteio(6);
    const nivel = ufs.map(() => Math.floor(r() * 5));
    const regioes = [[t('Todas', 'All'), ''], ['N', 'N'], ['NE', 'NE'], ['CO', 'CO'], ['SE', 'SE'], ['S', 'S']];
    p.innerHTML = `<header>${t('Estágio curricular obrigatório', 'Mandatory teaching internship')} <span>${t('Progressão das políticas', 'Policy progression')}</span></header>
      <div class="es-reg">${regioes.map(([n]) => `<button>${n}</button>`).join('')}</div>
      <div class="es-mapa">${ufs.map(([uf, c, l], i) => `<div style="left:${c * 34}px;top:${l * 34}px;background:${cores[nivel[i]]}" title="${uf}: ${escala[nivel[i]]}">${uf}</div>`).join('')}</div>
      <ul class="es-leg">${escala.map((n, i) => `<li><i style="background:${cores[i]}"></i>${n}</li>`).join('')}</ul>
      <div class="es-total"><b></b><span>${t('redes no nível alto ou avançado', 'networks at high or advanced level')}</span></div>`;
    const tiles = [...p.querySelectorAll('.es-mapa div')], total = p.querySelector('.es-total b');
    grupo(p, '.es-reg button', (i) => {
      const reg = regioes[i][1];
      let n = 0;
      tiles.forEach((tl, k) => {
        const dentro = !reg || ufs[k][3] === reg;
        tl.classList.toggle('fora', !dentro);
        if (dentro && nivel[k] >= 3) n++;
      });
      total.textContent = n;
    });
  };

  // ---------- 07 · IA para relatórios: checagem do padrão ----------
  const ia = (p) => {
    const regras = [t('Fonte e tamanho do corpo', 'Body font and size'), t('Estrutura de tópicos', 'Heading structure'), t('Sumário automático', 'Automatic table of contents'),
      t('Legendas de tabelas e figuras', 'Table and figure captions'), t('Margens e espaçamento', 'Margins and spacing'), t('Capa padronizada', 'Standard cover')];
    const relatorios = [['relatorio_produto_2.docx', [1, 1, 0, 1, 1, 0]], ['relatorio_produto_5.docx', [1, 0, 1, 0, 1, 1]]];
    p.innerHTML = `<header><i></i>${t('Revisor de padrão de relatórios', 'Report standard checker')}</header>
      <div class="ia-env"><span>${t('Relatório enviado', 'Uploaded report')}</span>${relatorios.map(([n]) => `<button>📄 ${n}</button>`).join('')}
        <button class="ia-rodar">${t('Verificar padrão', 'Check standard')}</button></div>
      <ul class="ia-lista">${regras.map((n) => `<li><i></i>${n}</li>`).join('')}</ul>
      <div class="ia-nota"><b>–</b><span>${t('dentro do padrão', 'within standard')}</span></div>`;
    const itens = [...p.querySelectorAll('.ia-lista li')], nota = p.querySelector('.ia-nota b');
    let rel = 0, tempos = [];
    const limpar = () => { tempos.forEach(clearTimeout); tempos = []; itens.forEach((li) => { li.className = ''; }); nota.textContent = '–'; };
    const rodar = () => {
      limpar();
      const res = relatorios[rel][1];
      itens.forEach((li, i) => {
        tempos.push(setTimeout(() => { li.className = 'lendo'; }, i * 380));
        tempos.push(setTimeout(() => { li.className = res[i] ? 'ok' : 'erro'; }, i * 380 + 300));
      });
      tempos.push(setTimeout(() => { nota.textContent = `${res.filter(Boolean).length}/${res.length}`; }, res.length * 380 + 200));
    };
    grupo(p, '.ia-env button:not(.ia-rodar)', (i) => { rel = i; limpar(); });
    p.querySelector('.ia-rodar').addEventListener('click', rodar);
  };

  // ---------- 08 · Lakehouse: das camadas bronze, prata e ouro ao painel ----------
  const lakehouse = (p) => {
    const camadas = [
      ['Bronze', t('Dados brutos, como chegam das fontes', 'Raw data, as it arrives from the sources'),
        [['MUNICIPIO', 'DT_REF', 'QTD'], ['sao paulo', '2024-01', '1.204'], ['SÃO PAULO ', '01/2024', '1204'], ['Campinas', '2024-01', ''], ['campinas', '2024-01', '388']]],
      [t('Prata', 'Silver'), t('Tratados: nomes, datas e duplicidades', 'Cleaned: names, dates and duplicates'),
        [[t('município', 'city'), t('mês', 'month'), t('famílias', 'families')], ['São Paulo', '2024-01', '1204'], ['Campinas', '2024-01', '388']]],
      [t('Ouro', 'Gold'), t('Pronto para análise e painéis', 'Ready for analysis and dashboards'), null],
    ];
    p.innerHTML = `<div class="lk-camadas">${camadas.map(([n]) => `<button>${n}</button>`).join('<span>→</span>')}</div>
      <p class="lk-desc"></p><div class="lk-corpo"></div>`;
    const corpo = p.querySelector('.lk-corpo'), desc = p.querySelector('.lk-desc');
    grupo(p, '.lk-camadas button', (i) => {
      p.dataset.camada = i;
      desc.textContent = camadas[i][1];
      const tab = camadas[i][2];
      if (tab) {
        corpo.innerHTML = `<table>${tab.map((l, k) => `<tr>${l.map((c) => (k ? `<td>${c || '<em>∅</em>'}</td>` : `<th>${c}</th>`)).join('')}</tr>`).join('')}</table>`;
      } else {
        const v = [62, 48, 71, 55, 80];
        corpo.innerHTML = `<div class="lk-painel"><span>Power BI</span>${v.map((x, k) => `<div><i style="height:${x}%"></i><b>${t('Reg.', 'Reg.')} ${k + 1}</b></div>`).join('')}</div>`;
      }
    });
  };

  // ---------- 09 · Juventudes: respostas do survey em escala de concordância ----------
  const juventudes = (p) => {
    const perguntas = [t('Os itinerários atendem aos meus interesses', 'The study tracks match my interests'),
      t('Entendo como escolher meu itinerário', 'I understand how to choose my track'), t('A escola me prepara para o futuro', 'School prepares me for the future')];
    const cats = [t('Discordo totalmente', 'Strongly disagree'), t('Discordo', 'Disagree'), t('Neutro', 'Neutral'), t('Concordo', 'Agree'), t('Concordo totalmente', 'Strongly agree')];
    const cores = ['#ff5a36', '#ffa48f', '#e2ded4', '#a6a6a6', '#111'];
    const r = sorteio(3);
    const dados = perguntas.map(() => [0, 1, 2].map(() => {
      const v = cats.map(() => 0.2 + r()); const s = v.reduce((a, b) => a + b, 0); return v.map((x) => (x / s) * 100);
    }));
    p.innerHTML = `<h4>Survey · ${t('Juventudes e o Novo Ensino Médio', 'Youth and the New High School')}</h4>
      <div class="ju-perg">${perguntas.map((_, i) => `<button>${t('Pergunta', 'Question')} ${i + 1}</button>`).join('')}</div>
      <p class="ju-texto"></p><div class="ju-barras"></div>
      <ul class="ju-leg">${cats.map((n, i) => `<li><i style="background:${cores[i]}"></i>${n}</li>`).join('')}</ul>`;
    const barras = p.querySelector('.ju-barras'), texto = p.querySelector('.ju-texto');
    grupo(p, '.ju-perg button', (q) => {
      texto.textContent = `“${perguntas[q]}”`;
      barras.innerHTML = dados[q].map((linha, s) => `<div><span>${t(`${s + 1}º ano`, ['1st', '2nd', '3rd'][s] + ' year')}</span><p>${linha.map((v, k) =>
        `<i style="width:${v}%;background:${cores[k]}" title="${cats[k]}: ${pct(v)}">${v > 11 ? pct(v) : ''}</i>`).join('')}</p></div>`).join('');
    });
  };

  const demos = { superacao, piaui, feminicidio, datapedia, protocolo, estagio, ia, lakehouse, juventudes };

  document.querySelectorAll('.demo').forEach((caixa) => {
    const montar = demos[caixa.dataset.demo];
    if (!montar) return;
    const real = caixa.querySelector('img');
    const tela = document.createElement('div');
    tela.className = 'demo-tela';
    if (real) tela.append(real);
    const palco = document.createElement('div');
    palco.className = `palco palco-${caixa.dataset.demo}`;
    palco.setAttribute('role', 'group');
    palco.setAttribute('aria-label', t('Demonstração interativa com dados ilustrativos', 'Interactive demo with illustrative data'));
    tela.append(palco);
    caixa.append(tela);
    montar(palco);
    const barra = document.createElement('div');
    barra.className = 'demo-barra';
    barra.innerHTML = `<span>${t('Interativo · dados ilustrativos', 'Interactive · illustrative data')}</span>`;
    caixa.append(barra);
    if (real) {
      // a tela real fica guardada atrás de um botão
      real.classList.add('demo-real');
      const bt = document.createElement('button');
      bt.className = 'demo-ver-real';
      const aviso = barra.querySelector('span'), textoDemo = aviso.textContent;
      const rotulo = () => {
        const realAberta = caixa.classList.contains('mostrando-real');
        bt.textContent = realAberta ? t('← Demonstração', '← Demo') : t('Ver tela real', 'See real screen');
        aviso.textContent = realAberta ? t('Tela real do projeto', 'Real project screen') : textoDemo;
      };
      bt.addEventListener('click', () => { caixa.classList.toggle('mostrando-real'); rotulo(); });
      rotulo();
      barra.append(bt);
    }
    const ajustar = () => { palco.style.transform = `scale(${tela.clientWidth / W})`; };
    ajustar();
    if ('ResizeObserver' in window) new ResizeObserver(ajustar).observe(tela);
    else window.addEventListener('resize', ajustar);
  });
})();
