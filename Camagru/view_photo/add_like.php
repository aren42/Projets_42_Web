<?php  
include '../function_sql.php';
session_start();
if ($_GET['id'] == NULL)
	header("Location: ../galeries.php");
if (preg_replace("/\d+_\d+/", "", $_GET['id']) == TRUE)
	header("Location: ../galeries.php");
try {
	$id_photo = preg_replace("/_\d+/", "", $_GET['id']);
	$page = preg_replace("/\d+_/", "", $_GET['id']);

	$db = ft_connect();

	$sql = "SELECT * FROM Likes WHERE id_photo=? AND id_user=?";
	$data = $db->prepare($sql);
	$data->execute(array($id_photo, $_SESSION['id_user']));

	$res = $data->fetchall();
	if ($res == NULL) {
		$sql = "INSERT INTO Likes(id_user, id_photo) VALUES(?, ?);";
		$data = $db->prepare($sql);
		$data->execute(array($_SESSION['id_user'], $id_photo));

		$data = ft_get_photo_where_id($id_photo);

		$res = $data->fetch();
		$id_user = $res['id_user'];

		$sql = "UPDATE Photo SET nbr_likes=? WHERE id=?;";
		$data = $db->prepare($sql);
		$data->execute(array($res['nbr_likes'] + 1, $id_photo));

		$data = ft_get_user_where_id($res['id_user']);
		$res = $data->fetch();

		if ($res != NULL) {
			if ($res['notif'] == 1) {
				$content = "Salut " . $res['login'] . ",\n";
				$content .= "Quelqu'un vient d'aimer ta photo !\n";
				$content .= "Viens vite voir ça sur Camagru : \n";
				$content .= "http://localhost:8080/camagru/view_photo.php?id=" . $id_photo . "_" . $page . "\n";
				mail($res['email'], 'Nouveau like !', $content);
			}
		}
		header("Location: ../galeries.php?page=$page");
	}
	else {
		$sql = "DELETE FROM Likes WHERE id_user=? AND id_photo=?;";
		$data = $db->prepare($sql);
		$data->execute(array($_SESSION['id_user'], $id_photo));

		$data = ft_get_photo_where_id($id_photo);

		$res = $data->fetch();
		$id_user = $res['id_user'];

		$sql = "UPDATE Photo SET nbr_likes=? WHERE id=?;";
		$data = $db->prepare($sql);
		$data->execute(array($res['nbr_likes'] - 1, $id_photo));


		header("Location: ../galeries.php?page=$page");
	}
	$db = NULL;
}
catch(Exception $e) {
	echo "Error : " . 'Vous devez être co' . "<br />";
	return -1;
}
?>
