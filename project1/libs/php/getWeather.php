<?php

    require '../../vendor/autoload.php';

    use Dotenv\Dotenv;

    $dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
    $dotenv->safeLoad();

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url= 'http://api.weatherapi.com/v1/forecast.json?key=' . $_ENV['NEW_WEATHER_API_KEY'] . '&days=3&hour=12&lang=en&q=' . $_REQUEST['city'];

    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');

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

    //Data for today
    $output['data'][0]['maxtemp_c'] = $decode['forecast']['forecastday'][0]['day']['maxtemp_c'];
    $output['data'][0]['mintemp_c'] = $decode['forecast']['forecastday'][0]['day']['mintemp_c'];
    $output['data'][0]['condition'] = $decode['forecast']['forecastday'][0]['day']['condition']['text'];
    $output['data'][0]['icon'] = $decode['forecast']['forecastday'][0]['day']['condition']['icon'];

    //Data for tomorrow
    $output['data'][1]['maxtemp_c'] = $decode['forecast']['forecastday'][1]['day']['maxtemp_c'];
    $output['data'][1]['mintemp_c'] = $decode['forecast']['forecastday'][1]['day']['mintemp_c'];
    $output['data'][1]['condition'] = $decode['forecast']['forecastday'][1]['day']['condition']['text'];
    $output['data'][1]['icon'] = $decode['forecast']['forecastday'][1]['day']['condition']['icon'];
    $output['data'][1]['time'] = $decode['forecast']['forecastday'][1]['hour'][0]['time'];

    //Data for day after tomorrow
    $output['data'][2]['maxtemp_c'] = $decode['forecast']['forecastday'][2]['day']['maxtemp_c'];
    $output['data'][2]['mintemp_c'] = $decode['forecast']['forecastday'][2]['day']['mintemp_c'];
    $output['data'][2]['condition'] = $decode['forecast']['forecastday'][2]['day']['condition']['text'];
    $output['data'][2]['icon'] = $decode['forecast']['forecastday'][2]['day']['condition']['icon'];
    $output['data'][2]['time'] = $decode['forecast']['forecastday'][2]['hour'][0]['time'];

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>