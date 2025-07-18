// firebase/init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCR2zwKVwdSBCoIjgiGqt77UzNyCA92l6o",
  authDomain: "kalam-50ab1.firebaseapp.com",
  projectId: "kalam-50ab1",
  storageBucket: "kalam-50ab1.appspot.com",   
  messagingSenderId: "1028225395627",
  appId: "1:1028225395627:web:b17ee44edd7f085a9540ee",
  measurementId: "G-9PSFSJ1BP9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
