const Grupos = require('../models/Grupos');

//Muestra el formulario para nuevos Meeti
exports.formNuevoMeeti = async (req, res) =>{
    const grupos = await Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    });
    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    });
}