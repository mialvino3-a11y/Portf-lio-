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

// ============ EFEITOS 3D ============
const temMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Cubo: gira sozinho e pode ser arrastado com o mouse ou o dedo
const cena = document.querySelector('.cena');
const cubo = document.querySelector('.cubo');
if (cena && cubo && !semAnimacao) {
  let rx = -22, ry = 35, velocidade = 0, arrastando = false, ultimoX = 0, ultimoY = 0, visivel = true;
  const girar = () => {
    if (visivel && !arrastando) {
      ry += 0.35 + velocidade;
      velocidade *= 0.95;
    }
    cubo.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    requestAnimationFrame(girar);
  };
  cena.addEventListener('pointerdown', (e) => {
    arrastando = true; ultimoX = e.clientX; ultimoY = e.clientY;
    cena.setPointerCapture(e.pointerId);
  });
  cena.addEventListener('pointermove', (e) => {
    if (!arrastando) return;
    const dx = e.clientX - ultimoX, dy = e.clientY - ultimoY;
    ry += dx * 0.6;
    rx = Math.max(-80, Math.min(80, rx - dy * 0.6));
    velocidade = dx * 0.3;
    ultimoX = e.clientX; ultimoY = e.clientY;
  });
  const soltar = () => { arrastando = false; };
  cena.addEventListener('pointerup', soltar);
  cena.addEventListener('pointercancel', soltar);
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(cena);
  requestAnimationFrame(girar);
}

if (temMouse && !semAnimacao) {
  // Título: inclina e a sombra muda de lado conforme o mouse
  const hero = document.querySelector('.hero');
  const titulo = document.querySelector('.titulo-3d');
  const laranja = getComputedStyle(document.documentElement).getPropertyValue('--laranja').trim();
  const sombra = (dx, dy) => {
    const camadas = [];
    for (let i = 1; i <= 7; i++) {
      camadas.push(`${(-dx * i).toFixed(1)}px ${(-dy * i).toFixed(1)}px 0 ${i === 7 ? '#111' : laranja}`);
    }
    return camadas.join(', ');
  };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width * 2 - 1;   // -1 a 1
    const dy = (e.clientY - r.top) / r.height * 2 - 1;
    titulo.style.transform = `perspective(1000px) rotateY(${dx * 10}deg) rotateX(${-dy * 8}deg)`;
    titulo.style.textShadow = sombra(dx * 1.2, dy * 1.2);
  });
  hero.addEventListener('pointerleave', () => {
    titulo.style.transform = '';
    titulo.style.textShadow = '';
  });

  // Cartões: inclinam em 3D seguindo o mouse, com a sombra acompanhando
  document.querySelectorAll('.projeto, .card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 a 0.5
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${-y * 14}deg`);
      card.style.setProperty('--ry', `${x * 14}deg`);
      card.style.setProperty('--sx', `${(-x * 20).toFixed(1)}px`);
      card.style.setProperty('--sy', `${(-y * 20 + 4).toFixed(1)}px`);
      card.classList.add('inclinando');
    });
    card.addEventListener('pointerleave', () => card.classList.remove('inclinando'));
  });
}
