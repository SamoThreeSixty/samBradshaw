// Functions
const addToast = (message) => {
    Toastify({
        text: message,
        gravity: "bottom",
        position: "right",
        
        duration: 3000
    }).showToast();
}

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

function returnDateFull(date) {
    const year = date.slice(0,4);
    const month = date.slice(5,7);
    const day = date.slice(8,10);

    var options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const event = new Date(year, (month - 1), day);

    return event.toLocaleDateString(undefined, options);
}

function returnDateDay(date) {
    const year = date.slice(0,4);
    const month = date.slice(5,7);
    const day = date.slice(8,10);

    var options = { weekday: 'long'};
    const event = new Date(year, (month - 1), day);

    return event.toLocaleDateString(undefined, options);
}

// This gets all of the countrys ready for selection in the dropdown
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
    fillColor: '#F1DDFF',
    color: '#8D14DC',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5
    },

    style: {
        fillColor: '#F1DDFF',
        color: '#8D14DC',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
    }
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
    $('#infoModal').modal('show');
}).addTo(map);

$('#infoModal').on('show.bs.modal', function() {
    $.ajax({
        url: 'libs/php/getCountryInfo.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country: selectedCountryIso2()
        },
        success: function(result) {            
            // Generates country info on select if this option is chosen (true / false)
            const showInformationOnLoad = $('#showInformationOnLoad').prop('checked'); 
            if(showInformationOnLoad) {
                $('#infoModal').modal('show');
            }

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
                $('#continent').html(continents.join(', '));
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

            $('#info-modal-loader').addClass('fadeOut');
        }
    })
})

$('#infoModal').on('hidden.bs.modal', function() {
    $('#info-modal-loader').removeClass('fadeOut');
})


//News Button
L.easyButton('fa-newspaper-o', function(btn, map) {
    $('#newsModal').modal('show');
}).addTo(map)

$('#newsModal').on('show.bs.modal', function(btn, map){
    $.ajax({
        url: 'libs/php/getNews.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country: selectedCountryIso2()
        },
        success: function(result) {

            // Hide all avalible news articles
            for(let i = 1; i <= 7; i++){
                $(`#news${i}`).attr('style', 'display: none;')
            }

            if(result.data == null) {
                $('#noNews').attr('style', "display: block;");

                $('#news-modal-loader').addClass('fadeOut');
            } else {
                let newsCount = 0;

                // Configure to be an array
                const resultArry = Object.entries(result.data);
            
                result.data.forEach((news) => {
                    // Only works if there is an image
                    if(news.image !== null){
                        //only returns 6 news articles
                        if(newsCount === 8){
                            return;
                        } else {
                        $('#noNews').attr('style', "display: none;")
                        $(`#news${newsCount}`).attr('style', 'display: block-inline;')

                        $(`#newsImage${newsCount}`).attr('src', news.image_url);
                        $(`#newsPostedDate${newsCount}`).html(returnDateFull(news.pubDate));
                        $(`#newsSource${newsCount}`).html(news.source_id);
                        $(`#newsTitle${newsCount}`).html(news.title);
                        $(`#newsLink${newsCount}`).attr('href', news.link);
                        newsCount++;
                        }
                    }
                })

                $('#news-modal-loader').addClass('fadeOut');
            }
        }
    })
})

$('#newsModal').on('hidden.bs.modal', function(btn, map){
    $('#news-modal-loader').removeClass('fadeOut');
})

//Weather Button
L.easyButton('fa-thermometer-empty fa-xl', function(btn, map){
    $('#weatherModal').modal('show');
}).addTo(map);

$('#weatherModal').on('show.bs.modal', function(btn, map){
    $.ajax({
        url: 'libs/php/getWeather.php',
        type: 'POST',
        datatype: 'json',
        data: {
            city: selectedCountryCapital(),
        },
        success: function(result) {

            // Update Todays Weather
            $('#todayWeather').html(result.data[0].condition)
            $('#todayWeatherIcon').attr('src', result.data[0].icon)
            $('#todayWeatherHigh').html(Math.round(result.data[0].maxtemp_c) + "&degC")
            $('#todayWeatherLow').html(Math.round(result.data[0].mintemp_c) + "&degC")

            // Update Tomorrows Weather
            $('#tomorrowDate').html(returnDateDay(result.data[1].time))
            $('#tomorrowWeather').html(result.data[1].condition)
            $('#tomorrowWeatherIcon').attr('src', result.data[1].icon)
            $('#tomorrowWeatherHigh').html(Math.round(result.data[1].maxtemp_c) + "&degC")
            $('#tomorrowWeatherLow').html(Math.round(result.data[1].mintemp_c) + "&degC")

            // Update Day after Weather
            $('#dayAfterDate').html(returnDateDay(result.data[2].time))
            $('#dayAfterWeather').html(result.data[2].condition)
            $('#dayAfterWeatherIcon').attr('src', result.data[2].icon)
            $('#dayAfterWeatherHigh').html(Math.round(result.data[2].maxtemp_c) + "&degC")
            $('#dayAfterWeatherLow').html(Math.round(result.data[2].mintemp_c) + "&degC")

            $('#weather-modal-loader').addClass('fadeOut');
        }
    })
})

$('#weatherModal').on('hidden.bs.modal', function(btn, map){
    $('#weather-modal-loader').removeClass('fadeOut');
})

//Currency Button
L.easyButton('fa-money fa-xl', function(btn, map){
    $('#currencyModal').modal('show');
}).addTo(map)

$('#currencyModal').on('show.bs.modal', function(){
    $('#startingCurrency').val(0.00);
    $('#currencyCalculatorResult').val(0);

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

            $(`#exchangeRate option[id=${$('#selectedCountryCurrency').val()}]`).attr('selected', 'selected');
            
            $('#currency-modal-loader').addClass('fadeOut');
        }        
    }) 
})

$('#currencyModal').on('hidden.bs.modal', function(){
    $('#currency-modal-loader').removeClass('fadeOut');
})

// Event handlers on currency caluclator
$('#startingCurrency').on('input', function () {
    $('#currencyCalculatorResult').val(calculateCurrency())
})

$('#exchangeRate').on('change', function () {
    $('#currencyCalculatorResult').val(calculateCurrency())
})


//Wiki button
L.easyButton('fa-wikipedia-w fa-xl', function(btn, map) {
    $('#wikiModal').modal('show');
}).addTo(map);

$('#wikiModal').on('show.bs.modal', function(){
// Generate country wiki
        $.ajax({
            url: 'libs/php/getWiki.php',
            type: 'POST',
            dataType: 'json',
            data: {
                country: selectedCountryName(),
                countryCode: selectedCountryIso2()
            },
            success: function(result) {
                $('#countryImage').attr('src', result.data.thumbnailImg);
                $('#country').html(result.data.title);
                $('#countryWikiText').html(result.data.summary.slice(0, -5));
                const link = $('<a id="contryWikiLink" class="text-decoration-none">(Read more...)</a>')
                $('#countryWikiText').append(link)
                $('#contryWikiLink').attr('href', "https://" + result.data.wikipediaUrl)

                $('#preloader').delay(100).fadeOut('slow', function () {
                    $(this).hide();
                });
                
                $('#wiki-modal-loader').addClass('fadeOut');
            }
        })
})

$('#wikiModal').on('hidden.bs.modal', function(){
    $('#wiki-modal-loader').removeClass('fadeOut');
})

//Images Button
L.easyButton('fa-picture-o fa-xl', function (btn, map){
    $('#imagesModal').modal('show');
}).addTo(map);

$('#imagesModal').on('show.bs.modal', function(btn, map){
    $.ajax({
        url: 'libs/php/getImages.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country: selectedCountryName()
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
            $('#images-modal-loader').addClass('fadeOut');
        }
    })
})

$('#imagesModal').on('hidden.bs.modal', function(btn, map){
    $('#image-modals-loader').removeClass('fadeOut');
})


//Setting Button
L.easyButton('fa-cog fa-xl', function(btn, map){
    $('#settingsModal').modal('show');
}).addTo(map);

// Add geoJSON when country is selected
$('.countrySelect').on('change', () => {
  
    // Generates country info on select if this option is chosen (true / false)
    if($('#showInformationOnLoad').prop('checked')) {
        $('#infoModal').modal('show');
    }

    $.ajax({
        url: "libs/php/getCountryBoarders.php",
        type: "POST",
        dataType: "json",
        data: {
            country: selectedCountryIso3(),
        },
        success: function(result) {

            // Removes previous boarder outline if already there and clears any generated icons
            if(featureGroup){
                map.removeLayer(featureGroup);
                airportGroup.clearLayers();
                earthquakeGroup.clearLayers();
                cityGroup.clearLayers();
            }

            featureGroup = L.geoJSON(result.data[0], {
                style: options.style
            }).addTo(map);
            const bounds = featureGroup.getBounds();

            // Fits view to bounds of the country
            map.fitBounds(bounds);
            
            // Required for generating icons
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            const east = bounds.getEast();
            const west = bounds.getWest();             
                
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
                    if(result.status.code === '200') {
                        if(result.data.earthquakes.length !== 0) {

                        result.data.earthquakes.forEach((each) => {
                            L.marker([each.lat, each.lng], { icon: earthquakeIcon }).bindTooltip(`
                                <h5 class="text-center">Earthquake</h5>
                                <p class="text-center">${returnDateFull(each.datetime)}</p>
                                <p class="text-center">${each.magnitude} Magnitude</p>`, 
                                {direction: "top", sticky: true}).addTo(earthquakeGroup)
                        });
                        if($('#showMapIconLoaders').prop('checked')) {
                            addToast("Earthquakes Loaded")  
                        }                 
                        } else {
                            if($('#showMapIconLoaders').prop('checked')) {
                                addToast("No earthquake data to load")  
                            }  
                        }
                    } else {
                        if($('#showMapIconLoaders').prop('checked')) {
                            addToast("Error loading earthquakes")  
                        }
                    }
                },
                error: function(error){
                    Toastify({
                        text: "Error loading earthquakes",
                        gravity: "bottom",
                        position: "right",
                        
                        duration: 3000
                    }).showToast();
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
                    if(result.status.code === '200') {
                        if(result.data.length !== 0) {
                            result.data.forEach((each) => {
                                if(each.countrycode === selectedCountryIso2()) {
                                    L.marker([each.lat, each.lng], { icon: cityIcon }).bindTooltip(`
                                    <h5 class="text-center">${each.name}</h5>
                                    <p class="text-center">(${each.population.toLocaleString("en-US")})</p>`, {direction: "top", sticky: true}).addTo(cityGroup)
                                }
                            })
                            if($('#showMapIconLoaders').prop('checked')) {
                            addToast("Citys Loaded")  
                            }
                        } else {
                            if($('#showMapIconLoaders').prop('checked')) {
                                addToast("No Citys to load")  
                                }
                        }     
                    } else {
                        if($('#showMapIconLoaders').prop('checked')) {
                            addToast("Error loading Citys")  
                        }
                    }
                }
            })
        }
    })

    // Used to generate the lat and lng

    $.ajax({
        url: 'libs/php/getCountryInfo.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country: selectedCountryIso2()
        },
        success: function(result) {

            // Below is useful to assist other modals, namely the currency and weather
                // Set country currency in currency modal
                $('#selectedCountryCurrency').val(Object.keys(result.data.currencies)[0]);

                // Set weather city in weather modal
                $('#weatherCity').html(result.data.name.common + ', ' + result.data.capital);  

            const lat = result.data.latlng[0];
            const lng = result.data.latlng[1];

            // Generate airport info
            $.ajax({
                url: 'libs/php/getNearby.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    lat: lat,
                    lng: lng,
                    feature: 'AIRP',
                },
                success: function(result) {                    
                    if(result.status.code === '200') {
                        if(result.data.length !== 0) {
                            result.data.forEach((each) => {
                                if(each.countryCode == selectedCountryIso2()){
                                    L.marker([each.lat, each.lng], { icon: airportIcon }).bindTooltip(`
                                    <h5 class="text-center">${each.name}</h5>`, {direction: "top", sticky: true}).addTo(airportGroup);
                                }
                            });
                            if($('#showMapIconLoaders').prop('checked')) {
                                addToast("Airports Loaded")  
                            }    
                        } else {
                            if($('#showMapIconLoaders').prop('checked')) {
                                addToast("No Airports to load")  
                            }
                        }
                    } else {
                        if($('#showMapIconLoaders').prop('checked')) {
                            addToast("Error loading Airports")  
                        }
                    }
                }
            })
        }
    })
});