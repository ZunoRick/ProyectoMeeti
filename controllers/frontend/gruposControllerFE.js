const Grupos = require('../../models/Grupos');
const Meeti = require('../../models/Meeti');
const moment = require('moment');

exports.mostrarGrupo = async (req, res, next) =>{
    const consultas = [
        Grupos.findOne({
            where:{
                id: req.params.id
            }
        }),
        Meeti.findAll({
            where:{ grupoId: req.params.id},
            order: [
                ['fecha', 'ASC']
            ]
        })
    ];
    
    const [ grupo, meetis ] = await Promise.all(consultas);

    if (!grupo) {
        res.redirect('/');
        return next();
    }

    //mostrar la vista
    res.render('mostrar-grupo', {
        nombrePagina: `Información del grupo: ${grupo.nombre}`,
        grupo,
        meetis,
        moment
    });
}