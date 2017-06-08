/*
** Gestion mysql
*/

const mysql = require('mysql');

const pool = mysql.createPool({
	host		: 'localhost',
	user		: 'root',
	password	: 'root42',
	port		: 3307,
	database	: 'matchei'
});

module.exports = pool;