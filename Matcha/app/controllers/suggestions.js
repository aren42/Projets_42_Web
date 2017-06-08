var	express		= require('express');
var	router		= express.Router();
var	pool		= require('../config/db.js');
var	async		= require('async');


/*
 ** Page Index Rechercher
 */

router.get('/', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		connection.query("SELECT * FROM tags", function(err, rows) {
			res.render('suggestions', {
				title: 'Page des Suggestions',
				connected: req.session.user !== undefined,
				userName: (req.user) ? req.user.username : undefined,
				tags: rows
			});
			connection.release();
		});
	});
});


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

router.post('/', function( req, res ) {
	var age_min = req.body.age_min;
	var age_max = req.body.age_max;
	var distance_min = req.body.distance_min;
	var distance_max = req.body.distance_max;
	var score_min = req.body.score_min;
	var score_max = req.body.score_max;
	var interests = req.body.interests || [];
	var order_by = req.body.order_by

	if (age_min == undefined || age_max === undefined || distance_min == undefined || distance_max == undefined
	 	|| score_min === undefined || score_max === undefined || interests === undefined) {
		res.sendStatus( 400 ); return ;
	}
	pool.getConnection(function( err, connection ) {
		if ( err ) { res.sendStatus( 500 ); return ; }
			// Recup les données de l'user pour comparer
			connection.query('SELECT * FROM users WHERE id = ?', [ req.session.user ], function (err, rows) {
				var requester = rows[0];
				var sql = "1";
				// Homme Hetero => Femme Hetero ou Bi
				if (requester.orientation === "HETEROSEXUAL" && requester.gender === "MEN")
					sql = "gender = 'WOMEN' AND orientation != 'HOMOSEXUAL'";
				// Femme Hetero => Homme Hetero ou Bi
				else if (requester.orientation === "HETEROSEXUAL" && requester.gender === "WOMEN")
					sql = "gender = 'MEN' AND orientation != 'HOMOSEXUAL'";
				// Si Homo => Homo et même sexe
				else if (requester.orientation === "HOMOSEXUAL")
					sql = "gender = '" + requester.gender + "' AND orientation != 'HETEROSEXUAL'";
				// Homme Bi => tlm sauf Femme Homo ET Homme Hetero
				else if (requester.orientation === "BISEXUAL" && requester.gender == "MEN")
					sql = "id NOT IN (SELECT id FROM `users` WHERE `gender` = 'WOMEN' AND orientation = 'HOMOSEXUAL' UNION SELECT id FROM `users` WHERE `gender` = 'MEN' AND orientation = 'HETEROSEXUAL')";
				// Femme Bi => tlm sauf Homme Homo ET Femme Hetero
				else if (requester.orientation === "BISEXUAL" && requester.gender == "WOMEN")
					sql = "id NOT IN (SELECT id FROM `users` WHERE `gender` = 'MEN' AND orientation = 'HOMOSEXUAL' UNION SELECT id FROM `users` WHERE `gender` = 'WOMEN' AND orientation = 'HETEROSEXUAL')";

				// Cherche les users correspondant !
				connection.query('SELECT * FROM users WHERE ' + sql + ' ORDER BY score DESC', [], function ( err, users ) {
					
					async.each(users, function(user, callback) {
						// Enlever sa propre id
						if (user.id === requester.id) {
							delete users[users.indexOf(user)];
							callback();
						}
						// Retire les users incompatibles à la localisation
						else if (/* user.location.length == 0 || */distance(requester.location, user.location) < distance_min ||
							distance(requester.location, user.location) > distance_max) {
							delete users[users.indexOf(user)];
							callback();
						} 
						// Retire les users incompatibles à la popularité
						else if ( user.score < score_min || user.score > score_max ) {
							delete users[users.indexOf(user)];
							callback();
						}
						// Retire les users incompatibles à l'âge
						else if ( user.age < age_min || user.age > age_max ) {
							delete users[users.indexOf(user)];
							callback();
						}
						// Retire les users incompatibles avec leurs intérêts et mach avec ceux qui sont compatibles
						else if ( interests.length > 0) {
							connection.query('SELECT * FROM `user_tags` WHERE `user` = ? AND `tag` IN (?)', [ user.id, interests ], 
								function ( err, rows) {
								if (rows.length == 0)
									delete users[users.indexOf(user)];
								callback();
							})
						} 
						else {
							// Retire les users bloqués
							connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ requester.id, user.id ], function (err, rows) {
								if (rows.length > 0) {
									delete users[users.indexOf(user)];
								}
								// Retire les users qui t'ont bloqués
								connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ user.id, requester.id ], function(err, rows2) {
									if (rows2.length > 0) {
										delete users[users.indexOf(user)];
									}
									callback();
								});
							});
						}
					}, function ( err ) {
						var returned_users = [];
						users.clean();
						
						// Renvoi vide si il n'y a pas d'utilisateur sélectionné
						if (users.length == 0) {
							connection.release();
							res.send( returned_users );
							return ;
						}
						
						// Sinon récupère les noms et photos des utilisateurs sélectionnés
						async.each(users, function (item, callback) {
							// Si l'utilisateur n'a pas de photo
							if (item.picture == undefined || item.picture.length == 0) {
								returned_users.push( item );
								callback();
							}
							else {
								connection.query("SELECT * FROM images WHERE id = ?", [ item.picture ],  function( err, rows ) {
									if (err) { returned_users.push( item ); callback( true ); return ; }
									if ( rows.length > 0 ) {
										item.picture = rows[0].img;
										returned_users.push( item );
									}
									callback();
								});
							}
						}, function (err) {
							// Trier par ordre de personnes intéressantes
							async.sortBy(returned_users, function(user, callback) {
								// Trier par le plus de points communs
								if (order_by === "ponderation") {
									connection.query('SELECT DISTINCT * FROM `user_tags` WHERE user = ? AND tag IN ( SELECT tag FROM `user_tags` WHERE user = ?)',
										[ user.id, requester.id], function ( err, rows) {
										callback(null, (-(distance(user.location, requester.location) / 2) + (rows.length * 20) + (user.score / 12)) * - 1);
									});
								} else if (order_by === "tags") {
									connection.query('SELECT DISTINCT * FROM `user_tags` WHERE user = ? AND tag IN ( SELECT tag FROM `user_tags` WHERE user = ?)',
										[ user.id, requester.id], function ( err, rows) {
										callback(null, (-rows.length));
									});
								}
								else if (order_by === "age") {
									callback(null, -user.age);
								}
								else if (order_by === "distance") {
									callback(null, distance(user.location, requester.location));
								}
								else if (order_by === "popularite") {
									callback(null, -user.score);
								}
								else {
									callback(null, 0);
								}
							}, function(err, result){
								if (err) {
									res.sendStatus( 404 );
								}
								res.send( result );
								connection.release();
							});
					});
				});
			});
		});
	});
});

module.exports = router;