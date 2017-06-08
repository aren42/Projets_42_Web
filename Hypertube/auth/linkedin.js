var passport         = require('passport');
var LinkedInStrategy = require('passport-linkedin').Strategy;

var config           = require('./config');
var models           = require('../models');

passport.use('linkedin', new LinkedInStrategy({
		consumerKey     : config.linkedInAuth.clientID,
		consumerSecret  : config.linkedInAuth.clientSecret,
		callbackURL     : config.linkedInAuth.callbackURL,
		profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline'],
    	session: true
	},
	function(access_token, refresh_token, profile, done) {
		process.nextTick(function() {
			models.user.findOne({ where: { email : profile.emails[0].value }})
				.then(function(user){
					if (user) {
						return done(null, user.dataValues);
					}
					else {
						var email      = profile.emails[0].value; // linkedin can return multiple emails so we'll take the first
						var first_name = profile.name.givenName;  // look at the passport user profile to see how names are returned
						var last_name  = profile.name.familyName; // look at the passport user profile to see how names are returned

						models.sequelize.sync().then(function() {
							return models.user.create({
								email      : email,
								first_name : first_name,
								last_name  : last_name
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
