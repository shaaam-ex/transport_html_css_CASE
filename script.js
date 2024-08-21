
var darkModeStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#212121"
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#212121"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#bdbdbd"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#6d6d6d"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#181818"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2c2c2c"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2c2c2c"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#3d3d3d"
            }
        ]
    }
];

const selectedDegreeLevel = { UG: false, PG: false, G: false };
const departmentName = { CS: false, EE: false, MG: false, SH: false, AMHS: false };
const gender = { M: false, F: false };

const currentCenter = { lat: 33.681200, lng: 72.830000, title: 'Location 1A' };

const mapOptions = {
    center: currentCenter,
    zoom: 15,
    styles: darkModeStyle
};

let allGeoLocation = [];
let currentGeoLocations = [];
let map;
let markersAndShapes = []; // Array to keep track of all markers and shapes

// Function to read CSV file and process data
const fetchDataFromCSV = async () => {
    try {
        const response = await fetch('http://192.168.53.149:40725/testTransportData.csv');
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const locationsArray = results.data.map(row => ({
                        address: row.Address,
                        degreeLevel: row.DegreeLevel,
                        departmentName: row.DepartmentName,
                        GENDER: row.GENDER,
                        coordinates: { lat: 0, lng: 0 } // Placeholder for coordinates
                    }));

                    resolve(locationsArray);
                },
                error: reject
            });
        });
    } catch (error) {
        document.getElementById('loading-bar').style.display = 'none';
        console.error('Error fetching the CSV file:', error);
        return [];
    }
};

// Function to initialize the map
function initMap() {
    document.getElementById('loading-bar').style.display = 'block';
    fetchDataFromCSV().then(async (locationsArray) => {
        // Convert addresses to geolocations
        const geolocations = [];
        for (let i = 0; i < locationsArray.length; i++) {
            try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationsArray[i].address)}&key=AIzaSyDoCmnLSTMCBPnbqrG3_71ZztjLItFsnfk`);
                if (!response.ok) {
                    console.error(`Failed to fetch geolocation for ${locationsArray[i].address}. Status: ${response.status}`);
                    continue;
                }
                const data = await response.json();
                if (data.status === 'ZERO_RESULTS') {
                    console.warn(`No geolocation results for ${locationsArray[i].address}`);
                    continue;
                }
                if (data.results.length > 0) {
                    const location = data.results[0].geometry.location;
                    geolocations.push(location);
                    locationsArray[i].coordinates = location;
                } else {
                    console.warn(`Unexpected response format for ${locationsArray[i].address}`);
                }
            } catch (error) {
                console.error(`Error fetching geolocation for ${locationsArray[i].address}:`, error);
            }
        }

        if (geolocations.length > 0) {
            mapOptions.center = geolocations[0];
        } else {
            console.warn('No valid geolocations found to set map center.');
        }

        if (!map) {
            map = new google.maps.Map(document.getElementById('map'), mapOptions);
        }

        allGeoLocation = locationsArray;
        currentGeoLocations = locationsArray;

        updateMapShapes();
        document.getElementById('loading-bar').style.display = 'none';
    });
}

// Function to add a marker or shape to the array
function addToMarkersAndShapes(item) {
    markersAndShapes.push(item);
}

// Function to remove all markers and shapes from the map
function clearMap() {
    markersAndShapes.forEach(item => item.setMap(null));
    markersAndShapes = []; // Clear the array after removing all items
}

// Function to update map shapes based on current filters
const updateMapShapes = () => {
    clearMap(); // Clear existing markers and shapes

    currentGeoLocations.forEach(curr => {
        const size = 0.0010;
        let fillColor;
        if (curr.departmentName === 'CS') { fillColor = '#ffe700'; }
        else if (curr.departmentName === 'EE') { fillColor = '#f000ff'; }
        else if (curr.departmentName === 'MG') { fillColor = '#4deeea'; }
        else if (curr.departmentName === 'SH') { fillColor = '#C0BBF9'; }
        else { fillColor = '#660066'; }

        let shape;
        const infoWindowContent = `<div><strong>${curr.address}</strong><br>Degree Level: ${curr.degreeLevel}<br>Department: ${curr.departmentName}<br>Gender: ${curr.GENDER}</div>`;

        if (curr.degreeLevel === 'UG') {
            shape = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: fillColor,
                fillOpacity: 0.35,
                map: map,
                center: curr.coordinates,
                radius: 200,
                clickable: true // Ensure the circle is clickable
            });
        } else if (curr.degreeLevel === 'PG') {
            const squareBounds = [
                { lat: curr.coordinates.lat + size, lng: curr.coordinates.lng - size },
                { lat: curr.coordinates.lat + size, lng: curr.coordinates.lng + size },
                { lat: curr.coordinates.lat - size, lng: curr.coordinates.lng + size },
                { lat: curr.coordinates.lat - size, lng: curr.coordinates.lng - size }
            ];
            shape = new google.maps.Polygon({
                paths: squareBounds,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: fillColor,
                fillOpacity: 0.35,
                map: map,
                clickable: true // Ensure the polygon is clickable
            });
        } else {
            const triangleBounds = [
                { lat: curr.coordinates.lat + size, lng: curr.coordinates.lng - size },
                { lat: curr.coordinates.lat - size, lng: curr.coordinates.lng - size },
                { lat: curr.coordinates.lat, lng: curr.coordinates.lng + size }
            ];
            shape = new google.maps.Polygon({
                paths: triangleBounds,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: fillColor,
                fillOpacity: 0.35,
                map: map,
                clickable: true // Ensure the polygon is clickable
            });
        }

        addToMarkersAndShapes(shape);

        // Create a new InfoWindow for each shape
        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        // Add event listener to open info window when shape is clicked
        shape.addListener('click', function () {
            infoWindow.setPosition(curr.coordinates);
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(map, shape); // Use 'shape' as the anchor for the InfoWindow
        });
    });
}

// Other code remains unchanged

const checkAll = () => {
    if (document.getElementById('all-check').checked) {
        document.getElementById('ug-checkbox').checked = true;
        document.getElementById('pg-checkbox').checked = true;
        document.getElementById('g-checkbox').checked = true;
        document.getElementById('cs-checkbox').checked = true;
        document.getElementById('ee-checkbox').checked = true;
        document.getElementById('mg-checkbox').checked = true;
        document.getElementById('sh-checkbox').checked = true;
        document.getElementById('amhs-checkbox').checked = true;
        document.getElementById('male-checkbox').checked = true;
        document.getElementById('female-checkbox').checked = true;
    }
};

$(document).ready(function () {
    $("input[type='checkbox']").change(function () {
        if ($("input[type='checkbox']:checked").length - 1 === $("input[type='checkbox']").length - 1) {
            $("#all-check").prop("checked", true);
            $('#all-check').prop('disabled', true);
        } else {
            $("#all-check").prop("checked", false);
            $('#all-check').prop('disabled', false);
        }
    });
});

document.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        selectedDegreeLevel.UG = document.getElementById('ug-checkbox').checked;
        selectedDegreeLevel.PG = document.getElementById('pg-checkbox').checked;
        selectedDegreeLevel.G = document.getElementById('g-checkbox').checked;

        departmentName.CS = document.getElementById('cs-checkbox').checked;
        departmentName.EE = document.getElementById('ee-checkbox').checked;
        departmentName.MG = document.getElementById('mg-checkbox').checked;
        departmentName.SH = document.getElementById('sh-checkbox').checked;
        departmentName.AMHS = document.getElementById('amhs-checkbox').checked;

        gender.M = document.getElementById('male-checkbox').checked;
        gender.F = document.getElementById('female-checkbox').checked;

        currentGeoLocations = allGeoLocation.filter(location => selectedDegreeLevel[location.degreeLevel] && departmentName[location.departmentName] && gender[location.GENDER]);

        updateMapShapes();
    });
});
