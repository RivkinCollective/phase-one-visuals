const firebaseConfig = {
  apiKey: "AIzaSyBG5IqXi9ds5GAn0gOEB2xFIsQuUFivLYM",
  authDomain: "phase-one-visual-web.firebaseapp.com",
  projectId: "phase-one-visual-web",
  storageBucket: "phase-one-visual-web.firebasestorage.app",
  messagingSenderId: "1064324008256",
  appId: "1:1064324008256:web:808b7fcb833493139b3e25"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
