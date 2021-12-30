// URL to fetch the United States Geological Survey - Earthquake data for the past 7 days. 
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

console.log("Hello there!")

// Perform GET request to the query URL
d3.json(queryURL).then((data) => {
    
    // Once we get a response, send the data.features object to the createFeatures function 
    var earthquakeData = data.features;
    console.log(`Earthquake Data:`)
    console.log(earthquakeData);

    // Pointing the center of map to the first geometry coordinates of earthquake data
    var mapCenter = [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]];
    console.log(`Map Center Coordinates: ${mapCenter}`)
    console.log(`Map Center Place: ${data.features[0].properties.place}`)

    //  Create base layers
    var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    }); 

    var grayscaleMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    
    var outdoorMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    // Create a GeoJSON Layer containing the features array on the earthquake object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakeLayer = L.geoJSON(earthquakeData, {
        onEachFeature: (feature, Layer) => Layer.bindPopup(`<h3>${feature.properties.place}</h3><h4>Magniture: ${feature.properties.mag}</h4>
                        <hr><p>${new Date(feature.properties.time)}</p>`)
    });

    // Define a baseMaps object to hold our base layers 
    var baseMaps = {
        "Satellite": satelliteMap,
        "Grayscale": grayscaleMap,
        "Outdoors": outdoorMap
    };

    // Create Overlay object to hold our overlay layer
    var overlayMaps = {
        // "Tectonic Plates": tectonicLayer,
        "Earthquakes": earthquakeLayer
    };

    // Create our map, giving it the satellite map and earthquake layers to display on load
    var myMap = L.map("map", {
        // center: [34.052235, -118.243683],
        center: mapCenter,
        zoom: 3,
        layers: [satelliteMap, earthquakeLayer]
    });

    // Create a Layer Control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap) 

});