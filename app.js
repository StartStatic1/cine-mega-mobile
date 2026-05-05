const API_KEY = "SUA_API_TMDB";
const MOTOR = "https://api-scraper-cinema.onrender.com";

// NAVEGAÇÃO
function ir(pagina) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pagina).classList.add('active');
}

// API helper
async function api(url) {
  const r = await fetch(url);
  return await r.json();
}

// HOME
async function carregarHome() {
  const data = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
  
  const lista = document.getElementById('lista-populares');

  lista.innerHTML = data.results.map(f => `
    <div class="card" onclick="abrirFilme('${f.title}')">
      <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
    </div>
  `).join('');
}

// BUSCA
async function buscarFilme() {
  const q = document.getElementById('inputBusca').value;

  const data = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${q}`);

  const lista = document.getElementById('resultados');

  lista.innerHTML = data.results.map(f => `
    <div class="card" onclick="abrirFilme('${f.title}')">
      <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
    </div>
  `).join('');
}

// ABRIR FILME
async function abrirFilme(titulo) {
  ir('player');

  const video = document.getElementById('video');

  video.src = `${MOTOR}/buscar?titulo=${encodeURIComponent(titulo)}`;
}

// INIT
carregarHome();

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
