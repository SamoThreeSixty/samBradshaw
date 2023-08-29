<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url = 'http://api.mediastack.com/v1/news?access_key=a74a03ce050d24f823f7d8cdbfb5eb37&countries=' . $_REQUEST['country'] . '&sort=published_desc&categories=general';

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
    $output['data'] = $decode['data'];

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>