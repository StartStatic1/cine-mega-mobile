const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let currentHeroIndex = 0;
let heroData = [];

// AUTO SLIDER
async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    heroData = d.results.slice(0, 5);
    renderHero();
    setInterval(nextHero, 6000);
}

function renderHero() {
    const f = heroData[currentHeroIndex];
    const hero = document.getElementById('hero');
    hero.style.backgroundImage = `url(https://image.tmdb.org/p/original${f.backdrop_path})`;
    document.getElementById('hero-titulo').innerText = f.title;
    document.getElementById('hero-sinopse').innerText = f.overview;
    
    // Pontinhos
    const dots = document.getElementById('hero-dots');
    dots.innerHTML = heroData.map((_, i) => `<div class="dot ${i === currentHeroIndex ? 'active' : ''}"></div>`).join('');
}

function nextHero() {
    currentHeroIndex = (currentHeroIndex + 1) % heroData.length;
    renderHero();
}

// BUSCA IGUAL AO PRINT
async function buscar() {
    const q = document.getElementById("busca").value;
    if(!q) return;
    ir('buscaPage');
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    
    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div class="card-search" onclick="abrir(${f.id})">
            <img src="https://image.tmdb.org/t/p/w500${f.poster_path}">
            <p style="font-size:12px; margin-top:5px; font-weight:bold">${f.title}</p>
        </div>
    `).join('');
}

// TOP 10 NUMERADO (Lógica mantida mas CSS atualizado)
async function loadHome() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById("top10").innerHTML = d.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})" style="position:relative; margin-left:30px; min-width:140px">
            <span class="numero" style="position:absolute; left:-30px; bottom:-10px; font-size:70px; font-weight:900; -webkit-text-stroke: 1.5px #fff; color:#000; z-index:5">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w300${f.poster_path}" style="width:100%; border-radius:10px">
        </div>
    `).join('');
}

// CHAMADAS DE INICIALIZAÇÃO
initHero();
loadHome();
