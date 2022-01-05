const Meeti = require("../../models/Meeti");
const Grupos = require("../../models/Grupos");
const Usuarios = require("../../models/Usuarios");
const { Sequelize, Op } = require('sequelize');
const moment = require("moment");

exports.resultadosBusqueda = async(req, res) =>{
    
    //leer datos de la url
    const { categoria, titulo, ciudad, pais } = req.query;

    //Si la categoria está vacía
    let query = (categoria === '') ? '' : `where:{ categoriaId: { [Op.eq]: ${categoria} } }`;

    //Filtrar los meeti's por los términos de la búsqueda
    const meetis = await Meeti.findAll({
        where:{
            titulo: { [Op.iLike]: '%'+titulo+'%' },
            ciudad: { [Op.iLike]: '%'+ciudad+'%' },
            pais: { [Op.iLike]: '%'+pais+'%' }
        },
        include:[
            {
                model: Grupos,
                query
            },{
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    //Pasar los resultados a la vista
    res.render('busqueda', {
        nombrePagina: 'Resultados Búsqueda',
        meetis,
        moment
    });
}