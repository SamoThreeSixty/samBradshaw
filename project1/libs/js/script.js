//Imported Functions
import convertDate from "./functions/convertDate.js";

// This gets all of the countrys ready for selection in the dropdown
// Want to sort into alphabetical order at some point!!
$(document).ready(function () {
    $.ajax({
        url: 'libs/php/getCountries.php',
        type: 'POST',
        dataType: 'json',
        success: function(result){

            result.data.forEach((country) => {
                const x = document.getElementById("countrySelect");
                const option = document.createElement("option");
                option.text = country.name;
                option.value = country.iso3;
                x.appendChild(option);
            })
        },
        error: function(error){
            console.log(error)
        }
    })

    //Set current location and trigger the on change function
    navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        $.ajax({
            url: 'libs/php/getCountry.php',
            type: 'POST',
            dataType: 'json',
            data: {
                lat: lat,
                lng: lng
            },
            success: function(result) {
                $(`#countrySelect option:contains(${result.data.countryName})`).attr('selected', 'selected');
                $('#countrySelect').trigger('change')
            },
            error: function(error) {
                console.log("error")
                
            }
        })

    });
});

let featureGroup; //Country marker
var airportGroup = L.markerClusterGroup().addTo(map);
let earthquakeGroup = L.markerClusterGroup().addTo(map);
var cityGroup = L.markerClusterGroup().addTo(map);
var markers = {
    "Earthquakes": earthquakeGroup,
    "Citys": cityGroup,
    "Airports": airportGroup,
}

L.control.layers(basemaps, markers, {position: 'bottomleft'}).addTo(map);


//Gets info generated when country is selected
$('#countrySelect').on('change', (event) => {
    let country = event.target.value;
    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: country,
        },
        success: function(result) {
            JSON.stringify(result);
            const country = result.data[0].name.common.split(" ").join('%20');
            const cca2 = result.data[0].cca2;
            
            // This will change the information for the country
            if (result.status.name == "ok") {
                //converts currency object to an array
                var obj = result.data[0].currencies;
                var currency = Object.keys(obj).map((key) => [key, obj[key]]);

                //Update Info Modal
                $('#country').html(result.data[0].name.common);
                $('#population').html(result.data[0].population.toLocaleString("en-US")); //adds , every 1000
                $('#currency').html(currency[0][1].name + " -  " + currency[0][1].symbol);
                $('#flag').attr("src",result.data[0].flags.png);
                $('#area').html(result.data[0].area.toLocaleString("en-US") + "km²") //adds , every 1000

                //Check if more than one capital
                const capitalAmount = Object.keys(result.data[0].capital).length;
                if(capitalAmount > 1) {
                    $('#capitalHead').html("Capitals");
                    $('#capital').html('');
                    for(let i = 0; i < capitalAmount; i++) {
                        const x = document.getElementById("capital");
                        var newLi = document.createElement("LI");
                        var text = document.createTextNode(result.data[0].capital[i]);
                        newLi.appendChild(text);
                        x.appendChild(newLi);
                    }
                } else {
                    $('#capitalHead').html("Capital");
                    $('#capital').html(result.data[0].capital[0]);
                }

                
                //Check if more than one language
                const languagesAmount = Object.keys(result.data[0].languages).length;
                if(languagesAmount > 1) {
                    $('#languageHead').html("Languages");
                    $('#language').html('');
                    for(let i = 0; i < languagesAmount; i++) {
                        const x = document.getElementById("language");
                        var newLi = document.createElement("LI");
                        var text = document.createTextNode(Object.values(result.data[0].languages)[i]);
                        newLi.appendChild(text);
                        x.appendChild(newLi);
                    }
                } else {
                    $('#languageHead').html("Language");
                    $('#language').html(Object.values(result.data[0].languages)[0]);
                }



                //Update currency modal
                $('#countryCurrency').html(currency[0][1].name);
                $('#countryCurrency').attr("value", currency[0][0]);

                //Leaflet pan to location
                const lat = result.data[0].latlng[0];
                const lng = result.data[0].latlng[1]

                $.ajax({
                    url: 'libs/php/getCountries.php',
                    type: 'POST',
                    dataType: 'json',
                    success: function(result){
                        const countryAmount = result.data.length;
                        //Search through each one to proivde polygon data
                        for(let i = 0; i < countryAmount; i++) {
                            if(result.data[i].iso3 === $('#countrySelect').val()){
                                const geojson = result.data[i].geometry;
                                const iso_a2 = result.data[i].iso2;
                                const countryName = result.data[i].name

                                //If there is already the geojson, remove it before adding another
                                if(featureGroup){
                                    map.removeLayer(featureGroup);
                                    airportGroup.clearLayers();
                                    earthquakeGroup.clearLayers();
                                    cityGroup.clearLayers();
                                }
                                
                                featureGroup = L.geoJSON(geojson).addTo(map);
                                map.fitBounds(featureGroup.getBounds());

                                
                                const bounds = featureGroup.getBounds();
                                const north = bounds.getNorth();
                                const south = bounds.getSouth();
                                const east = bounds.getEast();
                                const west = bounds.getWest();                            

                                //Generate airport info
                                $.ajax({
                                    url: 'libs/php/getNearby.php',
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                        lat: lat,
                                        lng: lng,
                                        feature: 'AIRP'
                                    },
                                    success: function(result) {
                                        result.data.geonames.forEach((each) => {
                                            if(each.countryCode === iso_a2){
                                                L.marker([each.lat, each.lng], { icon: airportIcon }).bindPopup(`<b>Airport</b><br>${each.toponymName}`).openPopup().addTo(airportGroup);
                                            }
                                            
                                        })
                                    },
                                    error: function(error){
                                        console.log(error)
                                    }})
                                    
                                //Generate earthquake info
                                $.ajax({
                                    url: 'libs/php/getEarthquakes.php',
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                        north: north,
                                        south: south,
                                        east: east,
                                        west: west
                                    },
                                    success: function(result) {
                                        result.data.earthquakes.forEach((each) => {
                                            L.marker([each.lat, each.lng], { icon: earthquakeIcon }).bindPopup(`<b>Earthquake</b><br>Date= ${convertDate(each.datetime)}</br>Magnitude= ${each.magnitude}`).openPopup().addTo(earthquakeGroup);
                                        })
                                    },
                                    error: function(error){
                                        console.log(error)
                                    }})

                                                        
                                //Generate city info
                                $.ajax({
                                    url: 'libs/php/getCitys.php',
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                        north: north,
                                        south: south,
                                        east: east,
                                        west: west
                                    },
                                    success: function(result) {
                                        $('#wikiBody').html('');
                                        result.data.geonames.forEach((each) => {
                                            if(each.countrycode === iso_a2) {
                                                L.marker([each.lat, each.lng], { icon: cityIcon }).bindPopup(`<b>${each.name}</b><br>Population ${each.population.toLocaleString("en-US")}</br><a href="http://${each.wikipedia}">Wiki</a>`).openPopup().addTo(cityGroup);
                                                //add wiki to the wiki modal
                                                const wiki = document.createElement('div');
                                                const title = document.createElement('h3');
                                                title.textContent = each.name;
                                                const link = document.createElement('a');
                                                link.textContent = "Wiki";
                                                link.setAttribute('href', "http://" + each.wikipedia);
                                                wiki.appendChild(title)
                                                wiki.appendChild(link)

                                                document.getElementById('wikiBody').appendChild(wiki)
                                            }
                                        })
                                    },
                                    error: function(error){
                                        console.log(error)
                                    }})

                                break;
                            }
                        }
                    },
                    error: function(error) {
                        console.log(error)
                    }
                })
                
                //Returning the weather values
                $.ajax({
                    url: "libs/php/getWeather.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        lat: result.data[0].latlng[0],
                        lon: result.data[0].latlng[1]
                    },
                    success: function(result) {
                            //Will return 40 x data for every 3h
                            //Only return every 5 starting at 0
                            //i.e 0, 5, 10, 15
                            let count = 0;
                            for(let i = 0; i <= Object.keys(result.data).length; i = i + 8){                                
                                if(i === 0) {
                                    $('#weatherDate1').html(convertDate(result.data[i].dt_txt))
                                    $('#temp1').html(String((Math.round(result.data[i].main.temp))) + "\u00B0C")
                                    $('#weather1').html(result.data[i].weather[0].main);
                                    $('#weatherIcon1').attr('src', `https://openweathermap.org/img/wn/${result.data[i].weather[0].icon}@2x.png`)
                                    count++
                                } else {
                                    const key = i - 1;
                                    $(`#weatherDate${count}`).html(convertDate(result.data[key].dt_txt));
                                    $(`#temp${count}`).html(String((Math.round(result.data[key].main.temp))) + "\u00B0C")
                                    $(`#weather${count}`).html(result.data[key].weather[0].main);
                                    $(`#weatherIcon${count}`).attr('src', `https://openweathermap.org/img/wn/${result.data[key].weather[0].icon}@2x.png`)
                                    count++
                                }
                            }
                    },
                    error: function (error) {
                        console.log(error)
                    }
            })

            // Return news articles
            $.ajax({
                url: 'libs/php/getNews.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    country: cca2
                },
                success: function(result) {
                    let count = 0;
                    
                    result.data.forEach((news) => {
                        if(news.image !== null){
                            //only returns 6 news articles
                            if(count === 7){
                                return;
                            } else {
                            $('#noNews').attr('style', "display: none;");
                            $(`#news${count}`).attr('style', 'display: block;')
                            $(`#newsImage${count}`).attr('src', news.image);
                            $(`#newsDescription${count}`).html(news.description);
                            $(`#newsSource${count}`).attr("href", news.url);
                            $(`#newsTitle${count}`).html(news.title);
                            count++;
                            }
                        }
                        //If there are no news articles
                        if(count === 0){
                            $('#noNews').attr('style', "display: block;");
                            for(let i = 0; i < 7; i++){
                                $(`#news${i}`).attr('style', 'display: none;')
                            }
                        }
                    })
                    console.log(count)
                },
                error: function(error) {
                    console.log(error)
                }
            })

            // Return images
            $.ajax({
                url: 'libs/php/getImages.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    country: country
                },
                success: function(result) {
                    //Returns 10 images
                    for(let i = 0; i <= 9; i++){
                        if(i === 0){
                            $(`#slide${i}`).attr('src', result.data.results[i].urls.full)
                        } else {
                            $(`#slide${i}`).attr('src', result.data.results[i].urls.full)
                        }
                    }
                },
                error: function(error) {
                    console.log(error)
                }
            })
        }

        },
        error: function(error) {
            console.log("error")
        }
    })
});

  //Button to center map
  L.easyButton('<i class="bi bi-geo"></i>', function(btn, map){
    $.ajax({
      url: "libs/php/getCountryInfo.php",
      type: 'POST',
      dataType: 'json',
      data: {
          country: $('#countrySelect').val(),
      },
      success: function(result) {
        const lat = result.data[0].latlng[0]
        const lng = result.data[0].latlng[1]
        map.setView([lat, lng])
        map.fitBounds(featureGroup.getBounds());
      },
      error: function(error){

      }
    })
  }).addTo(map);