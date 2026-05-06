// ====== SISTEMA VIP & TESTE GRÁTIS ======
const TEMPO_LIMITE_TESTE = 2 * 60 * 60 * 1000; // 2 horas em milissegundos

document.addEventListener("DOMContentLoaded", () => {
    const statusAcesso = localStorage.getItem('cine_mega_acesso');
    const inicioTeste = localStorage.getItem('cine_mega_teste_inicio');
    const btnTeste = document.getElementById('btnTeste');
    const msgSubtitulo = document.getElementById('msgSubtitulo');

    if(statusAcesso === 'LIBERADO') {
        // VIP AUTORIZADO - Pode entrar direto
        liberarApp();
    } else if (inicioTeste) {
        // ESTÁ EM FASE DE TESTE - Vamos calcular se já acabou
        const tempoPassado = Date.now() - parseInt(inicioTeste);
        
        if (tempoPassado < TEMPO_LIMITE_TESTE) {
            // Ainda tem tempo! Libera o app.
            liberarApp();
        } else {
            // Tempo esgotado! Trava na tela de login e tira o botão de teste
            btnTeste.style.display = 'none';
            msgSubtitulo.innerText = "Seu tempo de teste acabou. Adquira a chave VIP.";
            msgSubtitulo.style.color = "#ffcc00";
        }
    }
});

function iniciarTeste() {
    // Marca a hora exata que clicou e libera
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
            // CHAVE CORRETA! Salva o acesso e entra
            localStorage.setItem('cine_mega_acesso', 'LIBERADO');
            liberarApp();
        } else {
            btn.innerText = "ENTRAR COM CHAVE";
            msg.innerText = "❌ Chave inválida ou bloqueada!";
            msg.style.display = 'block';
        }
    } catch(e) {
        btn.innerText = "ENTRAR COM CHAVE";
        alert("Erro de conexão com o servidor VIP.");
    }
}

// Função para ligar o motor do app só quando autorizado
function liberarApp() {
    document.getElementById('login').classList.remove('active');
    document.getElementById('home').classList.add('active');
    initHero(); 
    carregarHome();
}
// ==========================================


// ====== MOTOR DO CINE MEGA (Filmes e API) ======
const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";

document.addEventListener('contextmenu', event => event.preventDefault());

window.addEventListener('popstate', () => { if(document.querySelector('.page.active').id !== 'home') ir('home', false); });

async function api(url) { try { const r = await fetch(url); return await r.json(); } catch(e) { return null; } }

function ir(p, push = true) {
    if(push && p !== 'home') history.pushState({page: p}, '');
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    window.scrollTo(0,0);
}

async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    const wrapper = document.getElementById('hero-wrapper');
    wrapper.innerHTML = d.results.slice(0, 8).map(m => `
        <div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.poster_path})" onclick="abrir(${m.id})">
            <div class="hero-overlay">
                <h2>${m.title}</h2>
                <div style="font-size:10px; color:#ffcc00; margin:4px 0; font-weight:bold;">⭐ ${m.vote_average.toFixed(1)}</div>
                <p>${m.overview}</p>
            </div>
        </div>
    `).join('');
    
    setInterval(() => {
        let next = wrapper.scrollLeft + wrapper.offsetWidth;
        if (next >= wrapper.scrollWidth) next = 0;
        wrapper.scrollTo({ left: next, behavior: 'smooth' });
    }, 5000);
}

async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero-fix">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');

    const lan = await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML = lan.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const breve = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=2026-06-01&sort_by=popularity.desc`);
    document.getElementById('embreve').innerHTML = breve.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id}, true)">`).join('');

    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
    
    const cla = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&release_date.lte=1995-01-01&sort_by=vote_count.desc`);
    document.getElementById('classicos').innerHTML = cla.results.slice(0, 15).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

async function buscar() {
    const q = document.getElementById("inputBusca").value;
    if(!q) return;
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div class="search-row" onclick="abrir(${f.id})">
            <img src="https://image.tmdb.org/t/p/w200${f.poster_path}"><div class="search-info"><h4>${f.title}</h4><p>${f.overview || 'Sem sinopse.'}</p></div>
        </div>
    `).join('');
}

async function abrir(id, isBreve = false) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    filmeAtual = m.title;
    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview;

    const aviso = document.getElementById('aviso-embreve');
    const btnPlay = document.getElementById('btn-play-main');
    const boxPlayers = document.getElementById('box-players-externos');

    const urlVOD = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    const intentVLC = `intent://${urlVOD.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=org.videolan.vlc;S.title=${encodeURIComponent(filmeAtual)};end`;
    const intentMX = `intent://${urlVOD.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(filmeAtual)};end`;

    if(isBreve) { 
        aviso.style.display = 'block'; 
        btnPlay.style.background = '#222'; 
        btnPlay.innerText = "NÃO DISPONÍVEL"; 
        btnPlay.style.pointerEvents = 'none'; 
        boxPlayers.style.display = 'none'; 
    } else { 
        aviso.style.display = 'none'; 
        btnPlay.style.background = '#e50914'; 
        btnPlay.innerText = "ASSISTIR AGORA"; 
        btnPlay.style.pointerEvents = 'auto'; 
        
        boxPlayers.style.display = 'flex';
        boxPlayers.innerHTML = `
            <a href="${intentVLC}" target="_blank" style="text-decoration:none; width:55px; height:55px; border-radius:50%; background:#ff8800; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:14px;">VLC</a>
            <a href="${intentMX}" target="_blank" style="text-decoration:none; width:55px; height:55px; border-radius:50%; background:#0052d4; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:14px;">MX</a>
        `;
    }

    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 80px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid #e50914;"><p style="font-size:9px; margin-top:5px; color:#999;">${c.name}</p></div>`).join('');
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}
