/**********************************************************************
 * IMPORTACIÓN E INICIALIZACIÓN DE FIREBASE (FIRESTORE)
 **********************************************************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    writeBatch,
    getDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-functions.js";
import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

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

// Inicializar Firebase y obtener la instancia de Firestore y Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app); // Inicializar las funciones de Firebase


/**********************************************************************
 * CONFIGURACIÓN DE CLOUDINARY
 **********************************************************************/
// Reemplaza con tus datos de Cloudinary
const cloudName = 'eschmerz';
const uploadPreset = 'Navadez';




// Obtener el UID del usuario desde la URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("uid");

if (!userId) { // Cambiar "usuarioId" por "userId"
    alert("No se proporcionó un ID de usuario.");
    window.location.href = "/Frontend/pages/login.html"; // Redirigir al login si no hay UID
}


/**********************************************************************
 * FUNCIONALIDAD DEL DASHBOARD
 **********************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const botonesMenu = {
        campanas: document.getElementById('campanasBtn'),
        gestion: document.getElementById('gestionBtn'),
        platos: document.getElementById('platosBtn'),
        reservas: document.getElementById('reservasBtn'),
        cerrarSesion: document.getElementById('cerrarSesionBtn')
    };
    const contenido = document.getElementById('contenido');

    // Mostrar sección según opción
    function mostrarContenido(opcion) {
        const contenido = document.getElementById('contenido');
        contenido.innerHTML = ''; // Limpia el contenido previo
    
        if (opcion === 'gestion') {
            contenido.innerHTML = `
                <div class="gestion-layout">
                    <div id="gestion-options" class="gestion-options">
                        <button data-form="agregar-plato">Agregar Platillo</button>
                        <button data-form="agregar-chef">Agregar Chef</button>
                        <button data-form="agregar-categoria">Agregar Categoría</button>
                        <button data-form="agregar-wallpaper">Configurar Wallpaper</button>
                        <button data-form="agregar-video">Agregar Video de Presentación</button>
                        <button data-form="agregar-redes">Configurar Redes Sociales</button>
                        <button data-form="generar-qr-menu">Generar QR del Menú</button> <!-- Nuevo botón -->
                    </div>
                    <div id="formulario-gestion" class="formulario"></div>
                </div>
            `;
    
            // Delegación de eventos para los botones
            document
                .getElementById('gestion-options')
                .addEventListener('click', e => {
                    const formType = e.target.dataset.form;
                    if (formType) mostrarFormulario(formType);
                });
    
            // Seleccionar automáticamente "Agregar Platillo"
            mostrarFormulario('agregar-plato');
            mostrarCategorias();
            mostrarChefs();
        } else if (opcion === 'campanas') {
            mostrarCampanas();
        } else if (opcion === 'platos') {
            // Inyectar el título, recuadros de categorías y contenedor de tarjetas
            contenido.innerHTML = `
                <h1>Platos</h1>
                <div id="categorias-recuadros" class="categorias-recuadros"></div>
                <section id="contenedor-platillos" class="platillos-section"></section>
            `;
            mostrarPlatillos();
        } else if (opcion === 'reservas') {
            mostrarReservas();
        } else if (opcion === 'cerrarSesion') {
            cerrarSesion();
        } else {
            contenido.innerHTML = `<h1>Bienvenido</h1><p>Selecciona una opción.</p>`;
        }
    }

    // Función para inyectar formularios
    function mostrarFormulario(tipo) {
        const cont = document.getElementById('formulario-gestion');
        if (!cont) return console.error('No existe #formulario-gestion');
        cont.innerHTML = ''; // Limpio el contenedor

        if (tipo === 'agregar-plato') {
            cont.innerHTML = `
                <h3>Agregar Platillo</h3>
                <form id="form-plato">
                    <input type="text" id="nombre" placeholder="Nombre del plato" required />
                    <input type="text" id="subtitulo" placeholder="Subtítulo del plato" required />
                    <textarea id="descripcion" placeholder="Descripción del plato" required></textarea>
                    <input type="number" id="precio" placeholder="Precio" step="0.01" required />
                    
                    <h4>Información Nutricional</h4>
                    <div class="info-nutricional">
                        <input type="number" id="kcal" placeholder="Calorías (kcal)" step="0.01" required />
                        <input type="number" id="carbs" placeholder="Carbohidratos (g)" step="0.01" required />
                        <input type="number" id="protein" placeholder="Proteínas (g)" step="0.01" required />
                        <input type="number" id="fibra" placeholder="Fibra (g)" step="0.01" required />
                    </div>

                    <select id="categoriaSelect"><option value="">Selecciona categoría</option></select>
                    <select id="chefSelect"><option value="">Selecciona chef</option></select>
                    <input type="file" id="imagen" accept="image/*" required />
                    <button type="submit">Guardar plato</button>
                </form>
            `;
            document.getElementById('form-plato').addEventListener('submit', agregarPlatillo);
            cargarCategoriasYChefs();

        } else if (tipo === 'agregar-chef') {
            cont.innerHTML = `
                <h3>Agregar Chef</h3>
                <form id="form-chef">
                    <input type="text" id="nombreChef" placeholder="Nombre del chef" required />
                    <input type="text" id="especialidadChef" placeholder="Especialidad del chef" required /> <!-- Cambiado de descripción a especialidad -->
                    <input type="file" id="imagenChef" accept="image/*" required />
                    <button type="submit">Guardar chef</button>
                </form>
                <div id="contenedor-chefs" class="contenedor-chefs">
                    <!-- Aquí se generarán dinámicamente las tarjetas de los chefs -->
                </div>
            `;
            document.getElementById('form-chef').addEventListener('submit', agregarChef);
            mostrarChefs(); // Llamar a la función para mostrar las tarjetas de los chefs
        } else if (tipo === 'agregar-categoria') {
            cont.innerHTML = `
                <h3>Agregar Categoría</h3>
                <form id="form-categoria">
                    <input type="text" id="nombreCategoria" placeholder="Nombre categoría" required />
                    <button type="button" id="seleccionarIconoBtn">Seleccionar Ícono</button>
                    <input type="hidden" id="iconoSeleccionado" required />
                    <div id="iconoPreview" style="margin-top: 10px;"></div>
                    <button type="submit">Guardar categoría</button>
                </form>
                <div id="contenedor-categorias" class="contenedor-categorias">
                    <!-- Aquí se generarán dinámicamente las tarjetas de las categorías -->
                </div>
                <div id="iconoModal" class="modal">
                    <div class="modal-content">
                        <span id="cerrarModal" class="close-button">&times;</span>
                        <h3>Seleccionar Ícono</h3>
                        <div id="iconosContainer" class="iconos-container"></div>
                    </div>
                </div>
            `;
            document.getElementById('form-categoria').addEventListener('submit', agregarCategoria);
            mostrarCategorias(); // Mostrar las categorías al cargar la sección

            // Lógica para manejar la selección de íconos
            const iconos = Array.from({ length: 16 }, (_, i) => `icono (${i + 1}).png`);
            const iconoModal = document.getElementById('iconoModal');
            const iconosContainer = document.getElementById('iconosContainer');
            const seleccionarIconoBtn = document.getElementById('seleccionarIconoBtn');
            const cerrarModal = document.getElementById('cerrarModal');
            const iconoSeleccionado = document.getElementById('iconoSeleccionado');
            const iconoPreview = document.getElementById('iconoPreview');

            // Verificar que los elementos del DOM existen
            if (!iconoModal || !iconosContainer || !seleccionarIconoBtn || !cerrarModal || !iconoSeleccionado || !iconoPreview) {
                console.error("Error: Algunos elementos del DOM no se encontraron.");
                return;
            }

            // Mostrar los íconos en el modal
            iconosContainer.innerHTML = ""; // Limpiar el contenedor antes de agregar íconos
            iconos.forEach(icono => {
                const img = document.createElement('img');
                img.src = `/Backend/src/dashboard/categorias/${icono}`; // Asegúrate de que la ruta sea correcta y accesible desde el servidor
                img.alt = icono;
                img.classList.add('icono-img');
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    iconoSeleccionado.value = icono;
                    iconoPreview.innerHTML = `<img src="/Backend/src/dashboard/categorias/${icono}" alt="${icono}" style="width: 50px; height: 50px;" />`;
                    iconoModal.style.display = 'none';
                });
                iconosContainer.appendChild(img);
            });

            // Abrir el modal
            seleccionarIconoBtn.addEventListener('click', () => {
                iconoModal.style.display = 'block';
            });

            // Cerrar el modal
            cerrarModal.addEventListener('click', () => {
                iconoModal.style.display = 'none';
            });

            // Cerrar el modal al hacer clic fuera del contenido
            window.addEventListener('click', (event) => {
                if (event.target === iconoModal) {
                    iconoModal.style.display = 'none';
                }
            });
        } else if (tipo === 'agregar-wallpaper') {
            cont.innerHTML = `
                <h3>Agregar Wallpaper</h3>
                <form id="form-wallpaper">
                    <label for="wallpaperFile">Seleccionar Wallpaper:</label>
                    <input type="file" id="wallpaperFile" accept="image/*" required>
                    <button type="submit">Guardar</button>
                </form>
                <div id="contenedor-wallpapers" class="contenedor-wallpapers">
                    <!-- Aquí se generarán dinámicamente las tarjetas de los wallpapers -->
                </div>
            `;
            document.getElementById('form-wallpaper').addEventListener('submit', agregarWallpaper);
            mostrarWallpapers(); // Llamar a la función para mostrar las tarjetas de los wallpapers
        } else if (tipo === 'agregar-video') {
            cont.innerHTML = `
                <h3>Agregar Video de Presentación</h3>
                <form id="form-video">
                    <label for="videoFile">Seleccionar Video:</label>
                    <input type="file" id="videoFile" accept="video/*" required>
                    <label for="chefSelect">Seleccionar Chef:</label>
                    <select id="chefSelect" required>
                        <option value="">Selecciona un chef</option>
                    </select>
                    <button type="submit">Guardar</button>
                </form>
                <div id="contenedor-videos" class="contenedor-videos">
                    <!-- Aquí se generarán dinámicamente las tarjetas de los videos -->
                </div>
            `;
            cargarChefs(); // Llenar el selector de chefs
            document.getElementById('form-video').addEventListener('submit', agregarVideo);
            mostrarVideos(); // Mostrar las tarjetas de los videos
        } else if (tipo === 'agregar-redes') {
            cont.innerHTML = `
                <h3>Configurar Redes Sociales</h3>
                <form id="form-redes">
                    <label for="instagram">Instagram:</label>
                    <input type="url" id="instagram" placeholder="https://instagram.com/tu-perfil" required>
                    
                    <label for="googleMaps">Google Maps:</label>
                    <input type="url" id="googleMaps" placeholder="https://maps.google.com/tu-ubicacion" required>
                    
                    <label for="redSocial">Otra Red Social:</label>
                    <input type="url" id="redSocial" placeholder="https://redsocial.com/tu-perfil" required>
                    
                    <button type="submit">Guardar</button>
                </form>
                <div id="contenedor-redes" class="contenedor-redes">
                    <!-- Aquí se mostrarán las redes sociales configuradas -->
                </div>
            `;
            document.getElementById('form-redes').addEventListener('submit', guardarRedesSociales);
            mostrarRedesSociales(); // Mostrar las redes sociales configuradas
        } else if (tipo === 'generar-qr-menu') {
            cont.innerHTML = `
                <h3>Generar QR del Menú</h3>
                <button onclick="generarQRMenu()">Generar QR</button>
                <div id="qrCodeContainer" style="margin-top: 20px;"></div>
                <div id="linkContainer" style="margin-top: 20px;"></div>
            `;
            generarLinkMenu();
        }
    }

    // Asignar listener al menú
    Object.entries(botonesMenu).forEach(([key, btn]) => {
        btn.addEventListener('click', () => mostrarContenido(key));
    });

    // Arrancamos en "Gestión"
    mostrarContenido('gestion');
    botonesMenu.reservas.addEventListener('click', () => mostrarReservas());
    mostrarChefs();
});

/**********************************************************************
 * FUNCIONES PARA GUARDAR DATOS EN FIRESTORE Y SUBIR IMÁGENES A CLOUDINARY
 **********************************************************************/
// Funciones para agregar platillos, chefs y categorías
async function agregarPlatillo(event) {
    event.preventDefault();
    // Verificar si el usuario está autenticado
    if (!auth.currentUser) {
        alert("Debes iniciar sesión para realizar esta acción.");
        return;
    }
    const nombre = document.getElementById('nombre').value;
    const subtitulo = document.getElementById('subtitulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoriaSelect').value;
    const chefId = document.getElementById('chefSelect').value; // Capturar el ID del chef seleccionado
    const archivoImagen = document.getElementById('imagen').files[0];

    // Capturar los valores de la información nutricional
    const kcal = parseFloat(document.getElementById('kcal').value);
    const carbs = parseFloat(document.getElementById('carbs').value);
    const protein = parseFloat(document.getElementById('protein').value);
    const fibra = parseFloat(document.getElementById('fibra').value);

    if (!nombre || !subtitulo || !descripcion || !precio || !categoria || !chefId || !archivoImagen) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const formData = new FormData();
    formData.append("file", archivoImagen);
    formData.append("upload_preset", uploadPreset);

    try {
        // Subir la imagen a Cloudinary
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        if (!data.secure_url) {
            throw new Error("Error al subir la imagen del plato.");
        }

        // Crear el objeto del nuevo platillo
        const nuevoPlatillo = {
            nombre,
            subtitulo,
            descripcion,
            precio,
            categoria,
            chefId, // Asociar el platillo al chef seleccionado
            imagen: data.secure_url,
            infoNutricional: {
                kcal,
                carbs,
                protein,
                fibra,
            },
            fecha: new Date(),
            usuarioId: auth.currentUser.uid, // Asociar el platillo al usuario actual
        };

        // Guardar el platillo en Firestore
        const platosRef = collection(db, 'platos');
        await addDoc(platosRef, nuevoPlatillo);

        alert("Platillo agregado correctamente");
        document.getElementById('form-plato').reset();
    } catch (error) {
        console.error("Error al agregar el platillo:", error);
        alert("Error al agregar el platillo");
    }
}

async function agregarChef(event) {
    event.preventDefault();
    // Verificar si el usuario está autenticado
    if (!auth.currentUser) {
        alert("Debes iniciar sesión para realizar esta acción.");
        return;
    }
    const nombre = document.getElementById('nombreChef').value;
    const especialidad = document.getElementById('especialidadChef').value;
    const archivoImagen = document.getElementById('imagenChef').files[0];

    if (!archivoImagen) {
        alert("Por favor, selecciona una imagen.");
        return;
    }

    const formData = new FormData();
    formData.append("file", archivoImagen);
    formData.append("upload_preset", uploadPreset);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        if (!data.secure_url) throw new Error("Error en la subida de imagen");

        const nuevoChef = {
            nombre,
            especialidad,
            imagen: data.secure_url,
            usuarioId: auth.currentUser.uid, // Asociar el chef al usuario actual
            fecha: new Date()
        };
        await addDoc(collection(db, "chefs"), nuevoChef);

        alert("Chef agregado correctamente");
        document.getElementById('form-chef').reset();
        mostrarChefs(); // Actualizar la lista de chefs
    } catch (error) {
        console.error("Error al agregar el chef:", error);
        alert("Error al agregar el chef");
    }
}

async function agregarCategoria(event) {
    event.preventDefault();
    // Verificar si el usuario está autenticado
    if (!auth.currentUser) {
        alert("Debes iniciar sesión para realizar esta acción.");
        return;
    }
    const nombreCategoria = document.getElementById("nombreCategoria").value.trim();
    const iconoSeleccionado = document.getElementById("iconoSeleccionado").value;

    if (!nombreCategoria || !iconoSeleccionado) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const nuevaCategoria = {
            nombre: nombreCategoria,
            icono: iconoSeleccionado,
            usuarioId: auth.currentUser.uid, // Asociar el platillo al usuario actual
            fecha: new Date()
        };
        await addDoc(collection(db, "categorias"), nuevaCategoria);

        alert("Categoría agregada correctamente.");
        document.getElementById("form-categoria").reset();
    } catch (error) {
        console.error("Error al agregar la categoría:", error);
        alert("Error al agregar la categoría.");
    }
}

async function guardarFotoChef(fotoURL) {
    try {
        const configuracionRef = collection(db, 'configuracion');
        await addDoc(configuracionRef, { fotoChef: fotoURL });
        alert("Foto del chef guardada correctamente.");
    } catch (error) {
        console.error("Error al guardar la foto del chef:", error);
    }
}

async function guardarVideoSlider(videoURL) {
    try {
        const configuracionRef = collection(db, 'configuracion');
        await addDoc(configuracionRef, { videoSlider: videoURL });
        console.log("Video guardado en Firestore:", videoURL);
    } catch (error) {
        console.error("Error al guardar el video en Firestore:", error);
    }
}

async function subirVideoSlider(event) {
    event.preventDefault();
    // Verificar si el usuario está autenticado
    if (!auth.currentUser) {
        alert("Debes iniciar sesión para realizar esta acción.");
        return;
    }
    const archivoVideo = document.getElementById('videoSlider').files[0];
    if (!archivoVideo) {
        alert("Por favor, selecciona un video.");
        return;
    }

    const formData = new FormData();
    formData.append("file", archivoVideo);
    formData.append("upload_preset", uploadPreset);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        if (!data.secure_url) throw new Error("Error en la subida del video");

        // Guardar la URL del video en Firestore
        await guardarVideoSlider(data.secure_url);
        alert("Video subido y guardado correctamente.");
    } catch (error) {
        console.error("Error al subir el video:", error);
        alert("Error al subir el video.");
    }
            if (configuracion.videoSlider) {
                videoSource.src = configuracion.videoSlider;
                videoSource.parentElement.load(); // Recargar el video
            }
        }
try {
    // Add the necessary code for the try block here
} catch (error) {
    console.error("Error al cargar el video del slider:", error);
}

/**********************************************************************
 * FUNCIONES PARA MOSTRAR Y ELIMINAR DATOS
 **********************************************************************/
// Mostrar y eliminar platillos
async function mostrarPlatillos() {
    const contenedor = document.getElementById("contenedor-platillos");
    const categoriasRecuadros = document.getElementById("categorias-recuadros");
    if (!contenedor || !categoriasRecuadros) return;

    try {
        const platosRef = collection(db, "platos");
        if (!auth.currentUser) {
            console.error("Usuario no autenticado.");
            return;
        }
        const q = query(platosRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        // Mostrar categorías en la parte superior
        const categorias = new Set();
        snapshot.forEach((doc) => {
            const plato = doc.data();
            categorias.add(plato.categoria);
        });

        categoriasRecuadros.innerHTML = ""; // Limpiar las categorías

        // Agregar botón para mostrar todos los platos
        const todosDiv = document.createElement("div");
        todosDiv.classList.add("categorias-recuadro");
        todosDiv.innerHTML = `<span>Todos</span>`;
        todosDiv.addEventListener("click", () => filtrarPorCategoria("Todos"));
        categoriasRecuadros.appendChild(todosDiv);

        // Agregar las categorías dinámicamente
        categorias.forEach((categoria) => {
            const div = document.createElement("div");
            div.classList.add("categorias-recuadro");
            div.innerHTML = `<span>${categoria}</span>`;
            div.addEventListener("click", () => filtrarPorCategoria(categoria));
            categoriasRecuadros.appendChild(div);
        });

        // Mostrar los platillos
        contenedor.innerHTML = ""; // Limpiar el contenedor antes de agregar contenido
        snapshot.forEach((doc) => {
            const plato = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-plato");
            div.dataset.categoria = plato.categoria; // Agregar la categoría como atributo para filtrar
            div.innerHTML = `
                <img src="${plato.imagen}" alt="${plato.nombre}" class="imagen-plato">
                <h3>${plato.nombre}</h3>
                <p>${plato.subtitulo}</p>
                <p class="precio">$${plato.precio}</p>
                <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
            `;
            contenedor.appendChild(div);
        });

        // Asignar eventos a los botones de eliminación
        const botonesEliminar = document.querySelectorAll(".eliminar-btn");
        botonesEliminar.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const platoId = e.target.dataset.id; // Obtener el ID del plato
                eliminarPlatillo(platoId); // Llamar a la función para eliminar el plato
            });
        });
    } catch (error) {
        console.error("Error al mostrar los platillos:", error);
    }
}

// Función para filtrar por categoría
function filtrarPorCategoria(categoria) {
    const tarjetas = document.querySelectorAll(".tarjeta-plato");
    tarjetas.forEach((tarjeta) => {
        if (categoria === "Todos") {
            tarjeta.style.display = "block"; // Mostrar todos los platos
        } else {
            const tarjetaCategoria = tarjeta.dataset.categoria;
            tarjeta.style.display = tarjetaCategoria === categoria ? "block" : "none";
        }
    });
}

async function eliminarPlatillo(id) {
    try {
        const platilloRef = doc(db, "platos", id); // Referencia al documento del plato
        await deleteDoc(platilloRef); // Eliminar el documento
        alert("Platillo eliminado correctamente");
        mostrarPlatillos(); // Actualizar la lista de platillos
    } catch (error) {
        console.error("Error al eliminar el platillo:", error);
        alert("Error al eliminar el platillo");
    }
}

// Mostrar y eliminar categorías
async function mostrarCategorias() {
    const contenedor = document.getElementById("contenedor-categorias");
    if (!contenedor) return;

    try {
        const categoriasRef = collection(db, "categorias");
        const q = query(categoriasRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        contenedor.innerHTML = ""; // Limpiar el contenedor
        snapshot.forEach((doc) => {
            const categoria = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-categoria");
            div.innerHTML = `
                <h3>${categoria.nombre}</h3>
                <img src="/Backend/src/dashboard/categorias/${categoria.icono}" alt="${categoria.nombre}" class="icono-categoria" />
                <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
            `;
            contenedor.appendChild(div);
        });

        // Asignar eventos a los botones de eliminación
        const botonesEliminar = document.querySelectorAll(".tarjeta-categoria .eliminar-btn");
        botonesEliminar.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const categoriaId = e.target.dataset.id; // Obtener el ID de la categoría
                eliminarCategoria(categoriaId); // Llamar a la función para eliminar la categoría
            });
        });
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
    }
}

async function eliminarCategoria(id) {
    try {
        // Obtener la categoría a eliminar
        const categoriaRef = doc(db, "categorias", id);
        const categoriaSnapshot = await getDoc(categoriaRef);

        if (!categoriaSnapshot.exists()) {
            alert("La categoría no existe.");
            return;
        }

        const categoria = categoriaSnapshot.data().nombre;

        // Eliminar todos los platos asociados a la categoría
        const platosRef = collection(db, "platos");
        const q = query(platosRef, where("categoria", "==", categoria), where("usuarioId", "==", auth.currentUser.uid));
        const platosSnapshot = await getDocs(q);

        const batch = writeBatch(db); // Usar un batch para eliminar múltiples documentos
        platosSnapshot.forEach((doc) => {
            batch.delete(doc.ref); // Agregar la eliminación del plato al batch
        });

        await batch.commit(); // Ejecutar todas las eliminaciones en el batch

        // Eliminar la categoría
        await deleteDoc(categoriaRef);

        alert("Categoría y sus platos asociados eliminados correctamente.");
        mostrarCategorias(); // Actualizar la lista de categorías
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        alert("Error al eliminar la categoría.");
    }
}

// Mostrar y eliminar chefs
async function mostrarChefs() {
    const contenedor = document.getElementById("contenedor-chefs");
    if (!contenedor) return;

    try {
        const chefsRef = collection(db, "chefs");
        const q = query(chefsRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        contenedor.innerHTML = ""; // Limpiar el contenedor
        snapshot.forEach((doc) => {
            const chef = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-chef");
            div.innerHTML = `
                <img src="${chef.imagen}" alt="${chef.nombre}" class="imagen-chef" />
                <h3>${chef.nombre}</h3>
                <p>Especialidad: ${chef.especialidad}</p>
                <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error al obtener los chefs:", error);
    }
}

async function eliminarChef(id) {
    try {
        const chefRef = doc(db, "chefs", id);
        await deleteDoc(chefRef);
        alert("Chef eliminado correctamente");
        mostrarChefs(); // Actualizar la lista de chefs
    } catch (error) {
        console.error("Error al eliminar el chef:", error);
        alert("Error al eliminar el chef");
    }
}

/**********************************************************************
 * FUNCIONES AUXILIARES
 **********************************************************************/
async function cargarCategoriasYChefs() {
    const categoriaSelect = document.getElementById('categoriaSelect');
    const chefSelect = document.getElementById('chefSelect');


    try {
        // Cargar categorías
        const categoriasRef = collection(db, 'categorias');
        const qCategorias = query(categoriasRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const categoriasSnapshot = await getDocs(qCategorias);

        categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>'; // Limpiar opciones existentes
        categoriasSnapshot.forEach(doc => {
            const categoria = doc.data();
            categoriaSelect.innerHTML += `<option value="${categoria.nombre}">${categoria.nombre}</option>`;
        });

        // Cargar chefs
        if (!chefSelect) {
            console.error("El elemento 'chefSelect' no existe en el DOM.");
            return;
        }

        const chefsRef = collection(db, 'chefs');
        const qChefs = query(chefsRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const chefsSnapshot = await getDocs(qChefs);

        chefSelect.innerHTML = '<option value="">Selecciona un chef</option>'; // Limpiar opciones existentes
        chefsSnapshot.forEach(doc => {
            const chef = doc.data();
            chefSelect.innerHTML += `<option value="${doc.id}">${chef.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar categorías o chefs:", error);
    }
}

// Cerrar sesión
async function cerrarSesion() {
    try {
        await signOut(auth);
        alert("Sesión cerrada correctamente");
        // Redirigir al usuario a la página de inicio de sesión
        window.location.href = "/Frontend/pages/login.html"; // Cambia "/login.html" por la ruta de tu página de inicio de sesión
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error al cerrar sesión");
    }
}

const cerrarSesionBtn = document.getElementById('cerrarSesionBtn');
if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener('click', cerrarSesion);
} else {
    console.error("El botón 'cerrarSesionBtn' no existe en el DOM.");
}

document.getElementById('form-categoria').addEventListener('submit', agregarCategoria);
seleccionarIconoBtn.addEventListener('click', () => {
    iconoModal.style.display = 'block';
});

const seleccionarIconoBtn = document.getElementById('seleccionarIconoBtn');
if (seleccionarIconoBtn) {
    seleccionarIconoBtn.addEventListener('click', () => {
        iconoModal.style.display = 'block';
    });
} else {
    console.error("El botón 'seleccionarIconoBtn' no existe en el DOM.");
}

// Función para mostrar los platos disponibles para la campaña
async function mostrarPlatosParaCampana() {
    const contenedor = document.getElementById('contenedor-campanas');
    if (!contenedor) return;

    try {
        const platosRef = collection(db, 'platos');
        const q = query(platosRef, where('usuarioId', '==', auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        contenedor.innerHTML = ''; // Limpiar el contenedor antes de agregar contenido
        snapshot.forEach((doc) => {
            const plato = doc.data();
            const div = document.createElement('div');
            div.classList.add('tarjeta-plato');
            div.innerHTML = `
                <input type="checkbox" id="plato-${doc.id}" data-id="${doc.id}" />
                <label for="plato-${doc.id}">
                    <img src="${plato.imagen}" alt="${plato.nombre}" class="imagen-plato" />
                    <h3>${plato.nombre}</h3>
                    <p>${plato.subtitulo}</p> <!-- Mostrar el subtítulo en lugar de la descripción -->
                    <p>Precio: $${plato.precio}</p>
                </label>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error('Error al obtener los platos:', error);
        alert('Error al cargar los platos.');
    }
}

// Función para guardar la campaña
async function guardarCampana() {
    const checkboxes = document.querySelectorAll('#contenedor-campanas input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor, selecciona al menos un plato para la campaña.');
        return;
    }

    const platosSeleccionados = Array.from(checkboxes).map((checkbox) => checkbox.dataset.id);

    try {
        const nuevaCampana = {
            platos: platosSeleccionados,
            fecha: new Date(),
            usuarioId: auth.currentUser.uid, // Asociar la campaña al usuario actual
        };

        const campanasRef = collection(db, 'campañas');
        await addDoc(campanasRef, nuevaCampana);

        alert('Campaña guardada correctamente.');
        mostrarCampanasExistentes(); // Actualizar la lista de campañas
    } catch (error) {
        console.error('Error al guardar la campaña:', error);
        alert('Error al guardar la campaña.');
    }
}

/**********************************************************************
 * SISTEMA DE RESERVAS
 **********************************************************************/

// Mostrar la sección de reservas
function mostrarReservas() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = `
        <h1>Reservas</h1>
        <form id="form-reserva">
            <input type="text" id="nombreReserva" placeholder="Nombre del cliente" required />
            <input type="date" id="fechaReserva" required />
            <input type="time" id="horaReserva" required />
            <input type="number" id="personasReserva" placeholder="Número de personas" required />
            <textarea id="notasReserva" placeholder="Notas adicionales"></textarea>
            <button type="submit">Guardar Reserva</button>
        </form>
        <h2>Lista de Reservas</h2>
        <div id="lista-reservas" class="lista-reservas"></div>
    `;

    // Manejar el envío del formulario de reserva
    document.getElementById('form-reserva').addEventListener('submit', guardarReserva);

    // Mostrar las reservas existentes
    cargarReservas();
}

// Guardar una nueva reserva en Firestore
async function guardarReserva(event) {
    event.preventDefault();
    // Verificar si el usuario está autenticado
    if (!auth.currentUser) {
        alert("Debes iniciar sesión para realizar esta acción.");
        return;
    }
    const nombre = document.getElementById('nombreReserva').value;
    const fecha = document.getElementById('fechaReserva').value;
    const hora = document.getElementById('horaReserva').value;
    const personas = parseInt(document.getElementById('personasReserva').value, 10);
    const notas = document.getElementById('notasReserva').value;

    if (!nombre || !fecha || !hora || !personas) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    try {
        const nuevaReserva = {
            nombre,
            fecha,
            hora,
            personas,
            notas,
            fechaCreacion: new Date(),
            usuarioId: auth.currentUser.uid, // Asociar el platillo al usuario actual
        };

        const reservasRef = collection(db, 'reservas');
        await addDoc(reservasRef, nuevaReserva);

        alert('Reserva guardada correctamente.');
        document.getElementById('form-reserva').reset();
        cargarReservas(); // Actualizar la lista de reservas
    } catch (error) {
        console.error('Error al guardar la reserva:', error);
        alert('Error al guardar la reserva.');
    }
}

// Cargar y mostrar las reservas existentes
async function cargarReservas() {
    const listaReservas = document.getElementById("lista-reservas");
    if (!listaReservas) return;

    try {
        const reservasRef = collection(db, "reservas");
        const q = query(reservasRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        listaReservas.innerHTML = ""; // Limpiar la lista
        snapshot.forEach((doc) => {
            const reserva = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-reserva");
            div.innerHTML = `
                <h3>${reserva.nombre}</h3>
                <p>Fecha: ${reserva.fecha}</p>
                <p>Hora: ${reserva.hora}</p>
                <p>Personas: ${reserva.personas}</p>
                <p>Notas: ${reserva.notas || 'Sin notas adicionales'}</p>
                <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
            `;
            listaReservas.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar las reservas:", error);
    }
}

// Eliminar una reserva específica
async function eliminarReserva(id) {
    try {
        const reservaRef = doc(db, 'reservas', id);
        await deleteDoc(reservaRef);
        alert('Reserva eliminada correctamente.');
        cargarReservas(); // Actualizar la lista de reservas
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        alert('Error al eliminar la reserva.');
    }
}

async function agregarVideo(event) {
    event.preventDefault();
    // Verificar si el usuario está autenticado
    if (!auth.currentUser) {
        alert("Debes iniciar sesión para realizar esta acción.");
        return;
    }
    const archivoVideo = document.getElementById('videoFile').files[0];
    const chefId = document.getElementById('chefSelect').value;

    if (!archivoVideo || !chefId) {
        alert("Por favor, selecciona un video y un chef.");
        return;
    }

    const formData = new FormData();
    formData.append("file", archivoVideo);
    formData.append("upload_preset", uploadPreset);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        if (!data.secure_url) throw new Error("Error en la subida del video");

        const nuevoVideo = {
            url: data.secure_url,
            chefId,
            usuarioId: auth.currentUser.uid, // Asociar el video al usuario actual
            fecha: new Date()
        };

        const videosRef = collection(db, 'videos');
        await addDoc(videosRef, nuevoVideo);

        alert("Video agregado correctamente");
        document.getElementById('form-video').reset();
        mostrarVideos(); // Actualizar la lista de videos
    } catch (error) {
        console.error("Error al agregar el video:", error);
        alert("Error al agregar el video");
    }
}

async function mostrarVideos() {
    const contenedor = document.getElementById("contenedor-videos");
    if (!contenedor) return;

    try {
        const videosRef = collection(db, "videos");
        const q = query(videosRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        contenedor.innerHTML = ""; // Limpiar el contenedor antes de agregar contenido
        snapshot.forEach((doc) => {
            const video = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-video");
            div.innerHTML = `
                <video src="${video.url}" controls class="video-preview"></video>
                <button class="seleccionar-btn" data-id="${doc.id}" ${video.seleccionado ? "disabled" : ""}>
                    ${video.seleccionado ? "Seleccionado" : "Seleccionar"}
                </button>
                <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
            `;
            contenedor.appendChild(div);
        });

        // Asignar eventos a los botones de selección y eliminación
        const botonesSeleccionar = document.querySelectorAll(".tarjeta-video .seleccionar-btn");
        const botonesEliminar = document.querySelectorAll(".tarjeta-video .eliminar-btn");

        botonesSeleccionar.forEach((btn) => {
            btn.addEventListener("click", (e) => seleccionarVideo(e.target.dataset.id));
        });

        botonesEliminar.forEach((btn) => {
            btn.addEventListener("click", (e) => eliminarVideo(e.target.dataset.id));
        });
    } catch (error) {
        console.error("Error al obtener los videos:", error);
    }
}

async function eliminarVideo(id) {
    try {
        const videoRef = doc(db, "videos", id);
        await deleteDoc(videoRef);
        alert("Video eliminado correctamente");
        mostrarVideos(); // Actualizar la lista de videos
    } catch (error) {
        console.error("Error al eliminar el video:", error);
        alert("Error al eliminar el video");
    }
}

async function seleccionarVideo(id) {
    try {
        const videosRef = collection(db, "videos");
        const q = query(videosRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        // Desmarcar todos los videos del usuario actual
        snapshot.forEach(async (doc) => {
            const videoRef = doc.ref;
            await updateDoc(videoRef, { seleccionado: false });
        });

        // Marcar el video seleccionado
        const videoRef = doc(db, "videos", id);
        await updateDoc(videoRef, { seleccionado: true });

        alert("Video seleccionado correctamente");
        mostrarVideos(); // Actualizar la lista de videos en el dashboard
    } catch (error) {
        console.error("Error al seleccionar el video:", error);
        alert("Error al seleccionar el video");
    }
}

async function agregarWallpaper(event) {
    event.preventDefault();
    // Verificar si el usuario está autenticado
    if (!auth.currentUser) {
        alert("Debes iniciar sesión para realizar esta acción.");
        return;
    }
    const archivoWallpaper = document.getElementById('wallpaperFile').files[0];
    if (!archivoWallpaper) {
        alert("Por favor, selecciona un wallpaper.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("file", archivoWallpaper);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        if (!data.secure_url || !data.public_id) {
            throw new Error("Error en la subida del wallpaper");
        }

        // Guardar el nuevo wallpaper en Firestore
        const nuevoWallpaper = {
            url: data.secure_url,
            public_id: data.public_id, // Guardar el public_id
            fecha: new Date(),
            usuarioId: auth.currentUser.uid,
            seleccionado: true,
        };
        const wallpapersRef = collection(db, 'wallpapers');
        await addDoc(wallpapersRef, nuevoWallpaper);

        alert("Wallpaper agregado y seleccionado correctamente");
        document.getElementById('form-wallpaper').reset();
        mostrarWallpapers(); // Actualizar la lista de wallpapers
    } catch (error) {
        console.error("Error al agregar el wallpaper:", error);
        alert("Error al agregar el wallpaper");
    }
}

async function mostrarWallpapers() {
    const contenedor = document.getElementById("contenedor-wallpapers");
    if (!contenedor) return;

    try {
        const wallpapersRef = collection(db, "wallpapers");
        const q = query(wallpapersRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        contenedor.innerHTML = ""; // Limpiar el contenedor antes de agregar contenido
        snapshot.forEach((doc) => {
            const wallpaper = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-wallpaper");
            div.innerHTML = `
                <img src="${wallpaper.url}" alt="Wallpaper" class="wallpaper-preview" />
                <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
            `;
            contenedor.appendChild(div);
        });

        // Asignar eventos a los botones de eliminación
        const botonesEliminar = document.querySelectorAll(".tarjeta-wallpaper .eliminar-btn");
        botonesEliminar.forEach((btn) => {
            btn.addEventListener("click", (e) => eliminarWallpaper(e.target.dataset.id));
        });
    } catch (error) {
        console.error("Error al obtener los wallpapers:", error);
    }
}

async function seleccionarWallpaper(id) {
    try {
        const wallpapersRef = collection(db, "wallpapers");
        const snapshot = await getDocs(wallpapersRef);

        // Desmarcar todos los wallpapers
        snapshot.forEach(async (doc) => {
            const wallpaperRef = doc.ref;
            await updateDoc(wallpaperRef, { seleccionado: false });
        });

        // Marcar el wallpaper seleccionado
        const wallpaperRef = doc(db, "wallpapers", id);
        await updateDoc(wallpaperRef, { seleccionado: true });

        alert("Wallpaper seleccionado correctamente");
        cargarWallpaper(); // Actualizar el wallpaper mostrado
    } catch (error) {
        console.error("Error al seleccionar el wallpaper:", error);
        alert("Error al seleccionar el wallpaper");
    }
}

async function eliminarWallpaper(id) {
    try {
        // Obtener la referencia al documento del wallpaper
        const wallpaperRef = doc(db, "wallpapers", id);
        const wallpaperSnapshot = await getDoc(wallpaperRef);

        if (!wallpaperSnapshot.exists()) {
            alert("El wallpaper no existe.");
            return;
        }

        const wallpaper = wallpaperSnapshot.data();

        // Llamar a la función en la nube para eliminar el archivo de Cloudinary
        if (wallpaper.public_id) {
            const eliminarArchivo = httpsCallable(functions, "eliminarArchivoCloudinary");
            const result = await eliminarArchivo({ public_id: wallpaper.public_id });

            if (!result || result.result !== "ok") {
                console.error("Error al eliminar el archivo de Cloudinary:", result);
                alert("Error al eliminar el archivo de Cloudinary.");
                return;
            }
        }

        // Eliminar el documento de Firestore
        await deleteDoc(wallpaperRef);

        alert("Wallpaper eliminado correctamente");
        mostrarWallpapers(); // Actualizar la lista de wallpapers
    } catch (error) {
        console.error("Error al eliminar el wallpaper:", error);
        alert("Error al eliminar el wallpaper");
    }
}

async function cargarChefs() {
    const chefSelect = document.getElementById('chefSelect');
    if (!chefSelect) return;

    try {
        const chefsRef = collection(db, 'chefs');
        const q = query(chefsRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        chefSelect.innerHTML = '<option value="">Selecciona un chef</option>'; // Limpiar opciones existentes
        snapshot.forEach((doc) => {
            const chef = doc.data();
            chefSelect.innerHTML += `<option value="${doc.id}">${chef.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar los chefs:", error);
    }
}

async function mostrarCampanas() {
    const contenido = document.getElementById('contenido');
    contenido.innerHTML = `
        <h1>Campañas</h1>
        <h2>Campañas Existentes</h2>
        <div id="lista-campanas" class="lista-campanas"></div>
        <p>Selecciona los platos que deseas incluir en la campaña:</p>
        <div id="contenedor-campanas" class="campanas-container"></div>
        <button id="guardarCampanaBtn">Guardar Campaña</button>
    `;

    // Mostrar los platos disponibles
    mostrarPlatosParaCampana();

    // Manejar el guardado de la campaña
    document.getElementById('guardarCampanaBtn').addEventListener('click', guardarCampana);

    // Mostrar las campañas existentes
    mostrarCampanasExistentes();
}

async function mostrarCampanasExistentes() {
    const listaCampanas = document.getElementById('lista-campanas');
    if (!listaCampanas) return;

    try {
        const campanasRef = collection(db, 'campañas');
        const q = query(campanasRef, where('usuarioId', '==', auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        listaCampanas.innerHTML = ''; // Limpiar el contenedor antes de agregar contenido
        snapshot.forEach((doc) => {
            const campana = doc.data();
            const div = document.createElement('div');
            div.classList.add('tarjeta-campana');
            div.innerHTML = `
                <h3>Campaña del ${new Date(campana.fecha.toDate()).toLocaleDateString()}</h3>
                <ul>
                    ${campana.platos.map((platoId) => `<li>Plato ID: ${platoId}</li>`).join('')}
                </ul>
                <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
            `;
            listaCampanas.appendChild(div);
        });

        // Asignar eventos a los botones de eliminación
        const botonesEliminar = document.querySelectorAll('.tarjeta-campana .eliminar-btn');
        botonesEliminar.forEach((btn) => {
            btn.addEventListener('click', (e) => eliminarCampana(e.target.dataset.id));
        });
    } catch (error) {
        console.error('Error al mostrar las campañas existentes:', error);
    }
}

async function eliminarCampana(id) {
    try {
        const campanaRef = doc(db, 'campañas', id);
        await deleteDoc(campanaRef);
        alert('Campaña eliminada correctamente.');
        mostrarCampanasExistentes(); // Actualizar la lista de campañas
    } catch (error) {
        console.error('Error al eliminar la campaña:', error);
        alert('Error al eliminar la campaña.');
    }
}


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

        if (plato.infoNutricional) {
            document.getElementById("dish-kcal").innerHTML = `${plato.infoNutricional.kcal || 0}<br><span>Kcal</span>`;
            document.getElementById("dish-carbs").innerHTML = `${plato.infoNutricional.carbs || 0}<br><span>Carbs</span>`;
            document.getElementById("dish-protein").innerHTML = `${plato.infoNutricional.protein || 0}<br><span>Protein</span>`;
            document.getElementById("dish-fat").innerHTML = `${plato.infoNutricional.fibra || 0}<br><span>Fibra</span>`;
        }

        // Obtener la información del chef directamente del campo "chef"
        if (plato.chef) {
            const chef = plato.chef;

            // Actualizar la información del chef en la página
            document.getElementById("chef-image").src = chef.imagen || "/Backend/images/default-chef.jpg";
            document.getElementById("chef-name").textContent = chef.nombre || "Chef no disponible";
        } else {
            console.warn("El plato no tiene un chef relacionado.");
        }
    } catch (error) {
        console.error("Error al cargar los detalles del plato:", error);
    }
}

// Ejecutar la función al cargar la página
document.addEventListener("DOMContentLoaded", cargarDetallesPlato);

async function guardarRedesSociales(event) {
    event.preventDefault();
    // Verificar si el usuario está autenticado
    if (!auth.currentUser) {
        alert("Debes iniciar sesión para realizar esta acción.");
        return;
    }
    const instagram = document.getElementById('instagram').value.trim();
    const googleMaps = document.getElementById('googleMaps').value.trim();
    const redSocial = document.getElementById('redSocial').value.trim();

    if (!instagram || !googleMaps || !redSocial) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        // Verificar que el usuario esté autenticado
        if (!auth.currentUser) {
            throw new Error("Usuario no autenticado.");
        }

        const usuarioId = auth.currentUser.uid; // Obtener el UID del usuario actual
        const nuevasRedes = {
            instagram,
            googleMaps,
            redSocial,
            usuarioId, // Asociar las redes sociales al usuario actual
            fecha: new Date()
        };

        // Guardar las redes sociales en Firestore
        const redesRef = collection(db, "redesSociales");
        await addDoc(redesRef, nuevasRedes);

        alert("Redes sociales guardadas correctamente.");
        document.getElementById('form-redes').reset();
        mostrarRedesSociales(); // Actualizar la lista de redes sociales
    } catch (error) {
        console.error("Error al guardar las redes sociales:", error);
        alert("Error al guardar las redes sociales.");
    }
}

async function mostrarRedesSociales() {
    const contenedor = document.getElementById("contenedor-redes");
    if (!contenedor) return;

    try {
        const redesRef = collection(db, "redesSociales");
        const q = query(redesRef, where("usuarioId", "==", auth.currentUser.uid)); // Filtrar por usuarioId
        const snapshot = await getDocs(q);

        contenedor.innerHTML = ""; // Limpiar el contenedor antes de agregar contenido
        snapshot.forEach((doc) => {
            const red = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-red");
            div.innerHTML = `
                <p><strong>Instagram:</strong> <a href="${red.instagram}" target="_blank">${red.instagram}</a></p>
                <p><strong>Google Maps:</strong> <a href="${red.googleMaps}" target="_blank">${red.googleMaps}</a></p>
                <p><strong>Otra Red Social:</strong> <a href="${red.redSocial}" target="_blank">${red.redSocial}</a></p>
                <button class="eliminar-btn" data-id="${doc.id}">Eliminar</button>
            `;
            contenedor.appendChild(div);
        });

        // Asignar eventos a los botones de eliminación
        const botonesEliminar = document.querySelectorAll(".tarjeta-red .eliminar-btn");
        botonesEliminar.forEach((btn) => {
            btn.addEventListener("click", (e) => eliminarRedSocial(e.target.dataset.id));
        });
    } catch (error) {
        console.error("Error al mostrar las redes sociales:", error);
    }
}
async function eliminarRedSocial(id) {
    try {
        const redRef = doc(db, "redesSociales", id);
        await deleteDoc(redRef);
        alert("Red social eliminada correctamente.");
        mostrarRedesSociales(); // Actualizar la lista de redes sociales
    } catch (error) {
        console.error("Error al eliminar la red social:", error);
        alert("Error al eliminar la red social.");
    }
}

async function mostrarPlatos() {
    const contenedor = document.getElementById("contenedor-platillos");
    if (!contenedor) return;

    try {
        const platosRef = collection(db, "platos");
        const snapshot = await getDocs(platosRef); // Eliminamos el filtro por usuarioId

        contenedor.innerHTML = ""; // Limpiar el contenedor antes de agregar contenido
        snapshot.forEach((doc) => {
            const plato = doc.data();
            const div = document.createElement("div");
            div.classList.add("tarjeta-plato");
            div.innerHTML = `
                <img src="${plato.imagen}" alt="${plato.nombre}" class="imagen-plato">
                <h3>${plato.nombre}</h3>
                <p>${plato.descripcion}</p>
                <p class="precio">$${plato.precio}</p>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error al mostrar los platos:", error);
    }
}

async function generarQRMenu() {
    const usuarioId = auth.currentUser.uid; // Obtener el UID del usuario actual
    const menuUrl = `${window.location.origin}/Frontend/Menu/menu.html?uid=${usuarioId}`; // URL del menú con el UID del usuario

    const qrCodeContainer = document.getElementById("qrCodeContainer");
    if (!qrCodeContainer) {
        alert("No se encontró el contenedor para el QR.");
        return;
    }

    qrCodeContainer.innerHTML = ""; // Limpiar el contenedor antes de generar el QR

    // Generar el código QR
    const qrCode = new QRCode(qrCodeContainer, {
        text: menuUrl,
        width: 256,
        height: 256,
    });

    // Crear un contenedor para el enlace y el botón de copiar
    const linkContainer = document.createElement("div");
    linkContainer.style.marginTop = "20px";
    linkContainer.style.textAlign = "center";

    // Crear un campo de texto con el enlace
    const linkInput = document.createElement("input");
    linkInput.type = "text";
    linkInput.value = menuUrl;
    linkInput.readOnly = true;
    linkInput.style.width = "80%";
    linkInput.style.padding = "10px";
    linkInput.style.marginBottom = "10px";
    linkInput.style.border = "1px solid #ddd";
    linkInput.style.borderRadius = "5px";
    linkInput.style.textAlign = "center";

    // Crear un botón para copiar el enlace
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copiar enlace";
    copyButton.style.padding = "10px 15px";
    copyButton.style.backgroundColor = "#5B3CC4";
    copyButton.style.color = "#fff";
    copyButton.style.border = "none";
    copyButton.style.borderRadius = "5px";
    copyButton.style.cursor = "pointer";
    copyButton.style.marginLeft = "10px";

    // Agregar funcionalidad al botón de copiar
    copyButton.addEventListener("click", () => {
        linkInput.select();
        document.execCommand("copy");
        alert("Enlace copiado al portapapeles.");
    });

    // Agregar el campo de texto y el botón al contenedor
    linkContainer.appendChild(linkInput);
    linkContainer.appendChild(copyButton);

    // Agregar el contenedor del enlace al contenedor del QR
    qrCodeContainer.appendChild(linkContainer);

    // Botón para descargar el QR como PNG
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Guardar QR como PNG";
    downloadButton.style.marginTop = "10px";
    downloadButton.style.padding = "10px 15px";
    downloadButton.style.backgroundColor = "#5B3CC4";
    downloadButton.style.color = "#fff";
    downloadButton.style.border = "none";
    downloadButton.style.borderRadius = "5px";
    downloadButton.style.cursor = "pointer";

    downloadButton.addEventListener("click", () => {
        const qrCanvas = qrCodeContainer.querySelector("canvas");
        const qrImage = qrCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = qrImage;
        link.download = "menu-qr.png";
        link.click();
    });

    qrCodeContainer.appendChild(downloadButton);
}

async function generarLinkMenu() {
    const usuarioId = auth.currentUser.uid; // Obtener el UID del usuario actual
    const menuUrl = `${window.location.origin}/Frontend/Menu/menu.html?uid=${usuarioId}`; // URL del menú con el UID del usuario

    const linkContainer = document.getElementById("linkContainer");
    if (!linkContainer) {
        alert("No se encontró el contenedor para el enlace.");
        return;
    }

    linkContainer.innerHTML = ""; // Limpiar el contenedor antes de generar el enlace

    // Crear un campo de texto con el enlace
    const linkInput = document.createElement("input");
    linkInput.type = "text";
    linkInput.value = menuUrl;
    linkInput.readOnly = true;
    linkInput.style.width = "80%";
    linkInput.style.padding = "10px";
    linkInput.style.marginBottom = "10px";
    linkInput.style.border = "1px solid #ddd";
    linkInput.style.borderRadius = "5px";
    linkInput.style.textAlign = "center";

    // Crear un botón para copiar el enlace
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copiar enlace";
    copyButton.style.padding = "10px 15px";
    copyButton.style.backgroundColor = "#5B3CC4";
    copyButton.style.color = "#fff";
    copyButton.style.border = "none";
    copyButton.style.borderRadius = "5px";
    copyButton.style.cursor = "pointer";
    copyButton.style.marginLeft = "10px";

    // Agregar funcionalidad al botón de copiar
    copyButton.addEventListener("click", () => {
        linkInput.select();
        document.execCommand("copy");
        alert("Enlace copiado al portapapeles.");
    });

    // Agregar el campo de texto y el botón al contenedor
    linkContainer.appendChild(linkInput);
    linkContainer.appendChild(copyButton);
}

// Obtener el UID del usuario desde la URL
const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("uid");

if (!usuarioId) {
    alert("No se proporcionó un ID de usuario.");
    window.location.href = "/Frontend/pages/login.html"; // Redirigir al login si no hay UID
}

const admin = require("firebase-admin");
const cloudinary = require("cloudinary").v2;

admin.initializeApp();

cloudinary.config({
    cloud_name: "eschmerz",
    api_key: "488256748749724",
    api_secret: "xD3D7dn6fiE_0Btv9Uq-Q6BNqGk",
});

exports.eliminarArchivoCloudinary = functions.https.onCall(async (data) => {
    const { public_id } = data;

    if (!public_id) {
        throw new functions.https.HttpsError("invalid-argument", "El public_id es requerido.");
    }

    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return { result };
    } catch (error) {
        console.error("Error al eliminar el archivo de Cloudinary:", error);
        throw new functions.https.HttpsError("internal", "Error al eliminar el archivo de Cloudinary.");
    }
});


