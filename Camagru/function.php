<?php

function		ft_create_account($login, $passwd, $email)
{
	include 'function_sql.php';
	include 'config/database.php';

	$test = preg_match("#[A-Z]#", $passwd) + preg_match("#[a-z]#", $passwd) + preg_match("#[0-9]#", $passwd);
	if ($test != 3) {
		require_once("./body/header.php");
		echo "Error : Mot de passe pas assez sécurisé. Minimum : un chiffre, une majuscule et une minuscule !" . "<br />";
		include 'body/footer.php';
		$db = NULL;
		return 5;
	}
	try {
		$login = htmlspecialchars($login);
		$passwd = htmlspecialchars($passwd);
		$email = htmlspecialchars($email);
		$data = ft_get_user_where_login($login);
		$res = $data->fetch();
		if ($res == NULL) {
			$data = ft_get_user_where_email($email);
			$res = $data->fetch();
			if ($res == NULL) {
				if (filter_var($email, FILTER_VALIDATE_EMAIL) === FALSE) {
					require_once("./body/header.php");
					echo "Error : Email invalid" . "<br />";
					include 'body/footer.php';
					$db = NULL;
					return 1;
				}
				$cle = md5(microtime(TRUE) * 10000);
				$content = "Félicitations ! \n";
				$content .= "Vous venez de créer avec succès un nouveau compte Camagru.\n";
				$content .= "Votre identifiant est : $login.\n";
				$content .= "Pour procéder à la vérification de votre adresse e-mail et commencer à jouer, ";
				$content .= "veuillez cliquer sur le lien ci-dessous : \n";
				$content .= "http://localhost:8080/camagru/activate.php?";
				$content .= "login=$login"; 
				$content .= "&k=$cle \n";
				$content .= "Merci et bienvenue chez Camagru !\n\n";
				$content .= "---------------\n";
				$content .= "login : $login \n";
				$content .= "mot de passe : $passwd \n";
				$content .= "---------------\n";
				$content .= "Ceci est un mail automatique, merci de ne pas y répondre.";
				mail($email, "Bienvenue sur Camagru !", $content);
				$db = ft_connect();
				$sql = 'INSERT INTO User(login, passwd, email, cle) VALUES(?, ?, ?, ?)';
				$data = $db->prepare($sql);
				$data->execute(array($login, hash('whirlpool', $passwd), $email, $cle));
				$db = NULL;
				return 0;
			}
			else {
				require_once("./body/header.php");
				echo "Error : Email Used" . "<br />";
				include 'body/footer.php';
				$db = NULL;
				return 2;		
			}
		}
		else {
			require_once("./body/header.php");
			echo "Error : Login Used" . "<br />";
			include 'body/footer.php';
			$db = NULL;
			return 3;
		}
		$db = NULL;
	 }
	 catch(Exception $e) {
	 	require_once("./body/header.php");
		echo "Error : " . $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;
}

function			ft_activate_account($login, $k)
{
	include 'function_sql.php';
	try {
		$login = htmlspecialchars($login);
		$k = htmlspecialchars($k);
		$data = ft_get_user_where_login($login);
		$res = $data->fetch();
		if ($res != NULL) {
			if ($k == $res['cle']) {
				$db = ft_connect();
				$sql = 'UPDATE User SET activate=1 WHERE login=?' ;
				$data = $db->prepare($sql);
				$data->execute(array($login));
				return 0;
			}
			else {
				require_once("./body/header.php");
				echo "Error : Key invalid" . "<br />";
				include 'body/footer.php';
				$db = NULL;
				return 1;
			}
		}
		else {
			require_once("./body/header.php");
			echo "Error : Login invalid" . "<br />";
			include 'body/footer.php';
			$db = NULL;
			return 2;
		}
		$db = NULL;
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo 'Erreur : '. $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;
}

function 			ft_loggin_account($login, $passwd)
{
	include 'function_sql.php';
	include 'config/database.php';
	session_start();
	try {
		$passwd = hash('whirlpool', $_POST['passwd']);
		$data = ft_get_user_where_login($login);
		$res = $data->fetch();
		if ($res['passwd'] === $passwd && $res['activate'] == 0)
		{
			require_once("./body/header.php");
			echo "Error: Compte pas activé.";
			include 'body/footer.php';
			return 42;
		}
		if ($res['passwd'] === $passwd && $res['activate'] != 0)
		{
			$_SESSION['id_user'] = $res['id'];
			$_SESSION['login'] = $res['login'];
		}
		$db = NULL;
		return 0;
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo 'Erreur : '. $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
}

function			ft_new_passwd($newpasswd, $login, $k)
{
	include 'function_sql.php';
	include 'config/database.php';
	$test = preg_match("#[A-Z]#", $newpasswd) + preg_match("#[a-z]#", $newpasswd) + preg_match("#[0-9]#", $newpasswd);
	if ($test != 3) {
		require_once("./body/header.php");
		echo "Error : Mot de passe pas assez sécurisé. Minimum : un chiffre, une majuscule et une minuscule !" . "<br />";
		include 'body/footer.php';
		$db = NULL;
		return 5;
	}
	try {
		$newpasswd = htmlspecialchars($newpasswd);
		$login = htmlspecialchars($login);
		$k = htmlspecialchars($k);
		$data = ft_get_user_where_login($login);
		$res = $data->fetch();
		if ($res != NULL) {
			if ($k == $res['cle']) {
				$db = ft_connect();
				$sql = 'UPDATE User SET passwd=? WHERE login=?' ;
				$data = $db->prepare($sql);
				$data->execute(array(hash('whirlpool', $newpasswd), $login));
				$db = NULL;
				return 0;
			}
			else {
				require_once("./body/header.php");
				echo "Error : Key invalid" . "<br />";
				include 'body/footer.php';
				$db = NULL;
				return 1;
			}
		}
		else {
			require_once("./body/header.php");
			echo "Error : Login invalid" . "<br />";
			include 'body/footer.php';
			$db = NULL;
			return 2;
		}
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo 'Erreur : '. $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;
}

function			ft_new_email($newemail, $login, $k)
{
	include 'function_sql.php';
	try {
		$newemail = htmlspecialchars($newemail);
		$login = htmlspecialchars($login);
		$k = htmlspecialchars($k);
		$data = ft_get_user_where_login($login);
		$res = $data->fetch();
		if ($res != NULL) {
			if ($k == $res['cle']) {
				if (filter_var($newemail, FILTER_VALIDATE_EMAIL) === FALSE){
					echo "Error : Email not valid" . "<br />";
					$db = NULL;
					return 1;
				}
				$data = ft_get_user_where_email($newemail);
				$res = $data->fetch();
				if ($res == NULL) {
					$db = ft_connect();
					$sql = 'UPDATE User SET email=? WHERE login=?' ;
					$data = $db->prepare($sql);
					$data->execute(array($newemail, $login));
					$db = NULL;
					return 0;
				}
				else {
					require_once("./body/header.php");
					echo "Error : Email invalid" . "<br />";
					include 'body/footer.php';
					$db = NULL;
					return 1;
				}
			}
			else {
				require_once("./body/header.php");
				echo "Error : Key invalid" . "<br />";
				include 'body/footer.php';
				$db = NULL;
				return 1;
			}
		}
		else {
			require_once("./body/header.php");
			echo "Error : Login invalid" . "<br />";
			include 'body/footer.php';
			$db = NULL;
			return 2;
		}
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo 'Erreur : '. $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;
}

function			ft_new_login($newlogin, $id_user, $k)
{
	include 'function_sql.php';
	try {
		$newlogin = htmlspecialchars($newlogin);
		$id_user = htmlspecialchars($id_user);
		$k = htmlspecialchars($k);
		$data = ft_get_user_where_id($id_user);
		$res = $data->fetch();
		if ($res != NULL) {
			if ($k == $res['cle']) {
				$data = ft_get_user_where_login($newlogin);
				$res = $data->fetch();
				if ($res == NULL) {
					$db = ft_connect();
					$sql = 'UPDATE User SET login=? WHERE id=?' ;
					$data = $db->prepare($sql);
					$data->execute(array($newlogin, $id_user));
					$db = NULL;
					return 0;
				}
				else {
					require_once("./body/header.php");
					echo "Error : Login invalid" . "<br />";
					include 'body/footer.php';
					$db = NULL;
					return 1;
				}
			}
			else {
				require_once("./body/header.php");
				echo "Error : Key invalid" . "<br />";
				include 'body/footer.php';
				$db = NULL;
				return 1;
			}
		}
		else {
			require_once("./body/header.php");
			echo "Error : Id invalid" . "<br />";
			include 'body/footer.php';
			$db = NULL;
			return 2;
		}
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo 'Erreur : '. $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;
}

function 			ft_reset_passdw($login)
{
	include 'function_sql.php';
	include 'config/database.php';
	try {
		$login = htmlspecialchars($login);
		$data = ft_get_user_where_login($login);
		$res = $data->fetch();
		if ($res != NULL) {
			if ($res['activate'] == 1) {
				$cle = md5(microtime(TRUE) * 10000);
				$content = "Pour changer votre mot de passe veuillez cliquer sur le lien ci-dessous :\n";
				$content .= "http://localhost:8080/camagru/new_passwd.php?";
				$content .= "login=$login"; 
				$content .= "&k=$cle \n";
				$content .= "Ceci est un mail automatique, merci de ne pas y répondre.";
				mail($res['email'], 'Mot de passe oublié ?', $content);
				$db = ft_connect();
				$sql = 'UPDATE User SET cle=? WHERE login=?' ;
				$data = $db->prepare($sql);
				$data->execute(array($cle, $_POST['login']));
				$db = NULL;
				return 0;
			}
			else {
				require_once("./body/header.php");
				echo "Error : Account not activated" . "<br />";
				include 'body/footer.php';
				$db = NULL;
				return 1;
			}
		}
		else {
			require_once("./body/header.php");
			echo "Error : Login invalid" . "<br />";
			include 'body/footer.php';
			$db = NULL;
			return 2;
		}
		$db = NULL;
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo 'Erreur : '. $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;
}

function			ft_show_filtre()
{
	session_start();
	try {
		$db = ft_connect();
		$sql = "SELECT * FROM Filtre WHERE id_user=? OR id_user=? ORDER BY id DESC;";
		$data = $db->prepare($sql);
		$data->execute(array(1, $_SESSION['id_user']));
		$res = $data->fetchall();
		if (isset($res) == true) {
			echo "<form action=\"index.php\" method=\"post\">";
			echo "<table width=\"100%\" height=\"100%\">";
			$i = 0;
			foreach ($res as $k => $v) {
				$i++; 
				$path = preg_replace("/photo\//", "./photo/", $v['path_filtre']);
				echo "<td width=\"20%\" height=\"100%\";>";
				echo "<label for= '".$v['id_filtre']."'></label>";
				echo "<input class=\"radio\" type='radio' name='select' value='".$path."'>";
				echo "<img class=\"miniature_filtre\" src=$path>";
				if ($i >= 5)
					break ;
			}
			if ($i<5) {
				for ($j=$i; $j < 5; $j++) { 
					echo "<style=\"box_filtre\" width=\"20%\" height=\"100%\";>";
				}
			}
			echo "<input class=\"button input\" type=\"submit\" name=\"submit\" value=\"OK\" />";
			echo "</form>";
			echo "</table>";
		}
		$db = NULL;
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo "Error : " . $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;

}

function			ft_show_photo()
{
	session_start();
	try {
		$db = ft_connect();
		$sql = "SELECT * FROM Photo WHERE id_user=? ORDER BY id DESC;";
		$data = $db->prepare($sql);
		$data->execute(array($_SESSION['id_user']));
		$res = $data->fetchall();
		if (isset($res) == true) {
			echo "<table width=\"100%\" height=\"100%\">";
			$i = 0;
			foreach ($res as $k => $v) {
				$i++;
				$path = preg_replace("/photo\//", "./photo/", $v['path_photo']);
				echo "<td width=\"20%\" height=\"100%\";>";
				echo "<center><img class=\"miniature_photo\" src=$path></center>";
				echo "</td>";
				if ($i >= 5)
					break ;
			}
			if ($i<5) {
				for ($j=$i; $j < 5; $j++) { 
					echo "<td width=\"20%\" height=\"100%\";>";
					echo "</td>";
				}
			}
			echo "</table>";
		}	
		$db = NULL;
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo "Error : " . $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;

}

function ft_show_gallery()
{
	session_start();
	try {
		if (isset($_GET['page']) == TRUE) {
			$current = $_GET['page'] * 20;
		}
		if ($current < 0 || isset($_GET['page']) == FALSE) {
			$_GET['page'] = 0;
			$current = 0;
		}
		if ($_SESSION && $_GET['action'] === "del" && $_GET['id']) {
			$dba = ft_connect();
			$del = "DELETE FROM `Photo` WHERE id=".$_GET['id'];
			$data = $dba->prepare($del);
			$data->execute();
			} elseif ($_GET['action'] === "del" && $_GET['id']) {
			echo "<br/><center>Vous devez être connecté.</center><br/>";
		}
		$db = ft_connect();
		$sql = "SELECT * FROM Photo ORDER BY id DESC LIMIT 20 OFFSET $current;";
		$data = $db->prepare($sql);
		$data->execute();
		$res = $data->fetchall();
		if ($res != NULL) {
			$content = "<center>																							";
			$content .= "	<table>																							";
			$content .= "		<tr>																						";
			$i = 0;
			foreach ($res as $k => $v) {
				$i++;
				$path = preg_replace("/photo\//", "./photo/", $v['path_photo']);
				$content .= "<td width=\"20%\" height=\"100%\">																";
				$content .= "	<center>																					";
				$content .= "		<a href=\"view_photo.php?id=".$v['id']."_".$_GET['page']."\"/>							";
				$content .= "			<img class=\"gallery_photo\" src=\"$path\"></img>									";
				$content .= " 		</a>																					";
				$content .= " 		<div class=\"gallery_txt\"> 															";
				$content .= " 			<table>																				";
										if ($_SESSION) {
				$content .= "				<td>																			";
				$content .= " 					<a href=\"view_photo/add_like.php?id=".$v['id']."_".$_GET['page']."\"/>		";
				$content .= "						<i class=\"fa fa-heart gallery_txt\" aria-hidden=\"true\"></i></td>		";
				$content .= "				<td>".$v['nbr_likes']."</td></a>												";
				$content .= "				<td>																			";
				$content .= "					<a href=\"view_photo.php?id=".$v['id']."_".$_GET['page']."\"/>				";
				$content .= "					<i class=\"fa fa-comments gallery_txt\" aria-hidden=\"true\"></i></td>		";
				$content .= "				<td>".$v['nbr_coms']."</td></a>													";
				$content .= "																								";
											if ($_SESSION['id_user'] == $v['id_user']) {
				$content .= "				<td>																			";
				$content .= "					<a href=\"galeries.php?action=del&id=".$v['id']."\"/>						";
				$content .= "					<i class=\"fa fa-trash gallery_txt\" aria-hidden=\"true\"></i></td></a>		";
											}
										}
				$content .= "			</table>																			";
				$content .= "  		</div>																					";
				$content .= "	</center>																					";
				$content .= "</td>																							";
				if ($i % 5 == 0) {
					$content .= "</tr>																						";
					$content .= "<tr>																						";
				}
			}
			if ($i < 5) {
				for ($j=$i; $j < 5; $j++) { 
					$content .= "<td width=\"20%\" height=\"100%\"	></td>													";
				}
			}
			$content .= "		</tr>																						";
			$content .= "	</table>																						";
			$content .= "</center>																							";
		}
		else {
			echo "<br/><center>Aucune photo</center><br/>																	";
			return ;
		}
		$sql = "SELECT * FROM Photo ORDER BY date_photo LIMIT 20 OFFSET " . ($current + 20) . ";";
		$data = $db->prepare($sql);
		$data->execute();
		$res = $data->fetchall();
		if ($res != NULL) {
			$count_rest = 1;
		}
		else {
			$count_rest = 0;
		}
		$content .= "<center>																								";
		if ($current > 0) {
			$content .= "<div class=\"selector_page\">																		";
			$content .= "	<a href=\"?page=" . ($_GET['page'] - 1) . "\">													";
			$content .= "		<i class=\"fa fa-backward fleches\" aria-hidden=\"true\"></i>								";
			$content .= "	</a>																							";
			$content .= "</div>																								";
		}
		if ($count_rest == 1) {
			$content .= "<div class=\"selector_page\">																		";
			$content .= "	<a href=\"?page=" . ($_GET['page'] + 1) . "\">													";
			$content .= "		<i class=\"fa fa-forward fleches\" aria-hidden=\"true\"></i>								";
			$content .= "	</a>																							";
			$content .= "</div>																								";
		}
		$content .= "</center>																								";
		echo $content;
		$db = NULL;
	}
	catch(Exception $e) {
		require_once("./body/header.php");
		echo "Error : " . $e->getMessage() . "<br />";
		include 'body/footer.php';
		return -1;
	}
	return 0;
}

function 			ft_show_comment($id)
{
	?><link rel="stylesheet" href="style/view.css" charset="utf-8"><?php
	$data = ft_get_comment_where_id_photo($id);
	$res = $data->fetchall();
	echo "<div width=\"100%\">";
	foreach ($res as $k => $v) {
		$data = ft_get_user_where_id($v['id_user']);
		$user_res = $data->fetch();
		$content .= "<div class=\"com\">";
		$content .= 	htmlspecialchars($user_res['login']) . " :";
		$content .= "</div>";
		$content .= "<div class=\"sous-com\">";
		$content .= 	htmlspecialchars($v["commentaire"]);
		$content .= "</div>";
	}
	echo "</div>";
	echo $content;
}

function 			ft_get_data_from_img($file, $type)
{
	$ret = file_get_contents($file);
	$ret = base64_encode($ret);
	$ret = "data:" . $type .  ";base64," . $ret;
	return $ret;
}


?>