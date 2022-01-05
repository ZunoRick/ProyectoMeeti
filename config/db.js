const {Sequelize} = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

module.exports = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS, {
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 10000
    },
    // Agrega las columas: cuando fue creado y cuando fue actualizado
    // define: {
    //     timestamps: false
    // },
    logging: false
});