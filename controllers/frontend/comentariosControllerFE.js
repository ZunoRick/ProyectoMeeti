const Comentarios = require("../../models/Comentarios")
const Meeti = require("../../models/Meeti")
const Usuarios = require("../../models/Usuarios")

exports.agregarComentario = async (req, res, next) => {
    //Obtener el comentario
    const {comentario} = req.body;

    //Crear comentario en la BD
    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    //Redireccionar a la misma página
    res.redirect('back');
    next();
}

exports.eliminarComentario = async (req, res, next) =>{
    
    //Tomar el ID del comentario
    const comentarioId  = req.body.datos;

    //Consultar el comentario
    const comentario = await Comentarios.findOne({
        where: {
            id: comentarioId
        }
    });

    //Verificar si existe el comentario
    if (!comentario) {
        //intenta borrar un comentario que no existe
        res.status(404).send('Acción no válida');
        return next();
    }

    //Consultar el meeti del comentario
    const meeti = await Meeti.findOne({
        where: {
            id: comentario.meetiId
        }
    });

    //verificar que quien lo borra sea el creador
    if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        await Comentarios.destroy({
            where: {
                id: comentario.id
            }
        });

        res.status(200).send('Eliminado Correctamente');
    } else{
        //Cuando quieren borrar un comentario que no es propietario
        res.status(403).send('Acción no válida');
    }
    return next();
}