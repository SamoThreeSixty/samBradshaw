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

	$url='http://api.geonames.org/findNearbyJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=' . $_ENV['GEONAMES_API_KEY'] . '&featureCode=' . $_REQUEST['feature'] . '&localCountry=true&radius=300&maxRows=100';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);
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
			$output['status']['name'] = "Faliure - JSON";
			$output['status']['description'] = json_last_error_msg();
			$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
			$output['data'] = null;
		} else {
			if(isset($decode['status'])) {
				$output['status']['code'] = $decode['status']['value'];
				$output['status']['name'] = "Failure - API";
				$output['status']['description'] = $decode['status']['message'];
				$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
				$output['data'] = null;
			} else {
				$finalResult = [];

				foreach ($decode['geonames'] as $airport) {
					$temp['countryCode'] = $airport['countryCode'];
					$temp['lat'] = $airport['lat'];
					$temp['lng'] = $airport['lng'];
					$temp['name'] = $airport['name'];

					array_push($finalResult, $temp);
				};
				
				$output['status']['code'] = "200";
				$output['status']['name'] = "ok";
				$output['status']['description'] = "success";
				$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
				$output['data'] = $finalResult;
				
			}
		}
	} 	

	echo json_encode($output); 

?>
