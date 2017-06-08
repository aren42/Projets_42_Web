var express          = require('express');
// var session          = require('express-session')
var cookie_   		 = require('cookie-session');
var path             = require('path');
var favicon          = require('serve-favicon');
var logger           = require('morgan');
var cookieParser     = require('cookie-parser')('42424242');;
var bodyParser       = require('body-parser');
var passport         = require('passport');
var app              = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));


/* Parse the form sent by client */
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

/* Session */
var session = (cookie_({
	name: 'session',
	keys: ['42424242'],
	maxAge: 24 * 60 * 60 * 1000
}))

app.use(session)
app.use(cookieParser);

/* Middleware session */
// app.use(session({
// 	secret: 'keyboard cat',
// 	resave: false,
// 	saveUninitialized: true
// }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());


// Passport settings

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
	cb(null, obj);
});

require('./auth/local');
require('./auth/facebook');
require('./auth/intra42');
require('./auth/twitter');
require('./auth/instagram');
require('./auth/github');
require('./auth/linkedin');


/* LES ROUTES - LES ROUTES - LES ROUTES */
/* Includes routes */

var index            = require('./routes/index');
var register         = require('./routes/register');
var auth             = require('./routes/auth');
var update           = require('./routes/update');
var error            = require('./routes/error');
var user             = require('./routes/user');
var movie            = require('./routes/movie');
var play            = require('./routes/play');

app.use('/', index);
app.use('/auth', auth);
app.use('/auth/signup', register);
app.use('/auth/signin', index);
app.use('/update', update);
app.use('/error', error);
app.use('/user', user);
app.use('/movie', movie);
app.use('/film', play);


// Secu page introuvable
app.use(function(req, res, next){
	res.status(404).send('Page introuvable !');
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
