// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app-old's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAp-kIbXD4ND75jG_zSnKhvqvsi0Qtt7UU",
  authDomain: "journee-0507.firebaseapp.com",
  projectId: "journee-0507",
  storageBucket: "journee-0507.firebasestorage.app-old",
  messagingSenderId: "225325124643",
  appId: "1:225325124643:web:39e10cab7f3fe97714f596",
  measurementId: "G-LJSC4Z7QC0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
