// Get the icons by their IDs
const folderIcon = document.getElementById('folder-icon');
const accountIcon = document.getElementById('account-icon');
const settingsIcon = document.getElementById('settings-icon');
const siteLogo = document.getElementById('logo-icon');

// Add event listeners for each icon
folderIcon.addEventListener('click', () => {
    alert("This button will redirect users to the shortlisted areas where further action is being undertaken / planned");
});

accountIcon.addEventListener('click', () => {
    alert("This button will allow users to view their account information");
});

settingsIcon.addEventListener('click', () => {
    alert("This button will allow users to edit their interface settings");
});

siteLogo.addEventListener('click', () => {
    alert("Introduces the interface to the user");
});

mapboxgl.accessToken = 'pk.eyJ1IjoiYnlyb25ubiIsImEiOiJjbTB2NG9qajYxOTE1Mmtwd3Q1aDd5cjM2In0.K6SRujI45VvXnG1vfcwbwA';

var map = new mapboxgl.Map({
    container: 'map-panel', // ID of the div where the map will be placed
    style: 'mapbox://styles/byronnn/cm460wqzq00r001qrdi7m3q81', // Mapbox style
    center: [4.890660, 52.373166], // Initial position [lng, lat]
    zoom: 10.5
});

// Add navigation control (zoom buttons)
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

// Initialize all layers with opacity set to 0
map.on('load', function() {
    map.addLayer({
        id: "fishnet_cells",
        type: "fill",
        source: {
            type: "geojson",
            data: "fairbnb_detailed.geojson"
        },
        paint: {
            "fill-color": ["get", "Fairbnb_Index_Category"],
            "fill-opacity": 0.5
        }
    });

    // Initialize the popup for tooltips
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mousemove', 'fishnet_cells', function(e) {
        // Check if fill-opacity is greater than 0 (layer is visible)
        var opacity = map.getPaintProperty('fishnet_cells', 'fill-opacity');
        if (opacity > 0) {
            // Get the Project_Name and Units from the hovered feature
            var hood = e.features[0].properties.Wijk;
            var units = e.features[0].properties.countBnb;

            // Create a popup and set its position to the hovered polygon
            popup
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-size: 1.4em; font-family: 'Barlow', sans-serif;">
                        Neighborhood:<br><strong>${hood}</strong><br>
                        Number of listings: ${units}
                    </div>`)
                .addTo(map);
        }
    });

    // Remove the popup when the mouse leaves the polygon
    map.on('mouseleave', 'fishnet_cells', function() {
        popup.remove();
    });
});

// Assuming you have a Mapbox map instance initialized as `map`
map.on('click', 'fishnet_cells', (e) => {
    // Get the clicked feature from the map
    const features = e.features[0]; // Only handle one feature at a time

    // Get the attributes from the clicked feature
    const countBnb = features.properties.countBnb;
    const cellId = features.properties.Cell_ID;
    const meanPrice = features.properties.mean_price;
    const fairbnbIndex = features.properties.Fairbnb_Index;
    const wijk = features.properties.Wijk;

    // Create the content to be displayed in the details section
    const detailsContent = `
        <!-- Shortlist Button -->
        <button id="shortlist-button" class="btn btn-primary mb-3">Shortlist cell for further study</button>
        <h4>Grid Cell: ${cellId}</h4>
        <ul>
            <li><strong>Number of Short-Term Rentals:</strong> ${countBnb}</li>
            <li><strong>Average daily Airbnb rate:</strong> ${meanPrice.toFixed(2)}</li>
            <li><strong>Fairbnb Index:</strong> ${fairbnbIndex}</li>
            <li><strong>Neighborhood (Wijk):</strong> ${wijk}</li>
        </ul>
    `;

    // Populate the details-section with the new content
    document.getElementById('details-section').innerHTML = detailsContent;

    // Add an event listener for the "Shortlist" button
    document.getElementById('shortlist-button').addEventListener('click', () => {
        alert('Added to shortlist!');
    });

    addGaugeChart(fairbnbIndex);
    updateWarningsSection(fairbnbIndex);
});

function addGaugeChart(fairbnbIndex) {
    const gaugeData = [
        {
            type: "indicator",
            mode: "gauge",
            value: fairbnbIndex,
            title: { text: "Fairbnb Index", font: { size: 16, family: "Inter, sans-serif" } },
            gauge: {
                axis: { range: [-3, 3], tickwidth: 0.5, tickcolor: "black" },
                bar: { color: "black" },
                steps: [
                    { range: [-5, -1.5], color: "#c7522a" },
                    { range: [-1.5, -0.5], color: "#e5c185" },
                    { range: [-0.5, 0.5], color: "#c8c7d1" },
                    { range: [0.5, 1.5], color: "#74a892" },
                    { range: [1.5, 5], color: "#008585" }
                ],
            }
        }
    ];

    const gaugeLayout = {
        width: 300,
        height: 250,
        margin: { t: 20, r: 20, l: 20, b: 20 },
        font: { family: "Inter, sans-serif" }, // Set global font for layout
        paper_bgcolor: "transparent", // Remove white background outside the plot
        plot_bgcolor: "transparent"  // Remove white background within the plot
    };

    Plotly.newPlot('gaugeChart', gaugeData, gaugeLayout);
}

function updateWarningsSection(fairbnbIndex) {
    const warningsSection = document.getElementById('warnings-section');

    // Determine the recommendation message based on fairbnbIndex
    let recommendation;
    if (fairbnbIndex < -1.5) {
        recommendation = "Recommendation:<br>Likely <b>over-supply</b> of listings at this area — further policy intervention may be needed.";
    } else if (fairbnbIndex > 1.5) {
        recommendation = "Recommendation:<br>Likely <b>under-supply</b> of listings at this area — further planning interventions may be needed.";
    } else {
        recommendation = "Recommendation:<br>The number of listings at this area is likely to be at market equilibrium.";
    }

    // Update the warnings section with the recommendation message
    warningsSection.innerHTML = `<p>${recommendation}</p>`;
}

const mapContainer = document.getElementById('map-panel');
mapContainer.style.cursor = `url(./dot.cur), auto`;

// Update the cursor for the map on mousemove to ensure consistency
map.on('mousemove', () => {
    map.getCanvas().style.cursor = `url(./dot.cur), auto`;
});
