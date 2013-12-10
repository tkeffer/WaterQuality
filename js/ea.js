/*
 * Retrieves water quality info from a Google spreadsheet, then displays it
 * on a map. Clicking on one of the flags brings up a popup with details.
 *
 * Tom Keffer 2013-11-28
 *
 * TODOs:
 *  o Better looking flags.
 */

var spreadsheet_key = "0Ar8LDnqhlSk_dG5QYlB1ODd6Y0NDR3VCWHEzTnpZQlE";

// Shape of the clickable polygon around each marker
var shape = {
    coord: [1, 1, 1, 20, 18, 20, 18 , 1],
    type: 'poly'
};

// Flags to be used as markers.
var flags = [
    'images/unknown.png',
    'images/good.png',
    'images/caution.png',
    'images/unhealthy.png'
];

function initialize() {

    var data_ds = new Miso.Dataset({
	importer : Miso.Dataset.Importers.GoogleSpreadsheet,
	parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
	key : spreadsheet_key,
	worksheet : "1",
	columns: [{name:"Date", type:"time"}]
    });

    var site_ds = new Miso.Dataset({
	importer : Miso.Dataset.Importers.GoogleSpreadsheet,
	parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
	key : spreadsheet_key,
	worksheet : "2",
    });

    // Now go fetch the datasets. The return value will be a deferred.
    // We'll evaluate it when we're ready.
    var site_deferred = site_ds.fetch();
    var data_deferred = data_ds.fetch();

    // Set up the map.
    var mapOptions = {
	zoom: 10,
	center: new google.maps.LatLng(26.0, -111.3)
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);

    // Wait for the two deferreds to be resolved, then set up the flags
    _.when(site_deferred, data_deferred)
	.then(
	    function(site_ds, data_ds){
		// site_ds: The Miso Dataset holding the site information
		// data_ds: THe Miso Dataset holding the data information
		// Iterate over each row in the site dataset.
		// Each will be a unique sampling site.
		site_ds.each(function(site_row){
		    // Filter the data dataset, keeping only the
		    // data for this site.
		    var site_data = data_ds.where(function(row){
			return row.SITIO === site_row.SITIO;
		    });
		    // Add a marker for this site
		    setup_site_popup(map, site_row, site_data);
		});
	    },
	    function(){
		console.log("Failed. Are you connected to the Internet?");
	    }
	);
}

function setup_site_popup(map, site_row, site_data){

    var latitude = cip(site_row, 'latitude');
    var longitude = cip(site_row, 'longitude');
    if (latitude == null || longitude == null){
	console.log(cip(site_row, 'sitio'), " location unknown.");
	return
    }
    var myLatLng = new google.maps.LatLng(latitude, longitude);

    //    var flag_url = get_flag_url(cip(site_row, "flag"));
    var flag_url = get_flag_url(1);

    // The icon data for the site marker
    var icon_data = {
	url: flag_url,
	// This marker is 20 pixels wide by 32 pixels tall.
	size: new google.maps.Size(20, 32),
	// The origin for this image is 0,0.
	origin: new google.maps.Point(0,0),
	// The anchor for this image is the base of the flagpole at 0,32.
	anchor: new google.maps.Point(0, 32)
    };

    // Now build the marker using the above data:
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: icon_data,
        shape: shape,
        title: cip(site_row, 'sitio')
    });

    // Get a nice HTML message to attach to the popup:
    html_msg = get_html_msg(site_row, site_data);

    // Now attach it.
    attach_window(marker, html_msg);
}

function get_flag_url(flag_no){
    // If a flag number is out of bounds, or missing, then use
    // the "unknown" flag.
    if (flag_no < 0 | flag_no >= flags.length | flag_no==null)
	flag_no = 0
    return flags[flag_no]
}

// These column types are dropped from the popup summary
special = {'Date':'', 'SITIO':'', 'comment':'', 'flag':''};

function get_html_msg(site_row, site_data){
    // Given some row data, returns a nice HTML summary.
    var result = "<h1>" + cip(site_row, 'sitio') + "</h1>";
    result += "<p><b>Historical Data:</b></p>";
    result += "<table border=1>";
    column_names = site_data.columnNames();
    result += "<tr>";
    for (i=0; i<column_names.length; i++){
	if (!(column_names[i] in special))
	    result += "<td class='column_name'>" + column_names[i] + "</td>";
    }
    result += "</tr>";
    site_data.each(function (row_data){
	result += "<tr>";
	for (i=0; i<column_names.length; i++){
	    if (!(column_names[i] in special))
		result += "<td class='column_value'>" + row_data[column_names[i]] + "</td>";
	};
	result += "</tr>";
    });
    result += "</table>";
    return result;
}

function attach_window(marker, msg) {
    /*
     * Put a message in an InfoWindow, then associate it with a marker.
     */
    var infowindow = new google.maps.InfoWindow({
	content: msg
    });
    google.maps.event.addListener(marker, 'click', function() {
	infowindow.open(marker.get('map'), marker);
    });
}

function cip(obj, prop){
    /*
     * Retrieve a "case-insensitive property" (cip)
     */
    var test_prop = prop.toLowerCase();
    for(var attr in obj){
	if (attr.toLowerCase() == test_prop)
	    return obj[attr];
    };
    return null;
}

