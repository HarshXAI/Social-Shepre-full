// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDLXaQ6k3CBrkiRhH55YqNUKRf4v5R-pdo",
  authDomain: "mern-blog-248bd.firebaseapp.com",
  projectId: "mern-blog-248bd",
  storageBucket: "mern-blog-248bd.appspot.com",
  messagingSenderId: "460494267721",
  appId: "1:460494267721:web:828b93f2801a628d122698"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);