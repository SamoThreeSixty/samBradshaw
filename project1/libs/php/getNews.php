<?php

    require '../../vendor/autoload.php';

    use Dotenv\Dotenv;

    $dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
    $dotenv->safeLoad();

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url = 'https://newsdata.io/api/1/news?apikey=' . $_ENV['NEWS_DATA_IO_KEY'] . '&country=' . $_REQUEST['country'] . '&image=1';

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

    for ($i = 0; $i <= 9; $i++) {
        $output['data'][$i]['image_url'] = $decode['results'][$i]['image_url'];
        $output['data'][$i]['title'] = $decode['results'][$i]['title'];
        $output['data'][$i]['pubDate'] = $decode['results'][$i]['pubDate'];
        $output['data'][$i]['source_id'] = $decode['results'][$i]['source_id'];
        $output['data'][$i]['link'] = $decode['results'][$i]['link'];
    }

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

?>