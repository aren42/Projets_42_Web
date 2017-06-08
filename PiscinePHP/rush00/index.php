<?php
	require_once("./header.php");
	$_SESSION['current'] = "index.php";
?>
<div id="slogan">
	<div class="container">
<iframe width="560" height="315" src="https://www.youtube.com/embed/jVm1NbrXaXc?amp;autoplay=1" frameborder="0" allowfullscreen></iframe>
		<a href="shop.php">
			<div class="button">
				Shop
			</div>
		</a>
	</div>
</div>
<div id="body">
	<div id="title">Starters !</div>
	<?php
		$sql = "SELECT uuid, name, img, price, stock FROM articles WHERE name = 'Carapuce' UNION SELECT uuid, name, img, price, stock FROM articles WHERE name = 'Salameche' UNION SELECT uuid, name, img, price, stock FROM articles WHERE name = 'Bulbizarre' UNION SELECT uuid, name, img, price, stock FROM articles WHERE name = 'Pikachu'";
		$result = mysqli_query($connect, $sql);
		if ($result != false && mysqli_num_rows($result) > 0) {
			$article = mysqli_fetch_all($result, MYSQLI_ASSOC);
			foreach ($article as $value) {
				if ($value['stock'] > 0) {
			?>
				<div class="box">
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
				<?php
				}
				?>
				<div class="clear"></div>
			<?php
			}
		}
	?>
</div>
<?php
	include 'footer.php';
?>
