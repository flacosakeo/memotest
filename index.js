document.getElementById('iniciar').addEventListener('click', () => {
    let tarjetas = ['imagenes/arandano.png', 'imagenes/banana.png', 'imagenes/celular.png', 'imagenes/circulo.png',
                    'imagenes/cuadrado.png', 'imagenes/durazno.png', 'imagenes/frambuesa.png', 'imagenes/frutilla.png',
                    'imagenes/gato.png', 'imagenes/globos.png', 'imagenes/leon.png', 'imagenes/manzana.png',
                    'imagenes/naranja.png', 'imagenes/oso.png', 'imagenes/pajaro.png', 'imagenes/pelotabasquet.png',
                    'imagenes/pelotafutbol.png', 'imagenes/pelotaplaya.png', 'imagenes/pelotatenis.png', 'imagenes/perro.png',
                    'imagenes/sandia.png', 'imagenes/tomate.png', 'imagenes/tortuga.png', 'imagenes/triangulo.png', 
                    'imagenes/uva.png', 'imagenes/trebol.png', 'imagenes/diamante.png', 'imagenes/corazon.png',
                    'imagenes/pica.png', 'imagenes/tucan.png'];
    let tarjetasDuplicadas = tarjetas.concat(tarjetas);
    tarjetasDuplicadas = tarjetasDuplicadas.sort(() => Math.random() - 0.5);
    let tablero = document.getElementById('tablero');
    tablero.innerHTML = ''; // Limpia el tablero antes de empezar

    let tarjetasSeleccionadas = [];
    let tarjetasBloqueadas = false;

    tarjetasDuplicadas.forEach((src, index) => {
        let tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta');
        tarjeta.dataset.index = index;
        tarjeta.dataset.src = src;

        let img = document.createElement('img');
        img.src = src;
        tarjeta.appendChild(img);

        let nombreImagen = src.split('/').pop().replace('.png', '');

        let nombreSpan = document.createElement('span');
        nombreSpan.classList.add('nombre-imagen');
        nombreSpan.textContent = nombreImagen.toUpperCase();

        tarjeta.appendChild(nombreSpan);

        tarjeta.addEventListener('click', seleccionarTarjeta);
        tablero.appendChild(tarjeta);
    });

    function seleccionarTarjeta() {
        if (tarjetasBloqueadas) return;
        if (this.classList.contains('mostrada')) return;

        this.classList.add('mostrada');
        tarjetasSeleccionadas.push(this);

        if (tarjetasSeleccionadas.length === 2) {
            compararTarjetas();
        }
    }

    function compararTarjetas() {
        tarjetasBloqueadas = true;
        let [tarjeta1, tarjeta2] = tarjetasSeleccionadas;

        if (tarjeta1.dataset.src === tarjeta2.dataset.src) {
            console.log("¡Es un par!");
            tarjetasSeleccionadas = [];
            tarjetasBloqueadas = false;
        } else {
            console.log("No coinciden. Inténtalo de nuevo.");
            setTimeout(() => {
                tarjeta1.classList.remove('mostrada');
                tarjeta2.classList.remove('mostrada');
                tarjetasSeleccionadas = [];
                tarjetasBloqueadas = false;
            }, 1000);
        }
    }
});
        
