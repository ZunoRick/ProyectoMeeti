const { Sequelize } = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const Usuarios = db.define('usuarios',  {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(60),
        validate: {
            notEmpty:{
                msg: 'El nombre no puede ir vacio'
            }
        }
    },
    imagen: Sequelize.STRING(60),
    descripcion: Sequelize.TEXT,
    email: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
        validate:{
            isEmail: {
                msg: 'Agrega un correo válido'
            },
            notEmpty: {
                msg: 'El e-mail no puede ir vacio'
            },
            isUnique: function(value, next){
                Usuarios.findOne({ where: {
                    email: value
                }})
                .then(function (user) {
                    // reject if a different user wants to use the same email
                    if (user && this.id !== user.id) {
                        return next('Usuario ya registrado');
                    }
                    return next();
                })
                .catch(function (err) {
                    return next(err);
                });
            }
        }
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty:{
                msg: 'El password no puede ir vacío'
            }
        }
    },
    activo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    tokenPassword: Sequelize.STRING,
    expiraToken: Sequelize.DATE
}, {
    hooks: {
        beforeCreate(usuario){
            usuario.password = Usuarios.prototype.hashPassword(usuario.password);
        }
    }
});

//Método para comparar los password
Usuarios.prototype.validarPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

Usuarios.prototype.hashPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

module.exports = Usuarios;