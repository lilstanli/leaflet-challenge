let json_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

d3.json(json_url).then(data => {
    console.log(data.features[0].properties.place)
    console.log(data.features[0].geometry.coordinates.splice(0,2))
    console.log(data.features.length)
    console.log(data.features[0].properties.mag)
    console.log("marker size ", markerSize(data.features[0].properties.mag))
})

const markerSize = mag =>  Math.sqrt(mag) * 50

let markerColor = depth => {
    return depth > 90 ? '#ff5f65' :
           depth > 70 ? '#fca35d' :
           depth > 50 ? '#fdb72a' :
           depth > 30 ? '#f7db11' :
           depth > 10 ? '#dcf400' :
           depth > -11 ? '#a3f600' : "#ffffff"
}

let myMap = L.map("map", {
    center: [39.7392, -104.9903],
    zoom: 5,
    // layers: [street, geoMarkerGroup]
})


// const getGeoData = () => {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    
    
    
    // Creating the map object
    // let myMap = L.map("map", {
    //     center: [39.7392, -104.9903],
    //     zoom: 5,
    // });
    
    let geoMarkers = []
    let magnitudes = []
    let geoData = []

    d3.json(json_url).then(data => {
        for (let i = 0; i < data.features.length; i++) {
            geoMarkers.push([data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]])
        }
        
    })
    
    console.log("geos", geoMarkers)

    for (let i = 0; i < geoMarkers.length; i++) {        
            // L.marker([data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]).bindPopup("<h3>" + data.features[i].properties.place + "</h3>")

            L.circle(geoMarkers[i], {
                stroke: false,
                fillOpacity: 0.75,
                color: "white",
                fillColor: "purple",
                // fillColor: markerColor(data.features[i].geometry.coordinates[0]),
                // radius: (markerSize(data.features[i].properties.mag)) ? (markerSize(data.features[i].properties.mag)) : 0
                }).bindPopup("<h3>" + data.features[i].properties.place + "</h3>").addTo(myMap)

        console.log((markerSize(data.features[i].properties.mag)) ? true : data.features[i].properties.mag)
    }






// }

// getGeoData()