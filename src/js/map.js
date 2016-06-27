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
        var DB_layers = data[0].Layers,
            DB_services = data[0].Services,
            DB_WMS = data[0].WMS_Server,
            DB_legend = data[0].Legend;
            DB_photo = data[0].Photo,
            DB_UrbanAtlas = data[0].UrbanAtlas_06;

        var layers_ID = [],
            layers_Styles = [],
            layers_Workspaces = [],
            classes_UrbanAtlas = [],
            WMS_server = [];

        // console.log(legend[0].GLC_00);

        for (var i = 0; i < data[0].Layers.length; i++) {
            layers_ID[i] = DB_layers[i].ID;
            layers_Workspaces[i] = DB_layers[i].Workspace;
            layers_Styles[i] = DB_layers[i].Style;
            // localStorage.setItem(LULC_layers[i], "");
        }

        // for (var j= 0; j< data[0].WMS_Server.length; j++) {
        //     classes_UrbanAtlas[k] = DB_UrbanAtlas[j].Server;
        // }


        for (var k = 0; k < data[0].WMS_Server.length; k++) {
            WMS_server[k] = DB_WMS[k].Server;
        }


        // Call functions
        html_Design (layers_ID);
        leaflet_Control (layers_ID);
        WMS_Layers (DB_WMS[0], DB_services[0], layers_ID, layers_Styles, layers_Workspaces);
        WFS_Parse(DB_UrbanAtlas[0]);
        WMS_Custom ();
        geotag_Photos ();

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
