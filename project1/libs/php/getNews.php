<?php

    require '../../vendor/autoload.php';

    use Dotenv\Dotenv;

    $dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
    $dotenv->safeLoad();

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url = 'https://newsdata.io/api/1/news?apikey=' . $_ENV['NEWS_DATA_IO_KEY'] . '&country=' . $_REQUEST['country'] . '&image=1';

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
        } elseif($decode['status'] !== 'success') {
            // Check for api fault
            $output['status']['code'] = $decode['results']['code'];
			$output['status']['name'] = "Faliure - API";
			$output['status']['description'] = $decode['results']['message'];
			$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
            $output['data'] = null;
        } else {
            $output['status']['code'] = "200";
            $output['status']['name'] = "ok";
            $output['status']['description'] = "success";
            $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

            $prevNewsArticle = [];
            $counter = 0;
        
            for ($i = 0; $i <= 9; $i++) {
                if(($decode['results'][$i]['image_url'] !== null) && (in_array($decode['results'][$i]['title'], $prevNewsArticle) == false)) {

                    $output['data'][$i]['image_url'] = $decode['results'][$i]['image_url'];
                    $output['data'][$i]['title'] = $decode['results'][$i]['title'];
                    $output['data'][$i]['pubDate'] = $decode['results'][$i]['pubDate'];
                    $output['data'][$i]['source_id'] = $decode['results'][$i]['source_id'];
                    $output['data'][$i]['link'] = $decode['results'][$i]['link'];

                    array_push($prevNewsArticle, $decode['results'][$i]['title']);
                }
            }
        }
    }

    echo json_encode($output); 

?>