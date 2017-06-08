<?php
	require_once("include/include.php");
if ($_GET['id'] == NULL)
	header("Location: galeries.php");
if (preg_replace("/\d+_\d+/", "", $_GET['id']) == TRUE)
	header("Location: galeries.php");
$id_photo = preg_replace("/_\d+/", "", $_GET['id']);
$page = preg_replace("/\d+_/", "", $_GET['id']);
$data = ft_get_photo_where_id($id_photo);
$res = $data->fetch();
$path= preg_replace("/photo\//", "photo/", $res['path_photo']);
	require_once("body/header.php");
?>

<link rel="stylesheet" href="style/view.css" charset="utf-8">
<body style="background-color: #e4e6ea;">
	<?php if (!$_SESSION) { ?>
		<div class="header text_center">Vous devez être connecté.</div>	
	<?php } else { ?>
		<div class="view">
			<center>
				<div>
					<img class="view_image" src="<?php echo $path;?>">
				</div>
				<form style="width: 100%" action="view_photo/add_com.php?id=<?php echo $id_photo."_".$page ?>" method="post">
					<textarea class="input view_commentaire_box" name="commentaire" maxlength="140" cols="100" rows="8"></textarea><br />
					<input class="input view_submit" type="submit" name="submit" value="Envoyer">
				</form>
				<?php ft_show_comment($id_photo); ?>
			</center>
		</div>
	<?php } ?>
</body>
<?php include 'body/footer.php'; ?>