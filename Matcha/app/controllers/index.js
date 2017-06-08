var express	= require('express');
var router	= express.Router();
var pool	= require('../config/db.js');

/*
** Page Index
*/

router.get('/', function(req, res) {
	if (req.session.user !== undefined) {
		pool.getConnection(function(err, connection) {
			if (err) {
				res.sendStatus(500);
				return;
			}
			connection.query('SELECT * FROM tags', function (err, rows) {
				res.render('rechercher', {
					title: 'Page de Recherche',
					connected: req.session.user !== undefined,
					tags: rows
				});
				connection.release();
			});
		});
	} else {
		res.render('index', {
			title: 'Page Index',
			message: 'Your header message',
			connected: req.session.user !== undefined,
			userName: (req.user) ? req.user.username : undefined
		});
	}
});

module.exports = router;