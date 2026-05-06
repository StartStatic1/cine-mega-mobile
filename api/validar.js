let CHAVES = global.CHAVES || {};
global.CHAVES = CHAVES;

export default function handler(req, res) {
    const { chave, device } = req.query;

    if (!chave) {
        return res.json({ status: "erro" });
    }

    const dados = CHAVES[chave];

    if (!dados) {
        return res.json({ status: "erro" });
    }

    if (Date.now() > dados.expira) {
        return res.json({ status: "expirada" });
    }

    if (!dados.device) {
        dados.device = device;

        return res.json({
            status: "ok",
            expira: dados.expira
        });
    }

    if (dados.device !== device) {
        return res.json({ status: "bloqueada" });
    }

    return res.json({
        status: "ok",
        expira: dados.expira
    });
}
