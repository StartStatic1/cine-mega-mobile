const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";

// Carregar Home Completa
async function loadHome() {
    const d = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`).then(r => r.json());
    
    // Slider (Hero)
    const h = d.results[0];
    document.getElementById('hero').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${h.backdrop_path})`;
    document.getElementById('hero-titulo').innerText = h.title;
    document.getElementById('hero-sinopse').innerText = h.overview;

    // Top 10 Numerado
    document.getElementById("top10").innerHTML = d.results.slice(0, 10).map((f, i) => `
        <div class="card-top" onclick="abrir(${f.id})">
            <span class="numero">${i + 1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');
}

// Busca Corrigida (2 Colunas)
async function buscar() {
    const q = document.getElementById("busca").value;
    if(!q) return;
    document.getElementById('home').classList.remove('active');
    document.getElementById('buscaPage').classList.add('active');
    
    const d = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`).then(r => r.json());
    
    document.getElementById("resultados").innerHTML = d.results.map(f => `
        <div class="card-search" onclick="abrir(${f.id})">
            <img src="https://image.tmdb.org/t/p/w500${f.poster_path}">
            <p style="font-size:12px; margin-top:8px; font-weight:bold; text-align:center;">${f.title}</p>
        </div>
    `).join('');
}

function ir(aba) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(aba).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    // Aqui você pode adicionar lógica para marcar o ícone ativo
}

loadHome();
