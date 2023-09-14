<?php

	require '../../vendor/autoload.php';

	use Dotenv\Dotenv;

	$dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
	$dotenv->safeLoad();

    ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url1='http://api.exchangeratesapi.io/v1/latest?access_key=' . $_ENV['NEW_EXCHANGE_RATE_API_KEY'];

	$ch1 = curl_init();
	curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch1, CURLOPT_URL, $url1);

	$result1=curl_exec($ch1);

	curl_close($ch1);

	$url2='http://api.exchangeratesapi.io/v1/symbols?access_key=' . $_ENV['NEW_EXCHANGE_RATE_API_KEY'];

	$ch2 = curl_init();
	curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch2, CURLOPT_URL, $url2);

	$result2=curl_exec($ch2);

	curl_close($ch2);

	$decode1 = json_decode($result1, true);
	$decode2 = json_decode($result2, true);	

	$currencyAndRate = [];

	foreach($decode2['symbols'] as $symbol2 => $value2) {
		foreach($decode1['rates'] as $symbol1 => $value1) {
			if ($symbol1 == $symbol2) {
				$newCurrencyAndSymbol['currency'] = $value1;
				$newCurrencyAndSymbol['name'] = $value2;
				array_push($currencyAndRate, $newCurrencyAndSymbol);
			}
		}	
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $currencyAndRate;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
