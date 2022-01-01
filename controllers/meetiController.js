const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const { body, validationResult } = require('express-validator');
const uuid = require('uuid').v4;

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

    meeti.id = uuid();

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

exports.formEditarMeeti = async (req, res, next) =>{
    const consultas = [];

    consultas.push(Meeti.findByPk(req.params.id));
    consultas.push(Grupos.findAll({ where: {
        usuarioId: req.user.id
    } }));

    //Return a promise
    const [meeti, grupos] = await Promise.all(consultas);

    if (!grupos || !meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //Mostrar la vista
    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        meeti,
        grupos
    });
}

//Guarda los cambios en el meeti
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: { 
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }
    
    //Asignar los valores
    const { grupoId, titulo, invitado, fecha, hora, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = (req.body.cupo === '') ? 0 : req.body.cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    //Asignar el Point
    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    meeti.ubicacion = point;

    //almacenar en la BD
    try {
        await meeti.save();
        req.flash('exito', 'Cambios Guardados Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
    }
}

exports.formEliminarMeeti = async (req, res, next) =>{
    try {
        const meeti = await Meeti.findOne({
            where: {
                id: req.params.id,
                usuarioId: req.user.id
            }
        });
        //Todo bien, ejecutar la vista
        res.render('eliminar-meeti', {
            nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
        });
    } catch (error) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }
}

exports.eliminarMeeti = async(req, res, next) => {
    try {
        const meeti = await Meeti.findOne({
            where: {
                id: req.params.id,
                usuarioId: req.user.id
            }
        });
        
        //Eliminar el meeti
        await Meeti.destroy({
            where: {
                id: req.params.id
            }
        });
    
        //Redireccionar al usuario
        req.flash('exito', `Meeti ${meeti.titulo} Eliminado`);
        res.redirect('/administracion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/administracion');
        return next();
    }
}