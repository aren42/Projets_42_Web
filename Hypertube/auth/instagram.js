var passport          = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;

var config            = require('./config');
var models            = require('../models');

passport.use(new InstagramStrategy({
            clientID        : config.intagramAuth.clientID,
            clientSecret    : config.intagramAuth.clientSecret,
            callbackURL     : config.intagramAuth.callbackURL,
		    profileFields   : ['id', 'displayName', 'email', 'photos'],
            session: true
        }, function(access_token, refresh_token, profile, done) {
            process.nextTick(function() {
                models.user.findOne({ where: {login : profile.username }})
                    .then(function(user){
                        if (user) {
                            return done(null, user.dataValues);
                        }
                        else {
                            var login      = profile.username; // intra42 can return multiple emails so we'll take the first
                            var first_name = profile.name.givenName;  // look at the passport user profile to see how names are returned
                            var last_name  = profile.name.familyName; // look at the passport user profile to see how names are returned

                            models.sequelize.sync().then(function() {
                                return models.user.create({
                                    login      : login,
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