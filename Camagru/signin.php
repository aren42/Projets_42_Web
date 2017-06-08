<?php
include 'function.php';
if ($_POST['login'] && $_POST['passwd'] && $_POST['submit']) {
	if (ft_loggin_account($_POST['login'], $_POST['passwd']) == 0)
		header("Location: index.php");
} else {
	header("Location: index.php");
}
?>