$( document ).ready(function() {

// http://image.discomap.eea.europa.eu/arcgis/services/UrbanAtlas/Urban_Atlas_2012/MapServer/WMSServer?service=WMS&request=GetCapabilities&version=1.3.0

    // Clear local storage data
    localStorage.clear();
    window.map = "";
    window.group_Flickr = "";
    window.group_Panoramio = "";
    window.group_Geograph = "";
    window.photo_Page = 1;
    // window.map_Bounds = "unchanged";

    // Load JSON database
    $.getJSON( "db.json" )
    .done(function( data ) {

        // parse db.json
        var DB_Server = data.Servers,
            DB_layers = data.Layers,
            DB_UrbanAtlas = data.UrbanAtlas_06,
            DB_legend = data.Legend,
            DB_photo = data.Photo;

        // define variables
        var layer_List = [],
            server_List = [],
            atlas_List = [],
            legend_List = [],
            photo_List = [];

        // console.log(legend[0].GLC_00);

        // get key  names
        $.each(DB_layers, function(key, value) {
            layer_List.push(key);
        });

        $.each(DB_Server, function(key, value) {
            server_List.push(key);
        });

        $.each(DB_UrbanAtlas, function(key, value) {
            atlas_List.push(key);
        });

        $.each(DB_legend, function(key, value) {
            legend_List.push(key);
        });

        $.each(DB_photo, function(key, value) {
            photo_List.push(key);
        });

        // Call functions
        html_Design ();
        leaflet_Control (DB_photo);
        LULC_Layers (DB_layers, layer_List,  DB_Server, server_List);
        map_Layers();
        geotag_Photos (DB_photo);
        service_Selector (DB_Server);
        WFS_Layers (DB_UrbanAtlas, atlas_List, DB_Server);
        WMS_external ();

        // WMS_Layers (DB_WMS[0], DB_services[0], layers_ID, layers_Styles, layers_Workspaces);
        // get_Atlas_Boundaries(DB_UrbanAtlas[0]);
        // // WFS_Parse(DB_UrbanAtlas[0]);
        // WMS_Custom ();


            // Add JSON to localStorage http://stackoverflow.com/questions/22536620/jquery-posting-json-to-local-file
            // localStorage.setItem("serverData", JSON.stringify(DB_layers));
    })
    .fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Load JSON DB Failed: " + err );
    });

});

    // Opacity parameter (must be ouside of document ready function otherwise it will not work)
    function update_Opacity(layer) {
        var ID_layer = layer.getAttribute('data-id');
        var myVar = eval(ID_layer);
        var _leaflet_id = layer.id;

        console.log ('Value: ' + layer.value + ', layer: ' + _leaflet_id + ', id: ' + ID_layer);

        if (_leaflet_id) {
            myVar.setOpacity(layer.value);
        }
    }
