let json_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(json_url).then(data => {
    console.log("features",data.features)
    console.log(data.features[0].properties.place)
    console.log(data.features[0].geometry.coordinates.splice(0,2))
    console.log(data.features.length)
    console.log(data.features[0].properties.mag)
    console.log("marker size ", markerSize(data.features[0].properties.mag))
})

// const markerSize = mag =>  Math.sqrt(mag) * 7
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
    // console.log("all depth--", data.features)
    if (data.features[i].properties.mag <= 0) {
        console.log(data.features[i].properties.mag)
    }

    // console.log("all depth--", data.features[i].geometry.coordinates[2])

    }

})

const createFeatures = data => {
    const onEachFeature = (feature, layer) => {
        layer.bindPopup(`<h3>${feature.properties.place}</h3>
                        <table>
                            <tr>
                                <th>Magnitude:</th><td>${markerSize(feature.properties.mag)}</td>
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

    let tectonic = L.geoJSON(data, {
        pass
    })

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes, tectonic);
}


const createMap = (earthquakes, tectonic) => {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    let grayscale = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
	maxZoom: 13
    });
    let satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });



      // Create a baseMaps object.
    let baseMaps = {
        Satellite: satellite,
        Grayscale: grayscale,
        Outdoors: street,


    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes,
        // Tectonic : tectonic
    };
    
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [39.7392, -104.9903],
        zoom: 5,
        layers: [street, earthquakes] //tectonic]
    })


    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
        let div = L.DomUtil.create("div", "info legend");
        let scales = {
            "-10-10" : heatColors[0],
            "10-30" : heatColors[1],
            "30-50" : heatColors[2],
             "50-70" : heatColors[3], 
             "70-90" : heatColors[4], 
             "90+" : heatColors[5]
        };
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
