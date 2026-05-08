// === CONFIGURAÇÕES TÉCNICAS ======
const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR_APP = "https://api-scraper-cinema.onrender.com";
const isAndroidApp = /android/i.test(navigator.userAgent || navigator.vendor || window.opera);

let filmeAtual = "";
let filmeIdAtual = ""; // Necessário para o Player Interno
let heroIndex = 0;
let timerBuscaApp; // Para o Debounce

// ====== 1. INICIALIZAÇÃO E AUTO-HERO (FADE + INFO NO RODAPÉ) ======
document.addEventListener("DOMContentLoaded", () => {
    // Garante que os estilos do SPA (Single Page Application) comecem corretos
    document.getElementById('home').style.display = 'block';
    
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

// ====== 2. BUSCA EM LISTA COM DEBOUNCE ======
function aoDigitarBuscaApp() {
    clearTimeout(timerBuscaApp);
    timerBuscaApp = setTimeout(buscar, 600); // Aguarda 600ms antes de chamar a API
}

async function buscar() {
    const q = document.getElementById("inputBusca").value.trim();
    if(q.length < 3) return;
    
    document.getElementById("resultados").innerHTML = '<p style="text-align:center; padding:20px; color:#e50914;">Buscando...</p>';
    
    const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);
    
    if(d.results.length === 0) {
        document.getElementById("resultados").innerHTML = '<p style="text-align:center; padding:20px; color:#aaa;">Nenhum filme encontrado.</p>';
        return;
    }

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
    filmeIdAtual = id; // Guarda o ID globalmente para o player
    
    // RESET: Esconde player e botões extras antes de carregar o novo filme
    document.getElementById('iframe-player').src = '';
    document.getElementById('secao-player-interno').style.display = 'none';
    document.getElementById('btn-play-externo').style.display = 'none';
    document.getElementById('box-players-externos').style.display = 'none';

    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    filmeAtual = m.title.replace(/&/g, "e").replace(/[:]/g, "").replace(/[()]/g, "").trim();

    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview || "Sincronizando com o acervo...";

    const btnInterno = document.getElementById('btn-play-interno');
    const aviso = document.getElementById('aviso-embreve');

    if(isEmBreve) {
        btnInterno.style.display = "none";
        if(aviso) aviso.style.display = "block";
    } else {
        btnInterno.style.display = "flex";
        if(aviso) aviso.style.display = "none";
    }

    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '<p style="text-align:center; padding:20px; color:#555;">Trailer indisponível</p>';
    
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 75px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" onerror="this.src='https://via.placeholder.com/55?text=Ator'" style="width:55px; height:55px; border-radius:50%; object-fit:cover; border:2px solid #e50914;"><p style="font-size:9px; color:#999; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.name}</p></div>`).join('');
    
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onerror="this.src='https://via.placeholder.com/115x170?text=Cine'" onclick="abrir(${f.id})" style="margin-right:10px;">`).join('');
}

// ====== 5. NOVO SISTEMA DO PLAYER ======
function carregarPlayerInternoApp() {
    // Troca o botão principal pelo Iframe
    document.getElementById('btn-play-interno').style.display = 'none';
    document.getElementById('secao-player-interno').style.display = 'block';
    
    // Injeta a URL do MyEmbed
    document.getElementById('iframe-player').src = `https://myembed.biz/filme/${filmeIdAtual}`;
    
    // Revela os botões do Render e Nativos
    document.getElementById('btn-play-externo').style.display = 'block';
    
    // Mostra VLC/MX apenas se estiver no Android
    if(isAndroidApp) {
        document.getElementById('box-players-externos').style.display = 'flex';
    }

    // Configura os links com os dados recém-carregados
    let linkRender = `${MOTOR_APP}/buscar?id=${filmeIdAtual}&titulo=${encodeURIComponent(filmeAtual)}`;
    document.getElementById('btn-play-externo').href = linkRender;
    
    let linkVLC = `intent://${linkRender.replace(/https?:\/\//,'')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/mp4;package=org.videolan.vlc;end`;
    let linkMX = `intent://${linkRender.replace(/https?:\/\//,'')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/mp4;package=com.mxtech.videoplayer.ad;end`;
    
    document.getElementById('btn-vlc-app').href = linkVLC;
    document.getElementById('btn-mx-app').href = linkMX;
}

function fecharDetalhesApp() {
    // Ao clicar na setinha de voltar, essa função limpa o iframe e volta pra home
    document.getElementById('iframe-player').src = '';
    document.getElementById('secao-player-interno').style.display = 'none';
    document.getElementById('btn-play-interno').style.display = 'flex';
    document.getElementById('btn-play-externo').style.display = 'none';
    document.getElementById('box-players-externos').style.display = 'none';
    ir('home'); 
}

// ====== 6. NAVEGAÇÃO E CORES ======
function ir(p, push = true) {
    if(push) history.pushState({page: p}, '');
    
    // Oculta todas as páginas (display none) e mostra só a correta
    document.querySelectorAll('.page').forEach(e => e.style.display = 'none');
    document.getElementById(p).style.display = 'block';
    window.scrollTo(0,0);

    // Gerencia a cor dos ícones na barra de baixo
    if(document.getElementById('icon-home')) {
        document.getElementById('icon-home').style.color = p === 'home' ? '#e50914' : '#555';
    }
    if(document.getElementById('icon-busca')) {
        document.getElementById('icon-busca').style.color = p === 'buscaPage' ? '#e50914' : '#555';
    }
}

window.addEventListener('popstate', (e) => {
    const p = (e.state && e.state.page) ? e.state.page : 'home';
    // Se estiver voltando da tela de detalhes pelo botão nativo do celular, limpa o vídeo
    if (document.getElementById('detalhes').style.display === 'block' && p !== 'detalhes') {
        document.getElementById('iframe-player').src = '';
    }
    ir(p, false);
});

// ====== 7. HERO REVISADO (INFO NO RODAPÉ + DEGRADÊ) ======
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
                    <i class="fa fa-star"></i> ${(m.vote_average || 0).toFixed(1)} | ${m.release_date ? m.release_date.split('-')[0] : 'N/A'}
                </div>

                <p style="font-size:11px; color:#ccc; max-width:85%; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; 
                   overflow:hidden; line-height:1.4; margin:0; text-shadow: 1px 1px 3px #000;">
                   ${m.overview || 'Sinopse não disponível.'}
                </p>
            </div>
        </div>
    `).join('');
}
