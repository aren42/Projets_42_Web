var express   = require('express');
var router    = express.Router();
var models    = require('../models');


router.get('/', function(req, res, next) {
    res.render('/');
});

/* POST home page. */
router.post('/', function(req, res, next) {
    var login      = req.body.username;
    var password   = req.body.pwd;
    var cpassword  = req.body.pwd2;
    var email      = req.body.email;
    var first_name = req.body.firstname;
    var last_name  = req.body.lastname;

    if (!login) {
        res.redirect('/?err=login');
        return('Login is incorrect', null);
    }

    if (!email) {
        res.redirect('/?err=email');
        return('Email is incorrect', null);
    }

    if (password.length < 8) {
        res.redirect('/?err=pwdl');
        eturn('Your password must have 8+ characters', null);
    }

    if (password.match(/\d/) == null) {
        res.redirect('/?err=pwdd');
        return('Your password must have a digit', null);
    }

    if (password !== cpassword || !password) {
        res.redirect('/?err=pwd');
        return('Password or password confirmation is incorrect', null);
    }

    models.user.findOne({ $or : {email : email, login: login } })
        .then(function(user){
            models.sequelize.sync()
                .then(function() {
                    res.redirect('../');
                    return models.user.create({
                        login     : login,
                        password  : models.user.generateHash(password),
                        email     : email,
                        first_name:first_name,
                        last_name :last_name 
                    });
                })
                .catch(function(err) {
                    if (err && err.message)
                        console.log(err.message);
                    else
                        console.log(err);
                })   
        });
});

module.exports = router;
