<?php
include 'function.php';
if ($_GET['login'] && $_GET['k']) {
	if (ft_activate_account($_GET['login'], $_GET['k']) == 0)
		header("Location: index.php");
}
?>