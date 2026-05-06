let CHAVES = {
  VIP123: {
    expira: Date.now() + (2 * 86400000),
    usado: false,
    device: null
  }
};

export default function handler(req, res) {
  const { chave, device } = req.query;

  const dados = CHAVES[chave];

  if (!dados) {
    return res.json({ status: "erro" });
  }

  // expirado
  if (Date.now() > dados.expira) {
    return res.json({ status: "expirada" });
  }

  // primeira vez
  if (!dados.device) {
    dados.device = device;
    dados.usado = true;

    return res.json({
      status: "ok",
      expira: dados.expira
    });
  }

  // já usada em outro aparelho
  if (dados.device !== device) {
    return res.json({ status: "bloqueada" });
  }

  // mesmo aparelho
  return res.json({
    status: "ok",
    expira: dados.expira
  });
}
