<?php
	include 'database.php';
	try
	{
		$db = new PDO($DB_DSN, $DB_USER, $DB_PASSWORD, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
		$sql = "CREATE DATABASE IF NOT EXISTS Camagru CHARACTER SET 'utf8';";
		$db->exec($sql);
		$sql = "use Camagru;";
		$sql .= "
		CREATE TABLE IF NOT EXISTS `Commentaire` (
			`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
			`id_user` int(11) NOT NULL,
			`id_photo` int(11) NOT NULL,
			`commentaire` text
		);

		CREATE TABLE IF NOT EXISTS `Filtre` (
			`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
			`id_user` int(11) NOT NULL,
			`path_filtre` text
		);

		CREATE TABLE IF NOT EXISTS `Likes` (
			`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
			`id_user` int(11) NOT NULL,
			`id_photo` int(11) NOT NULL
		);

		CREATE TABLE IF NOT EXISTS `Photo` (
			`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
			`id_user` int(11) NOT NULL,
			`date_photo` datetime DEFAULT NULL,
			`nbr_likes` int(11) DEFAULT '0',
			`nbr_coms` int(11) DEFAULT '0',
			`path_photo` text
		);

		CREATE TABLE IF NOT EXISTS `User` (
			`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
			`login` varchar(255) DEFAULT NULL,
			`passwd` varchar(255) DEFAULT NULL,
			`email` varchar(255) DEFAULT NULL,
			`activate` int(1) DEFAULT '0',
			`notif` int(1) DEFAULT '1',
			`cle` varchar(255) DEFAULT NULL
		);
		
		ALTER TABLE `Commentaire`
			ADD CONSTRAINT `commentaire_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
			ADD CONSTRAINT `commentaire_ibfk_2` FOREIGN KEY (`id_photo`) REFERENCES `Photo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

		ALTER TABLE `Filtre`
			ADD CONSTRAINT `filtre_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

		ALTER TABLE `Likes`
			ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
			ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`id_photo`) REFERENCES `Photo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

		ALTER TABLE `Photo`
			ADD CONSTRAINT `photo_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;";
		$db->exec($sql);
		$sql = "INSERT INTO User VALUES
		(1, 'admin', '" . hash('whirlpool', 'admin') . "', 'aren@student.42.fr', 1, 0, 'aren');";
		$db->exec($sql);
		$sql = "INSERT INTO Filtre(id_user, path_filtre) VALUES
		(1, 'photo/Filtres/coeur33.png'),
		(1, 'photo/Filtres/barney.png'),
		(1, 'photo/Filtres/Ballon.png'),
		(1, 'photo/Filtres/Kiss.png');";
		$db->exec($sql);
		header('Location: ../index.php');
	}

	catch(Exception $e)
	{
		echo 'Error : Database already install !';
		die();
	}
?>
