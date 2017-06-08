var passport         = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var config           = require('./config');
var models           = require('../models');

passport.use('facebook', new FacebookStrategy({
		clientID        : config.facebookAuth.clientID,
		clientSecret    : config.facebookAuth.clientSecret,
		callbackURL     : config.facebookAuth.callbackURL,
		profileFields   : ['id', 'displayName', 'email', 'photos'],
    	session: true
	},
	function(access_token, refresh_token, profile, done) {
		process.nextTick(function() {
			models.user.findOne({ where: {email : profile._json.email }})
				.then(function(user){
					if (user) {
						return done(null, user.dataValues);
					}
					else {
						var email      = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
						var first_name = profile.name.givenName;  // look at the passport user profile to see how names are returned
						var last_name  = profile.name.familyName; // look at the passport user profile to see how names are returned
						var picture    = profile.photos[0].value;

						models.sequelize.sync().then(function() {
							return models.user.create({
								email      : email,
								first_name : first_name,
								last_name  : last_name,
								picture    : picture
							});
						}).then(function(user) {
							return done(null, user.dataValues);
						}).catch(function(err) {
							return done(err);
						});
					}
				});
		});
}));
