<?php

	$countryData = json_decode(file_get_contents("../data/countryBorders.geo.json"), true);

	$countryBoarder = [];

    foreach ($countryData['features'] as $feature) {
        if($_REQUEST['country'] == $feature['properties']['iso_a3']) {
            array_push($countryBoarder, $feature['geometry']);
        }
    };

	$output['data'] = $countryBoarder;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
