<?php
	require_once("./include/auth.php");

	if (!empty($_POST['mail']) && !empty($_POST['password1']) && !empty($_POST['password2'])) {
		if (preg_match('/@.+\./', $_POST['mail']) && $_POST['password1'] === $_POST['password2']) {
			// CONNECT
			$server = "localhost";
			$user = "root";
			$pass = "root";
			$dbname = "ft_minishop";

			$connect = mysqli_connect($server, $user, $pass);

			if (!$connect) {
				die("Connection failed: ".mysqli_connect_error());
			}

			// CREATE
			$sql = "CREATE DATABASE ".$dbname;
			if (mysqli_query($connect, $sql)) {
				echo "Database Ok<br />";
				mysqli_close($connect);

				$connect = mysqli_connect($server, $user, $pass, $dbname);

				if (!$connect) {
				    die("Connection failed: ".mysqli_connect_error());
				}

				// USER
				$sql = "CREATE TABLE users (
					uuid VARCHAR(255) NOT NULL PRIMARY KEY,
					mail VARCHAR(255) NOT NULL,
					password VARCHAR(128) NOT NULL,
					rank INT(1),
					create_at TIMESTAMP
				)";

				if (mysqli_query($connect, $sql)) {
				    echo "Users Ok<br />";
					$sql = "INSERT INTO users (uuid, mail, password, rank, create_at)
					VALUES ('".uuid()."', '".$_POST['mail']."', '".pass_hash($_POST['mail'], $_POST['password1'])."', 1, NOW())";

					if (mysqli_query($connect, $sql)) {
					    echo "New admin Ok<br />";
					}
					else {
					    echo "Error: ".$sql."<br />".mysqli_error($connect);
					}
				}
				else {
				    echo "Error creating table: ".mysqli_error($connect);
				}

				// ARTICLE
				$sql = "CREATE TABLE articles (
					uuid VARCHAR(255) NOT NULL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					categories TEXT,
					img VARCHAR(255),
					price FLOAT(4),
					stock INT(11)
				)";

				if (mysqli_query($connect, $sql)) {
				    echo "Article tab Ok<br />";
				}
				else {
				    echo "Error creating table: ".mysqli_error($connect);
				}

				$sql = "INSERT INTO `articles` (`uuid`, `name`, `categories`, `img`, `price`, `stock`) VALUES
				(1, 'Carapuce', 'Eau', 'Carapuce.png', 100, 100),
				(2, 'Carabaffe', 'Eau', 'Carabaffe.png', 100, 100),
				(3, 'Tortank', 'Eau', 'Tortank.png', 100, 100),
				(4, 'Tiplouf', 'Eau', 'Tiplouf.png', 100, 100),
				(5, 'Aquali', 'Eau', 'Aquali.png', 100, 100),
				(6, 'Leviator', 'Eau', 'Leviator.png', 100, 100),
				(7, 'Salameche', 'Feu', 'Salameche.png', 100, 100),
				(8, 'Reptincel', 'Feu', 'Reptincel.png', 100, 100),
				(9, 'Dracaufeu', 'Feu', 'Dracaufeu.png', 100, 100),
				(10, 'Pyroli', 'Feu', 'Pyroli.png', 100, 100),
				(11, 'Ponyta', 'Feu', 'Ponyta.png', 100, 100),
				(12, 'Feunard', 'Feu', 'Feunard.png', 100, 100),
				(13, 'Arcanin', 'Feu', 'Arcanin.png', 100, 100),
				(14, 'Bulbizarre', 'Plante', 'Bulbizarre.png', 100, 100),
				(15, 'Herbizarre', 'Plante', 'Herbizarre.png', 100, 100),
				(16, 'Florizarre', 'Plante', 'Florizarre.png', 100, 100),
				(17, 'Phyllali', 'Plante', 'Phyllali.png', 100, 100),
				(18, 'Germignon', 'Plante', 'Germignon.png', 100, 100),
				(19, 'Pikachu', 'Electrique', 'Pikachu.png', 100, 100),
				(20, 'Raichu', 'Electrique', 'Raichu.png', 100, 100),
				(21, 'Butterfree', 'Vol', 'Butterfree.png', 100, 100),
				(22, 'Evoli', 'Normal', 'Evoli.png', 100, 100),
				(23, 'Miaouss', 'Normal', 'Miaouss.png', 100, 100),
				(24, 'Melofee', 'Normal', 'Melofee.png', 500, 20),
				(25, 'Ronflex', 'Normal', 'Ronflex.png', 1000, 10)";

				if (mysqli_query($connect, $sql)) {
				    echo "Articles ajoutes!<br />";
				}
				else {
				    echo "Error creating table: ".mysqli_error($connect);
				}

				// CATEGORY
				$sql = "CREATE TABLE categories (
					uuid VARCHAR(255) NOT NULL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					article TEXT
				)";

				if (mysqli_query($connect, $sql)) {
				    echo "Category Ok<br />";
				}
				else {
				    echo "Error creating table: ".mysqli_error($connect);
				}
				$sql = "INSERT INTO `categories` (`uuid`, `name`, `article`) VALUES
				(1, 'Eau', ''),
				(2, 'Feu', ''),
				(3, 'Plante', ''),
				(4, 'Electrique', ''),
				(5, 'Vol', ''),
				(6, 'Normal', '')
				";
				if (mysqli_query($connect, $sql)) {
				    echo "Categories ajoutes!<br />";
				}
				else {
				    echo "Error en ajoutant les categories: ".mysqli_error($connect);
				}

				// COMMANDS
				$sql = "CREATE TABLE IF NOT EXISTS commands (
					uuid VARCHAR(255) NOT NULL,
					price INT(11) NOT NULL,
					tab TEXT
				)";

				if (mysqli_query($connect, $sql)) {
				    echo "Commands Ok<br />";
				}
				else {
				    echo "Error creating table: ".mysqli_error($connect);
				}
				echo "<a href=\"index.php\"><input type=\"submit\" name=\"submit\" value=\"Go\"></a>";
			}
			else {
				echo "Error creating database: " . mysqli_error($connect);
			}
			mysqli_close($connect);
		}
	}
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<link rel="stylesheet" href="install.css" charset="utf-8">
		<title>Install</title>
	</head>
	<body>
	<div class="install">
		<form action="install.php" method="post">
			<h3>Bienvenue Administrateur !</h3>
			<hr />
			<label for="mail">Email :</label>
			<input type="email" name="mail" value="" />
			<label for="password1">Mot de passe :</label>
			<input type="password" name="password1" value="" />
			<label for="password2">Mot de passe :</label>
			<input type="password" name="password2" value="" />
			<hr />
			<input type="submit" name="submit" value="Installer">
		</form>
	</div>
	</body>
</html>
