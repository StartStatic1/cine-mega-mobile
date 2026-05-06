// ===== CONFIG =====
const CHAVES_VALIDAS = ["VIP123","CINEMEGA2026","TESTEVIP"];

// ===== FINGERPRINT SIMPLES =====
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

// ===== SALVAR EM 3 CAMADAS =====
function salvarDados(expira) {
    const data = JSON.stringify({
        expira,
        device: getDeviceId()
    });

    localStorage.setItem("cm_main", data);
    sessionStorage.setItem("cm_backup", data);
    window.name = data;
}

// ===== LER DADOS =====
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

// ===== LOGIN =====
function _cm_login() {
    const input = document.getElementById("inputChave");
    const erro = document.getElementById("msgErro");

    const chave = input.value.trim().toUpperCase();

    if (CHAVES_VALIDAS.includes(chave)) {
        liberarAcesso(2);
    } else {
        erro.style.display = "block";
    }
}

// ===== TESTE =====
function _cm_test() {
    liberarAcesso(0.08); // 2h
}

// ===== LIBERAR =====
function liberarAcesso(dias) {
    const agora = Date.now();
    const expira = agora + (dias * 86400000);

    salvarDados(expira);
    fecharLogin();
}

// ===== VERIFICAÇÃO =====
function verificarAcesso() {
    const dados = lerDados();

    const agora = Date.now();

    // 🚨 DETECTA RESET SUSPEITO
    if (!dados.device && localStorage.getItem("cm_suspeito")) {
        bloquear();
        return;
    }

    // primeira vez
    if (!dados.expira) {
        abrirLogin();
        return;
    }

    // device mudou
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
    localStorage.setItem("cm_suspeito", "1");

    const login = document.getElementById("login");
    login.style.display = "flex";
    login.innerHTML = `
        <h2 style="color:red;text-align:center;">
        ⚠️ ACESSO BLOQUEADO<br><br>
        Contate o suporte
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
