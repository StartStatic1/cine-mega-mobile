// ===== CONFIG =====
const CHAVES_VALIDAS = [
    "VIP123",
    "CINEMEGA2026",
    "TESTEVIP"
];

// ===== CONTROLE =====
function _cm_login() {
    const input = document.getElementById("inputChave");
    const erro = document.getElementById("msgErro");

    if (!input) return;

    const chave = input.value.trim().toUpperCase();

    if (CHAVES_VALIDAS.includes(chave)) {
        liberarAcesso(2); // 2 dias
    } else {
        erro.style.display = "block";
    }
}

function _cm_test() {
    liberarAcesso(0.08); // ~2 horas
}

// ===== LIBERAÇÃO =====
function liberarAcesso(dias) {
    const agora = new Date().getTime();
    const expira = agora + (dias * 24 * 60 * 60 * 1000);

    localStorage.setItem("cm_expira", expira);

    fecharLogin();
}

// ===== VERIFICAÇÃO AUTOMÁTICA =====
function verificarAcesso() {
    const expira = localStorage.getItem("cm_expira");

    if (!expira) {
        abrirLogin();
        return;
    }

    const agora = new Date().getTime();

    if (agora > parseInt(expira)) {
        abrirLogin();
    } else {
        fecharLogin();
    }
}

// ===== UI =====
function abrirLogin() {
    const login = document.getElementById("login");
    if (login) login.style.display = "flex";
}

function fecharLogin() {
    const login = document.getElementById("login");
    if (login) login.style.display = "none";
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(verificarAcesso, 300);
});
