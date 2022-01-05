const Comentarios = require("../../models/Comentarios");
const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const moment = require('moment');
const { Sequelize } = require('../../config/db');
const Categorias = require('../../models/Categorias');
const { Op } = require('sequelize');

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include:[
            {
                model: Grupos
            },{
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    if (!meeti) {
        res.redirect('/');
    }

    //Consultar por meeti's cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})' )`);

    //ST_DISTANCE_Sphere = Retorna una línea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    //Encontrar meeti's cercanos
    const cercanos = await Meeti.findAll({
        order: distancia, //los ordena del más cercano al lejano
        where: Sequelize.where(distancia, { [Op.lte]: 2000 }),
        limit: 3,
        offset: 1,
        include:[
            {
                model: Grupos
            },{
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    //Consultar después de veridicar que existe el meeti
    const comentarios = await Comentarios.findAll({
        where: {
            meetiId: meeti.id
        },
        include: [{
            model: Usuarios,
            attributes: ['id', 'nombre', 'imagen']
        }]
    });

    //pasar el resultado hacia la vista
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
        moment
    });
}

exports.confirmarAsistencia = async (req, res, next) =>{
    const meeti = await Meeti.findOne({
        where: {
            'slug': req.params.slug
        },
        attributes: ['interesados']
    });
    
    const { datos } = req.body;
    if(datos === 'confirmar'){
        if(meeti.interesados.includes(req.user.id)){
            res.send('Ya te has registrado.');
            return next();
        }

        //agregar el usuario
        Meeti.update({
            'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)
        },{
            where:{
                'slug': req.params.slug
            }
        });
        //Mensaje
        res.send('Has confirmado tu asistencia');
    }else{
        //cancelar la asistencia
        Meeti.update({
            'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)
        },{
            where:{
                'slug': req.params.slug
            }
        });
        //Mensaje
        res.send('Has cancelado tu asistencia');
    }
}

exports.mostrarAsistentes = async (req, res) =>{
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ['interesados']
    });

    //extraer interesados
    const { interesados } = meeti;
    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: {id : interesados}
    });
    
    //Crear la vista y pasar los datos
    res.render('asistentes-meeti', {
        nombrePagina: 'Listado Asistentes Meeti',
        asistentes
    });
}

exports.mostrarCategoria = async (req, res, next) =>{
    const categoria = await Categorias.findOne({
        where: {
            slug: req.params.categoria
        },
        attributes: ['id', 'nombre']
    });

    const meetis = await Meeti.findAll({
        order: [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [{
            model: Grupos,
            where: { categoriaId : categoria.id }
        }, {
            model: Usuarios
        }]
    });

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    });
}