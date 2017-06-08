<?php
include 'function.php';
session_start();
if ($_POST['new_passwd'] && $_POST['login'] && $_POST['k'] && $_POST['submit']) {
	if (ft_new_passwd($_POST['new_passwd'], $_POST['login'], $_POST['k']) == 0)
		header("Location: index.php");
	else
		return;
}
require_once("./body/header.php");
?>

<link rel="stylesheet" href="style/use.css">
<body style="background-color: #e4e6ea">
	<div class="background"></div>
	<?php if (!$_SESSION) { ?>
		<div class="header text_center">Vous n'êtes pas connecté.</div> 
	<?php } if (!$_GET['login'] || !$_GET['k']) {;} else {?>
		<form class="form_login" action="new_passwd.php" method="POST">
			<div class="input_log">
				<input class="input" type="password" name="new_passwd" placeholder="New password" /><br/>
			</div>
			<div class="button">
				<input type="submit" name="submit" value="OK" />
			</div>
			<?php if (!$_SESSION) { ?>
				<a class="link" href="index.php">Retour</a>
			<?php } else { ?>
				<a class="link" href="compte.php">Retour</a>
			<?php } ?>
			<div class="hidden">
				<input class="hidden" type="hidden" name="login" value="<?php echo $_GET['login']?>"/>
			</div>
			<div class="hidden">
				<input class="hidden" type="hidden" name="k" value="<?php echo $_GET['k']?>" />
			</div>
		</form>
	<?php } ?>
</body>
<?php include 'body/footer.php'; ?>