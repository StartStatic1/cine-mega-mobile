// CONFIGURAÇÕES GERAIS
const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
const URL_CHAVES = "https://raw.githubusercontent.com/StartStatic1/meus-apks/main/chaves.json";
const TEMPO_LIMITE_TESTE = 2 * 60 * 60 * 1000; 
let filmeAtual = "";

// ====== SISTEMA DE ACESSO (VIP & TESTE) ======
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
            if(btnTeste) btnTeste.style.display = 'none';
            msgSubtitulo.innerText = "Seu tempo de teste acabou. Adquira a chave VIP.";
            msgSubtitulo.style.color = "#ffcc00";
        }
    }
});

async function validarChave() {
    const input = document.getElementById('inputChave').value.trim().toUpperCase();
    const btn = document.querySelector('#login button');
    const msg = document.getElementById('msgErro');
    if(!input) return;

    btn.innerText = "VERIFICANDO...";
    msg.style.display = 'none';

    try {
        // O ?t= força o GitHub a ignorar o cache e ler as chaves novas
        const response = await fetch(`${URL_CHAVES}?t=${Date.now()}`);
        const chavesValidas = await response.json();
        
        if(Array.isArray(chavesValidas) && chavesValidas.includes(input)) {
            localStorage.setItem('cine_mega_acesso', 'LIBERADO');
            liberarApp();
        } else {
            btn.innerText = "ENTRAR COM CHAVE";
            msg.innerText = "❌ Chave inválida!";
            msg.style.display = 'block';
        }
    } catch(e) {
        btn.innerText = "ENTRAR COM CHAVE";
        msg.innerText = "⚠️ Erro ao conectar com servidor de chaves.";
        msg.style.display = 'block';
    }
}

function iniciarTeste() {
    localStorage.setItem('cine_mega_teste_inicio', Date.now().toString());
    liberarApp();
}

function liberarApp() {
    const loginTela = document.getElementById('login');
    if(loginTela) loginTela.style.display = 'none';
    document.getElementById('home').classList.add('active');
    initHero(); 
    carregarHome();
}

// ====== MOTOR DE DADOS (TMDB) ======
async function api(url) { try { const r = await fetch(url); return await r.json(); } catch(e) { return null; } }

async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `<div class="card-top" onclick="abrir(${f.id})"><span class="numero-fix">${i + 1}</span><img src="https://image.tmdb.org/t/p/w400${f.poster_path}"></div>`).join('');
    
    const lan = await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML = lan.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const hj = new Date().toISOString().split('T')[0];
    const emb = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=${hj}&sort_by=primary_release_date.asc`);
    document.getElementById('embreve').innerHTML = emb.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id}, true)">`).join('');

    const cla = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=vote_count.desc&release_date.lte=1995-01-01`);
    document.getElementById('classicos').innerHTML = cla.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// ====== PÁGINA DE DETALHES & SNIPER ARCHIVE.ORG ======
async function abrir(id, isEmBreve = false) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    
    // VACINA DO & (Integração Archive.org)
    filmeAtual = m.title.replace(/&/g, "e").replace(/[:]/g, "").trim();

    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview || "Sinopse não disponível.";

    const btnPlay = document.getElementById('btn-play-main');
    const boxPlayers = document.getElementById('box-players-externos');
    const aviso = document.getElementById('aviso-embreve');

    if(isEmBreve) {
        // TRAVA APENAS OS BOTÕES DE PLAY
        btnPlay.style.background = "#222"; btnPlay.style.color = "#555";
        btnPlay.innerText = "INDISPONÍVEL"; btnPlay.onclick = null;
        boxPlayers.innerHTML = `<div style="width:50px; height:50px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; color:#444; font-weight:bold; border: 1px solid #333;">VLC</div><div style="width:50px; height:50px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; color:#444; font-weight:bold; border: 1px solid #333;">MX</div>`;
        if(aviso) { aviso.style.display = "block"; aviso.innerText = "🍿 FILME EM EXIBIÇÃO NOS CINEMAS. AGUARDE O LANÇAMENTO NO APP."; }
    } else {
        // LIBERA TUDO
        btnPlay.style.background = "var(--red)"; btnPlay.style.color = "#fff";
        btnPlay.innerText = "ASSISTIR AGORA";
        btnPlay.onclick = () => window.open(`${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`);
        if(aviso) aviso.style.display = "none";
        const motorUrl = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
        boxPlayers.innerHTML = `
            <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=org.videolan.vlc;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#ff8800; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">VLC</a>
            <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#0052d4; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">MX</a>
        `;
    }

    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 75px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:55px; height:55px; border-radius:50%; object-fit:cover; border:2px solid var(--red);"><p style="font-size:8px; color:#999; margin-top:5px;">${c.name}</p></div>`).join('');
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})" style="margin-right:10px;">`).join('');
}

// ====== NAVEGAÇÃO & BUSCA ======
function ir(p, push = true) {
    if(push && p !== 'home') history.pushState({page: p}, '');
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    window.scrollTo(0,0);
}

async function buscar() {
    const q = document.getElementById("inputBusca").value;
    if(q.length < 3) return;
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    document.getElementById("resultados").innerHTML = d.results.map(f => `<div class="search-row" onclick="abrir(${f.id})"><img src="https://image.tmdb.org/t/p/w200${f.poster_path}" onerror="this.src='https://via.placeholder.com/65x95/111/fff'"><div class="search-info"><h4>${f.title}</h4><p>${f.overview || 'Sem sinopse.'}</p></div></div>`).join('');
}

async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('hero-wrapper').innerHTML = d.results.slice(0, 5).map(m => `<div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.backdrop_path})" onclick="abrir(${m.id})"><div class="hero-overlay"><h2>${m.title}</h2><p>${m.overview}</p></div></div>`).join('');
}

window.addEventListener('popstate', () => { if(document.querySelector('.page.active').id !== 'home') ir('home', false); });
