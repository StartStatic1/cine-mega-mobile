// ===== CONFIG =====
const API_URL = "https://cine-mega-mobile.onrender.com/validar";

// ===== DEVICE ID FIXO (SEM BUG) =====
function getDeviceId() {
    let id = localStorage.getItem("cm_device");

    if (!id) {
        id = "dev_" + btoa(
            navigator.userAgent +
            screen.width +
            screen.height +
            new Date().getTimezoneOffset()
        );

        localStorage.setItem("cm_device", id);
    }

    return id;
}

// ===== SALVAR =====
function salvarDados(expira) {
    const data = {
        expira,
        device: getDeviceId()
    };

    localStorage.setItem("cm_main", JSON.stringify(data));
}

// ===== LER =====
function lerDados() {
    try {
        return JSON.parse(localStorage.getItem("cm_main")) || {};
    } catch {
        return {};
    }
}

// ===== LOGIN =====
async function _cm_login() {
    const input = document.getElementById("inputChave");
    const erro = document.getElementById("msgErro");

    const chave = input.value.trim().toUpperCase();
    const device = getDeviceId();

    erro.style.display = "none";
    erro.innerText = "";

    try {
        const res = await fetch(`${API_URL}?chave=${chave}&device=${device}`);
        const data = await res.json();

        if (data.status === "ok") {
            salvarDados(data.expira);
            fecharLogin();
        }

        else if (data.status === "bloqueada") {
            erro.innerText = "🚫 Usada em outro aparelho";
            erro.style.display = "block";
        }

        else if (data.status === "expirada") {
            erro.innerText = "⏳ Chave expirada";
            erro.style.display = "block";
        }

        else {
            erro.innerText = "❌ Chave inválida";
            erro.style.display = "block";
        }

    } catch (e) {
        erro.innerText = "⚠️ Servidor iniciando... tente novamente";
        erro.style.display = "block";
    }
}

// ===== TESTE =====
function _cm_test() {
    const expira = Date.now() + (2 * 60 * 60 * 1000);
    salvarDados(expira);
    fecharLogin();
}

// ===== VERIFICAÇÃO =====
function verificarAcesso() {
    const dados = lerDados();
    const agora = Date.now();

    if (!dados.expira) {
        abrirLogin();
        return;
    }

    if (dados.device !== getDeviceId()) {
        abrirLogin();
        return;
    }

    if (agora > dados.expira) {
        abrirLogin();
        return;
    }

    fecharLogin();
}

// ===== UI =====
function abrirLogin() {
    document.getElementById("login").style.display = "flex";
}

function fecharLogin() {
    document.getElementById("login").style.display = "none";
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(verificarAcesso, 300);
});
