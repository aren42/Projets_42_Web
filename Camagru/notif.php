<?php  
include 'function_sql.php';
session_start();
if ($_GET['login'] == NULL || $_GET['k'] == NULL) {
	require_once("./body/header.php");
	echo "Erreur : Login or key not set";
	include 'body/footer.php';
	return ;
}
try {
	$db = ft_connect();

	$data = ft_get_user_where_login($_GET['login']);
	
	$res = $data->fetch();
	if ($res != NULL) {
		if ($_GET['k'] == $res['cle']) {
			if ($res['notif'] == 0) {
				$sql = "UPDATE User SET notif=? WHERE login=?;";
				$data = $db->prepare($sql);
				$data->execute(array(1, $_GET['login']));
			}
			if ($res['notif'] == 1) {
				$sql = "UPDATE User SET notif=? WHERE login=?;";
				$data = $db->prepare($sql);
				$data->execute(array(0, $_GET['login']));
			}
			header("Location: ./compte.php");
			$db = NULL;
		}
		else {
			require_once("./body/header.php");
			echo "Erreur : Key invalid";
			include 'body/footer.php';
			return ;
		}
	}
	else {
		require_once("./body/header.php");
		echo "Erreur : Login invalid";
		include 'body/footer.php';
		return ;
	}
}
catch(Exception $e) {
	echo "Error : " . $e->getMessage() . "<br />";
	return -1;
}
?>