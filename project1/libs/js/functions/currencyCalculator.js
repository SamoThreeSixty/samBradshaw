const getExchangeRates = async () => {
    const response = await fetch('libs/php/getExchangeRate.php');
    const result = await response.json();
    return result;
}

$('#calculateCurrency').on('click', function() {
    //Value user has given
    const amount = document.getElementById('startingCurrency').value;
    //Currency chosen to change from
    const from = document.getElementById('selectCurrency').value;
    // //Currency of chosen country to
    // const to = document.getElementById('countryCurrency').value;
    // //Above needs sorting


    //For testing using USD
    const to = 'USD';

    const exchange_rate = getExchangeRates().then((value) => {
        const rate = value.data.rates[from];
        console.log(rate)
        const newValue = amount * rate;
        $('#currencyCalculatorResult').val(newValue);
        return rate;
    })    
});