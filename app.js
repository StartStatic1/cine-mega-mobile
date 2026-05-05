const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";

let filmeAtual = "";

// NAV
function ir(p){
  document.querySelectorAll('.page').forEach(e=>e.classList.remove('active'));
  document.getElementById(p).classList.add('active');
}

// API
async function api(url){
  const r = await fetch(url);
  return await r.json();
}

// HERO
async function hero(){
  const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
  let i=0;
  setInterval(()=>{
    document.getElementById("hero").style.backgroundImage =
    `url(https://image.tmdb.org/t/p/original${d.results[i].backdrop_path})`;
    i=(i+1)%5;
  },3000);
}

// TOP10
async function top10(){
  const d = await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);

  document.getElementById("top10").innerHTML =
  d.results.slice(0,10).map((f,i)=>`
    <div class="card" onclick="abrir(${f.id})">
      <span class="numero">${i+1}</span>
      <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
    </div>
  `).join('');
}

// ABRIR DETALHES
async function abrir(id){
  ir("detalhes");

  const d = await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=recommendations`);

  filmeAtual = d.title;

  document.getElementById("titulo").innerText = d.title;
  document.getElementById("sinopse").innerText = d.overview;
  document.getElementById("poster").src = `https://image.tmdb.org/t/p/w300${d.poster_path}`;
  document.getElementById("backdrop").style.backgroundImage =
    `url(https://image.tmdb.org/t/p/original${d.backdrop_path})`;

  document.getElementById("recomendados").innerHTML =
    d.recommendations.results.slice(0,10).map(f=>`
      <div class="card" onclick="abrir(${f.id})">
        <img src="https://image.tmdb.org/t/p/w200${f.poster_path}">
      </div>
    `).join('');
}

// PLAY
function play(){
  const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
  window.open(link,"_blank");
}

// VLC
function abrirVLC(){
  const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
  location.href = `intent://${link.replace("https://","")}#Intent;package=org.videolan.vlc;end`;
}

// MX
function abrirMX(){
  const link = `${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`;
  location.href = `intent://${link.replace("https://","")}#Intent;package=com.mxtech.videoplayer.ad;end`;
}

// BUSCA
async function buscar(){
  ir("buscaPage");

  const q = document.getElementById("busca").value;

  const d = await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}`);

  document.getElementById("resultados").innerHTML =
    d.results.map(f=>`
      <div class="card" onclick="abrir(${f.id})">
        <img src="https://image.tmdb.org/t/p/w300${f.poster_path}">
      </div>
    `).join('');
}

// INIT
hero();
top10();
