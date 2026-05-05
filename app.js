const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";

async function api(url) {
    const r = await fetch(url);
    return await r.json();
}

// Navegação Inteligente
function ir(p) {
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    window.scrollTo(0,0);
}

// Slider Automático
async function hero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    let i = 0;
    const el = document.getElementById("hero");
    
    function updateHero() {
        const f = d.results[i];
        el.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${f.backdrop_path})`;
        document.getElementById("hero-titulo").innerText = f.title;
        i = (i + 1) % 5;
    }
    updateHero();
    setInterval(updateHero, 5000);
}

// Top 10 Numerado
async function carregarHome() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    
    document.getElementById("top10").innerHTML = d.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
        </div>
    `).join('');

    const estreias = await api(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById("estreias").innerHTML = estreias.results.map(f => `
        <div class="card-normal" onclick="abrir(${f.id})">
            <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
            <p style="font-size:10px; text-align:center; margin-top:5px;">${f.title}</p>
        </div>
    `).join('');
}

// Abrir Detalhes Otimizado
async function abrir(id) {
    ir("detalhes");
    const d = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=recommendations`);
    
    filmeAtual = d.title;
    document.getElementById("titulo").innerText = d.title;
    document.getElementById("sinopse").innerText = d.overview || "Sem sinopse disponível.";
    document.getElementById("poster").src = `https://image.tmdb.org/t/p/w300${d.poster_path}`;
    document.getElementById("backdrop").style.backgroundImage = `url(https://image.tmdb.org/t/p/original${d.backdrop_path})`;
    document.getElementById("meta").innerText = `${d.release_date.split('-')[0]} • ⭐ ${d.vote_average.toFixed(1)}`;

    document.getElementById("recomendados").innerHTML = d.recommendations.results.slice(0, 10).map(f => `
        <div class="card-normal" onclick="abrir(${f.id})">
            <img src="https://image.tmdb.org/t/p/w200${f.poster_path}">
        </div>
    `).join('');
}

// Busca Corrigida
async function buscar() {
    const q = document.getElementById("busca").value;
    if(!q) return;
    ir("buscaPage");
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    
    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div class="card-normal" onclick="abrir(${f.id})" style="width:100%">
            <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
        </div>
    `).join('');
}

// Players Externos (Intent Sniper)
function play() {
    const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.open(link, "_blank");
}

function abrirVLC() {
    const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    const intent = `intent://${link.replace(/^https?:\/\//, '')}#Intent;scheme=http;type=video/*;package=org.videolan.vlc;end`;
    location.href = intent;
}

function abrirMX() {
    const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    const intent = `intent://${link.replace(/^https?:\/\//, '')}#Intent;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;end`;
    location.href = intent;
}

// Init
hero();
carregarHome();
