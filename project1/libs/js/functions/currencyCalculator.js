const getExchangeRates = async () => {
    const response = await fetch('libs/php/getExchangeRate.php');
    const result = await response.json();
    return result;
}

$('#calculateCurrency').on('click', function() {
    //Value user has given
    const amount = $('#startingCurrency').val();

    //API only able to exchange from USD for free, so this is the only option
    const to = 'USD';

    //Currency used in chosen country
    // const from = document.getElementById('countryCurrency');
    const from = $('#countryCurrency').val();
    console.log(from)




    const exchange_rate = getExchangeRates().then((value) => {
        console.log(from)
        const rate = value.data.rates[from];
        console.log(rate)
        const newValue = (amount * rate).toFixed(2);
        console.log(newValue)
        $('#currencyCalculatorResult').val(newValue);
        return rate;
    })
});