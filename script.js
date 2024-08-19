
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
}

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


var currentCenter = { lat: 33.681200, lng: 72.830000, title: 'Location 1A' };


var mapOptions = {
    center: currentCenter,
    zoom: 15,
    styles: darkModeStyle
};

var allGeoLocation = [];
var currentGeoLocations = [];

function initMap() {

    // Get the geolocation of the string locations

    const getGeolocation = async () => {

        document.getElementById('loading-bar').style.display = 'block';

        let responseAddresses = await fetch('https://localhost:44314/Home/getAddresses', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        responseAddresses = await responseAddresses.json();

        var locationsArray = responseAddresses.data;

        // latest code [converts address to lat lon and stores in locationsArray]

        var stringLocations = locationsArray.map(location => location.address);


        let geolocations = [];

        for (let i = 0; i < locationsArray.length; i++) {
            try {
                let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationsArray[i].address)}&key=AIzaSyDoCmnLSTMCBPnbqrG3_71ZztjLItFsnfk`, {
                    method: 'GET'
                });

                if (!response.ok) {
                    console.error(`Failed to fetch geolocation for ${stringLocations[i]}. Status: ${response.status}`);
                    continue;
                }

                let data = await response.json();

                if (data.status === 'ZERO_RESULTS') {
                    console.warn(`No geolocation results for ${stringLocations[i]}`);
                    continue;
                }

                if (data.results.length > 0) {
                    geolocations.push(data.results[0].geometry.location);
                    locationsArray[i].coordinates = data.results[0].geometry.location;
                } else {
                    console.warn(`Unexpected response format for ${stringLocations[i]}`);
                }
            } catch (error) {
                console.error(`Error fetching geolocation for ${stringLocations[i]}:`, error);
            }
        }

        if (geolocations.length > 0) {
            mapOptions.center = geolocations[0];
        } else {
            console.warn('No valid geolocations found to set map center.');
        }
        document.getElementById('loading-bar').style.display = 'none';

        return locationsArray;
    };

    const contentString =
        '<div id="content">' +
        '<div id="siteNotice">' +
        "</div>" +
        '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
        '<div id="bodyContent">' +
        "<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large " +
        "sandstone rock formation in the southern part of the " +
        "Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) " +
        "south west of the nearest large town, Alice Springs; 450&#160;km " +
        "(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
        "features of the Uluru - Kata Tjuta National Park. Uluru is " +
        "sacred to the Pitjantjatjara and Yankunytjatjara, the " +
        "Aboriginal people of the area. It has many springs, waterholes, " +
        "rock caves and ancient paintings. Uluru is listed as a World " +
        "Heritage Site.</p>" +
        '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
        "https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
        "(last visited June 22, 2009).</p>" +
        "</div>" +
        "</div>";

    const infowindow = new google.maps.InfoWindow({
        content: contentString,
        ariaLabel: "Uluru",
    });


    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    getGeolocation().then((geolocations) => {
        currentGeoLocations = geolocations;
        allGeoLocation = geolocations;
        const size = 0.0010;
        let fillColor;
        geolocations.forEach(function (location) {
            if (location.departmentName === 'CS') { fillColor = '#ffe700' } else if (location.departmentName === 'EE') { fillColor = '#f000ff' } else if (location.departmentName === 'MG') { fillColor = '#4deeea' } else if (location.departmentName === 'SH') { fillColor = '#C0BBF9' } else { fillColor = '#660066' }

            if (location.degreeLevel === 'UG') {
                new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: fillColor,
                    fillOpacity: 0.35,
                    map: map,
                    center: location.coordinates,
                    radius: 200
                });
            }

            else if (location.degreeLevel === 'PG') {
                const squareBounds = [
                    { lat: location.coordinates.lat + size, lng: location.coordinates.lng - size },
                    { lat: location.coordinates.lat + size, lng: location.coordinates.lng + size },
                    { lat: location.coordinates.lat - size, lng: location.coordinates.lng + size },
                    { lat: location.coordinates.lat - size, lng: location.coordinates.lng - size }
                ];

                new google.maps.Polygon({
                    paths: squareBounds,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: fillColor,
                    fillOpacity: 0.35,
                    map: map
                });
            }

            else {

                const triangleBounds = [
                    { lat: location.coordinates.lat + size, lng: location.coordinates.lng - size },
                    { lat: location.coordinates.lat - size, lng: location.coordinates.lng - size },
                    { lat: location.coordinates.lat, lng: location.coordinates.lng + size }
                ];

                new google.maps.Polygon({
                    paths: triangleBounds,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: fillColor,
                    fillOpacity: 0.35,
                    map: map
                });
            }
        });
    });
}

var selectedDegreeLevel = {
    UG: true,
    PG: true,
    G: true
};

var departmentName = {
    CS: true,
    EE: true,
    MG: true,
    SH: true,
    AMHS: true
};

var gender = {
    M: true,
    F: true
}


var mapOptions = {
    center: currentCenter,
    zoom: 15,
    styles: darkModeStyle
};

const clearMapShapes = () => {
    markers.forEach(marker => marker.setMap(null));
    shapes.forEach(shape => shape.setMap(null));
    markers = [];
    shapes = [];
}


const updateMapShapes = () => {
    clearMapShapes();
    currentGeoLocations.forEach(curr => {
        const size = 0.0010;
        let fillColor;
        if (curr.departmentName === 'CS') { fillColor = '#ffe700' } else if (curr.departmentName === 'EE') { fillColor = '#f000ff' } else { fillColor = '#4deeea' }

        if (curr.degreeLevel === 'UG') {
            new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: fillColor,
                fillOpacity: 0.35,
                map: map,
                center: curr.coordinates,
                radius: 200
            });
        }

        else if (curr.degreeLevel === 'PG') {
            const squareBounds = [
                { lat: curr.coordinates.lat + size, lng: curr.coordinates.lng - size },
                { lat: curr.coordinates.lat + size, lng: curr.coordinates.lng + size },
                { lat: curr.coordinates.lat - size, lng: curr.coordinates.lng + size },
                { lat: curr.coordinates.lat - size, lng: curr.coordinates.lng - size }
            ];

            new google.maps.Polygon({
                paths: squareBounds,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: fillColor,
                fillOpacity: 0.35,
                map: map
            });
        }

        else {

            const triangleBounds = [
                { lat: curr.coordinates.lat + size, lng: curr.coordinates.lng - size },
                { lat: curr.coordinates.lat - size, lng: curr.coordinates.lng - size },
                { lat: curr.coordinates.lat, lng: curr.coordinates.lng + size }
            ];

            new google.maps.Polygon({
                paths: triangleBounds,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: fillColor,
                fillOpacity: 0.35,
                map: map
            });
        }
    })
}

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