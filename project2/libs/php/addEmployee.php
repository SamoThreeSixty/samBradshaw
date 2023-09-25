<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    // this includes the login details

    include("config.php");

    header('Content-Type: application/json; charset=UTF-8');

    $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

    if (mysqli_connect_errno()) {
            
        $output['status']['code'] = "300";
        $output['status']['name'] = "failure";
        $output['status']['description'] = "database unavailable";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];

        mysqli_close($conn);

        echo json_encode($output);

        exit;
    }	

    $highestId = $conn->prepare('SELECT id FROM personnel ORDER BY id DESC LIMIT 0, 1');

    $highestId->execute();

    $highestIdResult = $highestId->get_result();

    $newID = mysqli_fetch_assoc($highestIdResult)['id'] + 1;

    $query = $conn->prepare('INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID, id) VALUES (?, ?, ?, ?, ?, ?);');

    $query->bind_param('ssssii', $_REQUEST['firstName'],  $_REQUEST['lastName'],  $_REQUEST['jobTitle'],  $_REQUEST['email'], $_REQUEST['departmentID'], $newID);

    $query->execute();

    if (false === $query) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}

    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] =  null;
	
	mysqli_close($conn);

	echo json_encode($output); 