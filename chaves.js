// ====== CHAVES ======
const CHAVES_VALIDAS = [
    "VIP123",
    "MEGA2026",
    "TESTE777"
];


// ====== FUNÇÕES GLOBAIS (BOTÕES FUNCIONAM 100%) ======
function validarChave(){
    const input = document.getElementById("inputChave");
    const erro = document.getElementById("msgErro");

    const chave = input.value.trim().toUpperCase();

    if(CHAVES_VALIDAS.includes(chave)){
        localStorage.setItem("cm_exp", Date.now() + (30 * 24 * 60 * 60 * 1000));
        document.getElementById("login").style.display = "none";
    } else {
        erro.style.display = "block";
    }
}

function iniciarTeste(){
    if(localStorage.getItem("cm_test")){
        alert("Teste já usado!");
        return;
    }

    localStorage.setItem("cm_test", "1");
    localStorage.setItem("cm_exp", Date.now() + (2 * 60 * 60 * 1000));
    document.getElementById("login").style.display = "none";
}


// ====== BLOQUEIO (RODA DEPOIS DO APP) ======
window.addEventListener("load", () => {

    const login = document.getElementById("login");

    function bloqueado(){
        const exp = localStorage.getItem("cm_exp");
        if(!exp) return true;
        return Date.now() > parseInt(exp);
    }

    // espera app renderizar TOTAL
    setTimeout(() => {
        if(bloqueado()){
            login.style.display = "flex";
        } else {
            login.style.display = "none";
        }
    }, 500);

});
