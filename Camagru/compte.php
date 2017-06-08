<?php
	require_once("include/include.php");
if ($_SESSION['id_user'] != NULL) {
	$data = ft_get_user_where_id($_SESSION['id_user']);
	$res = $data->fetch();
	if ($res == NULL)
		return ;
}
require_once("body/header.php");
?>
<link rel="stylesheet" href="style/profil.css" charset="utf-8">
<body style="background-color: #e4e6ea;">
	<?php if (!$_SESSION) { ?>
		<div class="header text_center">Bienvenue sur Camagru</div>	
	<?php } else { ?>
	<div class="profil">
		<div class="profil_link">
			<a class="text_co" href="new_login.php?id=<?php echo $res['id']; ?>&k=<?php echo $res['cle']; ?>">Changer pseudo</a>
		</div>
		<div class="profil_link">
			<a class="text_co" href="new_passwd.php?login=<?php echo $res['login']; ?>&k=<?php echo $res['cle']; ?>">Changer mot de passe</a>
		</div>
		<div class="profil_link">
			<a class="text_co" href="new_email.php?login=<?php echo $res['login']; ?>&k=<?php echo $res['cle']; ?>">Changer e-mail</a>
		</div>
		<?php if ($res['notif'] == 0) { ?>
		<div class="profil_link">
			<a class="text_co" href="notif.php?login=<?php echo $res['login']; ?>&k=<?php echo $res['cle']; ?>">Activer notifications</a>
		</div>
		<?php } if ($res['notif'] == 1) { ?>
		<div class="profil_link">
			<a class="text_co" href="notif.php?login=<?php echo $res['login']; ?>&k=<?php echo $res['cle']; ?>">Desactiver notifications</a>
		</div>
		<?php } ?>
	</div>
	<?php } ?>
</body>
<?php include 'body/footer.php'; ?>
