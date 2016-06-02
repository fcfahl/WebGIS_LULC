$( document ).ready(function() {

    // Clear local storage data
    localStorage.clear();

    // Load JSON database
    $.getJSON( "db.json" )
          .done(function( data ) {
                var DB_layers = data[0].Layers,
                        DB_services = data[0].Services,
                        DB_WMS = data[0].WMS_Server;

                var LULC_layers = [],
                        LULC_styles = [],
                        WMS_server = [];

                for (var i = 0; i < data[0].Layers.length; i++) {
                    LULC_layers[i] = DB_layers[i].ID;
                    // localStorage.setItem(LULC_layers[i], "");
                }

                for (var i = 0; i < data[0].Services.length; i++) {
                    LULC_styles[i] = DB_services[i].Style;
                }

                for (var i = 0; i < data[0].WMS_Server.length; i++) {
                    WMS_server[i] = DB_WMS[i].Server;
                }

                // Call functions
                html_design (LULC_layers);
                leaflet_control (LULC_layers);
                WMS_layers (DB_WMS[0], DB_services[0], LULC_layers, LULC_styles);
                map_Layers();

                // Add JSON to localStorage http://stackoverflow.com/questions/22536620/jquery-posting-json-to-local-file
                localStorage.setItem("serverData", JSON.stringify(DB_layers));


        })
        .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Load JSON DB Failed: " + err );
    });
});
