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

const calculateCurrency = () => {
    const startingValue = $('#startingCurrency').val();
    const rate = $('#exchangeRate').find(":selected").val().split(' ')[0];
    return ((startingValue * rate).toFixed(2)).toLocaleString();
}

function convertDate(date) {
    const year = date.slice(0,4);
    const month = date.slice(5,7);
    const day = date.slice(8,10);

    var options = { weekday: 'short', month: 'short', day: 'numeric' };
    const event = new Date(year, (month - 1), day);

    return event.toLocaleDateString(undefined, options);
}

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

    //Set the currencys in currency modal
    $.ajax({
        url: "libs/php/newgetExchangeRate.php",
        type: "POST",
        dataType: "json",
        success: function(result) {
            

            // Reset current currency values if any
            $('#startingCurrency').val(0);
            $('#currencyCalculatorResult').val(0);

            result.data.forEach((currency) => {
                const selectCurrencyElement = $('.countryCurrency');
                const option = document.createElement("option");
                option.text = currency.name;
                option.value = currency.currency;
                option.id = currency.symbol;
                selectCurrencyElement.append(option);
            })
          
        },
        error: function(error) {
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
        $(`.countrySelect option:first`).attr('selected', 'selected');
    }

    if ($('#preloader').length) {
        $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).hide();
    });
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

L.control.layers(basemaps, markers, {position: 'topright'}).addTo(map);

//Information Button
L.easyButton('fa-info', function(btn, map){
    $('#preloader').show();

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

    $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).hide();
    });
}).addTo(map);

//News Button
L.easyButton('fa-newspaper-o', function(btn, map){
    $('#preloader').show();

    $.ajax({
        url: 'libs/php/getNews.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country: selectedCountryIso2()
        },
        success: function(result) {
            for(let i = 0; i < 7; i++){
                $(`#news${i}`).attr('style', 'display: none;')
            }

            let count = 0;
            
            result.data.forEach((news) => {
                if(news.image !== null){
                    //only returns 6 news articles
                    if(count === 8){
                        return;
                    } else {
                    $('#noNews').attr('style', "display: none;")
                    $(`#news${count}`).attr('style', 'display: block-inline;')



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

    $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).hide();
    });
    $('#newsModal').modal('show');
}).addTo(map);

//Weather Button
L.easyButton('fa-thermometer-empty fa-xl', function(btn, map){
    $('#preloader').show();

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
            $('#todayWeatherHigh').html(result.data[0].maxtemp_c + "&degC")
            $('#todayWeatherLow').html(result.data[0].mintemp_c + "&degC")

            // Update Tomorrows Weather
            $('#tomorrowDate').html(convertDate(result.data[1].time))
            $('#tomorrowWeather').html(result.data[1].condition)
            $('#tomorrowWeatherIcon').attr('src', result.data[1].icon)
            $('#tomorrowWeatherHigh').html(result.data[1].maxtemp_c + "&degC")
            $('#tomorrowWeatherLow').html(result.data[1].mintemp_c + "&degC")

            // Update Day after Weather
            $('#dayAfterDate').html(convertDate(result.data[2].time))
            $('#dayAfterWeather').html(result.data[2].condition)
            $('#dayAfterWeatherIcon').attr('src', result.data[2].icon)
            $('#dayAfterWeatherHigh').html(result.data[2].maxtemp_c + "&degC")
            $('#dayAfterWeatherLow').html(result.data[2].mintemp_c + "&degC")
        }
    })

    $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).hide();
    });
    $('#weatherModal').modal('show');
}).addTo(map);

//Currency Button
L.easyButton('fa-money fa-xl', function(btn, map){
    $('#preloader').show();

    $('#startingCurrency').val(0);
    $('#currencyCalculatorResult').val(0);

    $(`#exchangeRate option[id=${$('#selectedCountryCurrency').val()}]`).attr('selected', 'selected');

    $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).hide();
    });
    $('#currencyModal').modal('show');
}).addTo(map);

// Event handlers on currency caluclator
$('#startingCurrency').on('input', function () {
    $('#currencyCalculatorResult').val(calculateCurrency())
})

$('#exchangeRate').on('change', function () {
    $('#currencyCalculatorResult').val(calculateCurrency())
})


//Wiki button
L.easyButton('fa-wikipedia-w fa-xl', function(btn, map){
    $('#preloader').show();

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

    $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).hide();
    });
    $('#wikiModal').modal('show');
}).addTo(map);

//Images Button
L.easyButton('fa-picture-o fa-xl', function(btn, map){
    $('#preloader').show();

    const country = $(".countrySelect option:selected").text().split(' ').join('%20');

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

    $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).hide();
    });
    $('#imagesModal').modal('show');
}).addTo(map);


//Setting Button
L.easyButton('fa-cog fa-xl', function(btn, map){
    console.log("Settings")

    $('#settingsModal').modal('show');
}).addTo(map);

// Add geoJSON when country is selected
$('.countrySelect').on('change', (event) => {
    $('#preloader').show();

    // Icon Loaders
    // Generates country info on select if this option is chosen (true / false)
    const showMapIconLoaders = $('#showMapIconLoaders').prop('checked'); 
    if(showMapIconLoaders) {
        $('.icon-loader').show();
    } else {
        $('.icon-loader').hide();
    }

    
    $('#airportLoaderResult').removeClass()
    $('#airportLoaderResult').addClass("spinner-border spinner-border-sm")
    $('#cityLoaderResults').removeClass()
    $('#cityLoaderResults').addClass("spinner-border spinner-border-sm")
    $('#earthquakeLoaderResults').removeClass()
    $('#earthquakeLoaderResults').addClass("spinner-border spinner-border-sm")

    $('#airportLoader').removeClass()
    $('#cityLoader').removeClass()
    $('#earthquakeLoader').removeClass()

    setTimeout(
        function() {
            $('#earthquakeLoader').addClass('icon-loaded')
        }, 400);

    setTimeout(
        function() {
            $('#cityLoader').addClass('icon-loaded')
        }, 600);

    setTimeout(
        function() {
            $('#airportLoader').addClass('icon-loaded')
        }, 800);

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
                    $('#earthquakeLoaderResult').removeClass()
                    $('#earthquakeLoaderResult').addClass('bi bi-check-square-fill text-success')



                    result.data.earthquakes.forEach((each) => {
                        L.marker([each.lat, each.lng], { icon: earthquakeIcon }).bindTooltip(`
                            <h5 class="text-center">Earthquake</h5>
                            <p class="text-center">${convertDate(each.datetime)}</p>
                            <p class="text-center">${each.magnitude} Magnitude</p>`, 
                            {direction: "top", sticky: true}).addTo(earthquakeGroup)
                    })

                    setTimeout(
                        function () {
                            $('#earthquakeLoader').addClass('hide-icon')
                        }, 3000)
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
                    $('#cityLoaderResult').removeClass()
                    $('#cityLoaderResult').addClass('bi bi-check-square-fill text-success')


                    $('#wikiTableCitys').html('');
                    result.data.geonames.forEach((each) => {
                        
                        if(each.countrycode === selectedCountryIso2()) {
                            L.marker([each.lat, each.lng], { icon: cityIcon }).bindTooltip(`
                            <h5 class="text-center">${each.name}</h5>
                            <p class="text-center">(${each.population.toLocaleString("en-US")})</p>`, {direction: "top", sticky: true}).addTo(cityGroup)
                        }
                    })

                    setTimeout(
                        function () {
                            $('#cityLoader').addClass('hide-icon')
                        }, 3000)
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
            
            // Set country currency in currency modal
            $('#selectedCountryCurrency').val(Object.keys(result.data.currencies)[0]);

            // Set currency symbol in currency modal
            $("#selectedCountryCurrency").attr('value', Object.keys(result.data.currencies)[0]);

            // Set weather city in weather modal
            $('#weatherCity').html(result.data.name.common + ', ' + result.data.capital);


            // Generates country info on select if this option is chosen (true / false)
            const showInformationOnLoad = $('#showInformationOnLoad').prop('checked'); 
            if(showInformationOnLoad) {
                $('#infoModal').modal('show');

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
            }

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
                    $('#airportLoaderResult').removeClass()
                    $('#airportLoaderResult').addClass('bi bi-check-square-fill text-success')

                    
                    result.data.geonames.forEach((each) => {
                        if(each.countryCode == selectedCountryIso2()){
                            L.marker([each.lat, each.lng], { icon: airportIcon }).bindTooltip(`
                            <h5 class="text-center">${each.toponymName}</h5>`, {direction: "top", sticky: true}).addTo(airportGroup);
                        }
                        
                    })

                    setTimeout(
                        function () {
                            $('#airportLoader').addClass('hide-icon')
                        }, 3000)
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

    $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).hide();
    });
});