const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";

// Função de Segurança para API
async function api(url) {
    try {
        const r = await fetch(url);
        if(!r.ok) throw new Error();
        return await r.json();
    } catch(e) {
        console.log("Erro na conexão");
        return null;
    }
}

// Navegação Nativa
function ir(p) {
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    window.scrollTo(0,0);
}

// Carregar Home & Hero
async function carregarHome() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    if(!d) return;

    // Hero Sniper
    const h = d.results[0];
    filmeAtual = h.title;
    document.getElementById('hero').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${h.backdrop_path})`;
    document.getElementById('h-titulo').innerText = h.title;
    document.getElementById('h-sinopse').innerText = h.overview;

    // Top 10 Numerado
    document.getElementById("top10").innerHTML = d.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');
}

// Busca Blindada (2 Colunas)
async function buscar() {
    const q = document.getElementById("inputBusca").value;
    if(!q) return;
    ir('buscaPage');
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    if(!d) return;

    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div class="card-search" onclick="abrir(${f.id})">
            <img src="https://image.tmdb.org/t/p/w500${f.poster_path}">
            <p style="font-size:11px; text-align:center; margin-top:8px; font-weight:bold">${f.title}</p>
        </div>
    `).join('');
}

// Abrir Detalhes (Estilo App)
async function abrir(id) {
    ir("detalhes");
    const d = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=recommendations,videos`);
    
    filmeAtual = d.title;
    document.getElementById("m-titulo").innerText = d.title;
    document.getElementById("m-sinopse").innerText = d.overview || "Sem sinopse disponível.";
    document.getElementById("m-poster").src = `https://image.tmdb.org/t/p/w400${d.poster_path}`;
    document.getElementById("m-backdrop").style.backgroundImage = `url(https://image.tmdb.org/t/p/original${d.backdrop_path})`;
    
    document.getElementById("recomendados").innerHTML = d.recommendations.results.slice(0, 10).map(f => `
        <div class="card-top" style="min-width:120px; height:180px;" onclick="abrir(${f.id})">
            <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
        </div>
    `).join('');
}

// Players Sniper (Trava de Segurança Koyeb)
function play() {
    const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.open(link, "_blank");
}

function abrirVLC() {
    const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    location.href = `intent://${link.replace(/^https?:\/\//, '')}#Intent;scheme=http;type=video/*;package=org.videolan.vlc;end`;
}

function abrirMX() {
    const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    location.href = `intent://${link.replace(/^https?:\/\//, '')}#Intent;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;end`;
}

carregarHome();
