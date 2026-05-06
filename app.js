// ====== CONFIGURAÇÕES ======
const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";

// ====== SISTEMA DE ACESSO LOCAL (ENQUANTO NÃO CRIA O BANCO) ======
// Mestre, deixei essa função simples para você testar aí enquanto o chaves.json não sobe
async function validarChave() {
    const input = document.getElementById('inputChave').value.trim();
    if(input === "0981" || input === "0982") { // Exemplo manual
        localStorage.setItem('cine_mega_acesso', 'LIBERADO');
        liberarApp();
    } else {
        document.getElementById('msgErro').style.display = 'block';
    }
}

function iniciarTeste() {
    localStorage.setItem('cine_mega_teste_inicio', Date.now().toString());
    liberarApp();
}

function liberarApp() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('home').classList.add('active');
    initHero(); 
    carregarHome();
}

// ====== CARREGAR HOME (CORRIGINDO A ABA EM BREVE) ======
async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `<div class="card-top" onclick="abrir(${f.id})"><span class="numero-fix">${i + 1}</span><img src="https://image.tmdb.org/t/p/w400${f.poster_path}"></div>`).join('');
    
    const lan = await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML = lan.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    // CORREÇÃO AQUI: Garante que a div 'embreve' receba os cards
    const emb = await api(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=pt-BR`);
    const divEmBreve = document.getElementById('embreve');
    if(divEmBreve) {
        divEmBreve.innerHTML = emb.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id}, true)">`).join('');
    }

    const cla = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=vote_count.desc&release_date.lte=1995-01-01`);
    document.getElementById('classicos').innerHTML = cla.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// ====== DETALHES (TRAVANDO O BOTÃO BRANCO/CINZA) ======
async function abrir(id, isEmBreve = false) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    
    filmeAtual = m.title.replace(/&/g, "e").replace(/[:]/g, "").trim();

    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview || "Informações em breve.";

    const btnPlay = document.getElementById('btn-play-main');
    const boxPlayers = document.getElementById('box-players-externos');
    const aviso = document.getElementById('aviso-embreve');

    if(isEmBreve) {
        // VISUAL TRAVADO PARA "EM BREVE"
        btnPlay.style.background = "#222"; 
        btnPlay.style.color = "#555";
        btnPlay.innerText = "NÃO DISPONÍVEL";
        btnPlay.onclick = null; // Desativa o clique
        
        boxPlayers.style.display = "none"; // Esconde os botões VLC/MX
        if(aviso) aviso.style.display = "block"; 
    } else {
        // VISUAL NORMAL
        btnPlay.style.background = "var(--red)";
        btnPlay.style.color = "#fff";
        btnPlay.innerText = "ASSISTIR AGORA";
        btnPlay.onclick = () => window.open(`${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`);
        
        boxPlayers.style.display = "flex";
        if(aviso) aviso.style.display = "none";
        
        const motorUrl = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
        boxPlayers.innerHTML = `
            <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=org.videolan.vlc;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#ff8800; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">VLC</a>
            <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#0052d4; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">MX</a>
        `;
    }
    
    // Carrega o resto (elenco, recomendações) normalmente
    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 75px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:55px; height:55px; border-radius:50%; object-fit:cover; border:2px solid var(--red);"><p style="font-size:8px; color:#999; margin-top:5px;">${c.name}</p></div>`).join('');
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})" style="margin-right:10px;">`).join('');
}

// Auxiliares
function ir(p) {
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    window.scrollTo(0,0);
}
async function api(url) { try { const r = await fetch(url); return await r.json(); } catch(e) { return {results:[]}; } }
