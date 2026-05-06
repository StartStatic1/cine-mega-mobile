let CHAVES = global.CHAVES || {};
global.CHAVES = CHAVES;

export default function handler(req, res) {
  const { chave, device } = req.query;

  // não enviou chave
  if (!chave) {
    return res.json({ status: "erro" });
  }

  const dados = CHAVES[chave];

  // chave não existe
  if (!dados) {
    return res.json({ status: "erro" });
  }

  // expirou
  if (Date.now() > dados.expira) {
    return res.json({ status: "expirada" });
  }

  // primeira ativação
  if (!dados.device) {
    dados.device = device;

    return res.json({
      status: "ok",
      expira: dados.expira
    });
  }

  // outro aparelho
  if (dados.device !== device) {
    return res.json({
      status: "bloqueada"
    });
  }

  // mesmo aparelho
  return res.json({
    status: "ok",
    expira: dados.expira
  });
}
