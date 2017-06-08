var	pool	= require('../config/db');
var async	= require('async');

module.exports = function(io, users) {
	// Connexion socket
	io.on('connection', function(socket) {
		var id = socket.handshake.session.user;
		if (id != undefined) {
			// Stock le socket user
			users[id] = socket;
			pool.getConnection(function(err, connection) {
				if (err) {
					return;
				}
				// Envoie le nombre d'alerte non lu
				connection.query("SELECT COUNT(*) FROM user_alerts WHERE user = ? AND shown = '0'", [ id ], function(err, rows) {
					socket.emit('alerts', {'nbr' : rows[0]['COUNT(*)']});
				});
				// Initialiser le last_visit
				connection.query("UPDATE users SET last_visit = ? WHERE id = ?", [ '0000-00-00 00:00:00', id], function(err, rows) {
					if (err)
						return;
				})
				// Récupère les données de l'user qui a match
				connection.query("SELECT id,lastname,firstname,picture,last_visit FROM users LEFT JOIN user_matchs ON user = ? AND mutual = '1' WHERE users.id = user_matchs.matched", [ id ], function(err, rows) {
					// Check si le chat entre les deux users existe ou pas
					async.each(rows, function(item, callback) {
						connection.query("SELECT * FROM chats WHERE (user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?)", [ id, item.id, item.id, id ], function(err, rows) {
							// Si inexistant, le crée.
							if (rows.length == 0) {
								// Générer un UUID en js en respectant la norme RFC4122
								var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
									var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
									return v.toString(16);
								});
								connection.query("INSERT INTO chats (id, user_1, user_2) VALUES (?, ?, ?)", [ uuid, id, item.id ], function (error, rows) {
									item.id = uuid;
									callback();
								});
							} else {
								item.id = rows[0].id;
								callback();
							}
						});
					}, function(err) {
						//  Envoie de la liste des contacts
						socket.emit('user_list', rows);
					});
				});
				connection.release();
			});
		}

		socket.on('notif_lu', function(data) {
			if (id != undefined && data.id != undefined) {
				pool.getConnection(function(err, connection) {
					if (err) {
						return;
					}
					connection.query("SELECT * FROM user_alerts WHERE id = ?", [ data.id ], function(err, rows) {
						// Check si y a une notif et si ca concerne l'user
						if (rows.length > 0 && rows[0].user === id) {
							connection.query("UPDATE user_alerts SET shown = '1' WHERE id = ?", [ data.id ], function(err, rows) {});
						}
					});
					connection.release();
				});
			}
		});

		socket.on('nouveau_msg', function(data) {
			if (id != undefined || data.chat == undefined || data.msg == undefined) {
				// get sql connection
				pool.getConnection(function (err, connection) {
					if ( err ) { return ; }

					connection.query("SELECT * FROM chats WHERE id = ? AND (user_1 = ? OR user_2 = ?)", [ data.chat, id, id], function(err, rows) {
						if (rows.length == 0) return ;
						connection.query('INSERT INTO chat_msgs (id, user, msg) VALUES (?, ?, ?)', [ data.chat, id, data.msg ], function (err, rows) {});
						// Get id de l'autre utilisateur
						var partenaire;
						if (id === rows[0].user_1)
							partenaire = rows[0].user_2;
						else if (id === rows[0].user_2)
							partenaire = rows[0].user_1;
						
						// Si partenaire est connecté, le chat est accessible
						if (users[partenaire] !== undefined) {
							connection.query('SELECT * FROM users WHERE id = ?', [ id ], function (err, rows) {
								users[partenaire].emit('nouveau_msg', {
									user: rows[0].firstname + " " + rows[0].lastname,
									chat: data.chat,
									msg: data.msg
								});
							});
						}
						// notif
						else {
							// Check si le destinataire a bloqué l'user
							connection.query("SELECT * FROM user_blockeds WHERE user = ? AND blocked = ?", [ partenaire, id ], function (err, rows) {
								if (rows.length == 0) {
									// Générer un UUID en js en respectant la norme RFC4122
									var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
										var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
										return v.toString(16);
									});
									connection.query('SELECT * FROM users WHERE id = ?', [ id ], function (err, rows) {
										if (rows.length > 0) {
											var msg = rows[0].firstname + " " + rows[0].lastname + " t'a envoyé un message.";
											connection.query('INSERT INTO user_alerts (id, user, actor, msg) VALUES (?, ?, ?, ?)', [ uuid, partenaire, id, msg ], function (err2, rows2) {});
										}
									});	
								}
							});
						}
					});
					connection.release();
				});
			}
		})

		socket.on('get_previous_msg', function(data) {
			if (id === undefined || data.id === undefined) {
				return;
			}
			pool.getConnection(function(err, connection) {
				if (err) {
					return;
				}
				connection.query("SELECT * FROM chats WHERE id = ?", [ data.id ], function(err, rows) {
					if (rows.length > 0 && (rows[0].user_1 === id || rows[0].user_2 === id)) {
						connection.query("SELECT * FROM chat_msgs WHERE id = ? ORDER BY date DESC LIMIT 20", [ data.id ], function(err, rows) {
							socket.emit('get_previous_msg', {
								msgs: rows,
								user: id,
								chat: data.id
							});
						});
					}
				});
			});
		});

		socket.on('disconnect', function() {
			if (id != undefined) {
				delete users[id];
				pool.getConnection(function(err, connection) {
					if (err) {
						return;
					}
					connection.query("UPDATE users SET last_visit = NOW() WHERE id = ?", [ id ], function(err, rows) {
						if (err) {
							return;
						}
					});
					connection.release();
				});
			}
		});
	});
}