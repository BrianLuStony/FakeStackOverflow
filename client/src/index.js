import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApp } from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import "./style.css";


const firebaseConfig = {
  apiKey: "AIzaSyCXAvdga8ozACaNX_SQzD2qPc3PEesh8RQ",
  authDomain: "fakestackoverflow-f08e9.firebaseapp.com",
  projectId: "fakestackoverflow-f08e9",
  storageBucket: "fakestackoverflow-f08e9.appspot.com",
  messagingSenderId: "304362601435",
  appId: "1:304362601435:web:cde8645fb896ddc15b05fe",
  // measurementId: "G-NDGL6SGLTC"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db,auth };

  
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
