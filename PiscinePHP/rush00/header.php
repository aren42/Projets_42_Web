<?php
	require_once("./include/include.php");
	function count_item($tab)
	{
		$compteur = 0;
		if (isset($tab[0]) == FALSE)
			return (0);
		foreach ($tab as $key => $value) {
			$compteur = $compteur + $value['quantity'];
		}
		return ($compteur);
	}
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<link rel="stylesheet" href="style.css" charset="utf-8">
		<title>My Little Store</title>
	</head>
	<body>
		<nav>
			<div class="container">
				<div class="foothead_left">
					<a href="index.php">My Little Store</a>
				</div>
				<div class="foothead_right">
					<a href="shop.php">Boutique</a>
				</div>
				<div class="clear"></div>
			</div>
		</nav>
		<div id="user">
			<div class="container">
				<div class="foothead_left">
					<?php if (is_connected()) { echo '<span>Bonjour, '.$_SESSION['mail'].'</span>'; } ?></span>
				</div>
				<div class="foothead_right">
				<?php
					if (!is_connected()) {
						echo '<a href="cart.php">Panier ('.count_item($_SESSION['cart']).')</a>';
						echo '<a href="signin.php">Connexion</a>';
						echo '<a href="signup.php">Inscription</a>';
					} else {
						echo '<a href="cart.php">Panier ('.count_item($_SESSION['cart']).')</a>';
						echo '<a href="user.php">Mon compte</a>';
						echo '<a href="signout.php">Déconnexion</a>';
						if (is_admin()) {
							echo '<a href="admin/">Admin</a>';
						}
					}
				?>
				</div>
				<div class="clear"></div>
			</div>
		</div>
