const Usuarios = require('../models/Usuarios');
const { body, validationResult } = require('express-validator');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    });
}

exports.crearNuevaCuenta = async (req, res) =>{
    const usuario = req.body;

    const rules = [
        body('confirmar').notEmpty().withMessage('Debes de confirmar tu password'),
        body('confirmar').equals(req.body.password).withMessage('El password es diferente')
    ];

    await Promise.all(rules.map(validation => validation.run(req)));
    
    //Leer los errores de express
    const errExp = validationResult(req);

    try {
        await Usuarios.create(usuario);
        //Flash Message y redireccionar
        req.flash('exito', 'Hemos enviado un correo, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        //Extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);

        //Extraer unicamente el msg de los errores
        const erroresExpress = errExp.errors.map(err => err.msg);

        //Unir errores
        const listaErrores = [...erroresSequelize, ...erroresExpress];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}

//Formulario para iniciar sesión 
exports.formIniciarSesion = (req, res) =>{
    res.render('iniciar-sesion', {
        nombrePagina: 'Inicia Sesión'
    });
}