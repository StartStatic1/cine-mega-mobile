const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";

// NAV
function ir(p) {
  document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
  document.getElementById(p).classList.add('active');
}

// API
async function api(url) {
  const r = await fetch(url);
  return await r.json();
}

// HERO SLIDER
async function carregarHero() {
  const data = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
  let i = 0;

  setInterval(() => {
    const f = data.results[i];
    document.getElementById("hero").style.backgroundImage =
      `url(https://image.tmdb.org/t/p/original${f.backdrop_path})`;
    i = (i + 1) % 5;
  }, 3000);
}

// TOP 10
async function top10() {
  const data = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);

  document.getElementById("top10").innerHTML =
    data.results.slice(0,10).map((f,i)=>`
      <div class="card" onclick="abrirFilme('${f.title}')">
        <span class="numero">${i+1}</span>
        <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
      </div>
    `).join('');
}

// ESTREIAS FUTURAS
async function estreias() {
  const hoje = new Date().toISOString().split("T")[0];

  const data = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=${hoje}`);

  document.getElementById("estreias").innerHTML =
    data.results.slice(0,10).map(f=>`
      <div class="card">
        <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
      </div>
    `).join('');
}

// GENEROS
async function generos() {
  const acao = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28`);
  const comedia = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35`);

  document.getElementById("acao").innerHTML =
    acao.results.slice(0,10).map(f=>`
      <div class="card" onclick="abrirFilme('${f.title}')">
        <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
      </div>
    `).join('');

  document.getElementById("comedia").innerHTML =
    comedia.results.slice(0,10).map(f=>`
      <div class="card" onclick="abrirFilme('${f.title}')">
        <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
      </div>
    `).join('');
}

// BUSCA
async function buscarFilme() {
  ir("buscarPage");

  const q = document.getElementById("busca").value;

  const data = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}`);

  document.getElementById("resultados").innerHTML =
    data.results.map(f=>`
      <div class="card" onclick="abrirFilme('${f.title}')">
        <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
      </div>
    `).join('');
}

// ABRIR FILME (EXTERNO + INTENT)
function abrirFilme(titulo) {
  const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(titulo)}`;

  // tenta abrir externo
  window.open(link, "_blank");

  // VLC
  window.location.href =
    `intent://${link.replace("https://","")}#Intent;package=org.videolan.vlc;end`;

  // MX Player
  window.location.href =
    `intent://${link.replace("https://","")}#Intent;package=com.mxtech.videoplayer.ad;end`;
}

// INIT
carregarHero();
top10();
estreias();
generos();

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
