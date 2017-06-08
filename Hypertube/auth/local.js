
// passport local fail ...

module.exports.passport = function(req, res, next) {
	var models           = require('../models');

	if (!req.body.password || !req.body.email) {
		console.log('Username or password missing')
		res.redirect('/?err=upm')
	}

	var email = req.body.email,
		password = req.body.password;

	models.user.findOne({where : {email:email}})
		.then(function (user) {
			if (user) {
				if (!models.user.validPassword(password, user.dataValues.password)) {
					res.redirect('/?err=pwdb');
				}
					
				else {
					req.session.passport = {}
					req.session.passport.user = {
						id         : user.dataValues.id,
						login      : user.dataValues.login,
						email      : user.dataValues.email,
						first_name : user.dataValues.first_name,
						last_name  : user.dataValues.last_name,
						picture    : user.dataValues.picture,
						lang       : user.dataValues.lang,
						createdAt  : user.dataValues.createdAt,
						updatedAt  : user.dataValues.updatedAt
					}
					res.redirect('/?succ');
				}
			}
			else {
				res.redirect('/?err=id_na');
			}
		})
		.catch(function (err) {
			// if (err.message) console.log(err.message);
			// else             console.log(err);
			res.redirect('/?err=local');
		})
}

