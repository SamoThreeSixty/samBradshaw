<?php

	require '../../vendor/autoload.php';

	use Dotenv\Dotenv;

	$dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
	$dotenv->safeLoad();

    ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	header('Content-Type: application/json; charset=UTF-8');
	header('Access-Control-Allow-Origin: *'); 

	$executionStartTime = microtime(true);

	$url= 'http://api.geonames.org/earthquakesJSON?north=' . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . '&east=' . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . '&username=' . $_ENV['GEONAMES_API_KEY'] . '&maxRows=5';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result=curl_exec($ch);

	$cURLERROR = curl_errno($ch);

	curl_close($ch);

	if($cURLERROR) {
		$output['status']['code'] = $cURLERROR;
		$output['status']['name'] = "Faliure - cURL";
		$output['status']['description'] = curl_strerror($cURLERROR);
		$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
		$output['data'] = null;
	} else {
		$decode = json_decode($result, true);
		
		if(json_last_error() !== JSON_ERROR_NONE) {
			$output['status']['code'] = json_last_error();
			$output['status']['name'] = "Failure - JSON";
			$output['status']['description'] = json_last_error_msg();
			$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
			$output['data'] = null;
		} else {
			// API error code
			if(isset($decode['status'])) {
				$output['status']['code'] = $decode['status']['value'];
				$output['status']['name'] = "Failure - API";
				$output['status']['description'] = $decode['status']['message'];
				$output['status']['seconds'] = intval((microtime(true) - $executionStartTime), 3);
				$output['data'] = null;
			} else {
				$output['status']['code'] = "200";
				$output['status']['name'] = "ok";
				$output['status']['description'] = "success";
				$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
				$output['data'] = $decode;
			}
			

			
		}
	}

	echo json_encode($output); 
?>