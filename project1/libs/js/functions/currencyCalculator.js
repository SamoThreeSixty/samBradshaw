const getExchangeRates = async () => {
    const response = await fetch('libs/php/getExchangeRate.php');
    const result = await response.json();
    return result;
}

$('#calculateCurrency').on('change', function() {
    alert(this.value)
})

$('#calculateCurrency').on('click', function() {
    //Value user has given
    const amount = $('#startingCurrency').val();
    
    //API only able to exchange from USD for free, so this is the only option
    const from = 'USD';

    //Currency used in chosen country
    // const from = document.getElementById('countryCurrency');
    const to = $('#countryCurrencyValue').val();

    const symbol = $('#countryCurrencySymbolValue').val();





    getExchangeRates().then((value) => {
        const rate = value.data.rates[to];
        if(!rate){
            console.log("Rate not avalible")
        }
        const newValue = (amount * rate).toFixed(2);
        const formattedValue = Number(newValue).toLocaleString("en-US");
        console.log(symbol + ' ' + formattedValue)
        $('#currencyCalculatorResult').val(symbol + ' ' + formattedValue);
        return rate;
    })
});