const express = require("express");
const app = express();

let CHAVES = global.CHAVES || {};
global.CHAVES = CHAVES;

// GERAR CHAVE (teste)
app.get("/criar", (req, res) => {
    const chave = "VIP-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    CHAVES[chave] = {
        expira: Date.now() + (2 * 60 * 60 * 1000),
        device: null
    };

    res.json({ chave });
});

// VALIDAR (SEU CÓDIGO AQUI CORRIGIDO)
app.get("/validar", (req, res) => {
    const { chave, device } = req.query;

    if (!chave) return res.json({ status: "erro" });

    const dados = CHAVES[chave];

    if (!dados) return res.json({ status: "erro" });

    if (Date.now() > dados.expira)
        return res.json({ status: "expirada" });

    if (!dados.device) {
        dados.device = device;

        return res.json({
            status: "ok",
            expira: dados.expira
        });
    }

    if (dados.device !== device)
        return res.json({ status: "bloqueada" });

    return res.json({
        status: "ok",
        expira: dados.expira
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("rodando na porta", PORT);
});
