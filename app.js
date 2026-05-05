const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";

async function api(url) {
    try {
        const r = await fetch(url);
        return await r.json();
    } catch(e) { return null; }
}

// Navegação Nativa
function ir(p) {
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(i => i.classList.remove('active'));
    window.scrollTo(0,0);
}

// Slider 9:16 com Dados Internos
async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    const movies = d.results.slice(0, 6);
    const container = document.getElementById('hero-wrapper');
    
    container.innerHTML = movies.map((m, i) => `
        <div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.poster_path})">
            <div class="hero-overlay">
                <div class="hero-brand">CINE MEGA</div>
                <h2>${m.title}</h2>
                <div class="hero-meta"><span>${m.release_date.split('-')[0]}</span> • <span class="nota">⭐ ${m.vote_average.toFixed(1)}</span></div>
                <p>${m.overview}</p>
                <button class="btn-hero" onclick="abrir(${m.id})">▶ ASSISTIR</button>
            </div>
        </div>
    `).join('');

    const dots = document.getElementById('hero-dots');
    dots.innerHTML = movies.map((_, i) => `<div class="dot ${i===0?'active':''}"></div>`).join('');
    
    // Rotação Automática + Suporte a Scroll manual
    let current = 0;
    setInterval(() => {
        current = (current + 1) % 6;
        container.scrollTo({ left: container.offsetWidth * current, behavior: 'smooth' });
        document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === current));
    }, 7000);
}

// Carregar Categorias Específicas (Trash, Clássicos)
async function carregarSecoes() {
    // Top 10
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero-fix">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');

    // Estreias Futuras (Junho adiantado)
    const est = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=2026-06-01&sort_by=popularity.desc`);
    document.getElementById('estreias').innerHTML = est.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    // Clássicos (Van Damme, De Volta pro Futuro)
    const cla = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&release_date.lte=1995-01-01&sort_by=vote_count.desc`);
    document.getElementById('classicos').innerHTML = cla.results.slice(0, 15).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    // Trash (80-95)
    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// Busca Instantânea "No Gatilho"
async function buscar() {
    const q = document.getElementById("inputBusca").value;
    if(!q) return;
    ir('buscaPage');
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

// PLAYER DIRETO (SEM PLAY STORE)
function play() { window.open(`${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`, "_blank"); }

function abrirVLC() {
    const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    // Método direto para forçar abertura do APP
    window.location.href = `vlc://${link.replace("https://", "")}`;
    setTimeout(() => { // Fallback caso o esquema vlc:// falhe
       window.location.href = `intent://${link.replace("https://","")}#Intent;scheme=http;package=org.videolan.vlc;end`;
    }, 500);
}

function abrirMX() {
    const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.location.href = `intent://${link.replace("https://","")}#Intent;scheme=http;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(filmeAtual)};end`;
}

initHero();
carregarSecoes();
