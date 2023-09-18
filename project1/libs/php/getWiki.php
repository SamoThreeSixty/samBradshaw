<?php

	require '../../vendor/autoload.php';

	use Dotenv\Dotenv;

	$dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
	$dotenv->safeLoad();

    ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);
	
	$url='http://api.geonames.org/wikipediaSearchJSON?q=' . $_REQUEST['country'] . '&username=' . $_ENV['GEONAMES_API_KEY']; 
	
	header('Content-Type: application/json; charset=UTF-8');
	header('Access-Control-Allow-Origin: *');

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
			$output['status']['description'] = "success";
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
				
				$featureCountryArry = [];

				foreach($decode['geonames'] as $wiki) {
					if((isset($wiki['feature'])) && ($wiki['feature'] == "country")) {

						$temp2 = [];

						$temp2['summary'] = $wiki['summary'];
						$temp2['title'] = $wiki['title'];
						$temp2['wikipediaUrl'] = $wiki['wikipediaUrl'];
						$temp2['thumbnailImg'] = $wiki['thumbnailImg'];

						if(isset($temp['countryCode'])) {
							$temp2['countryCode'] = $wiki['countryCode'];
						}
						
						array_push($featureCountryArry, $temp2);

						break;
					}
				}

				if(count($featureCountryArry) == 0) {
					$output['status']['code'] = "404";
					$output['status']['name'] = "Faliure - API";
					$output['status']['description'] = "No suitable results returned";
					$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
					$output['data'] = null;
				} else {
					$output['status']['code'] = "200";
					$output['status']['name'] = "ok";
					$output['status']['description'] = "success";
					$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
					$output['data'] = $featureCountryArry[0];					
				}
			}
		}
	}

	echo json_encode($output); 

?>
