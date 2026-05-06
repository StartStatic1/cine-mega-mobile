const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";
let timerHero;

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

// Slider Automático (5s) + Manual
async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    if(!d) return;
    const movies = d.results.slice(0, 7);
    const wrapper = document.getElementById('hero-wrapper');
    const dots = document.getElementById('hero-dots');

    wrapper.innerHTML = movies.map((m, i) => `
        <div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.poster_path})" onclick="abrir(${m.id})">
            <div class="hero-overlay">
                <div class="hero-brand">CINE MEGA</div>
                <h2>${m.title}</h2>
                <div class="hero-meta"><span>${m.release_date.split('-')[0]}</span> • <span>⭐ ${m.vote_average.toFixed(1)}</span></div>
                <p>${m.overview}</p>
            </div>
        </div>
    `).join('');

    dots.innerHTML = movies.map((_, i) => `<div class="dot ${i===0?'active':''}"></div>`).join('');

    const startTimer = () => {
        timerHero = setInterval(() => {
            let scrollTotal = wrapper.scrollLeft + wrapper.offsetWidth;
            if (scrollTotal >= wrapper.scrollWidth) {
                wrapper.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                wrapper.scrollTo({ left: scrollTotal, behavior: 'smooth' });
            }
        }, 5000);
    };

    wrapper.addEventListener('scroll', () => {
        const idx = Math.round(wrapper.scrollLeft / wrapper.offsetWidth);
        document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    });

    wrapper.addEventListener('touchstart', () => clearInterval(timerHero));
    wrapper.addEventListener('touchend', startTimer);
    startTimer();
}

// Home e Seções
async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero-fix">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');

    const breve = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=2026-06-01&sort_by=popularity.desc`);
    document.getElementById('embreve').innerHTML = breve.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// Busca em Lista (Mini Fotos + Sinopse)
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

// Detalhes com TUDO (Atores, Trailer, Sugestões)
async function abrir(id) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    filmeAtual = m.title;
    
    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-meta').innerText = `${m.release_date.split('-')[0]} • ⭐ ${m.vote_average.toFixed(1)} • ${m.runtime} min`;
    document.getElementById('m-sinopse').innerText = m.overview;

    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="210" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';

    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 10).map(c => `
        <div class="ator-item">
            <img src="https://image.tmdb.org/t/p/w200${c.profile_path}" onerror="this.src='https://via.placeholder.com/70x70/111/fff?text=?'">
            <p>${c.name}</p>
        </div>
    `).join('');

    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `
        <img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">
    `).join('');
}

function abrirVLC() {
    const url = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.location.href = `vlc://${url.replace(/^https?:\/\//, '')}`;
    setTimeout(() => { window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=http;package=org.videolan.vlc;end`; }, 500);
}

function abrirMX() {
    const url = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=http;package=com.mxtech.videoplayer.ad;end`;
}

initHero();
carregarHome();
