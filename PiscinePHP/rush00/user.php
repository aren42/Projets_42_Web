<?php
	require_once('./include/include.php');
	if (is_connected()) {
		if(modif($_POST, $connect)) {
			header('Location: '.$_SESSION['current']);
		}
		if ($_GET['action'] === "del" && $_GET['uuid']) {
		$sql = "DELETE FROM users WHERE uuid=".$_GET['uuid'];
		if (mysqli_query($connect, $sql)) {
            header("Location: signout.php");
		} else {
		    echo "Erreur: " . mysqli_error($connect);
		}
	}
	}
	else
		header('Location: signin.php');
	require_once("./header.php");
?>
<div id="body">
	<div id="title">Modification du compte</div>
	<div class="error">
		<center><?php echo $_SESSION['error']; ?></center>
	</div>
	<?php
	echo "<tr><td><a href=\"user.php?action=del&uuid='".$_SESSION['uuid']."'\"><div class=\"del\">Supprimer mon compte</div></a></td></tr>";
	?>
</div>
<?php
	include 'footer.php';
?>
