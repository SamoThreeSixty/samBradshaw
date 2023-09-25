
<?php
	require '../../vendor/autoload.php';

	use Dotenv\Dotenv;

	$dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
	$dotenv->safeLoad();

	// connection details for MySQL database

	$cd_host = $_ENV['cd_host'];
	$cd_port = $_ENV['cd_port'];
	$cd_socket = $_ENV['cd_socket'];

	// database name, username and password

	$cd_dbname = $_ENV['cd_dbname'];
	$cd_user = $_ENV['cd_user'];
	$cd_password = $_ENV['cd_password'];

?>
