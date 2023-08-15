$('#btnRunEarthquakes').click(function() {
    $.ajax({
        url: "lib/php/getEarthquakes.php",
        type: 'POST',
        dataType: 'json',
        data: {
            nLat: $('#nLat').val(),
            sLat: $('#sLat').val(),
            eLat: $('#eLat').val(),
            wLat: $('#wLat').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#earthquakeDateTime').html(result['data'][0].datetime);
                $('#earthquakeMagnitude').html(result['data'][0].magnitude);
            }
        
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    }); 
});

$('#btnRunOceanSea').click(function() {
    $.ajax({
        url: "lib/php/getOceanSea.php",
        type: "POST",
        dataType: "json",
        data: {
            oceanLattitude: $('#oceanLattitude').val(),
            oceanLongitude: $('#oceanLongitude').val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#oceanSeaValue').html(result['data'].name)
            }
        }
    })
});

$('#btnRunTimezone').click(function() {
    $.ajax({
        url: "lib/php/getTimeZone.php",
        type: "POST",
        dataType: "json",
        data: {
            timeLatitude: $('#timeLatitude').val(),
            timeLongitude: $('#timeLongitude').val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));
            

            if (result.status.name == "ok") {
                console.log(result['data'].time)
                $('#timeValue').html(result['data'].time);
                $('#timeZone').html(result['data'].timezoneId);
            }
        }
    })
});