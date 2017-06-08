var passport         = require('passport');
var FortyTwoStrategy = require('passport-42').Strategy;

var config           = require('./config');
var models           = require('../models');

passport.use(new FortyTwoStrategy({
            clientID        : config.intra42Auth.clientID,
            clientSecret    : config.intra42Auth.clientSecret,
            callbackURL     : config.intra42Auth.callbackURL,
            profileFields   : {
                    'username'        : 'login',
                    'name.familyName' : 'last_name',
                    'name.givenName'  : 'first_name',
                    'emails.0.value'  : 'email',
                    'photos.0.value'  : 'image_url'
                },
            session: true
        }, function(access_token, refresh_token, profile, done) {
            process.nextTick(function() {
                models.user.findOne({ where: {email : profile.emails[0].value }})
                    .then(function(user){
                        if (user) {
                            return done(null, user.dataValues);
                        }
                        else {
                            var email      = profile.emails[0].value; // intra42 can return multiple emails so we'll take the first
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