/*
 * Retrieves water quality info from a Google spreadsheet, then displays it
 * on a map. Clicking on one of the flags brings up a popup with details.
 *
 * Tom Keffer 2013-12-10
 *
 */

// How old a sample can be and still be used to determine water
// quality (in milliseconds):
var max_stale = 15 * 24 * 3600 * 1000;  // = 15 days

// The cutoffs for bacterial counts:
var bact_good = 99;
var bact_caution = 199;

// Flags to be used as markers.
var flags = {
    'unknown'   : 'images/unknown.png',
    'good'      : 'images/good.png',
    'caution'   : 'images/caution.png',
    'unhealthy' : 'images/unhealthy.png'
};

// Shape of the clickable polygon around each marker
var shape = {
    coord: [1, 1, 1, 20, 18, 20, 18 , 1],
    type: 'poly'
};

// These will hold the compiled Handlebars templates
var description_template = null;
var data_template = null;

function initialize(spreadsheet_key) {

    // Set up the map.
    var mapOptions = {
	zoom: 10,
	center: new google.maps.LatLng(26.0, -111.3)
    }
    // Fetch and start rendering:
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);

    // Get and compile the Handlebars templates
    description_template = new Handlebars.compile($("#description-template").html());
    data_template = new Handlebars.compile($("#data-template").html());
    
    // Get the spreadsheet data
    Tabletop.init({key : spreadsheet_key,
		   callback: process_data,
		   simpleSheet: false
		  }
		 );

    // This function will be used to process the spreadsheet data
    function process_data(spreadsheet, tabletop){

        console.log(spreadsheet);

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
    result_set.column_names = desired_columns;

    return result_set;
}

function mark_site(map, site_info){

    if (site_info.latitude == null || site_info.longitude == null){
	console.log(site_info.site, " location unknown.");
	return
    }
    var myLatLng = new google.maps.LatLng(site_info.latitude, site_info.longitude);

    // Get the URL of the flag to be used for the marker
    var q_summary = get_health_summary(site_info.data, max_stale);
    var flag_url = flags[q_summary];

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
        // If a window is already open, close it.
	if (infowindow){
	    infowindow.close();
	}
	// Retrieve the site information
	site_info = this.site_info;

        // Open up an InfoBubble window and populate it with a couple of tabs:
	infowindow = new InfoBubble();
        infowindow.addTab('Description', description_template(site_info));
        infowindow.addTab('Data', data_template(site_info));
	infowindow.open(marker.map, marker);
    });
}

var right_now = new Date().getTime();

function get_health_summary(site_data, stale){
    /*
     * For this site, determine the whether the water quality
     * is 'good', 'caution', or 'unhealthy'. If the sample is too
     * old, or missing, then it's 'unknown'.
     */

    var date_col = site_data.column_names.indexOf("fecha");
    var last_t = 0;
    for (var irow=0; irow<site_data.length; irow++){
        var t = Date.parse(site_data[irow][date_col]);
        if (!isNaN(t)){
            if (t > last_t){
                // Record both the time and the row
                last_t = t;
                last_row = irow;
            }
        }
    }

    if (last_t < right_now - stale){
        // Too old
        return 'unknown';
    }

    var bact_col = site_data.column_names.indexOf("enterococos");
    var bact_val = site_data[last_row][bact_col];

    if (bact_val == null){
        return 'unknown';
    } 
    else if (bact_val <= bact_good){
        return 'good';
    }
    else if (bact_val <= bact_caution){
        return 'caution';
    }
    else {
        return 'unhealthy';
    }
}

