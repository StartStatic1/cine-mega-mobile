// === CONFIGURAÇÕES TÉCNICAS ======
const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";
let heroIndex = 0;

// ====== 1. INICIALIZAÇÃO E AUTO-HERO (FADE + INFO NO RODAPÉ) ======
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById('home').classList.add('active');
    initHero(); 
    carregarHome();

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
});

// ====== 2. BUSCA EM LISTA (FOTO + SINOPSE) ======
async function buscar() {
    const q = document.getElementById("inputBusca").value.trim();
    if(q.length < 3) return;
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    
    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div class="search-row" onclick="abrir(${f.id})" style="display:flex; gap:12px; padding:12px; border-bottom:1px solid #111; align-items:center;">
            <img src="https://image.tmdb.org/t/p/w200${f.poster_path}" onerror="this.src='https://via.placeholder.com/65x95/111/fff'" style="width:65px; height:95px; border-radius:6px; object-fit:cover; flex-shrink:0;">
            <div class="search-info" style="overflow:hidden;">
                <h4 style="margin:0; font-size:14px; color:#fff;">${f.title}</h4>
                <p style="margin:5px 0 0; font-size:10px; color:#777; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${f.overview || 'Sinopse em breve.'}</p>
            </div>
        </div>
    `).join('');
}

// ====== 3. CARREGAR HOME ======
async function api(url) { try { const r = await fetch(url); return await r.json(); } catch(e) { return {results:[]}; } }

async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `<div class="card-top" onclick="abrir(${f.id})"><span class="numero-fix">${i + 1}</span><img src="https://image.tmdb.org/t/p/w400${f.poster_path}"></div>`).join('');
    
    const lan = await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML = lan.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const hoje = new Date().toISOString().split('T')[0];
    const emb = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=${hoje}&sort_by=popularity.desc`);
    document.getElementById('embreve').innerHTML = emb.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id}, true)">`).join('');

    const cla = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=vote_count.desc&release_date.lte=1995-01-01`);
    document.getElementById('classicos').innerHTML = cla.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// ====== 4. DETALHES (SNIPER) ======
async function abrir(id, isEmBreve = false) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    filmeAtual = m.title.replace(/&/g, "e").replace(/[:]/g, "").replace(/[()]/g, "").trim();

    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview || "Sincronizando com o acervo...";

    const btnPlay = document.getElementById('btn-play-main');
    const boxPlayers = document.getElementById('box-players-externos');
    const aviso = document.getElementById('aviso-embreve');

    if(isEmBreve) {
        btnPlay.style.background = "#222"; btnPlay.style.color = "#555";
        btnPlay.innerText = "ASSISTIR EM BREVE"; btnPlay.onclick = null;
        boxPlayers.style.display = "none";
        if(aviso) { aviso.style.display = "block"; aviso.innerText = "🍿 EM BREVE NO CINE MEGA."; }
    } else {
        btnPlay.style.background = "var(--red)"; btnPlay.style.color = "#fff";
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

    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 75px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:55px; height:55px; border-radius:50%; object-fit:cover; border:2px solid var(--red);"><p style="font-size:8px; color:#999; margin-top:5px;">${c.name}</p></div>`).join('');
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})" style="margin-right:10px;">`).join('');
}

// ====== 5. NAVEGAÇÃO ======
function ir(p, push = true) {
    if(push) history.pushState({page: p}, '');
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    window.scrollTo(0,0);
}

window.addEventListener('popstate', (e) => {
    const p = (e.state && e.state.page) ? e.state.page : 'home';
    ir(p, false);
});

// ====== 6. HERO REVISADO (INFO NO RODAPÉ + DEGRADÊ) ======
async function initHero() {
    const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('hero-wrapper').innerHTML = d.results.slice(0, 6).map((m, i) => `
        <div class="hero-item" style="background-image: url(https://image.tmdb.org/t/p/original${m.backdrop_path}); 
             opacity: ${i === 0 ? '1' : '0'}; 
             transition: opacity 1.5s ease-in-out; 
             position: absolute; top:0; left:0; width:100%; height:100%; 
             background-size: cover; background-position: center;
             z-index: ${i === 0 ? '1' : '0'};" onclick="abrir(${m.id})">
            
            <div class="hero-overlay" style="display:flex; flex-direction:column; align-items:center; justify-content:flex-end; 
                 text-align:center; padding: 0 20px 25px; 
                 background: linear-gradient(to top, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0) 60%); 
                 height: 100%;">
                
                <h2 style="margin:0 0 5px; font-size:22px; color:#fff; font-weight: bold; text-shadow: 2px 2px 5px #000;">${m.title}</h2>
                
                <div style="font-size:11px; color:#ffcc00; font-weight:bold; margin-bottom:6px; text-shadow: 1px 1px 3px #000;">
                    <i class="fa fa-star"></i> ${m.vote_average.toFixed(1)} | ${m.release_date.split('-')[0]}
                </div>

                <p style="font-size:11px; color:#ccc; max-width:85%; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; 
                   overflow:hidden; line-height:1.4; margin:0; text-shadow: 1px 1px 3px #000;">
                   ${m.overview}
                </p>
            </div>
        </div>
    `).join('');
}
