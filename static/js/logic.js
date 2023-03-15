let json_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let tectonicCsv = "../../resources/PB2002_steps.csv"


d3.json(json_url).then(data => {
    console.log("features",data.features)
    console.log(data.features[0].properties.place)
    console.log(data.features[0].geometry.coordinates.splice(0,2))
    console.log(data.features.length)
    console.log(data.features[0].properties.mag)
    console.log("marker size ", markerSize(data.features[0].properties.mag))
})

const markerSize = mag =>  Math.abs(mag) * 4

let heatColors = ['#a3f600', '#dcf400', '#f7db11', '#fdb72a', '#fca35d', '#ff5f65']
let markerColor = depth => {
    return depth > 90 ? heatColors[5] :
           depth > 70 ? heatColors[4] :
           depth > 50 ? heatColors[3] :
           depth > 30 ? heatColors[2] :
           depth > 10 ? heatColors[1] : heatColors[0]
}

d3.json(json_url).then(data => {
    createFeatures(data.features)
    console.log("all features--", data.features)
    for (let i=0; i<data.features.length; i++){
        if (data.features[i].properties.mag <= 0) {
            console.log(data.features[i].properties.mag)
            }
    }
})

const createFeatures = data => {
    const onEachFeature = (feature, layer) => {
        layer.bindPopup(`<h3>${feature.properties.place}</h3>
                        <hr>
                        <table>
                            <tr>
                                <th>Longitude:</th><td>${feature.geometry.coordinates[0]}</td>        
                            </tr>
                            <tr>
                                <th>Latitude:</th><td>${feature.geometry.coordinates[1]}</td>
                            </tr>
                            <tr>
                                <th>Magnitude:</th><td>${markerSize(feature.properties.mag)}</td>
                            </tr>
                            <tr>
                                <th>Depth:</th><td>${feature.geometry.coordinates[2]}</td>
                            </tr>
                        </table>`
                        )}

    let earthquakes = L.geoJSON(data, {
        onEachFeature: onEachFeature,
        pointToLayer: feature => {
         return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                fillOpacity: 0.75,
                color: "grey",
                weight: 1,
                fillColor: markerColor(feature.geometry.coordinates[2]),
                radius: (markerSize(feature.properties.mag)) 
                })
        }
    });


  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}


const createMap = (earthquakes, tectonic) => {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
    let grayscale = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    })
    let satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    })



    // Create a baseMaps object.
    let baseMaps = {
        Satellite: satellite,
        Grayscale: grayscale,
        Outdoors: street,
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes,
    };
    
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [39.7392, -104.9903],
        zoom: 5,
        layers: [grayscale, earthquakes]
    })


    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
        let div = L.DomUtil.create("div", "info legend");
        rng = [-10, 10, 30, 50, 70, 90]
        scales = {}
        for (let i = 0; i < rng.length; i++) {
            scales[`${rng[i]}${rng[i+1] ? '-'+rng[i+1] : '+'}`] = heatColors[i]
        }
        let labels = [];
        Object.keys(scales).forEach(key => {
            labels.push(`<tr> <th style="background:${scales[key]}"></th> <td>&nbsp;&nbsp;</td> <td>${key}</td> </tr>`)
        });
        div.innerHTML+= `<table> ${labels.join("")} </table>`
        
        return div;

    }

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);


    legend.addTo(myMap);
}
