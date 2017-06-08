<?php
function get_all_items_from($table) {
		$server = "localhost";
		$user = "root";
		$pass = "root";
		$dbname = "ft_minishop";

		$connect = mysqli_connect($server, $user, $pass, $dbname);

		if (!$connect) {
			echo "wrong manipulation";
		}
		$sql = "SELECT * FROM $table";
		$result = mysqli_query($connect, $sql);
		if ($result) {
		} else {
				echo "Erreur: " . mysqli_error($connect);
		}
		$items= mysqli_fetch_all($result, MYSQLI_ASSOC);
		return ($items);
}
?>
