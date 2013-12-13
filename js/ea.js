/*
 * Retrieves water quality info from a Google spreadsheet, then displays it
 * on a map. Clicking on one of the flags brings up a popup with details.
 *
 * Tom Keffer 2013-12-10
 *
 * TODOs:
 *  o Better looking flags.
 *  o Bilingual labels.
 *  o Function get_html_msg is very clumsy. Perhaps use a Handlebars template?
 *  o Add sizing box to popup
 *  o Allow touchscreen scrolling of map
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

function initialize(spreadsheet_key) {

    // Set up the map.
    var mapOptions = {
	zoom: 10,
	center: new google.maps.LatLng(26.0, -111.3)
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);

    Tabletop.init({key : spreadsheet_key,
		   callback: process_data,
		   simpleSheet: false
		  }
		 );

    function process_data(data, tabletop){

	for (i=0; i<data.sitios.elements.length; i++){
	    site_info = data.sitios.elements[i];
	    console.log(site_info);
	    var site_data = jQuery.grep(data.Data.elements, function(row,i){
		return row.sitio == site_info.sitio;
	    });
	    mark_sites(map, site_info, site_data);
	}
    }
}

function mark_sites(map, site_info, site_data){

    if (site_info.latitude == null || site_info.longitude == null){
	console.log(site_info.sitio, " location unknown.");
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
        title: site_info.sitio
    });

    marker.site_info = site_info;
    marker.site_data = site_data;

    // Now attach it.
    attach_window(marker, "<p>foo</p>");
}

var infowindow = null;

function attach_window(marker, msg) {
    /*
     * Put a message in an InfoWindow, then associate it with a marker.
     */
    google.maps.event.addListener(marker, 'click', function() {
	if (infowindow){
	    infowindow.close();
	}
	var source   = $("#popup-template").html();
	var template = Handlebars.compile(source);
	var html = template();
	infowindow = new google.maps.InfoWindow({
	    content: html
	});
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

