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

	$com = trim($_POST['commentaire']);
	if (!isset($com) || empty($com)) {
		header("Location: ../view_photo.php?id=".$id_photo."_".$page);
		return ;
	}

	$db = ft_connect();
	$data = ft_get_photo_where_id($id_photo);
	$res = $data->fetch();
	if ($res == NULL)
		header("Location: ../galeries.php?page=$page");

	$sql = "INSERT INTO Commentaire(id_user, id_photo, commentaire) VALUES(?, ?, ?);";
	$data = $db->prepare($sql);
	$data->execute(array($_SESSION['id_user'], $id_photo, $com));

	$sql = "UPDATE Photo SET nbr_coms = ? WHERE id = ?;";
	$data = $db->prepare($sql);
	$data->execute(array(($res['nbr_coms'] + 1), $id_photo));

	$data = ft_get_user_where_id($res['id_user']);

	$res = $data->fetch();

	if ($res['notif'] == 1) {
		$content = "Salut " . $res['login'] . ",\n";
		$content .= "Quelqu'un vient de commenter ta photo !\n";
		$content .= "Viens vite voir ça sur Camagru : \n";
		$content .= "http://localhost:8080/camagru/view_photo.php?id=" . $id_photo . "_" . $page . "\n";
		mail($res['email'], 'Nouveau commentaire !', $content);
	}
	header("Location: ../view_photo.php?id=".$id_photo."_".$page);
	$db = NULL;
}
catch(Exception $e) {
	echo "Error : " . $e->getMessage() . "<br />";
	return -1;
}
?>
