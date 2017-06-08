<?php
	require_once("./header.php");
	$_SESSION['current'] = "categories.php";
?>
<?php
	if ($_GET['action'] === "add") {
		if (empty($_POST['name'])) {
		?>
			<form action="categories.php?action=add" method="POST">
				<label for="name">Nom :</label><br />
				<input type="text" name="name" /><br />
				<hr />
				<input type="submit" name="submit" value="Créer" />
			</form>
		<?php
		}
		else {
			$sql = "INSERT INTO categories (uuid, name)
			VALUES ('".uuid()."', '".htmlspecialchars($_POST['name'])."')";

			if (mysqli_query($connect, $sql)) {
			    echo "La categorie a été ajouté";
			}
			else {
			    echo "Erreur: ".$sql."<br />".mysqli_error($connect);
			}
		}
	}
	elseif ($_GET['action'] === "del" && $_GET['uuid']) {
		$sql = "DELETE FROM categories WHERE uuid=".$_GET['uuid'];
		if (mysqli_query($connect, $sql)) {
		    echo "La categorie a été suprimé";
		} else {
		    echo "Erreur: " . mysqli_error($connect);
		}
	}
	elseif ($_GET['action'] === "modif" && $_GET['uuid']) {
		if ($_POST['submit'] === "Modifier") {
			$sql = "UPDATE categories SET name='".htmlspecialchars($_POST['name'])."',article='". htmlspecialchars($_POST['articles'])."' WHERE uuid='".$_GET['uuid']."'";

			if (mysqli_query($connect, $sql)) {
			    echo "La categorie a été modifié";
			} else {
			    echo "Erreur: " . mysqli_error($connect);
			}
		}
		else {
			$sql = "SELECT uuid, name, article FROM categories WHERE uuid=".$_GET['uuid'];
			$result = mysqli_query($connect, $sql);
			if ($result !== FALSE && mysqli_num_rows($result) > 0) {
				$result = mysqli_fetch_assoc($result);
				echo "<br />";
				echo $result['uuid'];
				?>
					<form action="categories.php?action=modif&uuid=<?php echo $result['uuid']; ?>" method="POST">
						<label for="name">Nom :</label><br />
						<input type="text" name="name" value="<?php echo $result['name']; ?>" /><br />
						<label for="articles">Articles :</label><br />
						<textarea type="text" name="articles" > <?php echo $result['article']; ?></textarea><br />
						<hr />
						<input type="submit" name="submit" value="Modifier" />
					</form>
				<?php
			}
			else {
				echo mysql_error();
			}
		}
	}
	else {
	?>
		<div class="title">
			<span>Toutes les categories</span>
			<a href="categories.php?action=add"><div class="add">Ajouter une categorie</div></a>
		</div>
		<div class="articles">
			<table>
				<tr>
					<td>Uuid</td>
					<td>Nom</td>
					<td>Article</td>
					<td></td>
					<td></td>
				</tr>
		<?php
			$sql = "SELECT * FROM categories";
			$result = mysqli_query($connect, $sql);
			if ($result !== FALSE && mysqli_num_rows($result) > 0) {
				$user = mysqli_fetch_all($result, MYSQLI_ASSOC);
				//echo "<pre>".htmlentities(print_r($user, true))."</pre>";
				foreach ($user as $value) {
					echo "<tr>
						<td>".$value['uuid']."</td>
						<td>".$value['name']."</td>
						<td>".$value['article']."</td>
						<td><a href=\"categories.php?action=modif&uuid='".$value['uuid']."'\"><div class=\"modif\">Modifier</div></a></td>
						<td><a href=\"categories.php?action=del&uuid='".$value['uuid']."'\"><div class=\"del\">Supprimer</div></a></td>
					</tr>";
				}
			}
	}
	?>
	</table>
	</div>
</body>
</html>
