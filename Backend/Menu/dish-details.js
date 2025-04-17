console.log("Script cargado correctamente");

// Obtener los parámetros de la URL
const params = new URLSearchParams(window.location.search);
const platoId = params.get("id");

// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyALJ85dghx53FhA5-1DxrBrjq-Y2abKLnA",
    authDomain: "menus-digitales-32211.firebaseapp.com",
    projectId: "menus-digitales-32211",
    databaseURL: "https://menus-digitales-32211-default-rtdb.firebaseio.com/",
    storageBucket: "menus-digitales-32211.firebasestorage.app",
    messagingSenderId: "443239994194",
    appId: "1:443239994194:web:8bb506317d4c51ad98608b",
    measurementId: "G-PJGDMPF6LY"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cargar los detalles del plato
async function cargarDetallesPlato() {
    if (!platoId) {
        console.error("No se proporcionó un ID de plato en la URL.");
        return;
    }

    try {
        // Obtener los datos del plato
        const platoRef = doc(db, "platos", platoId);
        const platoSnapshot = await getDoc(platoRef);

        if (!platoSnapshot.exists()) {
            console.error("El plato no existe en Firestore.");
            return;
        }

        const plato = platoSnapshot.data();

        // Actualizar los elementos de la página con los datos del plato
        document.getElementById("dish-image").src = plato.imagen || "/assets/images/default-platillo.jpg";
        document.getElementById("dish-name").textContent = plato.nombre || "Nombre no disponible";
        document.getElementById("dish-subtitle").textContent = plato.subtitulo || "Subtítulo no disponible";
        document.getElementById("dish-description").textContent = plato.descripcion || "Descripción no disponible";
        document.body.style.backgroundImage = `url(${plato.imagen || "/assets/images/default-platillo.jpg"})`;

        if (plato.infoNutricional) {
            document.getElementById("dish-kcal").innerHTML = `${plato.infoNutricional.kcal || 0}<br><span>Kcal</span>`;
            document.getElementById("dish-carbs").innerHTML = `${plato.infoNutricional.carbs || 0}<br><span>Carbs</span>`;
            document.getElementById("dish-protein").innerHTML = `${plato.infoNutricional.protein || 0}<br><span>Protein</span>`;
            document.getElementById("dish-fat").innerHTML = `${plato.infoNutricional.fibra || 0}<br><span>Fibra</span>`;
        }

        // Obtener la información del chef
        if (plato.chefId) {
            const chefRef = doc(db, "chefs", plato.chefId);
            const chefSnapshot = await getDoc(chefRef);

            if (chefSnapshot.exists()) {
                const chef = chefSnapshot.data();
                document.getElementById("chef-image").src = chef.imagen || "/Backend/images/default-chef.jpg";
                document.getElementById("chef-name").textContent = chef.nombre || "Chef no disponible";
            } else {
                console.warn("El chef relacionado no existe en Firestore.");
            }
        } else {
            console.warn("El plato no tiene un chef relacionado.");
        }

        // Obtener los enlaces de redes sociales del usuario creador del plato
        if (plato.usuarioId) {
            const redesQuery = query(collection(db, "redesSociales"), where("usuarioId", "==", plato.usuarioId));
            const redesSnapshot = await getDocs(redesQuery);

            if (!redesSnapshot.empty) {
                const redes = redesSnapshot.docs[0].data();

                const addReviewButton = document.getElementById("addReviewButton");
                if (addReviewButton && redes.googleMaps) {
                    addReviewButton.addEventListener("click", () => {
                        window.open(redes.googleMaps, "_blank", "noopener,noreferrer");
                    });
                }
                

                const addToListButton = document.getElementById("addToListButton");
                if (addToListButton && redes.instagram) {
                    addToListButton.addEventListener("click", () => {
                        window.open(redes.instagram, "_blank", "noopener,noreferrer");
                    });
                }
            } else {
                console.warn("No se encontraron redes sociales para este usuario.");
            }
        } else {
            console.warn("El plato no tiene un usuarioId para obtener redes sociales.");
        }
    } catch (error) {
        console.error("Error al cargar los detalles del plato:", error);
    }
}

// Ejecutar la función al cargar la página
document.addEventListener("DOMContentLoaded", cargarDetallesPlato);
