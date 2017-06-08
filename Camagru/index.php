<?php
	require_once("include/include.php");
	require_once("./body/header.php");
	if ($_FILES && $_FILES['file']['tmp_name'] && $_FILES['file']['type'])
		if (getimagesize($_FILES['file']['tmp_name']) == false) {
			echo "Error : Fichier incorrect.";
		}
		else
			$_SESSION['file'] = ft_get_data_from_img($_FILES['file']['tmp_name'], $_FILES['file']['type']);
?>
	<link rel="stylesheet" href="style/page.css" charset="utf-8">
	<link rel="stylesheet" href="style/webcam.css" charset="utf-8">
	<?php if (!is_connected()) { ?>
		<div id="login">
			<div class="title">LOGIN</div>
			<div id="blue">
			<form method="post" style="position: relative;" action="signin.php">
				<label>User: </label>
				<input class="putput" type="text" name="login"  placeholder="Login" /><br/>
				<label>Password: </label>
				<input class="putput" type="password" name="passwd"  placeholder="Password" />
				<input class="sublog putput" type="submit" name="submit" value="OK" />
				<a class="lien" href="signup.php">Create account</a>
				<a class="lien" href="forgot.php">Forget password ?</a>
				</br></br><a class="install" href="config/setup.php">Installer database</a>
			</form>
			</div>
		</div>
	<?php } else { ?>
		<div class="camagru">
			<!-- Upload image -->
			<form class="upload_image" action="index.php" enctype="multipart/form-data" method="post">
				<div class="">Upload une photo existante ?</div>
				<input class="" type="file" name="file" accept="image/jpeg image/png">
				<input class="button" type="submit" value="Upload">
			</form>

			<!-- Affichage des filtres -->
			<div class="select_filtre"><?php ft_show_filtre(); ?></div>

			<!-- PHOTOS -->
			<?php if(!$_SESSION['file']){ ?> <!-- avec webcam -->
				<script type="text/javascript" src="webcam/wc_take.js"></script>
				<div class="video"><video id="video"></video></div>
				<div class="canvas"><canvas id="canvas"></canvas></div>
				<?php if($_POST['select']){ ?>
					<img style="z-index:0;" class="video" src=" <?php echo $_POST['select']; ?>">
					<img style="z-index:-11;height:0px;" id="filtre" class="canvas" src="<?php echo $_POST['select']; ?>"">
				<?php } ?>
				<button style="display: <?php if($_POST['select']){ echo ""; } else{ echo "none"; } ?>;" class="take_photo" id="snap">Prendre la photo</button>
				<form action="webcam/wc_save.php" method="post">
					<input type="hidden" id="photo" name="photo" value="" />
					<?php if($_POST['select']) { ?>
						<input type="hidden" name="filtre" value="<?php echo $_POST['select']?>" />
					<?php } ?>
					<input class="save_photo" id="submit" type="hidden" name="submit" value="Good" />
				</form>
			<?php } else { ?> <!-- avec image -->
				<div class="filtre"><img style="top: 0em;"src="<?php echo $_SESSION['file']; ?>" class="filtre"></img></div>
				<?php if($_POST['select']){ ?>
					<img style="z-index:0;" class="filtre" src=" <?php echo $_POST['select']; ?>">
				<?php } ?>
				<form action="webcam/wc_save.php" method="post">
					<input type="hidden" id="photo" name="photo" value="<?php echo $_SESSION['file']?>" />
					<?php if($_POST['select']) { ?>
						<input type="hidden" name="filtre" value="<?php echo $_POST['select']?>" />
						<input type="submit" class="take_file" id="submit" name="submit" value="Enregistrer" />
					<?php } ?>
				</form>
			<?php } ?>
			<div class="select_photo"><a href="galeries.php"><?php ft_show_photo(); ?></a></div>
		</div>
<?php }
	include 'body/footer.php';
?>