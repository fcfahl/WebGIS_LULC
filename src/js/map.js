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

    // var DB_location = "http://localhost/public/db.json";


    $.getJSON( 'db.json' )
    .done(function( data ) {

        // parse db.json
        var DB_Server = data.servers,
            DB_layers = data.layers,
            DB_photo = data.photo;

        // define variables
        var layer_List = [],
            server_List = [],
            photo_List = [];

        // get key  names
        $.each(DB_layers, function(key, value) {
            layer_List.push(key);
        });

        $.each(DB_Server, function(key, value) {
            server_List.push(key);
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
        WMS_external ();
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

function LULC_Layers (DB_layers, layer_List,  DB_Server, server_List) {
    // there is a problem on geoserver to set up a custom style - it seems to shift the color classes for discrete colortables - for this reason it is been using only the defaul raster style

    var serverDB = DB_Server.WMS;

    // loop through LULC_Layers
    for (var index in layer_List) {

        var layerDB = DB_layers[layer_List[index]];

        var id =  layerDB.ID,
            service = "WMS",
            layer = layerDB.Workspace + ":" + id,
            style = layerDB.Style,
            zIndex = 100 - index,
            server = serverDB.URL + layerDB.Workspace + "/wms";

        // Add parameters to object
        WMS_Object (id, server, service, serverDB.Version, layer, serverDB.Bbox, serverDB.Width, serverDB.Height, serverDB.CRS, serverDB.Format, serverDB.Transparent, serverDB.Tiled, style, zIndex);
    }
}

function WMS_Object  (id, server, service, version, layer, bbox, width, height, CRS, format, transparent, tiled, style, zIndex){

    // create geoserver URL
    var get_Map = server + "?service=" + service + "&version=" + version + "&request=GetMap&layers=" + layer + "&bbox=" + bbox + "&width=" + width + "&height=" + height + "&srs=" +  CRS + "&format=" + format;

    // console.log(get_Map);

    // create leaflet object
    var arg = {
        layers: layer,
        format: format,
        transparent: transparent,
        version: version,
        tiled: tiled,
        styles: style,
        zIndex: zIndex
    };

    // create Leaflet object
    window[id] = L.tileLayer.wms(server, arg);
}
