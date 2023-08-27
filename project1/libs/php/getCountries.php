<?php

	$countryData = json_decode(file_get_contents("../data/countryBorders.geo.json"), true);

	$countries = [];

    foreach ($countryData['features'] as $feature) {

        $country = null;
        $country['iso3'] = $feature['properties']['iso_a3'];
        $country['iso2'] = $feature['properties']['iso_a2'];
        $country['name'] = $feature['properties']['name'];
        $country['geometry'] = $feature['geometry'];

        array_push($countries, $country); 
   };

   usort($countries, function ($item1, $item2) {

	return $item1['name'] <=> $item2['name'];
});

	$output['data'] = $countries;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
