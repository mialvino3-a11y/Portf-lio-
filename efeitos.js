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

// ============ NAVEGAÇÃO INTERNA ============
// Rola só esta página até a seção. (O jeito padrão dos navegadores também rola a página
// "de fora" quando o site está dentro de outra, o que dava a impressão de travar.)
const irPara = (hash) => {
  const alvo = document.querySelector(hash);
  if (!alvo) return;
  const topo = document.querySelector('.topo');
  const y = alvo.getBoundingClientRect().top + window.pageYOffset - (topo ? topo.offsetHeight : 0);
  try { window.scrollTo({ top: y, behavior: semAnimacao ? 'auto' : 'smooth' }); }
  catch (erro) { window.scrollTo(0, y); }
  try { history.replaceState(null, '', hash); } catch (erro) { /* alguns ambientes não permitem */ }
};
document.addEventListener('click', (e) => {
  const link = e.target.closest && e.target.closest('a[href^="#"]');
  if (!link || link.classList.contains('bloco') || link.getAttribute('href').length < 2) return;
  e.preventDefault();
  irPara(link.getAttribute('href'));
});

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
  mapa(svg, r) {
    // mosaico hexagonal, como um mapa de municípios colorido por indicador
    const raio = 11, w = Math.sqrt(3) * raio, classes = ['hex-0', 'hex-1', 'hex-2', 'hex-3'];
    for (let lin = 0; lin < 9; lin++) {
      for (let col = 0; col < 15; col++) {
        const cx = 12 + col * w + (lin % 2 ? w / 2 : 0), cy = 10 + lin * raio * 1.5;
        const dx = (cx - 150) / 140, dy = (cy - 65) / 60;
        if (dx * dx + dy * dy > 1 + r() * 0.25) continue;   // recorte com contorno irregular
        const pts = Array.from({ length: 6 }, (_, k) => {
          const ang = (Math.PI / 3) * k + Math.PI / 6;
          return `${(cx + raio * 0.92 * Math.cos(ang)).toFixed(1)},${(cy + raio * 0.92 * Math.sin(ang)).toFixed(1)}`;
        }).join(' ');
        const valor = Math.min(3, Math.floor(r() * 3.2 + (1 - Math.hypot(dx, dy)) * 1.2));
        svg.append(el('polygon', { points: pts, class: `hex ${classes[valor]}` }));
      }
    }
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
  // dispara assim que o elemento começa a entrar na tela (funciona até para cartões muito altos)
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  // pequeno atraso entre irmãos, para aparecerem em cascata
  document.querySelectorAll('.revelar').forEach((alvo) => {
    const irmaos = [...alvo.parentElement.children].filter(c => c.classList.contains('revelar'));
    alvo.style.transitionDelay = `${Math.min(irmaos.indexOf(alvo), 5) * 90}ms`;
    observador.observe(alvo);
  });
  document.querySelectorAll('.grafico').forEach((g) => observador.observe(g));
  // garantia: se algo ainda estiver escondido depois de passar pela tela, mostra de qualquer jeito
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.revelar:not(.visivel)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visivel');
    });
  }, { passive: true });
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

// ============ CAPA: MUNDO SOCIAL FEITO DE DADOS ============
// Pontos (pessoas) espalhados numa esfera, ligados aos vizinhos mais próximos.
// Pacotes de dados correm pelas conexões e os blocos de navegação giram junto.
const mundo = document.querySelector('.mundo');
const canvasMundo = mundo && mundo.querySelector('.mundo-canvas');
if (mundo && canvasMundo && canvasMundo.getContext) {
  const canvas = canvasMundo;
  const ctx = canvas.getContext('2d');
  const blocos = [...mundo.querySelectorAll('.bloco')];
  const css = getComputedStyle(document.documentElement);
  const PRETO = css.getPropertyValue('--preto').trim();
  const LARANJA = css.getPropertyValue('--laranja').trim();
  const rnd = sementeAleatoria(11);

  // pontos distribuídos por igual na esfera (espiral de Fibonacci)
  // telas pequenas (celulares) usam menos pontos, para ficar leve mesmo em aparelhos simples
  const N = mundo.clientWidth < 450 ? 120 : 170;
  const pontos = Array.from({ length: N }, (_, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const raio = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(a) * raio, y, z: Math.sin(a) * raio, destaque: rnd() > 0.88 };
  });
  // cada ponto se liga aos 3 vizinhos mais próximos
  const ligacoes = [];
  pontos.forEach((p, i) => {
    pontos.map((q, j) => [j, (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2])
      .filter(([j]) => j > i).sort((u, v) => u[1] - v[1]).slice(0, 3)
      .forEach(([j]) => ligacoes.push([i, j]));
  });
  // posição de cada bloco na esfera (latitude/longitude em graus)
  const ancoras = blocos.map((b) => {
    const lat = (+b.dataset.lat * Math.PI) / 180, lon = (+b.dataset.lon * Math.PI) / 180;
    return { x: Math.cos(lat) * Math.sin(lon), y: -Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) };
  });
  // pacotes de dados viajando pelas conexões
  const pacotes = Array.from({ length: 22 }, () => ({ l: Math.floor(rnd() * ligacoes.length), t: rnd(), v: 0.006 + rnd() * 0.012 }));
  const pulsos = [];

  // orientação do globo guardada como matriz de rotação: permite girar livremente em qualquer direção
  let M = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  // gira em torno dos eixos da tela: ay = arrasto horizontal, ax = arrasto vertical
  const girarGlobo = (ax, ay) => {
    const ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax);
    M = M.map((_, i) => [0, 1, 2].map((j) => {
      const x = M[0][j], y = M[1][j], z = M[2][j];
      const y1 = y * cb - z * sb, z1 = y * sb + z * cb;
      if (i === 0) return x * ca + z1 * sa;
      if (i === 1) return y1;
      return -x * sa + z1 * ca;
    }));
  };
  // corrige pequenos erros numéricos para a esfera não deformar com o tempo
  const normalizar = () => {
    const n = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return v.map((c) => c / l); };
    const a = n(M[0]);
    const d = a[0] * M[1][0] + a[1] * M[1][1] + a[2] * M[1][2];
    const b = n([M[1][0] - d * a[0], M[1][1] - d * a[1], M[1][2] - d * a[2]]);
    M = [a, b, [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]];
  };
  girarGlobo(0.35, 0.6);
  let velX = 0, velY = 0.0025, quadros = 0, pausado = false, arrastando = false, ultX = 0, ultY = 0, visivel = true, tam = 0, dpr = 1;

  const medir = () => {
    tam = mundo.clientWidth || 300;
    dpr = Math.min(window.devicePixelRatio || 1, tam < 450 ? 1.5 : 2);
    canvas.width = tam * dpr; canvas.height = tam * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // guarda o tamanho de cada bloco para mantê-los sempre dentro do globo/tela
    blocos.forEach((b) => { b._meiaL = b.offsetWidth / 2; b._meiaA = b.offsetHeight / 2; });
  };

  // gira e projeta um ponto 3D na tela; devolve x, y, profundidade (0 atrás a 1 na frente) e escala
  const projetar = (p) => {
    const x1 = M[0][0] * p.x + M[0][1] * p.y + M[0][2] * p.z;
    const y2 = M[1][0] * p.x + M[1][1] * p.y + M[1][2] * p.z;
    const z2 = M[2][0] * p.x + M[2][1] * p.y + M[2][2] * p.z;
    const R = tam * 0.38, f = 2.6, esc = f / (f - z2);
    return { x: tam / 2 + x1 * R * esc, y: tam / 2 + y2 * R * esc, prof: (z2 + 1) / 2, esc };
  };

  const desenhar = () => {
    ctx.clearRect(0, 0, tam, tam);
    const P = pontos.map(projetar);
    // contorno do globo
    ctx.globalAlpha = 0.12; ctx.fillStyle = PRETO;
    ctx.beginPath(); ctx.arc(tam / 2, tam / 2, tam * 0.385, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1;
    ligacoes.forEach(([i, j]) => {
      const a = P[i], b = P[j];
      ctx.globalAlpha = 0.08 + Math.min(a.prof, b.prof) * 0.55;
      ctx.strokeStyle = PRETO;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    pontos.forEach((p, i) => {
      const q = P[i];
      ctx.globalAlpha = 0.25 + q.prof * 0.75;
      ctx.fillStyle = p.destaque ? LARANJA : PRETO;
      const r = (p.destaque ? 4 : 2.4) * q.esc;
      if (p.destaque) { ctx.fillRect(q.x - r, q.y - r, r * 2, r * 2); }
      else { ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.fill(); }
    });
    // pacotes de dados
    pacotes.forEach((k) => {
      const [i, j] = ligacoes[k.l];
      const a = P[i], b = P[j];
      const x = a.x + (b.x - a.x) * k.t, y = a.y + (b.y - a.y) * k.t;
      ctx.globalAlpha = 0.3 + Math.min(a.prof, b.prof) * 0.7;
      ctx.fillStyle = LARANJA; ctx.strokeStyle = PRETO;
      ctx.fillRect(x - 3, y - 3, 6, 6); ctx.strokeRect(x - 3, y - 3, 6, 6);
    });
    // pulsos de clique
    for (let n = pulsos.length - 1; n >= 0; n--) {
      const pu = pulsos[n];
      pu.t += 0.04;
      if (pu.t >= 1) { pulsos.splice(n, 1); continue; }
      ctx.globalAlpha = 1 - pu.t; ctx.strokeStyle = LARANJA; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(pu.x, pu.y, 10 + pu.t * 120, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1;
    }
    ctx.globalAlpha = 1;
    // blocos de navegação acompanham a rotação
    ancoras.forEach((p, i) => {
      const q = projetar(p);
      const b = blocos[i];
      const s = 0.75 + q.prof * 0.35;
      const mx = b._meiaL * s + 4, my = b._meiaA * s + 4;
      b.style.left = `${Math.max(mx, Math.min(tam - mx, q.x))}px`;
      b.style.top = `${Math.max(my, Math.min(tam - my, q.y))}px`;
      b.style.setProperty('--s', s.toFixed(3));
      b.style.setProperty('--o', (0.35 + q.prof * 0.65).toFixed(3));
      b.style.setProperty('--z', Math.round(q.prof * 100));
      b.classList.toggle('atras', q.prof < 0.35);
    });
  };

  const quadro = () => {
    if (visivel) {
      if (!arrastando && !pausado) girarGlobo(velX, velY);
      // depois de soltar, o embalo diminui aos poucos até voltar à rotação lenta normal
      velY += (0.0025 - velY) * 0.03;
      velX *= 0.95;
      if (++quadros % 300 === 0) normalizar();
      pacotes.forEach((k) => {
        k.t += k.v;
        if (k.t > 1) { k.t = 0; k.l = Math.floor(Math.random() * ligacoes.length); }
      });
      desenhar();
    }
    requestAnimationFrame(quadro);
  };

  if (!window.matchMedia('(hover: hover)').matches) {
    mundo.querySelector('.mundo-legenda').textContent = 'Arraste para girar · toque num bloco de dados';
  }
  medir(); desenhar();
  if (document.fonts) document.fonts.ready.then(() => { medir(); desenhar(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => { medir(); desenhar(); }).observe(mundo);
  else window.addEventListener('resize', () => { medir(); desenhar(); });

  // o globo para de girar enquanto o mouse ou o foco está num bloco, para facilitar o clique
  // no toque não existe "passar o mouse": o globo pausa ao encostar o dedo e volta a girar pouco depois
  let retomar;
  const pausarPorToque = () => {
    pausado = true;
    clearTimeout(retomar);
    retomar = setTimeout(() => { pausado = false; }, 2500);
  };
  mundo.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') pausarPorToque(); });
  blocos.forEach((b) => {
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pausado = true; });
    b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') pausado = false; });
    b.addEventListener('focus', () => { pausado = true; });
    b.addEventListener('blur', () => { pausado = false; });
  });

  // clicar num bloco: pulso de dados e depois rola até a seção
  blocos.forEach((b, i) => b.addEventListener('click', (e) => {
    e.preventDefault();
    const hash = b.getAttribute('href');
    if (semAnimacao) { irPara(hash); return; }
    const q = projetar(ancoras[i]);
    pulsos.push({ x: q.x, y: q.y, t: 0 });
    setTimeout(() => irPara(hash), 380);
  }));

  if (!semAnimacao) {
    mundo.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.bloco')) return;
      arrastando = true; ultX = e.clientX; ultY = e.clientY;
      mundo.classList.add('arrastando');
      mundo.setPointerCapture(e.pointerId);
    });
    mundo.addEventListener('pointermove', (e) => {
      if (!arrastando) return;
      const dx = e.clientX - ultX, dy = e.clientY - ultY;
      girarGlobo(-dy * 0.008, dx * 0.008);
      velY = dx * 0.002;
      velX = -dy * 0.002;
      ultX = e.clientX; ultY = e.clientY;
    });
    const soltar = () => { arrastando = false; mundo.classList.remove('arrastando'); };
    mundo.addEventListener('pointerup', soltar);
    mundo.addEventListener('pointercancel', soltar);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(mundo);
    requestAnimationFrame(quadro);
  }
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
