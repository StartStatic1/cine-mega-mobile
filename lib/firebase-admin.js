import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "cinemega-pocket",
      clientEmail: "COLE_AQUI",
      privateKey: "COLE_AQUI".replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export { db };
