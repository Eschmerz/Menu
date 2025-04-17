import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración de Firebase
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
const auth = getAuth();
const provider = new GoogleAuthProvider();

signInWithPopup(auth, provider)
.then((result) => {
    console.log("Usuario autenticado:", result.user);
})
    .catch((error) => {
console.error("Error al autenticar:", error);
});

// Obtener el UID del usuario desde la URL
const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("uid");

if (!usuarioId) {
    alert("No se proporcionó un UID válido en la URL.");
    throw new Error("UID no encontrado en la URL.");
}

// Cargar el menú del usuario específico
async function cargarMenu() {
    try {
        const menuRef = collection(db, "default");
        const q = query(menuRef, where("usuarioId", "==", usuarioId)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.warn(`No se encontraron menús disponibles para el usuario con UID: ${usuarioId}`);
            return;
        }

        const menu = snapshot.docs[0].data(); // Obtener el primer menú disponible
        document.querySelector(".local-name").textContent = menu.nombreRestaurante;

        // Cargar el wallpaper
        const backgroundContainer = document.querySelector(".background-container");
        backgroundContainer.style.backgroundImage = `url(${menu.wallpaper})`;

        // Mostrar los platos
        const contenedorPlatillos = document.getElementById("contenedor-platillos");
        menu.platos.forEach((plato) => {
            const div = document.createElement("div");
            div.classList.add("tarjeta-platillo");
            div.innerHTML = `
                <img src="${plato.imagen}" alt="${plato.nombre}" class="imagen-platillo" />
                <h3>${plato.nombre}</h3>
                <p>${plato.descripcion}</p>
                <p class="precio">$${plato.precio}</p>
            `;
            contenedorPlatillos.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar el menú:", error);
    }
}

// Mostrar platos y categorías
async function mostrarMenu() {
    const contenedorPlatillos = document.getElementById("contenedor-platillos");
    if (!contenedorPlatillos) return;

    try {
        const platillosRef = collection(db, "platos");
        const q = query(platillosRef, where("usuarioId", "==", usuarioId)); // Filtrar por usuarioId
        const platillosSnapshot = await getDocs(q);

        const platillos = [];
        platillosSnapshot.forEach((doc) => {
            const platillo = { id: doc.id, ...doc.data() };
            platillos.push(platillo);
        });

        // Función para renderizar platillos
        const renderizarPlatillos = (categoriaSeleccionada) => {
            contenedorPlatillos.innerHTML = "";
            const platillosFiltrados = categoriaSeleccionada === "todas"
                ? platillos
                : platillos.filter((p) => p.categoria?.toLowerCase() === categoriaSeleccionada.toLowerCase());

            if (platillosFiltrados.length === 0) {
                contenedorPlatillos.innerHTML = '<p>No hay platillos disponibles en esta categoría.</p>';
                return;
            }

            platillosFiltrados.forEach((platillo) => {
                const div = document.createElement("div");
                div.classList.add("tarjeta-platillo");
                div.innerHTML = `
                    <img src="${platillo.imagen || '/assets/images/default-platillo.jpg'}" alt="${platillo.nombre}" class="imagen-platillo" />
                    <h3>${platillo.nombre}</h3>
                    <p>${platillo.subtitulo}</p>
                    <p class="precio">$${platillo.precio || 'N/A'}</p>
                `;

                // Agregar evento para mostrar el modal
                div.addEventListener("click", () => mostrarDetallesPlatillo(platillo));

                contenedorPlatillos.appendChild(div);
            });
        };

        // Renderizar todos los platillos inicialmente
        renderizarPlatillos("todas");

        // Exponer la función `renderizarPlatillos` para que `mostrarCategorias` pueda usarla
        window.renderizarPlatillos = renderizarPlatillos;
    } catch (error) {
        console.error("Error al obtener los platillos:", error);
    }
}

// Mostrar categorías
async function mostrarCategorias() {
    const categoriasRecuadros = document.getElementById("categorias-recuadros");
    if (!categoriasRecuadros) return;

    try {
        const categoriasRef = collection(db, "categorias");
        const q = query(categoriasRef, where("usuarioId", "==", usuarioId)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        categoriasRecuadros.innerHTML = ""; // Limpiar las categorías existentes

        // Agregar la categoría "Todas"
        categoriasRecuadros.innerHTML += `
            <div class="categorias-recuadro" data-categoria="todas">
                <i class="fas fa-th-large"></i>
                <span>Todas</span>
            </div>
        `;

        // Agregar las categorías desde Firestore
        snapshot.forEach((doc) => {
            const categoria = doc.data();
            const iconoUrl = categoria.icono.startsWith("http")
                ? categoria.icono
                : `/Backend/src/dashboard/categorias/${categoria.icono}`; // Ruta base para íconos locales

            categoriasRecuadros.innerHTML += `
                <div class="categorias-recuadro" data-categoria="${categoria.nombre}">
                    <img src="${iconoUrl}" alt="${categoria.nombre}" class="categoria-icono">
                    <span>${categoria.nombre}</span>
                </div>
            `;
        });

        // Agregar eventos a las categorías
        document.querySelectorAll(".categorias-recuadro").forEach((recuadro) => {
            recuadro.addEventListener("click", (e) => {
                const categoriaSeleccionada = recuadro.dataset.categoria;
                renderizarPlatillos(categoriaSeleccionada); // Llamar a la función de filtrado
            });
        });
    } catch (error) {
        console.error("Error al mostrar las categorías:", error);
    }
}

// Función para buscar platillos
function buscarPlatillos() {
    const input = document.getElementById("search-input").value.toLowerCase();
    const tarjetas = document.querySelectorAll(".tarjeta-platillo");

    if (!tarjetas.length) {
        console.warn("No hay tarjetas de platillos disponibles para buscar.");
        return;
    }

    tarjetas.forEach((tarjeta) => {
        const nombre = tarjeta.querySelector("h3").textContent.toLowerCase();
        const descripcion = tarjeta.querySelector("p").textContent.toLowerCase();

        if (nombre.includes(input) || descripcion.includes(input)) {
            tarjeta.style.display = "block"; // Mostrar la tarjeta si coincide
        } else {
            tarjeta.style.display = "none"; // Ocultar la tarjeta si no coincide
        }
    });
}

// Mostrar detalles del platillo en un modal
function mostrarDetallesPlatillo(platillo) {
    // Redirigir a la página de detalles del plato con el ID como parámetro
    window.location.href = `Platos.html?id=${platillo.id}`;
}

// Cerrar el modal
function cerrarModal() {
    document.getElementById("modal-platillo").style.display = "none";
}

// Asignar evento al botón de cerrar
document.getElementById("cerrar-modal").addEventListener("click", cerrarModal);

// Cerrar el modal al hacer clic fuera del contenido
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal-platillo");
    if (e.target === modal) {
        cerrarModal();
    }
});

// Botón para subir historia a Instagram
document.getElementById("shareStoryButton").addEventListener("click", () => {
    alert("Función para subir historia a Instagram en desarrollo.");
});

// Botón para agregar reseña
document.getElementById("addReviewButton").addEventListener("click", () => {
    alert("Función para agregar reseña en desarrollo.");
});

// Cargar wallpaper
async function cargarWallpaper() {
    try {
        const wallpapersRef = collection(db, "wallpapers");
        const q = query(wallpapersRef, where("usuarioId", "==", usuarioId)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Buscar el wallpaper que está marcado como seleccionado
            const wallpaperSeleccionado = snapshot.docs.find(doc => doc.data().seleccionado);

            if (wallpaperSeleccionado) {
                const wallpaperData = wallpaperSeleccionado.data();
                const backgroundContainer = document.querySelector(".background-container");
                backgroundContainer.style.backgroundImage = `url(${wallpaperData.url})`;
            } else {
                console.warn("No hay un wallpaper seleccionado para este usuario.");
            }
        } else {
            console.error("No se encontraron wallpapers para este usuario.");
        }
    } catch (error) {
        console.error("Error al cargar el wallpaper:", error);
    }
}

// Cargar foto del chef
async function cargarFotoChef() {
    try {
        const configuracionRef = collection(db, 'configuracion');
        const snapshot = await getDocs(configuracionRef);

        if (!snapshot.empty) {
            const configuracion = snapshot.docs[snapshot.docs.length - 1].data(); // Obtener el último registro
            const chefPhoto = document.querySelector('.chef-photo');
            if (configuracion.fotoChef) {
                chefPhoto.src = configuracion.fotoChef;
            }
        }
    } catch (error) {
        console.error("Error al cargar la foto del chef:", error);
    }
}

// Cargar video slider
async function cargarVideoSlider() {
    try {
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, where("usuarioId", "==", usuarioId), where("seleccionado", "==", true)); // Filtrar por usuarioId y seleccionado
        const videosSnapshot = await getDocs(q);

        if (!videosSnapshot.empty) {
            const videoSeleccionado = videosSnapshot.docs[0].data(); // Obtener el primer video seleccionado
            console.log("Video seleccionado:", videoSeleccionado);

            const videoElement = document.querySelector('.video-slide video');
            videoElement.src = videoSeleccionado.url; // Asignar la URL del video seleccionado
            videoElement.load(); // Recargar el video

            // Obtener la información del chef relacionado con el video
            const chefId = videoSeleccionado.chefId;
            if (chefId) {
                const chefRef = doc(db, 'chefs', chefId);
                const chefSnapshot = await getDoc(chefRef);

                if (chefSnapshot.exists()) {
                    const chefData = chefSnapshot.data();
                    console.log("Chef relacionado:", chefData);

                    // Actualizar la información del chef en el HTML
                    const chefPhoto = document.querySelector('.chef-photo');
                    const chefName = document.querySelector('.chef-details p:nth-child(1)');
                    const chefSpecialty = document.querySelector('.chef-details p:nth-child(2)');

                    chefPhoto.src = chefData.imagen || '/assets/images/default-chef.jpg'; // Imagen por defecto si no hay imagen
                    chefName.textContent = `Chef: ${chefData.nombre || 'Desconocido'}`;
                    chefSpecialty.textContent = `Especialidad: ${chefData.especialidad || 'No especificada'}`;
                } else {
                    console.warn("No se encontró un chef relacionado con el video seleccionado.");
                }
            } else {
                console.warn("El video seleccionado no tiene un chefId asociado.");
            }
        } else {
            console.warn("No hay un video seleccionado en Firestore.");
        }
    } catch (error) {
        console.error("Error al cargar el video del slider:", error);
    }
}

// Mostrar recomendaciones
async function mostrarRecomendaciones() {
    const recomendacionesContainer = document.getElementById('recomendaciones-container');
    if (!recomendacionesContainer) return;

    try {
        const campanasRef = collection(db, "campañas");
        const q = query(campanasRef, where("usuarioId", "==", usuarioId)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.warn("No hay campañas disponibles para este usuario.");
            recomendacionesContainer.innerHTML = '<p>No hay recomendaciones disponibles.</p>';
            return;
        }

        // Obtener la última campaña
        const ultimaCampana = snapshot.docs[snapshot.docs.length - 1].data();
        console.log("Última campaña:", ultimaCampana);

        const platosRef = collection(db, "platos");
        const platosSnapshot = await getDocs(platosRef);

        recomendacionesContainer.innerHTML = ""; // Limpiar el contenedor

        // Filtrar los platos seleccionados en la campaña
        const platosSeleccionados = platosSnapshot.docs.filter((doc) =>
            ultimaCampana.platos.includes(doc.id)
        );

        if (platosSeleccionados.length === 0) {
            console.warn("No se encontraron platos seleccionados para esta campaña.");
            recomendacionesContainer.innerHTML = '<p>No hay platos seleccionados para esta campaña.</p>';
            return;
        }

        // Mostrar los platos seleccionados
        platosSeleccionados.forEach((doc) => {
            const plato = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-recomendacion");
            div.innerHTML = `
                <img src="${plato.imagen}" alt="${plato.nombre}" class="imagen-recomendacion" />
                <h3>${plato.nombre}</h3>
                <p>${plato.subtitulo}</p>
                <p class="precio">$${plato.precio}</p>
            `;
            recomendacionesContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Error al mostrar las recomendaciones:", error);
        recomendacionesContainer.innerHTML = '<p>Error al cargar las recomendaciones.</p>';
    }
}

let intervalId; // Variable global para almacenar el ID del intervalo

// Mostrar recomendaciones del menú
async function mostrarRecomendacionesMenu() {
    const recomendacionesContainer = document.getElementById('menu-recomendaciones-container');
    if (!recomendacionesContainer) return;

    try {
        const campanasRef = collection(db, 'campañas');
        const snapshot = await getDocs(campanasRef);

        if (snapshot.empty) {
            console.warn("No hay campañas disponibles en Firestore.");
            recomendacionesContainer.innerHTML = '<p>No hay recomendaciones disponibles.</p>';
            return;
        }

        // Obtener la última campaña
        const ultimaCampana = snapshot.docs[snapshot.docs.length - 1].data();
        console.log("Última campaña:", ultimaCampana);

        const platosRef = collection(db, 'platos');
        const platosSnapshot = await getDocs(platosRef);

        // Filtrar los platos seleccionados en la campaña
        const platosSeleccionados = platosSnapshot.docs.filter((doc) =>
            ultimaCampana.platos.includes(doc.id)
        );

        console.log("Platos seleccionados:", platosSeleccionados);

        if (platosSeleccionados.length === 0) {
            console.warn("No se encontraron platos seleccionados para esta campaña.");
            recomendacionesContainer.innerHTML = '<p>No hay platos seleccionados para esta campaña.</p>';
            return;
        }

        // Detener el intervalo anterior si existe
        if (intervalId) {
            clearInterval(intervalId);
        }

        // Alternar entre los platos seleccionados cada 5 segundos
        let currentIndex = 0;

        function mostrarPlato() {
            const plato = platosSeleccionados[currentIndex].data();
            console.log(`Mostrando plato: ${plato.nombre} (Índice: ${currentIndex})`);
            recomendacionesContainer.innerHTML = `
                <div class="tarjeta-recomendacion-horizontal" style="background-image: url('${plato.imagen}');">
                    <div class="contenido-recomendacion">
                        <h3>${plato.nombre}</h3>
                        <p>${plato.subtitulo}</p> <!-- Mostrar el subtítulo en lugar de la descripción -->
                    </div>
                </div>
            `;

            // Cambiar al siguiente plato
            currentIndex = (currentIndex + 1) % platosSeleccionados.length;
        }

        // Mostrar el primer plato inmediatamente
        mostrarPlato();

        // Cambiar el plato cada 5 segundos
        intervalId = setInterval(mostrarPlato, 5000);
    } catch (error) {
        console.error('Error al mostrar las recomendaciones del menú:', error);
        recomendacionesContainer.innerHTML = '<p>Error al cargar las recomendaciones.</p>';
    }
}

// Ejecutar funciones al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarMenu(); // Cargar el menú del restaurante
    cargarWallpaper(); // Cargar el wallpaper seleccionado
    cargarVideoSlider(); // Cargar el video seleccionado
    mostrarCategorias(); // Mostrar las categorías dinámicas
    mostrarMenu(); // Mostrar los platillos dinámicos
    mostrarRecomendaciones(); // Mostrar las recomendaciones de la casa
    mostrarRecomendacionesMenu(); // Mostrar las recomendaciones del menú
    document.getElementById("search-input").addEventListener("input", buscarPlatillos);
});
