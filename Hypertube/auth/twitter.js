var passport        = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

var config           = require('./config');
var models           = require('../models');

passport.use(new TwitterStrategy({
		consumerKey    : config.twitterAuth.clientID,
		consumerSecret : config.twitterAuth.clientSecret,
		callbackURL    : config.twitterAuth.callbackURL,
        session: true
	},
	function(access_token, refresh_token, profile, done) {
		process.nextTick(function() {
			models.user.findOne({ where: {login : profile._json.screen_name }})
				.then(function(user){
					if (user) {
						return done(null, user.dataValues);
					}
					else {
						var login      = profile.username; // facebook can return multiple emails so we'll take the first
						var first_name = profile.displayName;  // look at the passport user profile to see how names are returned
						var picture    = profile.photos[0].value;

						models.sequelize.sync().then(function() {
							return models.user.create({
								login      : login,
								first_name : first_name,
								picture    : picture
							});
						}).then(function(user) {
							return done(null, user);
						}).catch(function(err) {
							return done(err);
						});
					}
				});
		});
	}));