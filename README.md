Eco-Alianza Water Quality webpage
==========================================

This project indicates the location of Eco-Alianza's water quality sites on a Google Map. Map markers are coded by the most recent bacterial count.

* Green flag. Count is below 100. 
* Yellow flag. Count is between 100 and 199.
* Red flag. Count is above 200.
* Unknown flag. Either the sample is too old, or it was not taken. Water quality is unknown.

Clicking on a fag brings up a pop-up that displays a photo of the site, a short description, and the actual water quality data.

The webpage gets the information it needs from two Google spreadsheets.

Data spreadsheet
----------------

This spreadsheet supplies the site locations and data. It should include two worksheet tabs. 

1. sites. The first worksheet should be called "sites" (all lower-case). This worksheet should include columns "Site," containing the name of the site; "Longitude," containing the longitude of the site; "Latitude", containing the latitude of the site; and "Description," containing a short description of the site. Any other columns will be ignored.

2. data. The second tab contains the actual data, one measurement type per column. It should have the tab name "data" (all lower-case). While it can consist of any number of columns (and, therefore, measurement types), two of them are required: "SITIO", containing the site name, and "FECHA", containing the date the sample of was taken. The name in the SITIO column should match one of the names in the "sites" tab, above.

Label spreadsheet
-----------------

The second spreadsheet consists of a single worksheet, with name "labels" (all lower-case). It is used to supply HTML labels for the column names when displaying the data on the map popup.

Details
--------

The data and label spreadsheets can be combined into a single spreadsheet, provided they have the necessary tab names. However, as the label worksheet is primarily intended for the webmaster, while the data and sites worksheets are for the water sampling technician, they are kept separate.

For an example worksheet, see (https://docs.google.com/spreadsheet/ccc?key=0Ar8LDnqhlSk_dG5QYlB1ODd6Y0NDR3VCWHEzTnpZQlE).





