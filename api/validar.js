import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default async function handler(req, res) {
  const { chave, device } = req.query;

  // sem chave
  if (!chave) {
    return res.json({ status: "erro" });
  }

  try {
    const ref = doc(db, "chaves", chave);
    const snap = await getDoc(ref);

    // não existe
    if (!snap.exists()) {
      return res.json({ status: "erro" });
    }

    const dados = snap.data();

    // expirado
    if (Date.now() > dados.expira) {
      return res.json({ status: "expirada" });
    }

    // primeira ativação
    if (!dados.device) {
      await updateDoc(ref, {
        device: device
      });

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

  } catch (e) {
    return res.json({
      status: "erro"
    });
  }
}
