var express			= require('express');
var session			= require('express-session');
var sharedsession	= require("express-socket.io-session");
var morgan			= require('morgan'); // Middleware de logging
var path			= require('path');
var app				= express();
var server			= require('http').Server(app);
var io				= require('socket.io')(server); // communication sur events en temps réel
var events			= require('./config/event');
var cookie_			= require('cookie-session');

/* Includes routes */
var index			= require('./controllers/index');
var auth			= require('./controllers/auth');
var mycompte		= require('./controllers/compte');
var profil			= require('./controllers/profil');
var rechercher		= require('./controllers/rechercher');
var suggestions		= require('./controllers/suggestions');


// app.use(cookie_({
// 	name: 'session',
// 	keys: ['42424242'],
// 	maxAge: 24 * 60 * 60 * 1000
// }))

/* Find views files */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

/* Find public file */
app.use(express.static(path.join(__dirname, 'public')))

/* Log les requêtes */
app.use(morgan('dev'));

/* Parse the form sent by client */
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

/* Middleware session */
var sess_setup = session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
});
app.use(sess_setup);


/* LES ROUTES - LES ROUTES - LES ROUTES */

app.use('/', index);

app.use('/auth', auth);

app.use('/me', function(req, res, next) {
	if (req.session.user == undefined) 
		res.redirect("/#login");
	else
		next();
}, mycompte);

app.use('/profil', function(req, res, next) {
	if (req.session.user == undefined) 
		res.redirect("/#login");
	else
		next();
}, profil);

app.use('/search', function(req, res, next) {
	if (req.session.user == undefined)
		res.redirect("/#login");
	else
		next();
}, rechercher);

app.use('/suggest', function(req, res, next) {
	if (req.session.user == undefined)
		res.redirect("/#login");
	else
		next();
}, suggestions)


/* LA BIBLIOTHEQUE s*/

var users = {};

io.use(sharedsession(sess_setup));
require('./controllers/socket')(io, users);

require('./controllers/notifs')(users);

require('./controllers/popularite');

// Secu page introuvable
app.use(function(req, res, next){
	res.status(404).send('Page introuvable !');
});


server.listen(3000);
console.log("Listening connection on port 3000");

module.exports = events;
