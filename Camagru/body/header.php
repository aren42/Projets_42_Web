<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<link rel="stylesheet" href="style/css.css" charset="utf-8">
		<link rel="stylesheet" href="style/font-awesome-4.7.0/css/font-awesome.min.css">
		<title>Camagru</title>
	</head>
	<body>
		<nav>
			<div class="container">
				<div class="foothead_left">
					<a href="index.php">Camagru</a>
				</div>
				<div class="foothead_right">
					<?php
					if ($_SESSION) {
						echo '<a href="signout.php">Se déconnecter</a>';
					} else {
						echo '<a href="signin.php">Login</a>';
					}
					?>
				</div>
			</div>
		</nav>
		<div id="user">
			<div class="container">
				<div class="foothead_left">
					<?php
					if ($_SESSION) { echo '<span>Bonjour, '.$_SESSION['login'].'.</span>'; }
					?>
				</div>
				<div class="foothead_right">
					<?php
					if ($_SESSION) {
						echo '<a href="index.php">Home</a>';
						echo '<a href="compte.php">Compte</a>';
					}
					echo '<a href="galeries.php">Galeries</a>';
					?>
				</div>
			</div>
		</div>
		