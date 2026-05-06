const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";
let timerHero;

// 🔥 A TRAVA SNIPER PARA O BOTÃO VOLTAR
window.addEventListener('popstate', (e) => {
    const activePage = document.querySelector('.page.active').id;
    if (activePage !== 'home') {
        // Se não estiver na home, volta para ela sem fechar o navegador
        ir('home', false); 
    }
});

async function api(url) { try { const r = await fetch(url); return await r.json(); } catch(e) { return null; } }

function ir(p, push = true) {
    // Se push for true, cria um histórico. Se for false (vindo do botão voltar), não duplica.
    if(push && p !== 'home') history.pushState({page: p}, '');
    
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    window.scrollTo(0,0);
}

async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    const wrapper = document.getElementById('hero-wrapper');
    wrapper.innerHTML = d.results.slice(0, 7).map((m, i) => `
        <div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.poster_path})" onclick="abrir(${m.id})">
            <div class="hero-overlay">
                <div class="hero-brand" style="color:#e50914; font-weight:900;">CINE MEGA</div>
                <h2 style="color:#fff;">${m.title}</h2>
                <div style="font-size:11px; color:#ffcc00; margin:5px 0;">⭐ ${m.vote_average.toFixed(1)}</div>
                <p style="color:#bbb; font-size:11px;">${m.overview}</p>
            </div>
        </div>
    `).join('');
    
    // Slider Automático (5s)
    timerHero = setInterval(() => {
        let next = wrapper.scrollLeft + wrapper.offsetWidth;
        if (next >= wrapper.scrollWidth) next = 0;
        wrapper.scrollTo({ left: next, behavior: 'smooth' });
    }, 5000);
}

async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    // TOP 10 COM NÚMEROS ELEGANTES
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero-fix">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');

    // EM BREVE (2026+)
    const breve = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=2026-06-01&sort_by=popularity.desc`);
    document.getElementById('embreve').innerHTML = breve.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id}, true)">`).join('');

    // TRASH & CLÁSSICOS
    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

async function realizarBusca() {
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

    const aviso = document.getElementById('aviso-estreia');
    const btnPlay = document.getElementById('btn-main-play');
    if(isBreve) { 
        aviso.style.display = 'block'; 
        btnPlay.style.background = '#333'; 
        btnPlay.style.pointerEvents = 'none';
        btnPlay.innerText = "NÃO DISPONÍVEL NO MOMENTO"; 
    } else { 
        aviso.style.display = 'none'; 
        btnPlay.style.background = '#e50914'; 
        btnPlay.style.pointerEvents = 'auto';
        btnPlay.innerText = "ASSISTIR AGORA"; 
    }

    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 80px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid #e50914;"><p style="font-size:9px; margin-top:5px; color:#999;">${c.name}</p></div>`).join('');
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

function abrirVLC() {
    const u = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.location.href = `intent://${u.replace(/^https?:\/\//, '')}#Intent;scheme=http;package=org.videolan.vlc;end`;
}

function abrirMX() {
    const u = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
    window.location.href = `intent://${u.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;end`;
}

initHero(); carregarHome();
