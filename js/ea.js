/*
 * Retrieves water quality info from a Google spreadsheet, then displays it
 * on a map. Clicking on one of the flag brings up a popup with details.
 *
 * Tom Keffer 2013-11-28
 *
 * TODOs:
 *  o The column names should be case insensitive. This would probably require
 *    a custom Dataset importer.
 *  o The popup InfoWindow should use CSS styling.
 */

var shape = {
    coord: [1, 1, 1, 20, 18, 20, 18 , 1],
    type: 'poly'
};

var flags = [
    'images/unknown.png',
    'images/good.png',
    'images/caution.png',
    'images/unhealthy.png'
];

function initialize() {

    var ds = new Miso.Dataset({
	importer : Miso.Dataset.Importers.GoogleSpreadsheet,
	parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
	key : "0Ar8LDnqhlSk_dHFpMDB5YXBIVHc5UmlQX25nalY5V3c",
	worksheet : "1",
	columns: [{name:"Date", type:"time"}]
    });

    // Now go fetch the dataset. The return value, result, will be a deferred.
    // We'll evaluate it when we're ready.
    var result = ds.fetch();

    // Set up the map.
    var mapOptions = {
	zoom: 10,
	center: new google.maps.LatLng(26.0, -111.3)
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);

    // The map is done. Wait for the deferred to be done, then populate the map 
    // with the sampling sites.
    result.done(function(ds){
	// Iterate over each site
	ds.each(function(site){
	    // Add a marker for each site
	    set_marker(map, site);
	});
    });
    result.fail(function(ds){
	console.log("Failed. Are you connected to the Internet?");
    });

}

function set_marker(map, row_data){

    var myLatLng = new google.maps.LatLng(row_data.Latitude, row_data.Longitude);

    // Get a flag for this site
    var flag_url = get_flag_url(row_data.flag);

    // The image to be used with the marker:
    var image = {
	url: flag_url,
	// This marker is 20 pixels wide by 32 pixels tall.
	size: new google.maps.Size(20, 32),
	// The origin for this image is 0,0.
	origin: new google.maps.Point(0,0),
	// The anchor for this image is the base of the flagpole at 0,32.
	anchor: new google.maps.Point(0, 32)
    };

    // Now build the marker using the above image:
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image,
        shape: shape,
        title: row_data.Site
    });

    // Get a nice HTML message to attach to the popup:
    html_msg = get_html_msg(row_data);

    // Now attach it.
    attach_window(marker, html_msg);
}

function get_flag_url(flag_no){
    if (flag_no < 0 | flag_no >= flags.length | flag_no==null)
	flag_no = 0
    return flags[flag_no]
}

// These column types are either not included in the popup summary, or
// they are treated separately.
special = {'_id':'', 'date':'', 'site':'', 'latitude':'', 
	   'longitude':'', 'comment':'', 'flag':''};

function get_html_msg(row_data){
    // Given some row data, returns a nice HTML summary
    result = "<h1>" + row_data.Site + "</h1>";
    result += "<p><b>Sampling date: </b>" + row_data.Date.format("YYYY-MM-DD") + "</p>";
    result += "<p><b>Comments:</b><br/>" + row_data.Comment + "</p>";
    result += "<p><b>Data:</b><br/>";
    for (column in row_data){
	if (!(column.toLowerCase() in special)){
	    result += column + ": " + row_data[column] + "<br/>"
	};
    };
    result += "</p>"
    return result
}

function attach_window(marker, msg) {
    var infowindow = new google.maps.InfoWindow({
	content: msg
    });
    google.maps.event.addListener(marker, 'click', function() {
	infowindow.open(marker.get('map'), marker);
    });
}
