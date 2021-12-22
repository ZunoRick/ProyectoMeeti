const Usuarios = require('../models/Usuarios');
const { body, validationResult } = require('express-validator');
const enviarEmail = require('../handlers/emails');

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

        //Generar url de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //Enviar email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });

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

//Confirma la suscripción de usuario
exports.confirmarCuenta = async (req, res, next) =>{
    //Verificar que el usuario existe
    // console.log(req.params);
    const usuario = await Usuarios.findOne({ where: {
        email: req.params.correo
    }});

    //sino existe, redireccionar
    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    //Si existe, cofirmar suscripción y redireccionar
    usuario.activo = 1;
    await usuario.save();
    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
}

//Formulario para iniciar sesión 
exports.formIniciarSesion = (req, res) =>{
    res.render('iniciar-sesion', {
        nombrePagina: 'Inicia Sesión'
    });
}
