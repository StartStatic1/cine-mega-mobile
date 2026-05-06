const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";

async function api(url) {
    try {
        const r = await fetch(url);
        return await r.json();
    } catch(e) { return null; }
}

function ir(p) {
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    window.scrollTo(0,0);
}

// Slider Automático (Mantido o que estava bom)
async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    if(!d) return;
    const movies = d.results.slice(0, 6);
    const wrapper = document.getElementById('hero-wrapper');
    wrapper.innerHTML = movies.map((m, i) => `
        <div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.poster_path})">
            <div class="hero-overlay">
                <div class="hero-brand">CINE MEGA</div>
                <h2>${m.title}</h2>
                <div class="hero-meta"><span>${m.release_date.split('-')[0]}</span> • <span>⭐ ${m.vote_average.toFixed(1)}</span></div>
                <button onclick="abrir(${m.id})" class="btn-play-hero">▶ ASSISTIR AGORA</button>
            </div>
        </div>
    `).join('');
}

// Carregar Home com "Em Breve" e "Lançamentos"
async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero-fix">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');

    // LANÇAMENTOS (Recentes)
    const lan = await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML = lan.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    // EM BREVE (Junho de 2026 para frente)
    const breve = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=2026-06-01&sort_by=popularity.desc`);
    document.getElementById('embreve').innerHTML = breve.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// Pesquisa Padronizada
async function buscar() {
    const q = document.getElementById("inputBusca").value;
    if(!q) return;
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div class="search-row" onclick="abrir(${f.id})">
            <img src="https://image.tmdb.org/t/p/w200${f.poster_path}">
            <div class="search-info">
                <h4>${f.title}</h4>
                <p>${f.overview || 'Sinopse não disponível.'}</p>
            </div>
        </div>
    `).join('');
}

// Detalhes com Sugestões (Similares)
async function abrir(id) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=recommendations`);
    filmeAtual = m.title;
    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview;
    
    // Similares / Você pode gostar
    document.getElementById('m-sugestoes').innerHTML = m.recommendations.results.slice(0, 10).map(f => `
        <img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">
    `).join('');
}

// PLAYERS (VLC e MX DIRETO)
function abrirVLC() {
    const url = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=http;package=org.videolan.vlc;end`;
}

function abrirMX() {
    const url = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=http;package=com.mxtech.videoplayer.ad;end`;
}

initHero();
carregarHome();
