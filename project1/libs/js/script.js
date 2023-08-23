const getCountries = async () => {
    const response = await fetch('libs/php/getCountries.php');
    const json = await response.json();
    return json;
}

// This gets all of the countrys ready for selection in the dropdown
// Want to sort into alphabetical order at some point!!
$(document).ready(function () {
    getCountries()
    .then((value) => {
        value.data.forEach((country) => {
            const x = document.getElementById("countrySelect");
            const option = document.createElement("option");
            option.text = country.name.common;
            option.value = country.cca2;
            console.log(option)
            x.appendChild(option);
        })
    
    });
});

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
            // This will change the information for the country
            if (result.status.name == "ok") {
                //converts currency object to an array
                var obj = result.data[0].currencies;
                var currency = Object.keys(obj).map((key) => [key, obj[key]]);

                console.log(currency[0][1].name)
                $('#country').html(result.data[0].name.common);
                $('#capital').html(result.data[0].capital[0]);
                $('#population').html(result.data[0].population.toLocaleString("en-US")); //adds , every 1000
                $('#currency').html(currency[0][1].name);
                $('#flag').attr("src",result.data[0].flags.png);
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("error")
        }
    }); 
});