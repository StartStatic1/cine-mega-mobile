export default function handler(req, res) {
    const { chave } = req.query;

    const CHAVES = {
        VIP123: true,
        CINEMEGA2026: true,
        TESTEVIP: true
    };

    if (CHAVES[chave]) {
        return res.status(200).json({
            status: "ok",
            expira: Date.now() + (2 * 86400000)
        });
    }

    return res.status(200).json({
        status: "erro"
    });
}
