// Catálogo completo de imágenes disponibles
const TODAS_LAS_IMAGENES = [
    'imagenes/arandano.png', 'imagenes/banana.png', 'imagenes/celular.png', 'imagenes/circulo.png',
    'imagenes/cuadrado.png', 'imagenes/durazno.png', 'imagenes/frambuesa.png', 'imagenes/frutilla.png',
    'imagenes/gato.png', 'imagenes/globos.png', 'imagenes/leon.png', 'imagenes/manzana.png',
    'imagenes/naranja.png', 'imagenes/oso.png', 'imagenes/pajaro.png', 'imagenes/pelotabasquet.png',
    'imagenes/pelotafutbol.png', 'imagenes/pelotaplaya.png', 'imagenes/pelotatenis.png', 'imagenes/perro.png',
    'imagenes/sandia.png', 'imagenes/tomate.png', 'imagenes/tortuga.png', 'imagenes/triangulo.png', 
    'imagenes/uva.png', 'imagenes/trebol.png', 'imagenes/diamante.png', 'imagenes/corazon.png',
    'imagenes/pica.png', 'imagenes/tucan.png'
];

// Configuración de niveles
const CONFIG_DIFICULTAD = {
    facil: { pares: 8, claseGrid: 'modo-facil', nombre: 'Fácil' },
    medio: { pares: 15, claseGrid: 'modo-medio', nombre: 'Medio' },
    dificil: { pares: 30, claseGrid: 'modo-dificil', nombre: 'Difícil' }
};

// Variables del estado de la partida
let tarjetasSeleccionadas = [];
let tarjetasBloqueadas = false;
let movimientos = 0;
let paresEncontrados = 0;
let totalPares = 15;
let tiempoSegundos = 0;
let timerInterval = null;
let juegoIniciado = false;
let timeoutVolteo = null;

// Elementos del DOM
const tablero = document.getElementById('tablero');
const selectDificultad = document.getElementById('dificultad');
const btnIniciar = document.getElementById('iniciar');
const statMovimientos = document.getElementById('stat-movimientos');
const statPares = document.getElementById('stat-pares');
const statTiempo = document.getElementById('stat-tiempo');

// Modal Victoria
const modalVictoria = document.getElementById('modal-victoria');
const resumenDificultad = document.getElementById('resumen-dificultad');
const resumenMovimientos = document.getElementById('resumen-movimientos');
const resumenTiempo = document.getElementById('resumen-tiempo');
const btnReintentar = document.getElementById('btn-reintentar');

// Algoritmo de Fisher-Yates para mezcla uniforme sin sesgo
function barajar(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Formatear segundos a MM:SS
function formatearTiempo(segundos) {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Manejo del cronómetro
function iniciarCronometro() {
    if (timerInterval) clearInterval(timerInterval);
    tiempoSegundos = 0;
    statTiempo.textContent = formatearTiempo(tiempoSegundos);
    timerInterval = setInterval(() => {
        tiempoSegundos++;
        statTiempo.textContent = formatearTiempo(tiempoSegundos);
    }, 1000);
}

function detenerCronometro() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Inicializar un nuevo juego
function iniciarJuego() {
    // Limpiar temporizadores pendientes
    detenerCronometro();
    if (timeoutVolteo) {
        clearTimeout(timeoutVolteo);
        timeoutVolteo = null;
    }

    // Ocultar modal si estaba visible
    modalVictoria.classList.add('oculto');

    // Resetear estados
    tarjetasSeleccionadas = [];
    tarjetasBloqueadas = false;
    movimientos = 0;
    paresEncontrados = 0;
    juegoIniciado = false;

    const dificultadActual = selectDificultad.value;
    const config = CONFIG_DIFICULTAD[dificultadActual] || CONFIG_DIFICULTAD.medio;
    totalPares = config.pares;

    // Actualizar estadísticas visuales
    statMovimientos.textContent = '0';
    statPares.textContent = `0 / ${totalPares}`;
    statTiempo.textContent = '00:00';

    // Ajustar clase de grid en el tablero
    tablero.className = `tablero ${config.claseGrid}`;
    tablero.innerHTML = '';

    // Elegir aleatoriamente N imágenes del catálogo total
    const imagenesBarajadas = barajar(TODAS_LAS_IMAGENES);
    const imagenesSeleccionadas = imagenesBarajadas.slice(0, totalPares);

    // Duplicar y barajar las cartas para el tablero
    const cartasBarajadas = barajar([...imagenesSeleccionadas, ...imagenesSeleccionadas]);

    // Crear elementos en el tablero con estructura 3D
    cartasBarajadas.forEach((src, index) => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta');
        tarjeta.dataset.index = index;
        tarjeta.dataset.src = src;

        const tarjetaInner = document.createElement('div');
        tarjetaInner.classList.add('tarjeta-inner');

        // Cara trasera (oculta la carta)
        const caraReverso = document.createElement('div');
        caraReverso.classList.add('cara', 'cara-reverso');

        // Cara frontal (muestra la imagen y el texto)
        const caraFrente = document.createElement('div');
        caraFrente.classList.add('cara', 'cara-frente');

        const img = document.createElement('img');
        img.src = src;
        img.alt = src.split('/').pop().replace('.png', '');

        const nombreSpan = document.createElement('span');
        nombreSpan.classList.add('nombre-imagen');
        nombreSpan.textContent = img.alt.toUpperCase();

        caraFrente.appendChild(img);
        caraFrente.appendChild(nombreSpan);

        tarjetaInner.appendChild(caraReverso);
        tarjetaInner.appendChild(caraFrente);
        tarjeta.appendChild(tarjetaInner);

        tarjeta.addEventListener('click', () => voltearTarjeta(tarjeta));
        tablero.appendChild(tarjeta);
    });
}

// Interacción al voltear una tarjeta
function voltearTarjeta(tarjeta) {
    if (tarjetasBloqueadas) return;
    if (tarjeta.classList.contains('volteada') || tarjeta.classList.contains('emparejada')) return;

    // Iniciar temporizador en el primer movimiento
    if (!juegoIniciado) {
        juegoIniciado = true;
        iniciarCronometro();
    }

    tarjeta.classList.add('volteada');
    tarjetasSeleccionadas.push(tarjeta);

    if (tarjetasSeleccionadas.length === 2) {
        actualizarMovimientos();
        verificarPar();
    }
}

// Incrementar movimientos
function actualizarMovimientos() {
    movimientos++;
    statMovimientos.textContent = movimientos;
}

// Comparar si las 2 cartas volteadas son un par
function verificarPar() {
    tarjetasBloqueadas = true;
    const [tarjeta1, tarjeta2] = tarjetasSeleccionadas;

    if (tarjeta1.dataset.src === tarjeta2.dataset.src) {
        // Coinciden
        paresEncontrados++;
        statPares.textContent = `${paresEncontrados} / ${totalPares}`;

        tarjeta1.classList.add('emparejada');
        tarjeta2.classList.add('emparejada');

        tarjetasSeleccionadas = [];
        tarjetasBloqueadas = false;

        // Comprobar si completó el juego
        if (paresEncontrados === totalPares) {
            finalizarJuego();
        }
    } else {
        // No coinciden, voltear de regreso tras una breve pausa
        timeoutVolteo = setTimeout(() => {
            tarjeta1.classList.remove('volteada');
            tarjeta2.classList.remove('volteada');
            tarjetasSeleccionadas = [];
            tarjetasBloqueadas = false;
            timeoutVolteo = null;
        }, 850);
    }
}

// Pantalla de victoria
function finalizarJuego() {
    detenerCronometro();

    const config = CONFIG_DIFICULTAD[selectDificultad.value] || CONFIG_DIFICULTAD.medio;
    resumenDificultad.textContent = config.nombre;
    resumenMovimientos.textContent = movimientos;
    resumenTiempo.textContent = formatearTiempo(tiempoSegundos);

    setTimeout(() => {
        modalVictoria.classList.remove('oculto');
    }, 500);
}

// Event Listeners
btnIniciar.addEventListener('click', iniciarJuego);
selectDificultad.addEventListener('change', iniciarJuego);
btnReintentar.addEventListener('click', iniciarJuego);

// Iniciar automáticamente al cargar la página
iniciarJuego();
