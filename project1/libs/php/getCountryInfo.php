<?php

    ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url='https://restcountries.com/v3.1/alpha/' . $_REQUEST['country'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data']['name'] = $decode[0]['name'];
	$output['data']['region'] = $decode[0]['region'];
	$output['data']['subregion'] = $decode[0]['subregion'];
	$output['data']['continents'] = $decode[0]['continents'];
	$output['data']['currencies'] = $decode[0]['currencies'];
	$output['data']['capital'] = $decode[0]['capital'];
	$output['data']['capitalInfo'] = $decode[0]['capitalInfo'];
	$output['data']['languages'] = $decode[0]['languages'];
	$output['data']['latlng'] = $decode[0]['latlng'];
	$output['data']['area'] = $decode[0]['area'];
	$output['data']['flags'] = $decode[0]['flags'];
	$output['data']['population'] = $decode[0]['population'];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
