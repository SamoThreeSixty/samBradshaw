export default function convertDate(date) {

    const year = date.slice(0,4);
    const month = date.slice(5,7);
    const day = date.slice(8,10);

    var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const event = new Date(year, (month - 1), day);

    return event.toLocaleDateString(undefined, options);
    
}