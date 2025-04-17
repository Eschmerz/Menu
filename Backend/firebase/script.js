// 🔹 Importar Firebase SDK modular
import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    setPersistence, 
    browserLocalPersistence, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// 🔹 Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyALJ85dghx53FhA5-1DxrBrjq-Y2abKLnA",
    authDomain: "menus-digitales-32211.firebaseapp.com",
    projectId: "menus-digitales-32211",
    storageBucket: "menus-digitales-32211.firebasestorage.app",
    messagingSenderId: "443239994194",
    appId: "1:443239994194:web:8bb506317d4c51ad98608b",
    measurementId: "G-PJGDMPF6LY"
};

// 🔹 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Elementos del DOM
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn"); // Botón de Google
const status = document.getElementById("status");

// 🔹 Verificar si el usuario está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuario autenticado:", user.uid);
        logoutBtn.style.display = "block";

        // Si estás en el dashboard, mostrar contenido
        if (typeof mostrarContenido === "function") {
            mostrarContenido('gestion');
        }
    } else {
        console.warn("Usuario no autenticado.");
        status.innerText = "No hay usuario autenticado.";
        logoutBtn.style.display = "none";

        // Redirigir si no está en la página de login
        if (!window.location.href.includes("login.html")) {
            alert("Por favor, inicia sesión para acceder al dashboard.");
            window.location.href = "/Frontend/pages/login.html";
        }
    }
});

// 🔹 Iniciar sesión con correo y contraseña
loginBtn?.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        // Configurar persistencia de sesión
        await setPersistence(auth, browserLocalPersistence);

        // Iniciar sesión con correo y contraseña
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Usuario autenticado:", user);

        // Verificar si el usuario está autorizado
        const userRef = doc(db, "authorizedUsers", user.email);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists() && userSnapshot.data().activo) {
            console.log("Usuario autorizado:", user.email);
        } else {
            console.warn("Usuario no autorizado:", user.email);
            alert("No tienes permiso para acceder a este sistema.");
            await signOut(auth); // Cerrar sesión si no está autorizado
        }

        // Redirigir al dashboard
        window.location.href = `/Frontend/pages/Main/dashboard.html?uid=${user.uid}`;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Error al iniciar sesión. Verifica tus credenciales.");
    }
});

// 🔹 Iniciar sesión con Google
googleLoginBtn?.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
        // Iniciar sesión con Google usando un popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log("Usuario autenticado con Google:", user);

        // Verificar si el usuario está autorizado
        const userRef = doc(db, "authorizedUsers", user.email); // Documento con el correo electrónico del usuario
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists() && userSnapshot.data().activo) {
            console.log("Usuario autorizado:", user.email);

            // Redirigir al dashboard
            window.location.href = `/Frontend/pages/Main/dashboard.html?uid=${user.uid}`;
        } else {
            console.warn("Usuario no autorizado:", user.email);
            alert("No tienes permiso para acceder a este sistema.");
            await signOut(auth); // Cerrar sesión si no está autorizado
        }
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
        alert("Error al iniciar sesión con Google.");
    }
});

// 🔹 Cerrar sesión
logoutBtn?.addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("Sesión cerrada.");
        window.location.href = "/Frontend/pages/login.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});
