var	express		= require('express');
var	router		= express.Router();
var	pool		= require('../config/db.js');
var	async		= require('async');
var	http		= require('http');
var	moment		= require('moment');
const publicIp	= require('public-ip');
var iplocation	= require('ip-location');

/*
** Page Compte d'utilisateur
*/

router.get('/', function(req, res) {
	// async s'occupe de détecter que chacune des fonctions appelées se soient terminées avant d'appeler la fonction finale.
	async.parallel([
		// Get infos im™ages
		function(callback) {
			pool.getConnection(function(err, connection) {
				if (err) {
					callback(true);
					return;
				}
				connection.query("SELECT * FROM users WHERE id = ?", [ req.session.user ], function(err, rows) {
					if (err) {
						connection.release();
						callback(true);
						return;
					}
					// Check si il y a une photo de profil
					if (rows[0].picture !== undefined) { 
						connection.query("SELECT * FROM images WHERE id = ?", [ rows[0].picture ], function(err2, rows2) {
							// Check dans la db
							if (!err2 && rows2.length > 0) {
								rows[0].picture = rows2[0].img;
								connection.release();
								callback(false, rows[0]);
							} else {
								connection.release();
								callback(false, rows[0]);
							}
						});
					} else {
						connection.release();
						callback(false, rows[0]);
					}
				});
			});
		},
		// Get infos tags
		function(callback) {
			pool.getConnection(function(err, connection) {
				if (err) {
					callback(true);
					return;
				}
				connection.query("SELECT * FROM user_tags WHERE user = ?", [ req.session.user ], function(err, rows) {
					if (err) {
						connection.release();
						callback(true);
						return;
					}

					var tags = [];

					if (rows.length > 0) {
						// Récupère tout les tags de l'user
						async.each(rows, function(item, callback) {
							connection.query("SELECT * FROM tags WHERE id = ?", [ item.tag ], function(err, rows2) {
								if (err) {
									connection.release();
									callback(true);
									return;
								}
								// Si le tag existe, le mets dans le tableau
								if (rows2.length > 0) {
									tags.push( { id: rows2[0].id, name: rows2[0].name } );
									callback();
								}
							});
						}, function(err) {
							connection.release();
							if (err)
								callback(true);
							else
								callback(false, tags);
						});
					} // Si pas de tags :
					else {
						connection.release();
						callback(false, tags);
					}
				});
			});
		},
		// Get les photos de l'utilisateur
		function(callback) {
			pool.getConnection(function(err, connection) {
				if (err) {
					callback(true);
					return;
				}
				connection.query("SELECT * FROM images WHERE user = ?", [ req.session.user ], function(err, rows) {
					if (err) {
						connection.release();
						callback(true);
						return;
					}
					connection.release();
					callback(false, rows);
				});
			});
		}
	],
	function (err, results) {
		if (err) {
			res.send(500);
			return;
		}
		// else
		res.render('compte', {
			title: 'Compte Page',
			user: results[0],
			tags: results[1],
			images: results[2],
			connected: req.session.user !== undefined
		});
	});
});


/* Tools routes modifications */

router.post('/update', function(req, res) {
	var type = req.body.type;
	var data = req.body.data;

	if (type == undefined || data == undefined) {
		res.sendStatus(400);
		return;
	}
	// async.series exécute une série de rappels à l'ordre
	async.series([
		function(callback) {
			if (type === "location" && (data === "refused" || data === undefined)) {
				publicIp.v4().then(ip => {
					iplocation(ip, function(err, res) {
						if (res) {
							data = res.latitude+','+res.longitude;
							callback(null, 1);
						}
					})
				});
			}
			else
				callback(null, 1);
		},
		function(callback) {
			pool.getConnection(function(err, connection) {
				if (err) {
					res.sendStatus(500);
					callback(null, 2);
					return;
				}
				// Requête maj des données
				connection.query("UPDATE users SET ??=? WHERE id = ?", [ type, data, req.session.user ], function(err, rows) {
					if (err) {
						res.sendStatus(400);
						connection.release();
					} else {
						connection.release();
						res.sendStatus(200);
					}
					callback(null, 2);
				})
			});
		}
	]);
});



/* Tools recup donnée localisation */

router.post('/retrieve', function(req, res) {
	var type = req.body.type;
	var data = req.body.data;

	if (type == undefined) {
		res.sendStatus(400);
		return;
	}
	// async.series exécute une série de rappels à l'ordre
	async.series([
		function(callback) {
			if (type === "location" && data === "refused") {
				publicIp.v4().then(ip => {
					iplocation(ip, function(err, res) {
						if (res) {
							data = res.latitude+','+res.longitude;
							callback(null, 1);
						}
					})
				});
			}
			else
				callback(null, 1);
		},
		function(callback) {
			pool.getConnection(function(err, connection) {
				if (err) {
					res.sendStatus(500);
					callback(null, 2);
					return;
				}
				// Requête maj des données
				connection.query("UPDATE users SET ??=? WHERE id = ?", [ type, data, req.session.user ], function(err, rows) {
					if (err) {
						res.sendStatus(400);
						connection.release();
					} else {
						connection.release();
						res.sendStatus(200);
					}
					callback(null, 2);
				})
			});
		}
	]);
});


/* Tools TAGS : add and delete */

router.post('/tag/add', function(req, res) {
	var tag = req.body.tag;

	if (tag == undefined) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Check si le tag existe
		connection.query("SELECT * FROM tags WHERE name LIKE ?", [ tag ], function(err, rows) {
			var id = null;
			// Si le tag n'existe pas
			if (rows.length == 0) {
				// Générer un UUID en js en respectant la norme RFC4122
				var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
				// Le crée dans la db
				connection.query("INSERT INTO tags (id, name) VALUES(?, ?)", [ id, tag ], function(err, rows) {});
			}
			// else get id
			else {
				id = rows[0].id;
			}
			// Check si le tag est déjà dans la liste de l'user
			connection.query("SELECT * FROM user_tags WHERE user = ? AND tag = ?", [ req.session.user, id ], function(err, rows) {
				// Non et du coup, l'ajoute
				if (rows.length == 0) {
					connection.query("INSERT INTO user_tags (user, tag) VALUES(?, ?)", [req.session.user, id ], function(err, rows) {});
					connection.release();
					res.sendStatus(201);
				}
				// Oui, du coup envoi message d'infos avec main.js
				else {
					connection.release();
					res.sendStatus(409);
				} 
			});
		});
	});
});

router.post('/tag/delete', function(req, res) {
	var id = req.body.tag;

	if (id == undefined) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		connection.query("DELETE FROM user_tags WHERE tag = ? AND user = ?", [ id, req.session.user ], function(err, rows) {
			if (err) {
				connection.release();
				res.sendStatus(400);
			}
		});
		connection.release();
		res.sendStatus(200);
	});
});


/* Tools IMAGES : add and delete ANNNNND photo de profil */

router.put('/image/add', function(req, res) {
	var img = req.body.img;
	var path = img.split(',');

	if (img == undefined || path.length != 2 || !path[1].match("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$")) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		// Générer un UUID en js en respectant la norme RFC4122
		var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
		// Le crée dans la db
		connection.query("INSERT INTO images (id, user, img) VALUES(?, ?, ?)", [ id, req.session.user, img ], function(err, rows) {
			connection.release();
			res.sendStatus(201);
		});
	});
});

router.post('/image/delete', function(req, res) {
	var id = req.body.img;

	if (id == undefined) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		connection.query("SELECT picture FROM users WHERE id = ?", [ req.session.user ], function(err, rows) {
			// Si la photo a supprimé est une photo de profil, supprimer d'abord la photo de profil
			if (rows[0].picture === id)
				connection.query("UPDATE users SET picture='' WHERE id = ?", [ req.session.user ], function(err, rows) {});
			// puis l'image
			connection.query("DELETE FROM images WHERE user = ? AND id = ?", [ req.session.user, id ], function(err, rows) {});
			connection.release();
			res.sendStatus(200);
		});
	});
});

router.post('/image/favorite', function( req, res ) {
	 var id = req.body.img;
	 
	 // is request correctly formed
	 if ( id == undefined ) {
	 	res.sendStatus( 400 ); return ;
	 }
	 
	 // get connection from the pool
	 pool.getConnection(function( err, connection ) {
		if ( err ) { res.sendStatus( 500 ); return ; }
	    
	  	// delete image
		connection.query("UPDATE users SET picture = ? WHERE id = ?", [ id, req.session.user ], function ( err, rows ) {
            connection.release();
		  	res.sendStatus( 200 );
		});
	});
});


// Alerts

router.get('/alert', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		connection.query("SELECT * FROM user_alerts WHERE user = ? ORDER BY shown, date DESC LIMIT 20", [ req.session.user ], function(err, rows) {
			for (var i = 0; i < rows.length; i++) {
				rows[i].date = moment(rows[i].date).fromNow();
			}
			res.send(rows);
		});
		connection.release();
	});
});


// Liste de visites

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
					item.tmp = item.user;
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


// Liste des bloqués

router.post('/bloquer', function(req, res) {
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
		connection.query("SELECT * FROM user_blockeds WHERE user = ?", [ id ], function(err, rows) {
			async.each(rows, function(item, callback) {
				// Get l'identité de l'utilisateur
				connection.query("SELECT * FROM users WHERE id = ?", [ item.blocked ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					// Définir le nom du visiteur et la date
					item.tmp = item.blocked;
					item.blocked = rows[0].firstname + " " + rows[0].lastname;
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


// Liste des bloqués

router.post('/like', function(req, res) {
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
		connection.query("SELECT * FROM user_matchs WHERE matched = ? ORDER BY date DESC", [ id ], function(err, rows) {
			async.each(rows, function(item, callback) {
				// Get l'identité de l'utilisateur
				connection.query("SELECT * FROM users WHERE id = ?", [ item.user ], function(err, rows) {
					if (err) {
						callback(true);
						return;
					}
					// Définir le nom du visiteur et la date
					item.tmp = item.user;
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