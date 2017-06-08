<?php
	// DB
	$server = "localhost";
	$user = "root";
	$pass = "root";
	$dbname = "ft_minishop";

	$connect = mysqli_connect($server, $user, $pass, $dbname);

	if (!$connect) {
		die("Connection failed: ".mysqli_connect_error()."<br /><h1><a href=\"install.php\">Première connexion ? Cliquez ici.</a></h1>");
	}
?>
