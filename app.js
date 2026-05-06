// ====== CONFIGURAÇÕES TÉCNICAS ======
const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";
let heroIndex = 0;

// ====== 🔒 CINE MEGA SECURITY (VERSÃO ESTÁVEL) ======
function _cm_dev() {
    const data = [
        navigator.userAgent,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset()
    ].join("|");

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data.charCodeAt(i);
        hash |= 0;
    }

    return "CM-" + Math.abs(hash);
}

function _cm_save(expira) {
    const payload = { e: expira, d: _cm_dev() };
    localStorage.setItem("cm_access", btoa(JSON.stringify(payload)));
}

function _cm_check() {
    const raw = localStorage.getItem("cm_access");
    if (!raw) return false;

    try {
        const data = JSON.parse(atob(raw));
        if (data.d !== _cm_dev()) return false;
        if (Date.now() > data.e) return false;
        return true;
    } catch {
        return false;
    }
}

function _cm_guard() {
    const login = document.getElementById("login");
    if (!login) return;

    if (!_cm_check()) {
        login.style.display = "flex";
    } else {
        login.style.display = "none";
    }
}

function _cm_login() {
    const chave = document.getElementById("inputChave").value.trim().toUpperCase();

    if (typeof CHAVES_VALIDAS !== "undefined" && CHAVES_VALIDAS.includes(chave)) {
        const tempo = Date.now() + (30 * 24 * 60 * 60 * 1000);
        _cm_save(tempo);
        _cm_guard();
    } else {
        document.getElementById("msgErro").style.display = "block";
    }
}

function _cm_test() {
    if (localStorage.getItem("cm_test")) {
        alert("Teste já utilizado!");
        return;
    }

    const tempo = Date.now() + (60 * 60 * 1000);
    _cm_save(tempo);
    localStorage.setItem("cm_test", "1");

    _cm_guard();
}

// ====== 1. INICIALIZAÇÃO ======
document.addEventListener("DOMContentLoaded", () => {

    // INICIA APP NORMAL (IMPORTANTE)
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById('home').classList.add('active');

    initHero(); 
    carregarHome();

    // HERO AUTO
    setInterval(() => {
        const itens = document.querySelectorAll('.hero-item');
        if (itens.length > 0) {
            itens[heroIndex].style.opacity = "0";
            itens[heroIndex].style.zIndex = "0";
            heroIndex = (heroIndex + 1) % itens.length;
            itens[heroIndex].style.opacity = "1";
            itens[heroIndex].style.zIndex = "1";
        }
    }, 5000);

    // 🔒 APLICA SEGURANÇA DEPOIS (SEM QUEBRAR)
    setTimeout(() => {
        _cm_guard();
    }, 300);

    // 🔒 VERIFICAÇÃO CONTÍNUA (SEGURA)
    setInterval(() => {
        if (!_cm_check()) {
            _cm_guard();
        }
    }, 8000);

});

// ====== 2. BUSCA ======
async function buscar() {
    const q = document.getElementById("inputBusca").value.trim();
    if(q.length < 3) return;
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    
    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div class="search-row" onclick="abrir(${f.id})" style="display:flex; gap:12px; padding:12px; border-bottom:1px solid #111; align-items:center;">
            <img src="https://image.tmdb.org/t/p/w200${f.poster_path}" onerror="this.src='https://via.placeholder.com/65x95/111/fff'" style="width:65px; height:95px; border-radius:6px;">
            <div>
                <h4>${f.title}</h4>
                <p>${f.overview || 'Sinopse em breve.'}</p>
            </div>
        </div>
    `).join('');
}

// ====== API ======
async function api(url) { try { const r = await fetch(url); return await r.json(); } catch(e) { return {results:[]}; } }

// ====== HOME ======
async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `<div class="card-top" onclick="abrir(${f.id})"><span class="numero-fix">${i + 1}</span><img src="https://image.tmdb.org/t/p/w400${f.poster_path}"></div>`).join('');
    
    const lan = await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML = lan.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// ====== DETALHES ======
async function abrir(id) {
    if (!_cm_check()) {
        _cm_guard();
        return;
    }

    ir('detalhes');

    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`);
    filmeAtual = m.title;

    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview || "Sincronizando...";

    document.getElementById('btn-play-main').onclick = () =>
        window.open(`${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`);
}

// ====== NAVEGAÇÃO ======
function ir(p) {
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
}

// ====== HERO ======
async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('hero-wrapper').innerHTML = d.results.slice(0, 6).map((m, i) => `
        <div class="hero-item" style="background-image:url(https://image.tmdb.org/t/p/original${m.backdrop_path});opacity:${i===0?1:0};z-index:${i===0?1:0}" onclick="abrir(${m.id})"></div>
    `).join('');
}
