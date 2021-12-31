const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const moment = require('moment');
const { Op } = require('sequelize');

exports.panelAdministracion = async(req, res) =>{
    

    //consultas
    const consultas = [];
    consultas.push(Grupos.findAll({
        where: { usuarioId: req.user.id }
    }));

    //Próximos meetis
    consultas.push( Meeti.findAll({
        where: { 
            usuarioId: req.user.id,
            fecha: { [Op.gte] : moment(new Date).format("YYYY-MM-DD") }
        },
        order: [
            ['fecha', 'ASC']
        ]
    }));

    //Meetis anteriores
    consultas.push( Meeti.findAll({
        where: { 
            usuarioId: req.user.id,
            fecha: { [Op.lt] : moment(new Date).format("YYYY-MM-DD") }
        }
    }));

    //Array destructuring
    const [grupos, meeti, anteriores]  = await Promise.all(consultas) ;

    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        grupos,
        meeti,
        moment,
        anteriores
    });
}