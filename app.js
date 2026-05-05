const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";

// NAVEGAÇÃO
function ir(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById(p).classList.add('active');
}

// API helper
async function api(url) {
  try {
    const r = await fetch(url);
    return await r.json();
  } catch (e) {
    console.log("Erro API:", e);
    return null;
  }
}

// HOME
async function carregarHome() {
  const lista = document.getElementById('lista-populares');
  lista.innerHTML = "Carregando...";

  const data = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);

  if (!data || !data.results) {
    lista.innerHTML = "Erro ao carregar filmes 😢";
    return;
  }

  lista.innerHTML = data.results.map(f => `
    <div class="card" onclick="abrirFilme('${f.title.replace(/'/g, "")}')">
      <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
    </div>
  `).join('');
}

// BUSCA
async function buscarFilme() {
  const q = document.getElementById('inputBusca').value;

  if (!q) return;

  const lista = document.getElementById('resultados');
  lista.innerHTML = "Buscando...";

  const data = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(q)}`);

  if (!data || !data.results) {
    lista.innerHTML = "Nada encontrado 😢";
    return;
  }

  lista.innerHTML = data.results.map(f => `
    <div class="card" onclick="abrirFilme('${f.title.replace(/'/g, "")}')">
      <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
    </div>
  `).join('');
}

// PLAYER
async function abrirFilme(titulo) {
  ir('player');

  document.getElementById('tituloFilme').innerText = titulo;

  const video = document.getElementById('video');

  video.src = "";
  video.load();

  const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(titulo)}`;

  // Teste antes de jogar no player
  try {
    const teste = await fetch(link, { method: "HEAD" });

    if (teste.ok) {
      video.src = link;
      video.play().catch(() => {});
    } else {
      alert("❌ Filme não encontrado no servidor");
    }
  } catch {
    alert("⚠️ Erro ao conectar com servidor");
  }
}

// INIT
carregarHome();

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
