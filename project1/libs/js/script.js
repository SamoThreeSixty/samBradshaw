//Imported Functions
import convertDate from "./functions/convertDate.js";

// Functions

const selectedCountryIso2 = () => {
    return $(`.countrySelect`).val().split(' ')[0];
}

const selectedCountryIso3 = () => {
    return $(`.countrySelect`).val().split(' ')[1];
}

const selectedCountryName = () => {
    return $(`.countrySelect option:selected`).text().split(" ").join('%20');
}

const selectedCountryCapital = () => {
    return $(`#weatherCity`).text().split(", ")[1];
}

let capital;

// This gets all of the countrys ready for selection in the dropdown
// Want to sort into alphabetical order at some point!!
$(document).ready(function () {
    $.ajax({
        url: 'libs/php/getCountries.php',
        type: 'POST',
        dataType: 'json',
        success: function(result){
            result.data.forEach((country) => {
                const x = $('.countrySelect');
                const option = document.createElement("option");
                option.text = country.name;
                option.value = country.iso2 + " " + country.iso3;
                x.append(option);
            })
        },
        error: function(error){
            console.log(error)
        }
    })

    //Set current location and trigger the on change function
    try {
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
                    $(`.countrySelect option:contains(${result.data})`).attr('selected', 'selected');
                    $('.countrySelect').trigger('change')     
                },
                error: function(error) {
                }
            })
        });
    } catch (err) {
        console.log(err.message);
    }

});

// Leaflet Setup
var streets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var basemaps = {
    "Streets": streets,
    "Satellite": satellite
};

var map = L.map('map',  {
    layers: [streets]
}).setView([54.5, -4], 6);

const options = {
    polygonOptions: {
    fillColor: '#fff',
    color: '#000',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5}
}

let featureGroup; //Country marker
var airportGroup = L.markerClusterGroup(options).addTo(map);
let earthquakeGroup = L.markerClusterGroup(options).addTo(map);
var cityGroup = L.markerClusterGroup(options).addTo(map);
var markers = {
    "Earthquakes": earthquakeGroup,
    "Citys": cityGroup,
    "Airports": airportGroup,
}

// Leaflet Icons

var cityIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'bi bi-buildings-fill',
    markerColor: 'green',
    shape: 'square'
  });

var earthquakeIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'bi bi-exclamation-diamond',
    iconColor: 'white',
    markerColor: 'red',
    shape: 'square'
});

var airportIcon = L.ExtraMarkers.icon({
    prefix: 'fa',
    icon: 'bi bi-airplane-fill',
    iconColor: 'white',
    markerColor: 'yellow',
    shape: 'square'
});

L.control.layers(basemaps, markers, {position: 'bottomleft'}).addTo(map);

//Information Button
L.easyButton('fa-info', function(btn, map){
    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: selectedCountryIso2(),
        },
        success: function(result) {
            console.log(result)
            
            // This will change the information for the country
            if (result.status.name == "ok") {
                //converts currency object to an array
                var obj = result.data.currencies;
                var currency = Object.keys(obj).map((key) => [key, obj[key]]); 
                
                //Check if more than one capital
                const capitalAmount = Object.keys(result.data.capital).length;
                if(capitalAmount > 1) {
                    $('#capitalHead').html("Capitals");
                    
                    let capitals = [];
                    for(let i = 0; i < capitalAmount; i++) {
                        capitals.push(result.data.capital[i])
                    }
                    $('#capital').html(capitals.join(', '));
                } else {
                    $('#capitalHead').html("Capital");
                    $('#capital').html(result.data.capital[0]);
                }

                // Check if more than one contitnent
                const continentAmount = result.data.continents.length;
                console.log(continentAmount)
                if(continentAmount > 1) {
                    $('#continentHead').html("Continents");
                    
                    let continents = [];
                    for(let i = 0; i < capitalAmount; i++) {
                        continents.push(result.data.capital[i])
                    }
                    $('#continent').html(capitals.join(', '));
                } else {
                    $('#continentHead').html("Continent");
                    $('#continent').html(result.data.continents[0]);
                }


                //Update Info Modal (continent, region(subregion), )
                $('#continent').html(result.data.continent);
                $('#region').html(`${result.data.region}(${result.data.subregion})`)
                $('#population').html(result.data.population.toLocaleString("en-US")); //adds , every 1000
                $('#currency').html(currency[0][1].name + "   " + currency[0][1].symbol);
                $('#flag').attr("src",result.data.flags.png);
                $('#area').html(result.data.area.toLocaleString("en-US") + "km²") //adds , every 1000

               
                
                //Check if more than one language
                const languagesAmount = Object.keys(result.data.languages).length;
                if(languagesAmount > 1) {
                    $('#languageHead').html("Languages");
                    
                    let languages = [];
                    for(let i = 0; i < languagesAmount; i++) {
                        languages.push(Object.values(result.data.languages)[i])
                    }
                    $('#language').html(languages.join(', '));
                } else {
                    $('#languageHead').html("Language");
                    $('#language').html(Object.values(result.data.languages)[0]);
                }
            }},
        error: function(error) {
            console.log(error)
        }})
    $('#infoModal').modal('show');
}).addTo(map);

//News Button
L.easyButton('fa-newspaper-o fa-xl', function(btn, map){
    console.log("NewsModal")
    $.ajax({
        url: 'libs/php/getNews.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country: selectedCountryIso2()
        },
        success: function(result) {
            let count = 0;
            
            result.data.forEach((news) => {
                console.log(news)
                if(news.image !== null){
                    //only returns 6 news articles
                    if(count === 8){
                        return;
                    } else {
                    $('#noNews').attr('style', "display: none;")
                    $(`#news${count}`).attr('style', 'display: block;')



                    $(`#newsImage${count}`).attr('src', news.image_url);
                    $(`#newsPostedDate${count}`).html(convertDate(news.pubDate));
                    $(`#newsSource${count}`).html(news.source_id);
                    $(`#newsTitle${count}`).html(news.title);
                    count++;
                    }
                }
                console.log(count)
                //If there are no news articles
                if(count === 0){
                    $('#noNews').attr('style', "display: block;");
                    for(let i = 0; i < 7; i++){
                        $(`#news${i}`).attr('style', 'display: none;')
                    }
                }
            })
        },
        error: function(error) {
            console.log(error)
        }
    })
    $('#newsModal').modal('show');
}).addTo(map);

//Weather Button
L.easyButton('fa-thermometer-empty fa-xl', function(btn, map){
    console.log("Weather")
    $.ajax({
        url: 'libs/php/getWeather.php',
        type: 'POST',
        datatype: 'json',
        data: {
            city: selectedCountryCapital(),
        },
        success: function(result) {
            console.log(result)
            // Update Todays Weather
            $('#todayWeather').html(result.data[0].condition)
            $('#todayWeatherIcon').attr('src', result.data[0].icon)
            $('#todayWeatherHigh').html(result.data[0].maxtemp_c)
            $('#todayWeatherLow').html(result.data[0].mintemp_c)

            // Update Tomorrows Weather
            $('#tomorrowDate').html(convertDate(result.data[1].time))
            $('#tomorrowWeather').html(result.data[1].condition)
            $('#tomorrowWeatherIcon').attr('src', result.data[1].icon)
            $('#tomorrowWeatherHigh').html(result.data[1].maxtemp_c)
            $('#tomorrowWeatherLow').html(result.data[1].mintemp_c)

            // Update Day after Weather
            $('#dayAfterDate').html(convertDate(result.data[2].time))
            $('#dayAfterWeather').html(result.data[2].condition)
            $('#dayAfterWeatherIcon').attr('src', result.data[2].icon)
            $('#dayAfterWeatherHigh').html(result.data[2].maxtemp_c)
            $('#dayAfterWeatherLow').html(result.data[2].mintemp_c)
        }
    })



    $('#weatherModal').modal('show');
}).addTo(map);

//Currency Button
L.easyButton('fa-money fa-xl', function(btn, map){
    console.log("currencyModal")
    $.ajax({
        url: "libs/php/newgetExchangeRate.php",
        type: "POST",
        dataType: "json",
        success: function(result) {
            console.log(result.data)
            // Reset current currency values if any
            $('#startingCurrency').val(0);
            $('#currencyCalculatorResult').val(0);

            result.data.forEach((currency) => {
                const selectCurrencyElement = $('.countryCurrency');
                const option = document.createElement("option");
                option.text = currency.name;
                option.value = currency.currency;
                selectCurrencyElement.append(option);
            })

            result.data.forEach((currency) => {
                $('#countryCurrency').html(currency.name);
                $('#countryCurrencyValue').attr("value", currency.currency);
            })
            
        },
        error: function(error) {
            console.log(error)
        }
    })
    $('#currencyModal').modal('show');
}).addTo(map);

//Wiki button
L.easyButton('fa-wikipedia-w fa-xl', function(btn, map){
    console.log("wikiModal")
    const country = $(".countrySelect option:selected").text().split(' ').join('%20');
        // Generate country wiki
        $.ajax({
            url: 'libs/php/getWiki.php',
            type: 'POST',
            dataType: 'json',
            data: {
                country: country
            },
            success: function(result) {
                console.log(result)
                for(let i = 0; i < result.data.geonames.length; i++){
                    if(result.data.geonames[i].feature === "country") {
                        console.log(result.data.geonames[i])
                        $('#countryImage').attr('src', result.data.geonames[i].thumbnailImg);
                        $('#country').html(result.data.geonames[i].title);
                        $('#countryWikiText').html(result.data.geonames[i].summary.slice(0, -5));
                        const link = $('<a id="contryWikiLink" class="text-decoration-none">(Read more...)</a>')
                        $('#countryWikiText').append(link)
                        $('#contryWikiLink').attr('href', "https://" + result.data.geonames[0].wikipediaUrl)
                        break;
                    }
                }
            },
            error: function(error) {
            console.log(error)
            }
        })
    $('#wikiModal').modal('show');
}).addTo(map);

//Images Button
L.easyButton('fa-picture-o fa-xl', function(btn, map){
    const country = $(".countrySelect option:selected").text().split(' ').join('%20');
    console.log("imagesModal")
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
                    $(`#slide${i}`).attr('src', result.data[i])
                } else {
                    $(`#slide${i}`).attr('src', result.data[i])
                }
            }
        },
        error: function(error) {
            console.log(error)
        }
    })
    $('#imagesModal').modal('show');
}).addTo(map);


//Setting Button
L.easyButton('fa-cog fa-xl', function(btn, map){
    console.log("Settings")
}).addTo(map);

// Add geoJSON when country is selected
$('.countrySelect').on('change', (event) => {
    $.ajax({
        url: "libs/php/getCountryBoarders.php",
        type: "POST",
        dataType: "json",
        data: {
            country: selectedCountryIso3(),
        },
        success: function(result) {
            if(featureGroup){
                map.removeLayer(featureGroup);
                airportGroup.clearLayers();
                earthquakeGroup.clearLayers();
                cityGroup.clearLayers();
            }

            featureGroup = L.geoJSON(result.data[0]).addTo(map);
            map.fitBounds(featureGroup.getBounds());
            
            // Icons
            const bounds = featureGroup.getBounds();
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            const east = bounds.getEast();
            const west = bounds.getWest();                          

            // Below requires bounds
                
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
                    console.log("Earthquake Recieved")
                    result.data.earthquakes.forEach((each) => {
                        L.marker([each.lat, each.lng], { icon: earthquakeIcon }).bindTooltip(`
                            <h5 class="text-center">Earthquake</h5>
                            <p class="text-center">${convertDate(each.datetime)}</p>
                            <p class="text-center">${each.magnitude} Magnitude</p>`, 
                            {direction: "top", sticky: true}).addTo(earthquakeGroup)
                    })
                },
                error: function(error){
                    console.log("Earthquake Error")
                    console.log(error)
                }
            })

                                    
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
                    console.log("Citys Recieved")
                    $('#wikiTableCitys').html('');
                    result.data.geonames.forEach((each) => {
                        
                        if(each.countrycode === selectedCountryIso2()) {
                            L.marker([each.lat, each.lng], { icon: cityIcon }).bindTooltip(`
                            <h5 class="text-center">${each.name}</h5>
                            <p class="text-center">(${each.population.toLocaleString("en-US")})</p>`, {direction: "top", sticky: true}).addTo(cityGroup)
                        }
                    })
                }
            })
        },
        error: function(error) {
            console.log(error)

        }
    })

    // Requires the lat, lng

    $.ajax({
        url: 'libs/php/getCountryInfo.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country: selectedCountryIso2()
        },
        success: function(result) {
            const lat = result.data.latlng[0];
            const lng = result.data.latlng[1];

            // Set weather city
            $('#weatherCity').html(result.data.name.common + ', ' + result.data.capital);

            // Generate airport info
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
                    console.log("Airports Recieved")
                    result.data.geonames.forEach((each) => {
                        if(each.countryCode == selectedCountryIso2()){
                            L.marker([each.lat, each.lng], { icon: airportIcon }).bindTooltip(`
                            <h5 class="text-center">${each.toponymName}</h5>`, {direction: "top", sticky: true}).addTo(airportGroup);
                        }
                        
                    })
                },
                error: function(error){
                    console.log("Airports Error")
                    console.log(error)
                }
            })
        },
        error: function(err){
            console.log(err)
        }
    })

                

    console.log(capital)

    
});