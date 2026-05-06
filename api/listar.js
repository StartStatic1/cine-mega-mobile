let CHAVES = global.CHAVES || {};
global.CHAVES = CHAVES;

export default function handler(req, res) {
  return res.json(CHAVES);
}
