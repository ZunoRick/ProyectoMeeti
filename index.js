const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const router = require('./routes');

//Configuración y modelos
const db = require('./config/db');
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meeti');
require('./models/Comentarios');
db.sync()
  .then(() => console.log('DB Conectada'))
  .catch(error => console.log(error));

//Variables de desarrollo
require('dotenv').config({ path: 'variables.env'});

//App principal
const app = express();

//Habilitar la lectura de formularios
app.use(express.urlencoded({ extended: true }));

//Habilitar EJS como template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Definir ubicación de las vistas
app.set('views', path.join(__dirname, './views'));

//Archivos estáticos
app.use(express.static('public'));

//Habilitar cookie parser
app.use(cookieParser());

//Crear la sesión
app.use(session({
  secret: process.env.SECRETO,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Agrega flash messages
app.use(flash());

//Middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) =>{
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();

    next();
});

//Routing
app.use('/', router());

//Leer el host y el puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;

//Agrega el puerto
app.listen(port, host, () => {
    console.log('El servidor está funcionando correctamente');
});