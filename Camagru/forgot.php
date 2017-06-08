<?php
include 'function.php';

if ($_POST['login'] && $_POST['submit']) {
	if (ft_reset_passdw($_POST['login']) == 0)
		header("Location: index.php");
    else
        return ;
}
require_once("./body/header.php");
?>

<link rel="stylesheet" href="style/use.css">
<body style="background-color: #e4e6ea">
<?php 
    if (!$_POST['login'] || !$_POST['submit']) { ?>
		<form class="form_login" action="forgot.php" method="POST">
            <div class="input_loh">
                <input class="input" type="text" name="login"  placeholder="LOGIN" /><br/>
            </div>
            <div class="button">
                <input type="submit" name="submit" value="OK" />
            </div>
            <div class="link">
                <a href="index.php">Retour</a>
            </div>
        </form><?php
	} ?>
</body>
<?php include 'body/footer.php'; ?>