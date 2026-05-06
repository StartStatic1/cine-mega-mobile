let CHAVES = global.CHAVES || {};
global.CHAVES = CHAVES;

// gerar código estilo VIP
function gerarChave() {
  return "VIP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function handler(req, res) {
  const dias = parseFloat(req.body.dias) || 1;
  const chave = gerarChave();

  CHAVES[chave] = {
    expira: Date.now() + (dias * 86400000),
    device: null
  };

  return res.json({ chave });
}
