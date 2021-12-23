const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

const configuracionMulter = {
    limits: { fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination:(req, file, next) =>{
            next(null, __dirname+'/../public/uploads/grupos');
        },
        filename: (req, file, next) =>{ 
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //el callback se ejecuta como true o false: true cuando la imagen se acepta
            next(null, true);
        }else{
            next(new Error('Formato No Válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) =>{
    upload(req, res, function(error){
        if (error) {
            if(error instanceof multer.MulterError){
				if (error.code === 'LIMIT_FILE_SIZE') {
					req.flash('error', 'El archivo es muy grande');
				} else {
					req.flash('error', error.MulterError);
				}
			} else if(error.hasOwnProperty('message')){
				req.flash('error', error.message);
			}
            res.redirect('back');
            return;
        }else{
            next();
        }
    });
}

exports.formNuevoGrupo = async (req, res) =>{
    const categorias = await Categorias.findAll();
    
    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
}

//Almacena los grupos en la BD
exports.crearGrupo = async (req, res) =>{
    //Sanitizar
    const rules = [
        // body('categoriaId').notEmpty().withMessage('Agrega una categoría'),
        body('nombre').trim().escape(),
        body('url').trim().escape()
    ];
    await Promise.all(rules.map(validation => validation.run(req)));
    //Leer los errores de express
    const errExp = validationResult(req);

    const grupo = req.body;

    //almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;

    //leer la imagen
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    try {
        //Almacenar en la BD
        await Grupos.create(grupo);

        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');
    } catch (error) {
        
        //Extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        
        //Si hay errores, Extraer unicamente el msg de los errores
        // const erroresExpress = (errExp.errors.length) ? errExp.errors.map(err => err.msg) : [];

        //Unir errores
        // const listaErrores = [...erroresSequelize, ...erroresExpress];
        
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}
