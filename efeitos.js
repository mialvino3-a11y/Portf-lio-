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
