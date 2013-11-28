// The following example creates complex markers to indicate water quality
// information near Loreto, BCS. Note that the anchor is set to
// (0,32) to correspond to the base of the flagpole.

function initialize() {
    var ds = new Miso.Dataset({
	importer : Miso.Dataset.Importers.GoogleSpreadsheet,
	parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
	key : "0Ar8LDnqhlSk_dHFpMDB5YXBIVHc5UmlQX25nalY5V3c",
	worksheet : "1"
    });

    var result = ds.fetch();

    result.done(function(ds){
	console.log(ds.columnNames());
    });
    result.fail(function(ds){
	console.log("Failed. Are you connected to the Internet?");
    });

    var mapOptions = {
	zoom: 10,
	center: new google.maps.LatLng(26.0, -111.3)
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);

    setMarkers(map, sample_sites);
}

/**
 * Data for the markers:
 * 0: Name
 * 1: Latitude
 * 2: Longitude
 * 3: zIndex
 * 4: Message for the marker.
 * 5: 0=good quality; 1=caution; 2=unhealthy.
 */
var sample_sites = [
    ['Ensenada Blanca',  25.724881, -111.246491, 4, "<p>Nitrate: .1 ppm<br/>pH: 7.11</p>", 0],
    ['Playa Ligui',  25.74177, -111.258315, 5, "<p>Nitrate: .2 ppm<br/>pH: 7.09</p>", 1],
    ['Puerto Escondido',  25.811582, -111.307416, 3, "<p>Nitrate: .3 ppm<br/>pH: 7.02</p>", 2],
    ['Loreto Bay Estuary',  25.916395, -111.349023, 2, "<p>Nitrate: .2 ppm<br/>pH: 7.18</p>", 1],
    ['Loreto Bay Beach',  25.921455, -111.346357, 1, "<p>Nitrate: 0.0 ppm<br/>pH: 7.01</p>", 0],
    ['Cuevas Pintas',  25.977191, -111.465483, 0, "<p>Nitrate: .15 ppm<br/>pH: 7.15</p>", 0]
];

var icons = [
    'images/good.png',
    'images/caution.png',
    'images/unhealthy.png'
];

function setMarkers(map, locations) {
    // Add markers to the map

    // Marker sizes are expressed as a Size of X,Y
    // where the origin of the image (0,0) is located
    // in the top left of the image.

    // Origins, anchor positions and coordinates of the marker
    // increase in the X direction to the right and in
    // the Y direction down.
    // Shapes define the clickable region of the icon.
    // The type defines an HTML &lt;area&gt; element 'poly' which
    // traces out a polygon as a series of X,Y points. The final
    // coordinate closes the poly by connecting to the first
    // coordinate.
    var shape = {
	coord: [1, 1, 1, 20, 18, 20, 18 , 1],
	type: 'poly'
    };
    for (var i = 0; i < locations.length; i++) {
	var sample_site = locations[i];
	var myLatLng = new google.maps.LatLng(sample_site[1], sample_site[2]);
	// The image to be used with the marker:
	var image = {
	    url: icons[sample_site[5]],
	    // This marker is 20 pixels wide by 32 pixels tall.
	    size: new google.maps.Size(20, 32),
	    // The origin for this image is 0,0.
	    origin: new google.maps.Point(0,0),
	    // The anchor for this image is the base of the flagpole at 0,32.
	    anchor: new google.maps.Point(0, 32)
	};
	// Now build the marker usign the above image:
	var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            icon: image,
            shape: shape,
            title: sample_site[0],
            zIndex: sample_site[3]
	});
	var msg = "<b>"+sample_site[0]+"</b>"+sample_site[4];
	attach_window(marker, msg);
    }
}

function attach_window(marker, msg) {
    var infowindow = new google.maps.InfoWindow({
	content: msg
    });
    google.maps.event.addListener(marker, 'click', function() {
	infowindow.open(marker.get('map'), marker);
    });
}
