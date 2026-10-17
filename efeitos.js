// ============ MENU NO CELULAR ============
const btn = document.querySelector('.menu-btn');
const menu = document.querySelector('.menu');
btn.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  btn.setAttribute('aria-expanded', aberto);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('aberto');
  btn.setAttribute('aria-expanded', false);
}));

// Ano automático no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// Quem pediu "menos movimento" no sistema não vê as animações
const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const cor = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();

// Gerador de números "aleatórios" sempre iguais para a mesma semente,
// para os gráficos não mudarem a cada visita
const sementeAleatoria = (semente) => () => {
  semente = (semente + 0x6D2B79F5) | 0;
  let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ============ GRÁFICOS DECORATIVOS DOS PROJETOS ============
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
};
const caminho = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const L = 300, A = 130;

const desenhos = {
  linha(svg, r) {
    [['traco', 0], ['traco-2', 1]].forEach(([classe, s]) => {
      let y = 80 + s * 15;
      const pts = Array.from({ length: 13 }, (_, i) => {
        y = Math.max(20, Math.min(110, y - (s ? 2 : 5) + (r() - 0.5) * 22));
        return [10 + i * 23.3, y];
      });
      svg.append(el('path', { d: caminho(pts), class: classe }));
    });
  },
  area(svg, r) {
    let y = 112;
    const pts = Array.from({ length: 16 }, (_, i) => { y -= r() * 9; return [10 + i * 18.7, y]; });
    svg.append(el('path', { d: `${caminho(pts)} L290,120 L10,120 Z`, class: 'preenche' }));
    svg.append(el('path', { d: caminho(pts), class: 'traco' }));
  },
  dispersao(svg, r) {
    for (let i = 0; i < 42; i++) {
      const x = 15 + r() * 270;
      const y = 112 - (x / 300) * 80 + (r() - 0.5) * 36;
      svg.append(el('circle', { cx: x, cy: y, r: 2.8, class: r() > 0.8 ? 'ponto-2' : 'ponto' }));
    }
    svg.append(el('path', { d: 'M12,112 L288,32', class: 'traco-2' }));
  },
  barras(svg, r) {
    const n = 12, larg = 280 / n;
    const destaque = Math.floor(r() * n);
    let soma = 0;
    for (let i = 0; i < n; i++) {
      const h = 25 + r() * 75;
      soma += h;
      svg.append(el('rect', {
        x: 10 + i * larg + 3, y: 118 - h, width: larg - 6, height: h,
        class: i === destaque ? 'barra-destaque' : 'barra',
      }));
    }
    const media = 118 - soma / n;
    svg.append(el('path', { d: `M8,${media} L292,${media}`, class: 'traco-2' }));
  },
  rede(svg, r) {
    const nos = Array.from({ length: 16 }, () => [20 + r() * 260, 15 + r() * 100]);
    nos.forEach((a, i) => nos.forEach((b, j) => {
      if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 70) {
        svg.append(el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'ligacao' }));
      }
    }));
    nos.forEach((n, i) => svg.append(el('circle', { cx: n[0], cy: n[1], r: i % 5 ? 3 : 5, class: i % 5 ? 'ponto' : 'ponto-2' })));
  },
  camadas(svg) {
    // dados brutos → tratados → prontos para análise
    const colunas = [[50, 8], [150, 5], [250, 3]];
    const pos = colunas.map(([x, n]) => Array.from({ length: n }, (_, i) => [x, 65 + (i - (n - 1) / 2) * 13]));
    for (let c = 0; c < 2; c++) {
      pos[c].forEach((a) => pos[c + 1].forEach((b) => {
        svg.append(el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'ligacao' }));
      }));
    }
    pos.forEach((col, c) => col.forEach(([x, y]) => {
      svg.append(el('circle', { cx: x, cy: y, r: 4, class: c === 2 ? 'ponto-2' : 'ponto' }));
    }));
  },
};

document.querySelectorAll('.grafico').forEach((caixa, i) => {
  const svg = el('svg', { viewBox: `0 0 ${L} ${A}`, preserveAspectRatio: 'xMidYMid slice' });
  (desenhos[caixa.dataset.tipo] || desenhos.linha)(svg, sementeAleatoria(i + 7));
  caixa.append(svg);
  // prepara as linhas para serem "desenhadas" quando aparecerem
  svg.querySelectorAll('.traco, .traco-2').forEach((p) => {
    const comp = Math.ceil(p.getTotalLength());
    if (p.classList.contains('traco')) p.style.strokeDasharray = comp;
    p.style.setProperty('--comp', comp);
  });
});

// ============ ELEMENTOS APARECENDO AO ROLAR ============
if (!semAnimacao && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('com-efeitos');
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      const alvo = e.target;
      observador.unobserve(alvo);
      if (alvo.classList.contains('grafico')) {
        alvo.classList.add('desenhado');
        return;
      }
      alvo.classList.add('visivel');
      // depois de aparecer, libera o elemento para os outros efeitos (como a inclinação)
      setTimeout(() => {
        alvo.classList.remove('revelar', 'visivel');
        alvo.style.transitionDelay = '';
      }, 1400);
    });
  }, { threshold: 0.15 });
  // pequeno atraso entre irmãos, para aparecerem em cascata
  document.querySelectorAll('.revelar').forEach((alvo) => {
    const irmaos = [...alvo.parentElement.children].filter(c => c.classList.contains('revelar'));
    alvo.style.transitionDelay = `${Math.min(irmaos.indexOf(alvo), 5) * 90}ms`;
    observador.observe(alvo);
  });
  document.querySelectorAll('.grafico').forEach((g) => observador.observe(g));
}

// ============ TEXTO DIGITANDO ============
const palavraEl = document.querySelector('.palavra');
if (palavraEl && !semAnimacao) {
  const palavras = palavraEl.dataset.palavras.split('|');
  let i = 0, letras = palavras[0].length, apagando = true;
  // apaga a palavra letra por letra, troca para a próxima e escreve de novo
  const passo = () => {
    letras += apagando ? -1 : 1;
    palavraEl.textContent = palavras[i].slice(0, letras);
    let espera = apagando ? 40 : 85;
    if (!apagando && letras === palavras[i].length) { apagando = true; espera = 1800; }
    else if (apagando && letras === 0) { apagando = false; i = (i + 1) % palavras.length; espera = 300; }
    setTimeout(passo, espera);
  };
  setTimeout(passo, 2200);
}

// ============ BARRA DE PROGRESSO DA LEITURA ============
const barra = document.querySelector('.progresso');
const atualizarBarra = () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
};
window.addEventListener('scroll', atualizarBarra, { passive: true });
atualizarBarra();

// ============ REDE DE DADOS NO TOPO ============
const canvas = document.querySelector('.rede');
const hero = document.querySelector('.hero');
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d');
  const mouse = { x: -999, y: -999 };
  let nos = [], larg = 0, alt = 0, rodando = true;

  const iniciar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    larg = hero.clientWidth; alt = hero.clientHeight;
    canvas.width = larg * dpr; canvas.height = alt * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = sementeAleatoria(42);
    const qtd = Math.min(70, Math.round((larg * alt) / 16000));
    nos = Array.from({ length: qtd }, () => ({
      x: r() * larg, y: r() * alt,
      vx: (r() - 0.5) * 0.35, vy: (r() - 0.5) * 0.35,
      destaque: r() > 0.85,
    }));
  };

  const desenhar = () => {
    const azul = cor('--destaque'), ciano = cor('--ciano'), suave = cor('--texto-suave');
    ctx.clearRect(0, 0, larg, alt);
    const alcance = 130;
    for (let i = 0; i < nos.length; i++) {
      const a = nos[i];
      for (let j = i + 1; j < nos.length; j++) {
        const b = nos[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < alcance) {
          ctx.globalAlpha = (1 - d / alcance) * 0.35;
          ctx.strokeStyle = suave;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // ligações com o cursor
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 170) {
        ctx.globalAlpha = (1 - dm / 170) * 0.8;
        ctx.strokeStyle = azul;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    nos.forEach((n) => {
      ctx.globalAlpha = n.destaque ? 0.9 : 0.55;
      ctx.fillStyle = n.destaque ? ciano : azul;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.destaque ? 3.2 : 2.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  const mover = () => {
    nos.forEach((n) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > larg) n.vx *= -1;
      if (n.y < 0 || n.y > alt) n.vy *= -1;
    });
  };

  const quadro = () => {
    if (rodando) { mover(); desenhar(); }
    requestAnimationFrame(quadro);
  };

  iniciar();
  desenhar();
  if (!semAnimacao) {
    // só anima enquanto o topo está visível, para poupar bateria
    new IntersectionObserver(([e]) => { rodando = e.isIntersecting; }).observe(hero);
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    requestAnimationFrame(quadro);
  }
  let espera;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => { iniciar(); desenhar(); }, 200);
  });
}

if (temMouse && !semAnimacao) {
  // ============ COORDENADAS DO CURSOR ============
  const caixa = document.querySelector('.coordenadas');
  const cx = document.getElementById('cx'), cy = document.getElementById('cy');
  window.addEventListener('pointermove', (e) => {
    cx.textContent = (e.clientX / window.innerWidth).toFixed(3);
    cy.textContent = (1 - e.clientY / window.innerHeight).toFixed(3);
    caixa.classList.add('ativa');
  }, { passive: true });
  document.addEventListener('pointerleave', () => caixa.classList.remove('ativa'));

  // ============ CARTÕES QUE INCLINAM EM 3D ============
  document.querySelectorAll('.projeto, .card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.classList.add('inclinando');
    });
    card.addEventListener('pointerleave', () => card.classList.remove('inclinando'));
  });
}
