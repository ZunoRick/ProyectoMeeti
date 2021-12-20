const Sequelize = require('sequelize');

module.exports = new Sequelize('meeti', 'postgres', 'root', {
    host: '127.0.0.1',
    port: '5432',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 10000
    }
});