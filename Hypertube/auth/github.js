var passport          = require('passport');
var GitHubStrategy    = require('passport-github').Strategy;

var config            = require('./config');
var models            = require('../models');

passport.use(new GitHubStrategy({
            clientID        : config.githubAuth.clientID,
            clientSecret    : config.githubAuth.clientSecret,
            callbackURL     : config.githubAuth.callbackURL,
		    profileFields   : ['id', 'displayName', 'email', 'photos'],
            session: true
        },
        function(access_token, refresh_token, profile, done) {
            process.nextTick(function() {
                models.user.findOne({ where: {login : profile.username }})
                    .then(function(user){
                        if (user) {
                            return done(null, user.dataValues);
                        }
                        else {
                            var login      = profile.username; // intra42 can return multiple emails so we'll take the first
                            var picture    = profile.photos[0].value;

                            models.sequelize.sync().then(function() {
                                return models.user.create({
                                    login      : login,
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
