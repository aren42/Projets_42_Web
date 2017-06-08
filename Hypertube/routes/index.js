var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("session:", req.session)
	if (req.session.passport && req.session.passport.user) {
		var connected = true
	} else {
		var connected = false
	}

	if (connected == true) {
		// console.log(req.session.passport.user);
		res.render('search', {
			title: 'Hypertube | Page de Recherche',
			connected: connected,
            user: req.session.passport.user
		})
	} else {
		res.render('index', {
			title: 'Hypertube | Page principale',
			connected: connected
		})
	}
});

router.post('/send_reset_pwd', function(req, res, next) {

	if (req.body.email == '') res.redirect('/?err=email')

	var models = require('../models'),
		email  = req.body.email;

	models.user.findOne({where : {email : email}})
		.then(function(user){
			if (!user) res.redirect('/?err=emailnf')
			
			models.user.forgetPassword(email, function(new_password) {
				if (new_password) {
					console.log(new_password)
					models.user.sync()
						.then(function(){
							return (models.user.update({ password : models.user.generateHash(new_password) },
														{where : {email:email}})
									.then(function() {
										res.redirect('/')
									})
									.catch(function(err) {
										if (err.message)
											console.log(err.message)
										else
											console.log(err)
										res.redirect('/?err=mod')
									}))
						})
						.catch(function(err) {
							if (err.message)
								console.log(err.message)
							else
								console.log(err)
						})
				}
			})
		})
		.catch(function(err) {
			if (err.message)
				console.log(err.message)
			else
				console.log(err)
		})


})

module.exports = router;
