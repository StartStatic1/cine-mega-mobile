// ====== SISTEMA VIP & TESTE GRÁTIS ======
const TEMPO_LIMITE_TESTE = 2 * 60 * 60 * 1000; 

async function validarChave() {
    const input = document.getElementById('inputChave').value.trim().toUpperCase();
    const btn = document.querySelector('#login button');
    const msg = document.getElementById('msgErro');
    if(!input) return;

    btn.innerText = "VERIFICANDO...";
    msg.style.display = 'none';

    try {
        // LINK CORRIGIDO PARA ACESSAR O SEU JSON NO GITHUB
        const response = await fetch('https://raw.githubusercontent.com/StartStatic1/meus-apks/main/chaves.json'); 
        
        if (!response.ok) throw new Error();

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
        // Se der erro de conexão, ele avisa aqui
        msg.innerText = "⚠️ Erro ao conectar ao servidor de chaves.";
        msg.style.display = 'block';
    }
}

// ====== CARREGAMENTO DA HOME (EM BREVE FILTRADO) ======
async function carregarHome() {
    const pop = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML = pop.results.slice(0, 10).map((f, i) => `<div class="card-top" onclick="abrir(${f.id})"><span class="numero-fix">${i + 1}</span><img src="https://image.tmdb.org/t/p/w400${f.poster_path}"></div>`).join('');
    
    const lan = await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML = lan.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    // Busca filmes futuros
    const hj = new Date().toISOString().split('T')[0];
    const emb = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&primary_release_date.gte=${hj}&sort_by=primary_release_date.asc`);
    // O clique na foto continua abrindo o abrir(), mas passamos o "true" para o bloqueio interno
    document.getElementById('embreve').innerHTML = emb.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id}, true)">`).join('');

    const cla = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=vote_count.desc&release_date.lte=1995-01-01`);
    document.getElementById('classicos').innerHTML = cla.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');

    const trash = await api(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=27,35&primary_release_date.gte=1980-01-01&primary_release_date.lte=1995-12-31`);
    document.getElementById('trash').innerHTML = trash.results.map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">`).join('');
}

// ====== ABRIR DETALHES (LÓGICA DE BLOQUEIO NOS BOTÕES) ======
async function abrir(id, isEmBreve = false) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    
    filmeAtual = m.title.replace(/&/g, "e").replace(/[:]/g, "").trim();

    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview || "Sinopse não disponível.";

    const btnPlay = document.getElementById('btn-play-main');
    const boxPlayers = document.getElementById('box-players-externos');
    const aviso = document.getElementById('aviso-embreve');

    if(isEmBreve) {
        // MOSTRA INFORMAÇÕES MAS BLOQUEIA O PLAYER
        btnPlay.style.background = "#333"; // Cor de desativado
        btnPlay.innerText = "BLOQUEADO";
        btnPlay.onclick = () => alert("Este filme ainda não foi lançado no Cine Mega.");
        
        boxPlayers.innerHTML = `
            <div style="width:50px; height:50px; border-radius:50%; background:#222; display:flex; align-items:center; justify-content:center; color:#555; font-weight:bold;">VLC</div>
            <div style="width:50px; height:50px; border-radius:50%; background:#222; display:flex; align-items:center; justify-content:center; color:#555; font-weight:bold;">MX</div>
        `;
        
        if(aviso) {
            aviso.style.display = "block";
            aviso.innerText = "🍿 FILME EM EXIBIÇÃO NOS CINEMAS. AGUARDE O LANÇAMENTO NO APP.";
        }
    } else {
        // LIBERADO NORMAL
        btnPlay.style.background = "var(--red)";
        btnPlay.innerText = "ASSISTIR AGORA";
        btnPlay.onclick = () => window.open('https://api-scraper-cinema.onrender.com/buscar?titulo='+encodeURIComponent(filmeAtual));
        
        if(aviso) aviso.style.display = "none";
        
        const motorUrl = `https://api-scraper-cinema.onrender.com/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
        boxPlayers.innerHTML = `
            <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=org.videolan.vlc;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#ff8800; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">VLC</a>
            <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#0052d4; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">MX</a>
        `;
    }

    // Carrega Trailer, Elenco e Recomendações normalmente
    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 75px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:55px; height:55px; border-radius:50%; object-fit:cover; border:2px solid var(--red);"><p style="font-size:8px; color:#999; margin-top:5px;">${c.name}</p></div>`).join('');
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})" style="margin-right:10px;">`).join('');
}
