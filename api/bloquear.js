let CHAVES = global.CHAVES || {};
global.CHAVES = CHAVES;

export default function handler(req, res) {
  const { chave } = req.body;

  if (CHAVES[chave]) {
    CHAVES[chave].device = "BLOQUEADO";
  }

  return res.json({ ok: true });
}
