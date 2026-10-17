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

// ============ ELEMENTOS APARECENDO AO ROLAR ============
if (!semAnimacao && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('com-efeitos');
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        el.classList.add('visivel');
        observador.unobserve(el);
        // depois de aparecer, libera o elemento para os outros efeitos (como a inclinação)
        setTimeout(() => {
          el.classList.remove('revelar', 'visivel');
          el.style.transitionDelay = '';
        }, 1400);
      }
    });
  }, { threshold: 0.12 });
  // pequeno atraso entre irmãos, para aparecerem em cascata
  document.querySelectorAll('.revelar').forEach((el) => {
    const irmaos = [...el.parentElement.children].filter(c => c.classList.contains('revelar'));
    el.style.transitionDelay = `${Math.min(irmaos.indexOf(el), 5) * 90}ms`;
    observador.observe(el);
  });
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
    let espera = apagando ? 45 : 90;
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

if (temMouse && !semAnimacao) {
  // ============ BRILHO QUE SEGUE O MOUSE ============
  const brilho = document.querySelector('.brilho-cursor');
  window.addEventListener('pointermove', (e) => {
    brilho.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    brilho.style.opacity = '1';
  }, { passive: true });
  document.addEventListener('pointerleave', () => { brilho.style.opacity = '0'; });

  // ============ CARTÕES QUE INCLINAM EM 3D ============
  document.querySelectorAll('.projeto, .card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.classList.add('inclinando');
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('inclinando');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

// ============ FLORZINHAS AO CLICAR ============
if (!semAnimacao) {
  const simbolos = ['✿', '♡', '✦', '❀'];
  document.addEventListener('click', (e) => {
    for (let k = 0; k < 6; k++) {
      const s = document.createElement('span');
      s.className = 'faisca';
      s.textContent = simbolos[k % simbolos.length];
      const ang = (Math.PI * 2 * k) / 6 + Math.random() * 0.5;
      const dist = 40 + Math.random() * 30;
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      s.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
      s.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
  });
}
