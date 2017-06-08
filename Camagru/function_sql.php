<?php

function		ft_connect()
{
	include 'config/database.php';
	try {
		$db = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
		$db->exec('USE Camagru');
		return $db;
	}
	catch(Exception $e) {
		echo "Error : " . $e->getMessage() . "<br />";
		return -1;
	}
		
}

//
// ***************************************************************
// 					GET `COMMENTAIRE`
// ***************************************************************
//

function		ft_get_comment_where_id_photo($id_photo)
{
	try {
		$db = ft_connect();
		$sql = "SELECT * FROM Commentaire WHERE id_photo=?";
		$data = $db->prepare($sql);
		$data->execute(array($id_photo));
		$db = NULL;
		return $data;
	}
	catch(Exception $e) {
		echo "Error : " . $e->getMessage() . "<br />";
		return -1;
	}
}

//
// ***************************************************************
// 					GET `Photo`
// ***************************************************************
//

function		ft_get_photo_where_id($id)
{
	try {
		$db = ft_connect();
		$sql = "SELECT * FROM Photo WHERE id=?";
		$data = $db->prepare($sql);
		$data->execute(array($id));
		$db = NULL;
		return $data;
	}
	catch(Exception $e) {
		echo "Error : " . $e->getMessage() . "<br />";
		return -1;
	}
}

//
// ***************************************************************
// 					GET `User`
// ***************************************************************
//

function		ft_get_user_where_id($id)
{
	try {
		$db = ft_connect();
		$sql = "SELECT * FROM User WHERE id=?";
		$data = $db->prepare($sql);
		$data->execute(array($id));
		$db = NULL;
		return $data;
	}
	catch(Exception $e) {
		echo "Error : " . $e->getMessage() . "<br />";
		return -1;
	}
}

function		ft_get_user_where_login($login)
{
	try {
		$db = ft_connect();
		$sql = "SELECT * FROM User WHERE login=?";
		$data = $db->prepare($sql);
		$data->execute(array($login));
		$db = NULL;
		return $data;
	}
	catch(Exception $e) {
		echo "Error : " . $e->getMessage() . "<br />";
		return -1;
	}
}

function		ft_get_user_where_email($email)
{
	try {
		$db = ft_connect();
		$sql = "SELECT * FROM User WHERE email=?";
		$data = $db->prepare($sql);
		$data->execute(array($email));
		$db = NULL;
		return $data;
	}
	catch(Exception $e) {
		echo "Error : " . $e->getMessage() . "<br />";
		return -1;
	}
}

?>