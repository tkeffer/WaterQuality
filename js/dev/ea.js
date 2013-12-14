/*
 * Retrieves water quality info from a Google spreadsheet, then displays it
 * on a map. Clicking on one of the flags brings up a popup with details.
 *
 * Tom Keffer 2013-12-10
 *
 * TODOs:
 *  o Better looking flags.
 *  o Add sizing box to popup
 *  o Allow touchscreen scrolling of map
 *  o Trim size of photos to 300x300
 */


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

var description_template = null;
var data_template = null;

function initialize(spreadsheet_key) {

    // Set up the map.
    var mapOptions = {
	zoom: 10,
	center: new google.maps.LatLng(26.0, -111.3)
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);

    // Get and compile the Handlebars templates
    description_template = new Handlebars.compile($("#description-template").html());
    data_template = new Handlebars.compile($("#data-template").html());
                                            
    Tabletop.init({key : spreadsheet_key,
		   callback: process_data,
		   simpleSheet: false
		  }
		 );

    function process_data(spreadsheet, tabletop){

        // First, gather all the labels together
        var labels = [];
        for (i=0; i<spreadsheet.labels.column_names.length; i++){
            var var_name = spreadsheet.labels.column_names[i];
            labels.push(spreadsheet.labels.elements[0][var_name]);
        }

	// For each collection site, gather its data together
	for (isite=0; isite<spreadsheet.sites.elements.length; isite++){

	    // site_info will contain lat, lon, description, etc., for this site
	    var site_info = spreadsheet.sites.elements[isite];
            var site_name = site_info["site"];

            site_info.data = filter_data(spreadsheet.data.elements,
                                         site_name,
                                         spreadsheet.labels.column_names);

            // Add the labels
            site_info.labels = labels;

            console.log(site_info);
	    mark_site(map, site_info);
	}
    }
}

function filter_data(dataset, site_name, desired_columns){
    var result_set = [];
    for (irow=0; irow<dataset.length; irow++){
        if (dataset[irow]["sitio"] == site_name) {
            var row_data = [];
            for (icol=0; icol<desired_columns.length; icol++){
                var var_name = desired_columns[icol];
                row_data.push(dataset[irow][var_name]);
            }
            result_set.push(row_data);
        }
    }
    return result_set;
}

function mark_site(map, site_info){

    if (site_info.latitude == null || site_info.longitude == null){
	console.log(site_info.site, " location unknown.");
	return
    }
    var myLatLng = new google.maps.LatLng(site_info.latitude, site_info.longitude);

    // For now, hardwire the flag to flag #1 (green)
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
        title: site_info.site
    });

    // Store away the site information:
    marker.site_info = site_info;

    attach_window(marker);
}

var infowindow = null;

function attach_window(marker) {
    /*
     * Put a message in an InfoWindow, then associate it with a marker.
     */
    google.maps.event.addListener(marker, 'click', function() {
	if (infowindow){
	    infowindow.close();
	}
	// Retrieve the site information
	site_info = this.site_info;
	console.log("site_info=", site_info);
//	var html = template(site_info);
//	infowindow = new google.maps.InfoWindow({
	infowindow = new InfoBubble();
        infowindow.addTab('Description', description_template(site_info));
        infowindow.addTab('Data', data_template(site_info));
	infowindow.open(marker.map, marker);
    });
}

function get_flag_url(flag_no){
    // If a flag number is out of bounds, or missing, then use
    // the "unknown" flag.
    if (flag_no < 0 | flag_no >= flags.length | flag_no==null)
	flag_no = 0
    return flags[flag_no]
}

// // These column types are dropped from the popup summary
// special = {'SITIO':'', 'comment':'', 'flag':''};

// function get_html_msg(site_row, site_data){
//     // Given some row data, returns a nice HTML summary.
//     var result = "<div class='popup_box'>";
//     result += "<h1>" + cip(site_row, 'sitio') + "</h1>";
//     result += "<div class='popup_photo'>";
//     result += "<h2>Photo</h2>";
//     result += "<img src='images/" + site_row.SITIO + ".jpg' width=300 height=300></img>";
//     result += "</div> <!-- end class popup_photo -->";
//     if (site_row.Description != null) {
// 	result += "<div class='popup_description'>";
// 	result += "<h2>Description</h2>";
// 	result += site_row.Description;
// 	result += "</div> <!-- end class popup_description -->";
//     }
//     result += "<div class=popup_data>";
//     result += "<h2>Historical Data:</h2>";
//     result += "<table border=1>";
//     column_names = site_data.columnNames();
//     result += "<tr>";
//     for (i=0; i<column_names.length; i++){
// 	if (!(column_names[i] in special))
// 	    result += "<td class='popup_column_name'>" + column_names[i] + "</td>";
//     }
//     result += "</tr>";
//     site_data.each(function (row_data){
// 	result += "<tr>";
// 	for (i=0; i<column_names.length; i++){
// 	    if (!(column_names[i] in special))
// 		result += "<td class='popup_column_value'>" + row_data[column_names[i]] + "</td>";
// 	};
// 	result += "</tr>";
//     });
//     result += "</table>";
//     result += "</div> <!-- end class popup_data -->";
//     result += "</div> <!-- end class popup_box -->";
//     return result;
// }

