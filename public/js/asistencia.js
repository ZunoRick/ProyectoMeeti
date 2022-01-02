import axios from "axios";

document.addEventListener('DOMContentLoaded', () => {
    const asistencia = document.querySelector('#confirmar-asistencia');

    if (asistencia) {
        asistencia.addEventListener('submit', confirmarAsistencia);
    }
});

function confirmarAsistencia(e) {
    e.preventDefault();

    const btn = document.querySelector('#confirmar-asistencia input[type="submit"]');
    let accion = document.querySelector('#accion').value;
    const mensaje = document.querySelector('#mensaje');
    const divAsistentes = document.querySelector('.titulo h3 span');
    const numAsistentes = parseInt(document.querySelector('.titulo h3 span').textContent);

    //limpia la respuesta previa
    while(mensaje.firstChild)
        mensaje.removeChild(mensaje.firstChild);

    axios.post(this.action, `datos=${accion}`)
        .then(respuesta => {
            // console.log(respuesta);
            if (accion === 'confirmar') {
                //modifica los elementos del boton
                document.querySelector('#accion').value = 'cancelar';
                btn.value = 'Cancelar';
                btn.classList.remove('btn-azul');
                btn.classList.add('btn-rojo');

                //Actualiza el número de asistentes
                divAsistentes.textContent = numAsistentes + 1;
            } else{
                document.querySelector('#accion').value = 'confirmar';
                btn.value = 'Sí';
                btn.classList.remove('btn-rojo');
                btn.classList.add('btn-azul');
                divAsistentes.textContent = numAsistentes - 1;
            }

            //Mensaje
            mensaje.appendChild(document.createTextNode(respuesta.data));
        });
}