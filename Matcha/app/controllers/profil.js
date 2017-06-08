var	express		= require('express');
var	router		= express.Router();
var	pool		= require('../config/db.js');
var	async		= require('async');
var	http		= require('http');
var	moment		= require('moment');
var notif		= require('../config/event');


/*
 ** Page Profil d'utilisateur
 */

router.get('/:id', function(req, res) {
	var user = req.params.id;

	pool.getConnection(function(err, connection) {
		if (err) {
			callback(true);
			return;
		}
		// async s'occupe de détecter que chacune des fonctions appelées se soient terminées avant d'appeler la fonction finale.
		async.parallel([
			// Get user data
			function(callback) {
				connection.query("SELECT * FROM users WHERE id = ?", [ user ], function(err, rows) {
					if (err || rows.length == 0) {
						callback(true);
						return;
					}
					// Check si il y a une photo de profil
					if (rows[0].picture !== undefined) {
						connection.query("SELECT * FROM images WHERE id = ?", [ rows[0].picture ], function(err2, rows2) {
							// Check dans la db
							if (!err2 && rows2.length > 0) {
								rows[0].picture = rows2[0].img;
								callback(false, rows[0]);
							} else {
								callback(false, rows[0]);
							}
						});
					}
					else {
						callback(false, rows[0]);
					}
				});
			},
			// Get les tags de l'utilisateur
			function(callback) {
				connection.query("SELECT * FROM user_tags WHERE user = ?", [ user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}

					var tags = [];

					if (rows.length > 0) {
						// Récupère tout les tags de l'user
						async.each(rows, function(item, callback) {
							connection.query("SELECT * FROM tags WHERE id = ?", [ item.tag ], function(err, rows2) {
								if (err) {
									callback(true);
									return;
								}
								// Si le tag existe, le mets dans le tableau
								if (rows2.length > 0) {
									tags.push( { id: rows2[0].id, name: rows2[0].name });
									callback();
								}
							});
						}, function(err) {
							if (err)
								callback(true);
							else
								callback(false, tags);
						});
					} // Si pas de tags :
					else {
						callback(false, tags);
					}
				});
			},
			// Get les photos de l'utilisateur
			function(callback) {
				connection.query("SELECT * FROM images WHERE user = ?", [ user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					callback(false, rows)
				})
			},
			// Get les photos de l'utilisateur connecté à la session
			function(callback) {
				connection.query("SELECT * FROM images WHERE user = ?", [ req.session.user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					callback(false, rows)
				})
			},
			// Check si l'utilisateur a bloqué ce profil
			function(callback) {
				connection.query("SELECT * FROM user_blockeds WHERE blocked = ? AND user = ?", [ user, req.session.user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					if (rows.length == 0) {
						callback(false, false);
					}
					else {
						callback(false, true);
					}
				});
			},
			// Check si l'utilisateur a liké ce profil
			function(callback) {
				connection.query("SELECT * FROM user_matchs WHERE matched = ? AND user = ?", [ user, req.session.user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					if (rows.length == 0) {
						callback(false, false);
					}
					else {
						callback(false, true);
					}
				});
			},
			// Check si y a un match entre les deux utilisateurs
			function(callback) {
				connection.query("SELECT * FROM user_matchs WHERE mutual = 1 AND matched = ? AND user = ?", [ user, req.session.user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					if (rows.length == 0) {
						callback(false, false);
					}
					else {
						callback(false, true);
					}
				});
			},
			// Check si l'user du profil a deja liké ton profil
			function(callback) {
				connection.query("SELECT * FROM user_matchs WHERE mutual = 0 AND matched = ? AND user = ?", [ req.session.user, user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					if (rows.length == 0) {
						callback(false, false);
					}
					else {
						callback(false, true);
					}
				});
			}
		],
		function(err, results) {
			if (err) {
				res.sendStatus(500);
				return;
			}
			// mise à jour du moment de la dernière visite
			results[0].last_visit = moment(results[0].last_visit).fromNow();
			// else
			res.render('profil', {
				title: "Profil de " + results[0].firstname,
				user: results[0],
				tags: results[1],
				images: results[2],
				images_me: results[3],
				blocked: results[4],
				liked: results[5],
				matched: results[6],
				likeme: results[7],
				connected: req.session.user !== undefined
			});
			// ajout de la visite
			if (req.session.user != results[0].id) {
				connection.query("INSERT INTO visits (user, visited) VALUES (?, ?)", [ req.session.user, results[0].id ], function(err, rows) {});
				// émettre une notification
				notif.emit('user_visit', req.session.user, user);
				connection.release();
			}
		});
	});
});


/*
** Signaler - Bloquer - Liker - Visiter
*/

router.post('/signaler', function(req, res) {
	var id		= req.body.id;
	var reason	= req.body.reason;

	if (id == undefined || reason == undefined || id === req.session.user) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Générer un UUID en js en respectant la norme RFC4122
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
		// Check l'identité du signalé
		connection.query("SELECT id FROM users WHERE id = ?", [ id ], function(err, rows) {
			if (rows.length == 0)
				res.sendStatus(404);
			else {
				// Création du rapport
				connection.query("INSERT INTO reports (id, user, reported, type) VALUES (?, ?, ?, ?)", [ uuid, req.session.user, id, reason ], function(err, rows) {
					if (err)
						res.sendStatus(500);
					else
						res.sendStatus(201);
				});
			}
			connection.release();
		});
	});
});

router.post('/bloquer', function(req, res) {
	var id	= req.body.id;

	if (id == undefined || id === req.session.user) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Check si le blocage existe déjà ou non
		connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ req.session.user, id ], function(err, rows) {
			// Bloquer ce profil
			if (rows.length == 0) {
				connection.query("INSERT INTO user_blockeds (user, blocked) VALUES (?, ?)", [ req.session.user, id ], function(err, rows) {
					if (err)
						res.sendStatus(500);
					else
						res.sendStatus(201);
				});
			}
			// Débloquer ce profil
			else {
				connection.query("DELETE FROM user_blockeds WHERE user = ? AND blocked = ?", [ req.session.user, id ], function(err, rows) {
					if (err)
						res.sendStatus(500);
					else
						res.sendStatus(201);
				});
			}
			connection.release();
		});
	});
});

router.post('/like', function(req, res) {
	var	id = req.body.id;

	if (id == undefined || id === req.session.user) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Check si l'utilisateur a déjà liké ce profil
		connection.query("SELECT * FROM user_matchs WHERE user = ? AND matched = ?", [ req.session.user, id ], function(err, rows) {
			// Like ce profil
			if (rows.length == 0) {
				connection.query("INSERT INTO user_matchs (user, matched) VALUES (?, ?)", [ req.session.user, id], function(err, rows) {
					if (err)
						res.sendStatus(500);
					else {
						res.sendStatus(201);
						notif.emit('user_like', req.session.user, id);
					}
				});
			}
			// Dislike ce profil
			else {
				connection.query("DELETE FROM user_matchs WHERE user = ? AND matched = ?", [ req.session.user, id ], function(err, rows) {
					if (err)
						res.sendStatus(500);
					else {
						res.sendStatus(201);
						notif.emit('user_dislike', req.session.user, id);
					}
				});
			}
			connection.release();
		});
	});
});

router.post('/visiter', function(req, res) {
	var	id = req.body.id;

	if (id == undefined) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// TRUC
		connection.query("SELECT * FROM visits WHERE visited = ? ORDER BY date DESC LIMIT 15", [ id ], function(err, rows) {
			async.each(rows, function(item, callback) {
				// Get l'identité de l'utilisateur
				connection.query("SELECT * FROM users WHERE id = ?", [ item.user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					// Définir le nom du visiteur et la date
					item.user = rows[0].firstname + " " + rows[0].lastname;
					item.date = moment(item.date).fromNow();
					callback();
				});
			}, function(err) {
				if (err)
					res.sendStatus(500);
				else
					res.send(rows);
			});
		});
		connection.release();
	});
});

module.exports = router;