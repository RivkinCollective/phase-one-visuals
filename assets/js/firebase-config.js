const firebaseConfig = {
  apiKey: "AIzaSyBTDHLALaA_Jn2SsAEhJXcOvOyZMIeCG34",
  authDomain: "phase-one-visuals.firebaseapp.com",
  projectId: "phase-one-visuals",
  storageBucket: "phase-one-visuals.firebasestorage.app",
  messagingSenderId: "16706364965",
  appId: "1:16706364965:web:a63a8917ab2b2cf48bc1cc"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
