import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// CONFIG DO SEU PROJETO
const firebaseConfig = {
  apiKey: "AIzaSyD_-_-HnCthsjcg3uJyjMPS1eGxe9oEQnA",
  authDomain: "cinemega-pocket.firebaseapp.com",
  projectId: "cinemega-pocket"
};

// INICIA
const app = initializeApp(firebaseConfig);

// BANCO
const db = getFirestore(app);

export { db };
