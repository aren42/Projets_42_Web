<?php
session_start();

function ft_filtre($src, $filtre)
{
	$dest = imagecreatefromstring(file_get_contents($src));
	$srcs = imagecreatefromstring(file_get_contents($filtre));
	imagealphablending($dest, true);
	imagesavealpha($dest, true);
	imagecopy($dest, $srcs, 0, 0, 0, 0, 400, 300);
	imagepng($dest, $src);
	imagedestroy($dest);
	imagedestroy($srcs);
}


function 		ft_img_convertor($data)
{
	$Img = imagecreatefromstring(file_get_contents($data));
	$TailleImg = getimagesize($data);
	$NouvelleLargeur = 400;
	$NouvelleHauteur = 300;
	$NouvelleImage = imagecreatetruecolor($NouvelleLargeur , $NouvelleHauteur);
	imagecopyresampled($NouvelleImage , $Img , 0,0, 0,0, $NouvelleLargeur, $NouvelleHauteur, $TailleImg[0],$TailleImg[1]);
	imagedestroy($Img);
	imagejpeg($NouvelleImage , $data, 100);
 }


include '../config/database.php';
include '../function_sql.php';
try {
	if (file_exists("../photo/") == FALSE)
		mkdir("../photo");
	if (file_exists("../photo/" . $_SESSION['id_user']) == FALSE)
		mkdir("../photo/" . $_SESSION['id_user']);
	$data = preg_replace('/data:image\/\w+;base64,/', '', $_POST['photo']);
	$data = base64_decode($data);


	$date = date("Y-m-d H:i:s");

	$path_photo = "photo/" . $_SESSION['id_user'] . "/" . preg_replace('/ /', '_', $date) . ".png";

	file_put_contents("../" . $path_photo, $data);

	ft_img_convertor("../" . $path_photo);

	ft_filtre("../" . $path_photo, "." . $_POST['filtre']);

	$db = ft_connect();

	$sql = "INSERT INTO Photo(id_user, date_photo, path_photo) VALUES(?, ?, ?); ";
	$data = $db->prepare($sql);
	$data->execute(array($_SESSION['id_user'], $date, preg_replace('/ /', '_', $path_photo)));
	$db = NULL;
	$_SESSION['file'] = "";
	header("Location: ../index.php");
}
catch(Exception $e) {
	echo "Error : " . $e->getMessage() . "<br />" . "<a href=\"../index.php\">Go to home</a>";
	return -1;
}

?>
