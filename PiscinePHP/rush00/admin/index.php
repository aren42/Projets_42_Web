<?php
	require_once("./header.php");
	$_SESSION['current'] = "index.php";
?>
<?php
	if ($_GET['action'] === "add") {
		if (empty($_POST['name']) || empty($_POST['categories']) || empty($_POST['img']) || empty($_POST['price']) || empty($_POST['stock'])) {
		?>
			<form action="index.php?action=add" method="POST">
				<label for="name">Nom :</label><br />
				<input type="text" name="name" /><br />
				<label for="name">Categories :</label><br />
				<?php
				 $categories = get_all_items_from('categories');
				 $output = "<div>";
				 foreach ($categories as $category)
						 		$output .="<input type='checkbox' name='categories[]' value='". $category['name'] ."'>". $category['name'] ." " ;

				 $output .= "</div>";
				 echo $output;
			    ?>
				<label for="name">Image :</label><br />
				<input type="text" name="img" /><br />
				<label for="price">Prix :</label><br />
				<input type="text" name="price" /><br />
				<label for="name">Quantité :</label><br />
				<input type="number" name="stock" min="1" max="100000" /><br />
				<hr />
				<input type="submit" name="submit" value="Créer" />
			</form>
		<?php
		}
		else {
			// transforme le tableau en chaine separes par des virgules.
			$cat_str = implode(",", $_POST['categories']);
			$name = str_replace("'", "''", $_POST['name']);
			$categories = str_replace("'", "''", $cat_str);
			$sql = "INSERT INTO articles (uuid, name, categories, img, price, stock)
			VALUES ('".uuid()."', '".htmlspecialchars($name)."', '".htmlspecialchars($categories)."', '".htmlspecialchars($_POST['img'])."', ".htmlspecialchars($_POST['price']).", ".htmlspecialchars($_POST['stock']).")";

			if (mysqli_query($connect, $sql)) {
			    echo "L'article a été ajouté";
			}
			else {
			    echo "Erreur: ".$sql."<br />".mysqli_error($connect);
			}
		}
	}
	elseif ($_GET['action'] === "del" && $_GET['uuid']) {
		$sql = "DELETE FROM articles WHERE uuid=".$_GET['uuid'];
		if (mysqli_query($connect, $sql)) {
		    echo "L'article a été suprimé";
		} else {
		    echo "Erreur: " . mysqli_error($connect);
		}
	}
	elseif ($_GET['action'] === "modif" && $_GET['uuid']) {
		if ($_POST['submit'] === "Créer") {
			$name = str_replace("'", "''", $_POST['name']);
			$categories = str_replace("'", "''", $_POST['categories']);
			$sql = "UPDATE articles SET name='". htmlspecialchars($name)."',categories='".htmlspecialchars($categories)."',img='".htmlspecialchars($_POST['img'])."',price='".htmlspecialchars($_POST['price'])."',stock='".htmlspecialchars($_POST['stock']). "' WHERE uuid='". htmlspecialchars($_GET['uuid']) . "';";

			if (mysqli_query($connect, $sql)) {
			    echo "L'article a été modifié";
			} else {
			    echo "Erreur: " . mysqli_error($connect);
			}
		}
		else {
			$sql = "SELECT uuid, name, categories, img, price, stock FROM articles WHERE uuid=".$_GET['uuid'];
			$result = mysqli_query($connect, $sql);
			if ($result !== FALSE && mysqli_num_rows($result) > 0) {
				$result = mysqli_fetch_assoc($result);
				echo "<br />";
				?>
					<form action="index.php?action=modif&uuid=<?php echo $result['uuid']; ?>" method="POST">
						<label for="name">Nom :</label><br />
						<input type="text" name="name" value="<?php echo $result['name']; ?>" /><br />
						<label for="name">Categories :</label><br />
						<input type="text" name="categories" value="<?php echo $result['categories']; ?>"/><br />
						<label for="name">Image :</label><br />
						<input type="text" name="img" value="<?php echo $result['img']; ?>" /><br />
						<label for="name">Prix :</label><br />
						<input type="text" name="price" value="<?php echo $result['price']; ?>" /><br />
						<label for="name">Quantité :</label><br />
						<input type="text" name="stock" value="<?php echo $result['stock']; ?>" /><br />
						<hr />
						<input type="submit" name="submit" value="Créer" />
					</form>
				<?php
			}
			else {
				echo mysqli_error($connect);
			}
		}
	}
	else {
	?>
		<div class="title">
			<span>Tous les articles</span>
			<a href="index.php?action=add"><div class="add">Ajouter un article</div></a>
		</div>
		<div class="articles">
			<table>
				<tr>
					<td>Image</td>
					<td>Nom</td>
					<td>Categories</td>
					<td>Prix</td>
					<td>Quantité</td>
					<td></td>
					<td></td>
				</tr>
		<?php
			$sql = "SELECT uuid, name, categories, img, price, stock FROM articles";
			$result = mysqli_query($connect, $sql);
			if (mysqli_num_rows($result) > 0) {
				$article = mysqli_fetch_all($result, MYSQLI_ASSOC);
				foreach ($article as $value) {
					echo "<tr>
						<td><img src=\"../img/".$value['img']."\" /></td>
						<td>".$value['name']."</td>
						<td>".$value['categories']."</td>
						<td>".$value['price']."</td>
						<td>".$value['stock']."</td>
						<td><a href=\"index.php?action=modif&uuid='".$value['uuid']."'\"><div class=\"modif\">Modifier</div></a></td>
						<td><a href=\"index.php?action=del&uuid='".$value['uuid']."'\"><div class=\"del\">Supprimer</div></a></td>
					</tr>";
				}
			}
	}
	?>
	</table>
	</div>
</body>
</html>
