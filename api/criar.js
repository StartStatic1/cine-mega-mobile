let CHAVES = global.CHAVES || {};
global.CHAVES = CHAVES;

function gerarChave() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function handler(req, res) {
  const { dias } = req.body;

  const chave = gerarChave();

  CHAVES[chave] = {
    expira: Date.now() + (dias * 86400000),
    device: null
  };

  res.json({ chave });
}
