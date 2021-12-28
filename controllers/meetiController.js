const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const { body, validationResult } = require('express-validator');

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

exports.crearMeeti = async(req, res) =>{
    //obtener los datos
    const meeti = req.body;
    
    //Asignar el usuario
    meeti.usuarioId = req.user.id;

    //Almacena la ubicación con un point
    const point = { type: 'Point', coordinates: [ parseFloat(req.body.lat), parseFloat(req.body.lng)]};
    meeti.ubicacion = point;

    //Cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    //Almacnar en la BD
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        //Extraer el message de los errores
        const erroresSequelize = (error.errors.length) ? error.errors.map(err => err.message) : [];
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}

exports.sanitizarMeeti = async(req, res, next) =>{
    //Sanitizar
    const rules = [
        body('titulo').trim().escape(),
        body('invitado').trim().escape(),
        body('cupo').trim().escape(),
        body('fecha').trim().escape(),
        body('hora').trim().escape(),
        body('direccion').trim().escape(),
        body('ciudad').trim().escape(),
        body('estado').trim().escape(),
        body('pais').trim().escape(),
        body('lat').trim().escape(),
        body('lng').trim().escape(),
        body('grupoId').trim().escape(),
    ];

    try {
        //Leer los errores de express
        await Promise.all(rules.map(validation => validation.run(req)));
        validationResult(req);
        return next();
    } catch (error) {
        console.log(error);
        
    }
}