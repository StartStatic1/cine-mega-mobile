// ===== CONFIG =====
const API_URL = "/api/validar";

// ===== FINGERPRINT =====
function getDeviceId() {
    let id = localStorage.getItem("cm_device");

    if (!id) {
        id = btoa(
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
    const data = JSON.stringify({
        expira,
        device: getDeviceId()
    });

    localStorage.setItem("cm_main", data);
    sessionStorage.setItem("cm_backup", data);
    window.name = data;
}

// ===== LER =====
function lerDados() {
    try {
        return JSON.parse(
            localStorage.getItem("cm_main") ||
            sessionStorage.getItem("cm_backup") ||
            window.name ||
            "{}"
        );
    } catch {
        return {};
    }
}

// ===== LOGIN (API ONLINE) =====
async function _cm_login() {
    const input = document.getElementById("inputChave");
    const erro = document.getElementById("msgErro");

    const chave = input.value.trim().toUpperCase();
    const device = getDeviceId();

    erro.style.display = "none";

    try {
        const r = await fetch(`${API_URL}?chave=${chave}&device=${device}`);
        const d = await r.json();

        if (d.status === "ok") {
            salvarDados(d.expira);
            fecharLogin();
        } 
        else if (d.status === "bloqueada") {
            erro.innerText = "🚫 Chave já usada em outro aparelho";
            erro.style.display = "block";
        }
        else if (d.status === "expirada") {
            erro.innerText = "⏳ Chave expirada";
            erro.style.display = "block";
        }
        else {
            erro.innerText = "❌ Chave inválida!";
            erro.style.display = "block";
        }

    } catch (e) {
        erro.innerText = "⚠️ Erro de conexão com servidor";
        erro.style.display = "block";
    }
}

// ===== TESTE (2H) =====
function _cm_test() {
    const agora = Date.now();
    const expira = agora + (2 * 60 * 60 * 1000); // 2 horas
    salvarDados(expira);
    fecharLogin();
}

// ===== VERIFICAÇÃO =====
function verificarAcesso() {
    const dados = lerDados();
    const agora = Date.now();

    // nunca logou
    if (!dados.expira) {
        abrirLogin();
        return;
    }

    // aparelho diferente
    if (dados.device !== getDeviceId()) {
        bloquear();
        return;
    }

    // expirado
    if (agora > dados.expira) {
        abrirLogin();
        return;
    }

    fecharLogin();
}

// ===== BLOQUEIO =====
function bloquear() {
    const login = document.getElementById("login");

    login.style.display = "flex";
    login.innerHTML = `
        <h2 style="color:red;text-align:center;">
        ⚠️ ACESSO BLOQUEADO<br><br>
        Dispositivo inválido
        </h2>
    `;
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
