# Portfólio

Site de portfólio profissional em uma única página (HTML + CSS, sem instalar nada).

## Como editar

- **Textos:** abra `index.html` e troque os textos de exemplo ("Seu Nome", "Nome do projeto" etc.).
- **Foto:** crie uma pasta `img/`, coloque sua foto (ex.: `img/foto.jpg`) e troque o
  `<div class="foto-placeholder">SN</div>` por `<img src="img/foto.jpg" alt="Seu Nome">`.
- **Imagens dos projetos:** troque o texto dentro de `<div class="projeto-img ...">` por
  `<img src="img/projeto1.jpg" alt="Descrição">`.
- **Mais projetos:** copie um bloco `<article class="projeto">` inteiro e cole abaixo.
- **Cores:** mude as variáveis no topo de `style.css` (`--destaque` é a cor principal).

## Publicar grátis no GitHub Pages

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em *Source*, escolha **Deploy from a branch**, selecione a branch principal e a pasta `/ (root)`.
3. Salve. Em alguns minutos o site fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
