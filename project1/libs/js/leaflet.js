var streets = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "eh"
    }
  );
  
  var satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "eh"
    }
  );
  var basemaps = {
    "Streets": streets,
    "Satellite": satellite
  };
  
  var map = L.map("map", {
    layers: [streets]
  }).fitWorld();

  //Set current position
  navigator.geolocation.getCurrentPosition((position) => {
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;
  map.setView([lat, lng])
})

  //Marker Icons
  const airportIcon = L.icon({
    iconUrl: 'libs/images/airport.png',
    iconSize: [30, 30],
  })

  const hospitalIcon = L.icon({
    iconUrl: 'libs/images/hospital.png',
    iconSize: [30, 30],
  })

  const cityIcon = L.icon({
    iconUrl: 'libs/images/city.png',
    iconSize: [30, 30],
  })

  const earthquakeIcon = L.icon({
    iconUrl: 'libs/images/earthquake.png',
    iconSize: [30, 30],
  })