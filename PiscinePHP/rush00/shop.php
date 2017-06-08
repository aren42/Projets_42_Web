<?php
	require("./header.php");
	require("./include/helper.php");
	$_SESSION['current'] = "shop.php?c=" . $_GET['c'];
?>
<div id="body">
	<div id="title">Boutique</div>
		<div id="categories">
			<div class="container">
				<?php
					$sql = "SELECT name FROM categories";
					$result = mysqli_query($connect, $sql);
					if ($result != false && mysqli_num_rows($result) > 0) {
						$categories = mysqli_fetch_all($result, MYSQLI_ASSOC);
						foreach ($categories as $value) {
							echo "<a href=\"shop.php?c=".$value['name']."\">".$value['name']."</a>";
						}
					}
				?>
			</div>
		</div>
	<div class="filter">
	<form action="shop.php" method="get">
    <?php
     $categories = get_all_items_from('categories');
     $output = "<div>";
     foreach ($categories as $category)
		$output .="<input class='shop_input' type='checkbox' name='categories[]' value='". $category['name'] ."'>".ucfirst( $category['name']) ." " ;

     $output .= "</div>";
     echo $output;
     ?>
	<input class="shop_inpout" type="submit" value="Filter">
	</form>
	</div>
	
	<?php
		if (!empty($_GET['c'])) {
			$val = $_GET['c'];
			$sql = "SELECT * FROM articles WHERE categories REGEXP '$val'";
			$result = mysqli_query($connect, $sql);
			if ($result !== false && mysqli_num_rows($result) > 0) {
				$articles = mysqli_fetch_assoc($result);
				$articles = explode(',', $articles['article']);
				foreach ($articles as $key => $value) {
					$sql = "SELECT * FROM articles WHERE categories REGEXP '$val'";
					$result = mysqli_query($connect, $sql);
					if ($result != false && mysqli_num_rows($result) > 0) {
						$tmp = mysqli_fetch_all($result, MYSQLI_ASSOC);
						foreach($tmp as $article) {
							if ($article['stock'] <= 0)
								continue ;
						?>
							<div class="box" data-type1="<php $article['categories']) ?>">
								<div class="left">
									<img class="img" src="<?php echo htmlspecialchars("img/".$article['img']); ?>" />
								</div>
								<div class="right">
									<div class="name"><?php echo htmlspecialchars($article['name']); ?></div>
									<div class="price">
										Prix : <span><?php echo htmlspecialchars($article['price']); ?> &euro;</span>
									</div>
									<div class="stock">
										Stock : <span><?php echo htmlspecialchars($article['stock']); ?></span>
									</div>
									<a href="cart.php?action=add&uuid=<?php echo $value; ?>">
										<div class="buy">
											Ajouter au panier
										</div>
									</a>
								</div>
							</div>
							<div class="clear"></div>
							<p><?php echo htmlspecialchars($article['categories']); ?></p>
						<?php
						}
					}
				}
				echo "</div>";
				include 'footer.php';	
				return ;
			}
			echo "</div>";
			include 'footer.php';
			return;
		}
		if ($_GET['categories']) {
			$categories =  implode("|", $_GET['categories']);
			$sql = "SELECT * FROM articles WHERE categories REGEXP '($categories)'";
		} else {
			$sql = "SELECT uuid, categories, name, img, price, stock FROM articles";
		}
		$result = mysqli_query($connect, $sql);

		if ($result !== false && mysqli_num_rows($result) > 0) {
			$article = mysqli_fetch_all($result, MYSQLI_ASSOC);
			foreach ($article as $value) {
				if ($value['stock'] <= 0)
					continue ;
				$categories_explode = explode(" ", $value['categories']);
			?>
				<div class="box" data-type1= <?php echo $categories_explode[0]; ?> data-type2= <?php echo $categories_explode[1]; ?> >
					<div class="left">
						<img class="img" src="<?php echo "img/".$value['img']; ?>" />
					</div>
					<div class="right">
						<div class="name"><?php echo htmlspecialchars($value['name']); ?></div>
						<div class="price">
							Prix : <span><?php echo htmlspecialchars($value['price']); ?> &euro;</span>
						</div>
						<div class="stock">
							Stock : <span><?php echo htmlspecialchars($value['stock']); ?></span>
						</div>
						<a href="cart.php?action=add&uuid=<?php echo $value['uuid']; ?>">
							<div class="buy">
								Ajouter au panier
							</div>
						</a>
					</div>
				</div>
				<div class="clear"></div>
			<?php
			}
		}

	?>
</div>
<?php
	include 'footer.php';
?>
