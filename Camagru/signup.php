<?php
include 'function.php';

if ($_POST['login'] && $_POST['passwd'] && $_POST['email'] && $_POST['submit']) {
	if (ft_create_account($_POST['login'], $_POST['passwd'], $_POST['email']) == 0)
		header("Location: index.php");
	else 
		return ;
}
require_once("body/header.php");
?>

<link rel="stylesheet" href="style/use.css">
<body style="background-color: #e4e6ea">
    <?php 
	if (!$_POST['login'] || !$_POST['passwd'] || !$_POST['email'] || !$_POST['submit']) { ?>
		<form class="form_login" action="signup.php" method="post">
			<div class="input_log">
				<input class="input" type="text" name="login"  placeholder="LOGIN" /><br/>
			</div>
			<div class="input_log">
				<input class="input" type="password" name="passwd"  placeholder="PASSWORD" />
			</div>
			<div class="input_log">
				<input class="third input" type="mail" name="email"  placeholder="EMAIL" />
			</div>
			<div class="button">
				<input input" type="submit" name="submit" value="OK" />
			</div>
            <a class="link" href="index.php">Retour</a>
		</form><?php 
	}?>
</body>
<?php include 'body/footer.php'; ?>