var pool		= require('../config/db');
var events		= require('../config/event')
var express		= require('express');
var router		= express.Router();
var bcrypt		= require('bcryptjs');
var salt		= bcrypt.genSaltSync(10);
var mailSender	= require('./mail.js');


/*
** SIGNIN TOOLS
*/
router.post('/signin', function(req, res) {
	var mail = req.body.mail;
	var pwd = req.body.pwd;

	if (mail == undefined || pwd == undefined) {
		res.sendStatus(400);
		return;s
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Check si mail ok
		connection.query("SELECT * FROM users WHERE mail = ?", [ mail ], function(err, rows) {
			if (err || rows.length == 0) {
				res.sendStatus(404);
				connection.release();
				return;
			}
			// Check si mdp ok
			var checkpass = bcrypt.compareSync(pwd, rows[0].password);

			if (checkpass) {
				req.session.user = rows[0].id;
				res.sendStatus(200);
				connection.release();
			} else {
				res.sendStatus(404);
				connection.release();
			}
		});
	});
});


/*
** SIGNOUT TOOLS
*/
router.get('/signout', function(req, res) {
	// Mise à jour de la dernière date de connexion - déconnexion - redirection.
	pool.getConnection(function(err, connection) {
		if (!err) {
			connection.query("UPDATE users SET last_visit = NOW() WHERE id = ?", [ req.session.user ], function(err, rows) {});
		}
		// req.session = null;
		// res.redirect('/');
		req.session.destroy(function(err) {
			res.redirect('/');
		});
		connection.release();
	});
});


/*
** SIGNUP TOOLS
*/
// Redirection à la page signup
router.get('/signup', function(req, res) {
	res.render('signup', {
		title: "Signup Page",
		connected: req.session.user !== undefined
	});
});
// Récupération des données
router.post('/signup', function(req, res) {
	var mail = req.body.mail;
	var pwd = req.body.pwd;
	var username = req.body.username;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;

	if (mail == undefined || pwd == undefined || username == undefined || firstname == undefined || lastname == undefined) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Check si l'adresse mail existe
		connection.query("SELECT * FROM users WHERE mail = ?", [ mail ], function(err, rows) {
			if (err || rows.length > 0) {
				res.status(409).send('Mail already exist');
				connection.release();
				return;
			}
			else {
				// Générer un UUID en js en respectant la norme RFC4122
				var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
				// Création du compte
				connection.query("INSERT INTO users (id, mail, password, username, firstname, lastname, state) VALUES (?, ?, ?, ?, ?, ?, ?)",
					[ uuid, mail, bcrypt.hashSync(pwd, salt), username, firstname, lastname, 'REGISTERED' ], function(err, rows) {
						if (err) {
							console.log(err);
							res.sendStatus(500);
						}
						else {
							req.session.user = uuid;
							res.sendStatus(200);
						}
						connection.release();
					});
			}
		});
	});
});


/*
** PASSWORD TOOLS
*/
// Réinitialisation du mot de passe
router.post('/reset', function(req, res) {
	var mail = req.body.mail;

	if (mail == undefined) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Check si l'adresse mail existe
		connection.query("SELECT * FROM users WHERE mail = ?", [ mail ], function(err, rows) {
			if (rows.length == 0) {
				res.sendStatus(404);
			}
			else {
				// Générer un nouveau mot de passe
				var new_pwd = Math.random().toString(36).slice(2);
				var mailOptions = {
					from: '"Mrs.Doubtfire" <noreply@nanny.42.fr>',
					to: rows[0].mail,
					subject: 'Reset password ✅',
					text: "Salut ! Voici ton nouveau mot de passe : " + new_pwd
				};
				mailSender.sendMail(mailOptions, function(error, info) {
					console.log('Le nouveau mot de passe a bien été envoyé à ' + rows[0].id);
				});
				// Modification du mot de passe
				connection.query("UPDATE users SET password = ? WHERE id = ?", [ bcrypt.hashSync(new_pwd, salt), rows[0].id ], function(err, rows) {});
				res.sendStatus(201);
			}
			connection.release();
		});
	});
});
// Changement du mot de passe
router.post('/changepwd', function(req, res) {
	var old_pwd = req.body.old;
	var new_pwd = req.body.pwd;
	var user = req.session.user;

	if (old_pwd == undefined || new_pwd == undefined || user == undefined) {
		res.sendStatus(400);
		return;
	}
	console.log(old_pwd + " " + new_pwd);
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Check si l'utilisateur existe
		connection.query("SELECT * FROM users WHERE id = ?", [ user ], function(err, rows) {
			// Check si l'ancien mot de passe est valide
			var checkpass = bcrypt.compareSync(old_pwd, rows[0].password);
			if (checkpass === true) {
				// Changer mot de passe
				connection.query("UPDATE users SET password = ? WHERE id = ?", [ bcrypt.hashSync(new_pwd, salt), user ], function(err, rows) {});
				res.sendStatus(200);
			} else
			res.sendStatus(404);
		});
		connection.release();
	});
});


module.exports = router;