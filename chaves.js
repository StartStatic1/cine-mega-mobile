// ====== CHAVES (EDITA AQUI SEM MEXER NO APP) ======
const CHAVES_VALIDAS = [
    "VIP123",
    "MEGA2026",
    "TESTE777"
];


// ====== SISTEMA DE BLOQUEIO (SEPARADO DO APP) ======
document.addEventListener("DOMContentLoaded", () => {

    const login = document.getElementById("login");

    function bloqueado(){
        const exp = localStorage.getItem("cm_exp");
        if(!exp) return true;
        return Date.now() > parseInt(exp);
    }

    function liberar(){
        login.style.display = "none";
    }

    window.validarChave = function(){
        const chave = document.getElementById("inputChave").value.trim().toUpperCase();

        if(CHAVES_VALIDAS.includes(chave)){
            localStorage.setItem("cm_exp", Date.now() + (30 * 24 * 60 * 60 * 1000));
            liberar();
        } else {
            document.getElementById("msgErro").style.display = "block";
        }
    }

    window.iniciarTeste = function(){
        if(localStorage.getItem("cm_test")){
            alert("Teste já usado!");
            return;
        }

        localStorage.setItem("cm_test", "1");
        localStorage.setItem("cm_exp", Date.now() + (2 * 60 * 60 * 1000));
        liberar();
    }

    // 👇 ESSA LINHA É A CHAVE DO PROBLEMA QUE RESOLVEU
    setTimeout(() => {
        if(bloqueado()){
            login.style.display = "flex";
        } else {
            liberar();
        }
    }, 800); // espera app carregar primeiro

});
