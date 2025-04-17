import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyALJ85dghx53FhA5-1DxrBrjq-Y2abKLnA",
    authDomain: "menus-digitales-32211.firebaseapp.com",
    projectId: "menus-digitales-32211",
    storageBucket: "menus-digitales-32211.firebasestorage.app",
    messagingSenderId: "443239994194",
    appId: "1:443239994194:web:8bb506317d4c51ad98608b",
    measurementId: "G-PJGDMPF6LY"
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
