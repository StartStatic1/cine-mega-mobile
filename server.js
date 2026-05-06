const express = require("express");
const app = express();

let CHAVES = {};

function gerarChave() {
  return "VIP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// criar chave
app.get("/criar", (req, res) => {
  const dias = parseInt(req.query.dias) || 1;

  const chave = gerarChave();

  CHAVES[chave] = {
    expira: Date.now() + dias * 86400000,
    device: null
  };

  res.json({ chave });
});

// validar
app.get("/validar", (req, res) => {
  const { chave, device } = req.query;

  const dados = CHAVES[chave];

  if (!dados) return res.json({ status: "erro" });

  if (Date.now() > dados.expira)
    return res.json({ status: "expirada" });

  if (!dados.device) {
    dados.device = device;
    return res.json({ status: "ok", expira: dados.expira });
  }

  if (dados.device !== device)
    return res.json({ status: "bloqueada" });

  res.json({ status: "ok", expira: dados.expira });
});

// listar (admin)
app.get("/listar", (req, res) => {
  res.json(CHAVES);
});

app.listen(3000, () => console.log("rodando"));
