// ====== CONFIGURAÇÕES ======
const API_KEY = "ada88566665b60b44b5c2b800056aa33";
const MOTOR = "https://api-scraper-cinema.onrender.com";
let filmeAtual = "";
let heroIndex = 0;

// ====== 🔒 SEGURANÇA HARD ======
function _cm_dev(){
    const d=[navigator.userAgent,screen.width,screen.height,new Date().getTimezoneOffset()].join("|");
    let h=0;for(let i=0;i<d.length;i++){h=((h<<5)-h)+d.charCodeAt(i);h|=0;}
    return "CM-"+Math.abs(h);
}

function _cm_save(e){
    const p={e:e,d:_cm_dev()};
    localStorage.setItem("cm_access",btoa(JSON.stringify(p)));
}

function _cm_get(){
    try{
        const raw=localStorage.getItem("cm_access");
        if(!raw)return false;
        const d=JSON.parse(atob(raw));
        if(d.d!==_cm_dev())return false;
        if(Date.now()>d.e)return false;
        return true;
    }catch{return false;}
}

function _cm_block(){
    const l=document.getElementById("login");
    if(l)l.style.display="flex";
}

function _cm_unlock(){
    const l=document.getElementById("login");
    if(l)l.style.display="none";
}

function _cm_guard(){
    if(!_cm_get()){_cm_block();return false;}
    _cm_unlock();
    return true;
}

function _cm_login(){
    const chave=document.getElementById("inputChave").value.trim().toUpperCase();
    if(typeof CHAVES_VALIDAS!=="undefined" && CHAVES_VALIDAS.includes(chave)){
        _cm_save(Date.now()+30*24*60*60*1000);
        _cm_unlock();
    }else{
        document.getElementById("msgErro").style.display="block";
    }
}

function _cm_test(){
    if(localStorage.getItem("cm_test")){
        alert("Teste já utilizado!");
        return;
    }
    _cm_save(Date.now()+60*60*1000);
    localStorage.setItem("cm_test","1");
    _cm_unlock();
}

// trava funções sensíveis
function _cm_lockAction(){
    if(!_cm_guard()) return true;
    return false;
}

// ====== INICIALIZAÇÃO ======
document.addEventListener("DOMContentLoaded", () => {

    // inicia app NORMAL
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById('home').classList.add('active');

    initHero();
    carregarHome();

    // hero auto
    setInterval(() => {
        const itens=document.querySelectorAll('.hero-item');
        if(itens.length){
            itens[heroIndex].style.opacity="0";
            itens[heroIndex].style.zIndex="0";
            heroIndex=(heroIndex+1)%itens.length;
            itens[heroIndex].style.opacity="1";
            itens[heroIndex].style.zIndex="1";
        }
    },5000);

    // aplica segurança depois
    setTimeout(_cm_guard,400);

    // verificação contínua leve
    setInterval(()=>{
        if(!_cm_get()) _cm_block();
    },10000);
});

// ====== API ======
async function api(url){
    try{const r=await fetch(url);return await r.json();}
    catch{return {results:[]};}
}

// ====== BUSCA ======
async function buscar(){
    if(_cm_lockAction()) return;

    const q=document.getElementById("inputBusca").value.trim();
    if(q.length<3) return;

    const d=await api(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=pt-BR`);

    document.getElementById("resultados").innerHTML=d.results.map(f=>`
        <div onclick="abrir(${f.id})" style="display:flex;gap:12px;padding:12px;border-bottom:1px solid #111;">
            <img src="https://image.tmdb.org/t/p/w200${f.poster_path}" style="width:65px;height:95px;border-radius:6px;">
            <div>
                <h4>${f.title}</h4>
                <p style="font-size:10px;color:#777;">${f.overview||'...'}</p>
            </div>
        </div>
    `).join('');
}

// ====== HOME ======
async function carregarHome(){
    const pop=await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('top10').innerHTML=pop.results.slice(0,10).map((f,i)=>`
        <div onclick="abrir(${f.id})" class="card-top">
            <span class="numero-fix">${i+1}</span>
            <img src="https://image.tmdb.org/t/p/w400${f.poster_path}">
        </div>
    `).join('');

    const lan=await api(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('lancamentos').innerHTML=lan.results.map(f=>`
        <img class="card-min" src="https://image.tmdb.org/t/p/w300${f.poster_path}" onclick="abrir(${f.id})">
    `).join('');
}

// ====== DETALHES ======
async function abrir(id){
    if(_cm_lockAction()) return;

    ir('detalhes');

    const m=await api(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=videos,credits,recommendations`);

    filmeAtual=m.title;

    document.getElementById('m-titulo').innerText=m.title;
    document.getElementById('m-sinopse').innerText=m.overview||"...";

    document.getElementById('btn-play-main').onclick=()=>{
        if(_cm_lockAction()) return;
        window.open(`${MOTOR}/buscar?titulo=${encodeURIComponent(filmeAtual)}`);
    };
}

// ====== NAVEGAÇÃO ======
function ir(p){
    if(_cm_lockAction()) return;

    document.querySelectorAll('.page').forEach(e=>e.classList.remove('active'));
    document.getElementById(p).classList.add('active');
}

// ====== HERO ======
async function initHero(){
    const d=await api(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`);
    document.getElementById('hero-wrapper').innerHTML=d.results.slice(0,6).map((m,i)=>`
        <div class="hero-item" 
            style="background-image:url(https://image.tmdb.org/t/p/original${m.backdrop_path});
            opacity:${i===0?1:0};
            z-index:${i===0?1:0}" 
            onclick="abrir(${m.id})">
        </div>
    `).join('');
}
