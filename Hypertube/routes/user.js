var express   = require('express');
var router    = express.Router();
var models    = require('../models');

/* GET home page. */
router.get('/:id', function(req, res, next) {
    console.log(req.params.id)
    if (req.session.passport && req.session.passport.user) {
		var connected = true
	} else {
		res.redirect('/')
	}

    models.user.findOne({ where: {id: req.params.id } })
        .then(function(ret) {
            if (!ret) res.redirect('/')

            var user = ret.dataValues;
            
            // console.log(user);
            res.render('profile', {
                title: 'Hypertube | Page de ' + user.first_name + ' ' + user.last_name,
                profile: user,
                user: req.session.passport.user,
                connected: connected
            })

        })
        .catch(function(err) {
            console.log(err)
        })
});

/* POST home page. */
router.post('/', function(req, res, next) {
    next();
});

module.exports = router;
