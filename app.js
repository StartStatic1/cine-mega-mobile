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
        // Link Raw direto para o arquivo na raiz do seu repositório
        const urlChaves = 'https://raw.githubusercontent.com/StartStatic1/meus-apks/main/chaves.json';
        
        // Adicionamos um timestamp no final para evitar que o navegador pegue uma versão antiga (cache)
        const response = await fetch(`${urlChaves}?t=${Date.now()}`); 
        
        if (!response.ok) throw new Error("Erro ao baixar arquivo");

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
        console.error(e);
        btn.innerText = "ENTRAR COM CHAVE";
        msg.innerText = "⚠️ Erro de conexão com o servidor de chaves.";
        msg.style.display = 'block';
    }
}

// ====== ABRIR DETALHES (LÓGICA DE BLOQUEIO NOS BOTÕES) ======
async function abrir(id, isEmBreve = false) {
    ir('detalhes');
    const m = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);
    
    // Vacina do & para o Sniper do Archive.org
    filmeAtual = m.title.replace(/&/g, "e").replace(/[:]/g, "").trim();

    document.getElementById('m-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
    document.getElementById('m-poster').src = `https://image.tmdb.org/t/p/w400${m.poster_path}`;
    document.getElementById('m-titulo').innerText = m.title;
    document.getElementById('m-sinopse').innerText = m.overview || "Sinopse não disponível.";

    const btnPlay = document.getElementById('btn-play-main');
    const boxPlayers = document.getElementById('box-players-externos');
    const aviso = document.getElementById('aviso-embreve');

    if(isEmBreve) {
        // BLOQUEIO DOS BOTÕES (Mantém as informações visíveis)
        btnPlay.style.background = "#222"; 
        btnPlay.style.color = "#555";
        btnPlay.innerText = "BLOQUEADO";
        btnPlay.onclick = null;
        
        boxPlayers.innerHTML = `
            <div style="width:50px; height:50px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; color:#444; font-weight:bold; border: 1px solid #333;">VLC</div>
            <div style="width:50px; height:50px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; color:#444; font-weight:bold; border: 1px solid #333;">MX</div>
        `;
        
        if(aviso) {
            aviso.style.display = "block";
            aviso.innerText = "🍿 FILME EM EXIBIÇÃO NOS CINEMAS. AGUARDE O LANÇAMENTO NO APP.";
        }
    } else {
        // LIBERADO PARA FILMES NORMAIS
        btnPlay.style.background = "var(--red)";
        btnPlay.style.color = "#fff";
        btnPlay.innerText = "ASSISTIR AGORA";
        btnPlay.onclick = () => window.open('https://api-scraper-cinema.onrender.com/buscar?titulo='+encodeURIComponent(filmeAtual));
        
        if(aviso) aviso.style.display = "none";
        
        const motorUrl = `https://api-scraper-cinema.onrender.com/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
        boxPlayers.innerHTML = `
            <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=org.videolan.vlc;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#ff8800; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">VLC</a>
            <a href="intent://${motorUrl.replace(/^https?:\/\//, '')}#Intent;action=android.intent.action.VIEW;scheme=http;type=video/*;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(m.title)};end" style="text-decoration:none; width:50px; height:50px; border-radius:50%; background:#0052d4; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">MX</a>
        `;
    }

    // Trailer, Elenco e Recomendações carregam sempre
    const tr = m.videos.results.find(v => v.type === "Trailer");
    document.getElementById('m-trailer').innerHTML = tr ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${tr.key}" frameborder="0" allowfullscreen></iframe>` : '';
    document.getElementById('m-elenco').innerHTML = m.credits.cast.slice(0, 8).map(c => `<div style="flex:0 0 75px; text-align:center;"><img src="https://image.tmdb.org/t/p/w200${c.profile_path}" style="width:55px; height:55px; border-radius:50%; object-fit:cover; border:2px solid var(--red);"><p style="font-size:8px; color:#999; margin-top:5px;">${c.name}</p></div>`).join('');
    document.getElementById('m-rec').innerHTML = m.recommendations.results.slice(0, 10).map(f => `<img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})" style="margin-right:10px;">`).join('');
}
