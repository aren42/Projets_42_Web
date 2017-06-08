var pool		= require('../config/db');
var schedule	= require('node-schedule');
var async		= require('async');


/*/*
** Tools Score de Popularité
*/
// Update toutes les 42 minutes
schedule.scheduleJob('*/42 * * * *', function() {
	pool.getConnection(function(err, connection) {
		if (err)
			return;
		console.log("Mise à jour des scores de Popularité ..");
		var total_users;

		connection.query("SELECT * FROM users WHERE 1", function(err, rows) {
			total_users = rows.length;
			// Calcul le score de popularité pour chaque utilisateur
			async.each(rows, function(user, callback) {
				connection.query("SELECT COUNT(*) AS count FROM visits WHERE visited = ? UNION ALL SELECT COUNT(*) FROM user_matchs WHERE matched = ? UNION ALL SELECT COUNT(*) FROM user_blockeds WHERE blocked = ?",
					[ user.id, user.id, user.id ], function(err, rows) {
						// (Nb_visits + (Nb_likes * 10)) / (Nb_blockeds * 20)
						var resultat = (rows[0].count + (rows[1].count * 10)) - (rows[2].count * 20);
						console.log(user.username + " : " + resultat);
						// Mettre la limite entre 0 et 100
						if (resultat < 0)
							resultat = 0;
						else if (resultat > 1000)
							resultat = 1000;
						// Maj du score de popularité de l'user
						connection.query("UPDATE users SET score = ? WHERE id = ?", [ resultat, user.id ], function(err, rows) {
							callback();
						});
					});
			}, function(err) {
				console.log("Ok");
			});
		});
		connection.release();
	});
});
