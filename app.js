const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";

async function api(url) {
    const r = await fetch(url);
    return await r.json();
}

function ir(aba) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(aba).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(aba === 'home') document.getElementById('btnHome').classList.add('active');
    window.scrollTo(0,0);
}

// Lógica do Slider 9:16
async function initSlider() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    const movies = d.results.slice(0, 5);
    const slider = document.getElementById('hero-slider');
    const dots = document.getElementById('hero-dots');

    slider.innerHTML = movies.map((m, i) => `
        <div class="hero-item ${i === 0 ? 'active' : ''}" style="background-image: url(https://image.tmdb.org/t/p/original${m.poster_path})">
            <div class="hero-overlay">
                <h2>${m.title}</h2>
                <p>⭐ ${m.vote_average} | ${m.overview}</p>
                <button onclick="abrir(${m.id})" style="background:#fff; color:#000; border:none; padding:10px 25px; border-radius:5px; font-weight:bold;">ASSISTIR</button>
            </div>
        </div>
    `).join('');

    dots.innerHTML = movies.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('');

    let current = 0;
    setInterval(() => {
        current = (current + 1) % 5;
        const items = document.querySelectorAll('.hero-item');
        const dItems = document.querySelectorAll('.dot');
        items.forEach(it => it.classList.remove('active'));
        dItems.forEach(dt => dt.classList.remove('active'));
        items[current].classList.add('active');
        dItems[current].classList.add('active');
    }, 6000);
}

// Busca com Mini Fotos e Sinopse
async function realizarBusca() {
    const q = document.getElementById('inputBusca').value;
    if(!q) return;
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    
    document.getElementById('resultados-lista').innerHTML = d.results.map(m => `
        <div class="search-item" onclick="abrir(${m.id})">
            <img src="https://image.tmdb.org/t/p/w200${m.poster_path}">
            <div class="search-info">
                <h4>${m.title}</h4>
                <p>${m.overview || 'Sem sinopse.'}</p>
            </div>
        </div>
    `).join('');
}

// Carregar Seções Estilo Site
async function loadHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((m, i) => `
        <div class="card-top" onclick="abrir(${m.id})">
            <span class="numero-vod">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${m.poster_path}">
        </div>
    `).join('');
    
    // Aba Estreias (Upcoming)
    const est = await api(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('estreias').innerHTML = est.results.map(m => `
        <div class="card-top" style="min-width:115px; height:170px;" onclick="abrir(${m.id})">
            <img src="https://image.tmdb.org/t/p/w300${m.poster_path}">
        </div>
    `).join('');
}

// Detalhes e Players
async function abrir(id) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`);
    filmeAtual = m.title;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview;
    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
}

function play() { window.open(`${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`, "_blank"); }
function abrirVLC() { location.href = `intent://${MOTOR.replace("https://","")}/buscar?titulo=${encodeURIComponent(filmeAtual)}#Intent;scheme=http;package=org.videolan.vlc;end`; }
function abrirMX() { location.href = `intent://${MOTOR.replace("https://","")}/buscar?titulo=${encodeURIComponent(filmeAtual)}#Intent;scheme=http;package=com.mxtech.videoplayer.ad;end`; }

initSlider();
loadHome();
