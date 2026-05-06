const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";
let sliderAuto;

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

// Slider Automático Inteligente
async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    if(!d) return;
    const movies = d.results.slice(0, 6);
    const wrapper = document.getElementById('hero-wrapper');
    const dots = document.getElementById('hero-dots');

    wrapper.innerHTML = movies.map((m, i) => `
        <div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.poster_path})">
            <div class="hero-overlay">
                <div class="hero-brand">CINE MEGA</div>
                <h2>${m.title}</h2>
                <div class="hero-meta"><span>${m.release_date.split('-')[0]}</span> • <span>⭐ ${m.vote_average.toFixed(1)}</span></div>
                <p>${m.overview}</p>
                <button onclick="abrir(${m.id})" style="background:var(--red); color:#fff; border:none; padding:12px; border-radius:8px; font-weight:bold; width:150px;">▶ ASSISTIR</button>
            </div>
        </div>
    `).join('');

    dots.innerHTML = movies.map((_, i) => `<div class="dot ${i===0?'active':''}"></div>`).join('');

    const startAuto = () => {
        sliderAuto = setInterval(() => {
            let next = (wrapper.scrollLeft + wrapper.offsetWidth) >= wrapper.scrollWidth ? 0 : wrapper.scrollLeft + wrapper.offsetWidth;
            wrapper.scrollTo({ left: next, behavior: 'smooth' });
        }, 6000);
    };

    wrapper.addEventListener('scroll', () => {
        const idx = Math.round(wrapper.scrollLeft / wrapper.offsetWidth);
        document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    });

    wrapper.addEventListener('touchstart', () => clearInterval(sliderAuto));
    wrapper.addEventListener('touchend', startAuto);
    startAuto();
}

// Carregar Abas (Top 10, Clássicos, Trash)
async function carregarTudo() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero-fix">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');

    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const classicos = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&release_date.lte=1990-01-01&sort_by=vote_count.desc`);
    document.getElementById('classicos').innerHTML = classicos.results.slice(0, 15).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// Detalhes com Trailer e Elenco
async function abrir(id) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    filmeAtual = m.title;
    
    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview;

    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';

    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `
        <div style="flex:0 0 80px; text-align:center;">
            <img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:65px; height:65px; border-radius:50%; object-fit:cover; border:2px solid var(--red);">
            <p style="font-size:9px; margin-top:5px; color:#999;">${c.name}</p>
        </div>
    `).join('');
}

// Intents Sniper
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
carregarTudo();
