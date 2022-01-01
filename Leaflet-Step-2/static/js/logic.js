// URL to fetch the United States Geological Survey - Earthquake data for the past 7 days. 
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
// var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

var tectonicPlatesURL = "static/data/PB2002_plates.json";

// Perform GET request to the query URL
d3.json(queryURL).then((data) => {

    d3.json(tectonicPlatesURL).then((tectonicPlates) => {
    
        // Once we get a response, send the data.features object to the createFeatures function 
        var earthquakeData = data.features;
        console.log(`Earthquake Data:`);
        console.log(earthquakeData);

        var tectonicLayer = L.geoJSON(tectonicPlates);
        console.log('Techtonic Plate Coordinates');
        console.log(tectonicLayer);

        // Pointing the center of map to the first geometry coordinates of earthquake data
        var mapCenter = [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]];

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

        // Function to pick marker color based on the depth of the earthquake
        function markerColorByDepth(depth) {
            if(depth > 90) {
                return "orangered";
            } else if (depth > 70) {
                return "darkorange";
            } else if (depth > 50) {
                return "orange";
            } else if (depth > 30) {
                return "gold";
            } else if (depth > 10) {
                return "greenyellow";
            } else {
                return "lawngreen";
            }
        }

        // Function to set the marker size based on earthquake's magnitude
        function markerSizeByMagnitude(magnitude) {
                // console.log(`Magnitude: ${magnitude}; Radius: ${magnitude * 5}`)
                return magnitude * 5;
        }

        // Create a GeoJSON Layer containing the features array on the earthquake object
        // Run the onEachFeature function once for each piece of data in the array
        var earthquakeLayer = L.geoJSON(earthquakeData, {
            pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng);
            },
            style: function(feature) {
                return {
                color: "white",
                fillColor: markerColorByDepth(feature.geometry.coordinates[2]),
                fillOpacity: 0.5,
                weight: 1.5,
                radius: markerSizeByMagnitude(feature.properties.mag)
                };
            },
            onEachFeature: (feature, Layer) => Layer.bindPopup(`<h3>${feature.properties.place}</h3><br>
                                                                Magniture: ${feature.properties.mag}<br>
                                                                Depth: ${feature.geometry.coordinates[2]}<br>
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
            "Tectonic Plates": tectonicLayer,
            "Earthquakes": earthquakeLayer
        };

        // Create our map, giving it the satellite map and earthquake layers to display on load
        var myMap = L.map("map", {
            // center: mapCenter,
            center: [31.7917, 7.0926],
            zoom: 3,
            layers: [satelliteMap, earthquakeLayer, tectonicLayer]
        });

        // Create Legend Control
        var labels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
        // var labels = ['-10', '10', '30', '50', '70', '90+'];
        var colors = ['lawngreen','greenyellow','gold','orange','darkorange','orangered'  ];

        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend');
            
            for (var i = 0; i < labels.length; i++) {
            
                    div.innerHTML += 
                    '<i style="background:' + colors[i] + '"></i> ' + labels[i] + '<br>';
                }
            // console.log(div);
            // console.log(div.innerHTML);

            return div;
        }; 
        legend.addTo(myMap);

        // Create a Layer Control
        // Pass in our baseMaps and overlayMaps
        // Add the layer control to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap) 

    });
});