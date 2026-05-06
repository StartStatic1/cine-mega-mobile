// ====== SISTEMA VIP & TESTE GRÁTIS ======
const TEMPO_LIMITE_TESTE = 2 * 60 * 60 * 1000; 

document.addEventListener("DOMContentLoaded", () => {
    const statusAcesso = localStorage.getItem('cine_mega_acesso');
    const inicioTeste = localStorage.getItem('cine_mega_teste_inicio');
    const btnTeste = document.getElementById('btnTeste');
    const msgSubtitulo = document.getElementById('msgSubtitulo');

    if(statusAcesso === 'LIBERADO') {
        liberarApp();
    } else if (inicioTeste) {
        const tempoPassado = Date.now() - parseInt(inicioTeste);
        if (tempoPassado < TEMPO_LIMITE_TESTE) {
            liberarApp();
        } else {
            btnTeste.style.display = 'none';
            msgSubtitulo.innerText = "Seu tempo de teste acabou. Adquira a chave VIP.";
            msgSubtitulo.style.color = "#ffcc00";
        }
    }
});

function iniciarTeste() {
    localStorage.setItem('cine_mega_teste_inicio', Date.now().toString());
    liberarApp();
}

async function validarChave() {
    const input = document.getElementById('inputChave').value.trim().toUpperCase();
    const btn = document.querySelector('#login button');
    const msg = document.getElementById('msgErro');
    if(!input) return;
    btn.innerText = "VERIFICANDO...";
    msg.style.display = 'none';
    try {
        const response = await fetch('./chaves.json'); 
        const chavesValidas = await response.json();
        if(chavesValidas.includes(input)) {
            localStorage.setItem('cine_mega_acesso', 'LIBERADO');
            liberarApp();
        } else {
            btn.innerText = "ENTRAR COM CHAVE";
            msg.innerText = "❌ Chave inválida!";
            msg.style.display = 'block';
        }
    } catch(e) {
        btn.innerText = "ENTRAR COM CHAVE";
        alert("Erro de conexão com servidor VIP.");
    }
}

function liberarApp() {
    // MARRETADA PARA A TELA SUMIR NO CELULAR
    document.getElementById('login').style.display = 'none';
    document.getElementById('login').classList.remove('active');
    document.getElementById('home').classList.add('active');
    initHero(); 
    carregarHome();
}

// ====== MOTOR DO APP (API & BUSCA) ======
const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";

async function api(url) { try { const r = await fetch(url); return await r.json(); } catch(e) { return null; } }

function ir(p, push = true) {
    if(push && p !== 'home') history.pushState({page: p}, '');
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    window.scrollTo(0,0);
}

// BUSCA EM LISTA (IGUAL AO SITE)
async function buscar() {
    const q = document.getElementById("inputBusca").value;
    if(q.length < 3) return;
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div onclick="abrir(${f.id})" style="display:flex; gap:15px; padding:10px; border-bottom:1px solid #111; align-items:center;">
            <img src="https://image.tmdb.org/t/p/w200${f.poster_path}" style="width:60px; height:90px; border-radius:5px; object-fit:cover;">
            <div style="overflow:hidden;">
                <h4 style="margin:0; color:#fff; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.title}</h4>
                <p style="margin:5px 0 0; color:#666; font-size:11px; display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical; overflow:hidden;">${f.overview || 'Sem sinopse.'}</p>
            </div>
        </div>
    `).join('');
}

async function abrir(id, isBreve = false) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    filmeAtual = m.title;

    // VACINA CONTRA ERRO DO & (Muda Bill & Ted para Bill e Ted)
    const tituloLimpo = m.title.replace(/&/g, "e").trim();

    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview;

    const btnPlay = document.getElementById('btn-play-main');
    const boxPlayers = document.getElementById('box-players-externos');
    
    // LINK ENVIANDO O TÍTULO LIMPO PARA O MOTOR
    const motorUrl = `${MOTOR}/buscar?titulo=${encodeURIComponent(tituloLimpo)}`;
    
    btnPlay.onclick = () => window.open(motorUrl);

    boxPlayers.innerHTML = `
        <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=org.videolan.vlc;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#ff8800; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">VLC</a>
        <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#0052d4; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">MX</a>
    `;

    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 70px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid #e50914;"><p style="font-size:8px; color:#999;">${c.name}</p></div>`).join('');
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})" style="width:100px; height:150px; border-radius:8px; margin-right:10px; object-fit:cover;">`).join('');
}

// Funções de carga inicial (Hero e Home)
async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('hero-wrapper').innerHTML = d.results.slice(0, 5).map(m => `
        <div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.backdrop_path})" onclick="abrir(${m.id})">
            <div class="hero-overlay"><h2>${m.title}</h2></div>
        </div>
    `).join('');
}

async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `<div class="card-top" onclick="abrir(${f.id})"><span class="numero-fix">${i + 1}</span><img src="https://image.tmdb.org/t/p/w400${f.poster_path}"></div>`).join('');
    
    const lan = await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML = lan.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

window.addEventListener('popstate', () => { if(document.querySelector('.page.active').id !== 'home') ir('home', false); });
