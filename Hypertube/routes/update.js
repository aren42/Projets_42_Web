var express   = require('express');
var multer    = require('multer');
var path      = require('path');
var router    = express.Router();
var models    = require('../models');

/* POST update info page. */
router.post('/', function(req, res, next) {

    if (req.session.passport == null || req.session.passport.user == null) {
        res.redirect('/');
        return false;
    }

    var profile      = req.session.passport.user
    var login        = req.body.username;
    var old_password = req.body.opwd;
    var password     = req.body.pwd;
    var cpassword    = req.body.pwd2;
    var email        = req.body.email;
    var first_name   = req.body.firstname;
    var last_name    = req.body.lastname;
    var lang         = req.body.lang;

    if (password && cpassword && password != cpassword) {
        console.log('Password confirmation isn\'t correct');
        res.redirect('/user/' + profile.id + '?err=cpwd');
        return false;
    }

    if (password && password.length < 8) {
        res.redirect('/user/' + profile.id + '?err=pwdl');
        return('Your password must have 8+ characters', null);
    }

    if (password && password.match(/\d/) == null) {
        res.redirect('/user/' + profile.id + '?err=pwdd');
        return('Your password must have a digit', null);
    }

    if (password && cpassword && password !== cpassword) {
        res.redirect('/user/' + profile.id + '?err=pwd');
        return('Password or password confirmation is incorrect', null);
    }

    models.user.findOne({ where: {id : profile.id }})
        .then(function(user) {
            if (!user) {
                console.log('User not found');
                res.redirect('/user/' + profile.id);
                return false;
            }
            if (old_password && user.dataValues.password && models.user.validPassword(old_password, user.dataValues.password) === false) {
                console.log('Old password isn\'t correct');
                res.redirect('/user/' + profile.id);
                return false;
            }
            if (!password || !cpassword) {
                models.sequelize.sync()
                    .then(function() {
                        return models.user.update(
                                {
                                    login      : login      || user.dataValues.login,
                                    email      : email      || user.dataValues.email,
                                    first_name : first_name || user.dataValues.first_name,
                                    last_name  : last_name  || user.dataValues.last_name,
                                    lang       : lang       || user.dataValues.lang
                                },
                                { where: { id: profile.id } })
                            .then(function(result){
                                req.session.passport.user.login      = login      || user.dataValues.login;
                                req.session.passport.user.email      = email      || user.dataValues.email;
                                req.session.passport.user.first_name = first_name || user.dataValues.first_name;
                                req.session.passport.user.last_name  = last_name  || user.dataValues.last_name;
                                req.session.passport.user.lang       = lang       || user.dataValues.lang;
                                res.redirect('/user/' + profile.id);
                            })
                            .catch(function(error){
                                res.redirect('/user/' + profile.id);
                            })
                    })
                    .catch(function(err) {
                        if (err)
                            console.log(err.message)
                    })
            } else {
                models.sequelize.sync().then(function() {
                    console.log(lang)
                    return models.user.update(
                            {
                                login      : login                              || user.dataValues.login,
                                email      : email                              || user.dataValues.email,
                                password   : models.user.generateHash(password) || user.dataValues.password,
                                first_name : first_name                         || user.dataValues.first_name,
                                last_name  : last_name                          || user.dataValues.last_name,
                                lang       : lang                               || user.dataValues.lang
                            },
                            { where: { id: profile.id } })
                        .then(function(result){
                            req.session.passport.user.login      = login      || user.dataValues.login;
                            req.session.passport.user.email      = email      || user.dataValues.email;
                            req.session.passport.user.first_name = first_name || user.dataValues.first_name;
                            req.session.passport.user.last_name  = last_name  || user.dataValues.last_name;
                            req.session.passport.user.lang       = lang       || user.dataValues.lang;
                            res.redirect('/user/' + profile.id);
                        })
                        .catch(function(error){
                            res.redirect('/user/' + profile.id + '?err=sync');
                        })
                })
                .catch(function(err) {
                    if (err)
                        console.log(err.message)
                })
            }
        });
});


/* POST update picture page. */

router.post('/picture/', function(req, res, next) {

    if (req.session.passport == null || req.session.passport.user == null) {
        res.redirect('/');
        return false;
    }
    
    var profile   = req.session.passport.user;

	var upload = multer({
		storage: multer.diskStorage({
            destination: function(req, file, callback) {
                callback(null, './public/profile_picture/')
            },
            filename: function(req, file, callback) {
                callback(null, profile.id + '-' + Date.now() + path.extname(file.originalname))
            }
        }),
		fileFilter: function(req, file, callback) {
            if (file.mimetype.match(/image/) === null) 
				return callback('Only images are allowed', null)
            callback(null, true)
		}
	}).single('userFile')

	upload(req, res, function(err) {
        if (err) {
            console.log(err)
            res.redirect('/user/' + profile.id + '?err=img')
        }
        var models = require('../models');

        models.sequelize.sync()
            .then(function() {
                return models.user.update(
                        { picture: '../profile_picture/' + req.file.filename },
                        { where: { id: profile.id } })
                    .then(function(result){
                        req.session.passport.user.picture  = '../profile_picture/' + req.file.filename;
                        res.redirect('/user/' + profile.id);
                    })
                    .catch(function(error){
                        res.redirect('/user/' + profile.id + '?err=sync');
                    })

            })
            .catch(function(err) {
                if (err) {
                    console.log(err)
                    res.redirect('/user/' + profile.id + '?err=img')
                }
            })
	})

})

module.exports = router;
