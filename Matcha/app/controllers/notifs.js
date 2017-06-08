var events	= require('../config/event');
var pool	= require('../config/db');

module.exports = function(users) {
	events.on('user_like', function(user, liker) {
		pool.getConnection(function(err, connection) {
			if (err) {
				res.sendStatus(500);
				return;
			}
			connection.query("SELECT * FROM user_matchs WHERE user = ? AND matched = ?", [ liker, user ], function(err, rows) {
				// Si il y a match
				if (rows.length > 0) {
					// Mise à jour db match = 1
					connection.query("UPDATE user_matchs SET mutual = '1' WHERE matched = ? AND user = ?", [ user, liker ], function(err, rows) {});
					connection.query("UPDATE user_matchs SET mutual = '1' WHERE matched = ? AND user = ?", [ liker, user ], function(err, rows) {});

					// Check que l'utilisateur n'est pas bloqué
					connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ liker, user ], function(err, rows) {
						if (rows.length == 0) {
							// Notifications
							if (users[liker] != undefined)
								users[liker].emit('new_alerts');
							// Générer un UUID en js en respectant la norme RFC4122
							var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
								var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
								return v.toString(16);
							});
							// Récupère le nom dans la db et enregistre une notif
							connection.query("SELECT firstname, lastname FROM users WHERE id = ?", [ user ], function(err, rows) {
								var message = rows[0].firstname + " " + rows[0].lastname + " a matché avec toi !";
								connection.query("INSERT INTO user_alerts (id, user, actor, msg) VALUES (?, ?, ?, ?)", [ id, liker, user, message ], function(err, rows) {});
							});
						}
					});
				} // Juste un like
				else {
					// Check que l'utilisateur n'est pas bloqué
					connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ liker, user ], function(err, rows) {
						if (rows.length == 0) {
							// Notifications
							if (users[liker] != undefined)
								users[liker].emit('new_alerts');
							// Générer un UUID en js en respectant la norme RFC4122
							var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
								var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
								return v.toString(16);
							});
							// Récupère le nom dans la db et enregistre une notif
							connection.query("SELECT firstname, lastname FROM users WHERE id = ?", [ user ], function(err, rows) {
								var message = rows[0].firstname + " " + rows[0].lastname + " a liké ton profil !";
								connection.query("INSERT INTO user_alerts (id, user, actor, msg) VALUES (?, ?, ?, ?)", [ id, liker, user, message ], function(err, rows) {});
							});
						}
					});
				}
			});
			connection.release();
		});
	});

	events.on('user_dislike', function(user, disliker) {
		pool.getConnection(function(err, connection) {
			if (err) {
				res.sendStatus(500);
				return;
			}
			connection.query("SELECT * FROM user_matchs WHERE user = ? AND matched = ?", [ disliker, user ], function(err, rows) {
				// Check si il y avait match
				if (rows.length > 0) {
					// Enlever le match
					connection.query("UPDATE user_matchs SET mutual = '0' WHERE matched = ? AND user = ?", [ user, disliker ], function(err, rows) {});
					connection.query("UPDATE user_matchs SET mutual = '0' WHERE matched = ? AND user = ?", [ disliker, user ], function(err, rows) {});

					// Check que l'utilisateur n'est pas bloqué
					connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ disliker, user ], function(err, rows) {
						if (rows.length == 0) {
							// Notifications
							if (users[disliker] != undefined)
								users[disliker].emit('new_alerts');
							// Générer un UUID en js en respectant la norme RFC4122
							var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
								var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
								return v.toString(16);
							});
							// Récupère le nom dans la db et enregistre une notif
							connection.query("SELECT firstname, lastname FROM users WHERE id = ?", [ user ], function(err, rows) {
								var message = rows[0].firstname + " " + rows[0].lastname + " aime plus ton profil.";
								connection.query("INSERT INTO user_alerts (id, user, actor, msg) VALUES (?, ?, ?, ?)", [ id, disliker, user, message ], function(err, rows) {});
							});
						}
					});
				}
			});
			connection.release();
		});
	});

	events.on('user_visit', function(user, visiteur) {
		pool.getConnection(function(err, connection) {
			if (err || user === visiteur) {
				connection.release();
				return ;
			}
			// Check que l'utilisateur n'est pas bloqué
			connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ visiteur, user ], function(err, rows) {
				if (rows.length == 0) {
					connection.query("SELECT * FROM users WHERE id = ?", [ user ], function(err, rows) {
							// Générer un UUID en js en respectant la norme RFC4122
							var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
								var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
								return v.toString(16);
							});
							// Récupère le nom dans la db et enregistre une notif
							connection.query("SELECT firstname, lastname FROM users WHERE id = ?", [ user ], function(err, rows) {
								var message = rows[0].firstname + " " + rows[0].lastname + " a visité ton profil !";
								connection.query("INSERT INTO user_alerts (id, user, actor, msg) VALUES (?, ?, ?, ?)", [ id, visiteur, user, message ], function(err, rows) {});
							});
					});
				}
			});
			connection.release();
		});
	});
}
