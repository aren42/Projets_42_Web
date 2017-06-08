var	express		= require('express');
var	router		= express.Router();
var	pool		= require('../config/db.js');
var	async		= require('async');


/*
 ** Page Index Rechercher
 */


/* Tools fonctions */

// Calcule de la distance entre deux personnes
function distance(user, me) {
	var loc1 = user.split(',');
	var loc2 = me.split(',');
	var lat1 = loc1[0];
	var lon1 = loc1[1];
	var lat2 = loc2[0];
	var lon2 = loc2[1];
	var p = 0.017453292519943295;
	var c = Math.cos;
	var a = 0.5 - c((lat2 - lat1) * p)/2 +  c(lat1 * p) * c(lat2 * p) *  (1 - c((lon2 - lon1) * p))/2;
	return 12742 * Math.asin(Math.sqrt(a));
}

// clean un tableau
Array.prototype.clean = function(deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {         
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};


/*
 ** Page Index Rechercher
 */

router.post('/', function(req, res) {
	var name = '%' + req.body.name + '%' || '%';
	var age_min = req.body.age_min;
	var age_max = req.body.age_max;
	var score_min = req.body.score_min;
	var score_max = req.body.score_max;
	var distance_min = req.body.distance_min;
	var distance_max = req.body.distance_max;
	var nb_tags = req.body.nb_tags || [];
	var order_by = req.body.order_by;

	if (name == undefined || age_min == undefined || age_max == undefined || score_min == undefined || score_max == undefined
		|| distance_min == undefined || distance_max == undefined || nb_tags == undefined) {
		res.sendStatus(400);
		return;
	}
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		connection.query("SELECT id,username,firstname,lastname,age,location,picture,score FROM users WHERE id = ?", [ req.session.user ], function(err, rows) {
			var request = rows[0];
			// match name
			connection.query("SELECT * FROM users WHERE firstname LIKE ? OR lastname LIKE ? OR username LIKE ?", [ name, name, name ], function(err, users) {
				async.each(users, function(user, callback) {
					// // Retire toi même de la liste
					// if (user.id === request.id) {
					// 	delete users[users.indexOf(user)];
					// 	callback();
					// }
					// Retire les users incompatibles à la localisation
					if (user.location.length == 0 || distance(request.location, user.location) < distance_min || distance(request.location, user.location) > distance_max) {
						delete users[users.indexOf(user)];
						callback();
					}
					// // Retire les users incompatibles à la poplarité
					// else if (user.score < score_min || user.score > score_max) {
					// 	delete users[users.indexOf(user)];
					// 	callback();
					// }
					// Retire les users incompatibles à l'âge
					else if (user.age < age_min || user.age > age_max) {
						delete users[users.indexOf(user)];
						callback();
					}
					// Retire les users incompatibles avec leurs intérêts et mach avec ceux qui sont compatibles
					else if (nb_tags.length > 0) {
						connection.query("SELECT * FROM user_tags WHERE user = ? AND tag IN (?)", [ user.id, nb_tags ], function(err, rows) {
							if (rows.length == 0) {
								delete users[users.indexOf(user)];
							}
							callback();
						})
					}
					else {
						// Retire les users bloqués
						connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ request.id, user.id ], function (err, rows) {
							if (rows.length > 0) {
								delete users[users.indexOf(user)];
							}
							// Retire les users qui t'ont bloqués
							connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ user.id, request.id ], function(err, rows2) {
								if (rows2.length > 0) {
									delete users[users.indexOf(user)];
								}
								callback();
							});
						});
					}
				}, function(err) {
					var return_users = [];
					users.clean();
					// Renvoi vide si il n'y a pas d'utilisateur sélectionné
					if (users.length == 0) {
						connection.release();
						res.send(return_users);
						return;
					}
					// Sinon récupère les noms et photos des utilisateurs sélectionnés
					async.each(users, function(item, callback){
						// Si l'utilisateur n'a pas de photo
						if (item.picture == undefined || item.picture.length == 0) {
							return_users.push(item);
							callback();
						}
						else {
							connection.query("SELECT * FROM images WHERE id = ?", [ item.picture ], function(err, rows) {
								if (err) {
									return_users.push(item);
									callback(true);
									return;
								}
								if (rows.length > 0) {
									item.picture = rows[0].img;
									return_users.push(item);
									callback();
								}
								else
									callback();
							});
						}
					}, function(err) {
						// Si order_by est sélectionné, il faut trier !
						async.sortBy(return_users, function(user, callback) {
							// Trier par tags en commun
							if (order_by === "age") {
								callback(null, -user.age);
							}
							else if (order_by === "popularite") {
								callback(null, -user.score);
							}
							else if (order_by === "distance") {
								callback(null, distance(user.location, request.location));
							}
							else if (order_by === "tags") {
								connection.query("SELECT DISTINCT * FROM user_tags WHERE user = ? AND tag IN (SELECT tag FROM user_tags WHERE user = ?)",
									[ user.id, request.id ], function(err, rows) {
										callback(null, -rows.length);
									});
							}
							else {
								callback(null, 0);
							}
						}, function(err, result) {
							connection.release();
							if (err)
								res.sendStatus(404);
							else
								res.send(result);
						});
					});
				});
			});
		});
	});
});

module.exports = router;