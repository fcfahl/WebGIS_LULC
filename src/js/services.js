function add_Atlas(DB_WMS){

        // retrieve input values
        var city_name = $('#atlas-cities').val();
        var city_ID = $('#atlas-cities').attr( 'data-id');
        var ID = "#" + city_ID;
        var checked = true;

        // Create checkbox entry if it does not exist
        if ($(ID).length === 0 && $('#atlas-cities').attr("data-id") != null ){

            // duplicate model from template
            clone_AtlasModal (city_name);

            var html = create_HTML("atlas-layers-names", city_ID, city_name, city_name, ID, checked);
            $(".atlas-layers").append(html);

        }
}

function clone_AtlasModal(name){

    // duplicate model from template
    var modal_ID = "Modal_" + name;
    var WMS_ID = "WMS_" + name;
    var WFS_ID = "WFS_" + name;

    var clone = $('#modal-template').clone().attr("id", modal_ID).appendTo(".atlas-group");
    $(clone).attr("id", modal_ID);

    // replace model values with specific values from the city
    $("#" + modal_ID).find(".atlas-header").replaceWith("<h2>Urban Atlas: " + name + "</h2>");

    $("#" + modal_ID).find("#toBeReplaced_WMS").attr("id", WMS_ID).attr("value", name);
    $("#" + modal_ID).find("#toBeReplaced_WFS").attr("id", WFS_ID).attr("value", name);

    $("#" + modal_ID).find(".atlasbox-class").attr("data-name", name);

    $(clone).modal();
}

function LULC_Layers (DB_layers, layer_List,  DB_Server, server_List) {
    // there is a problem on geoserver to set up a custom style - it seems to shift the color classes for discrete colortables - for this reason it is been using only the defaul raster style

    var serverDB = DB_Server["WMS"];

    // loop through LULC_Layers
    for (var index in layer_List) {

        var layerDB = DB_layers[layer_List[index]];

        var id =  layerDB.ID,
            service = "WMS",
            layer = layerDB.Workspace + ":" + id,
            style = layerDB.Style,
            zIndex = 100 - index,
            filter = null;
            CRS = 'EPSG\:3035',
            server = serverDB.URL + layerDB.Workspace + "/wms";

        // Add parameters to object
        WMS_Object (id, server, service, serverDB.Version, layer, serverDB.Bbox, serverDB.Width, serverDB.Height, serverDB.CRS, serverDB.Format, serverDB.Transparent, serverDB.Tiled, style, zIndex, filter, CRS);
    }

    $("#atlas_add").on("click", function() {
        add_Atlas ();
    });

}

function WMS_Object  (id, server, service, version, layer, bbox, width, height, CRS, format, transparent, tiled, style, zIndex, filter, CRS){

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
        styles: "",
        // cql_filter: filter,
        // crs: CRS,
        zIndex: zIndex
    };

    // create Leaflet object
    window[id] = L.tileLayer.wms(server, arg);
    console.log("ID wmsobject: ", this);
}

function WFS_Layers (DB_UrbanAtlas, atlas_List, DB_Server) {

    var WFS_url = DB_Server["WFS"].URL,
        city_BBOX = "atlas06_extent",
        city_Workspace = "LULC";

    get_WFS(WFS_url, city_BBOX, city_Workspace);

}

function set_StyleWFS (click, color, fillColor, weight, opacity, fillOpacity) {
    return {
            "clickable": click,
            "color": color ,
            "fillColor": fillColor,
            "weight": weight,
            "opacity": opacity,
            "fillOpacity": fillOpacity
    };
}

function get_WFS (WFS_url, layer, workspace) {

    var defaultParameters = {
            service : 'WFS',
            version : '2.0.0',
            request : 'GetFeature',
            typeName :  workspace + ':' + layer,
            outputFormat : 'text/javascript',
            format_options : 'callback:getJson',
            SrsName : 'EPSG:4326'
    };

    var parameters = L.Util.extend(defaultParameters);
    var URL = WFS_url + L.Util.getParamString(parameters);

    retrieve_WFS (URL);
}

function retrieve_WFS (URL) {

        // console.log("url: ", URL);

         $.ajax ({
                type: 'GET',
                url: URL,
                dataType: 'jsonp',
                cache: true,
                async: true,
                format: "text/javascript",
                jsonpCallback: 'getJson',
                success: display_JSON
        });
}

function display_JSON(data) {

    var geojsonLayer = new L.GeoJSON();

    var clickable = true,
        color =  "#ff3333" ,
        fillColor = "#734d26",
        weight = 1.0,
        opacity = 0,
        fillOpacity = 0.1;

    var layer_Style = set_StyleWFS (clickable, color, fillColor, weight, opacity, fillOpacity);

    var geojsonLayer = L.geoJson(data, {
            style: layer_Style,
            onEachFeature: function (feature, layer) {

                // if (feature.properties.cities) {
                //     layer.bindPopup(feature.properties.cities);
                // }

                // bind properties to features (modified from previous version where it was outside of the l.geoJson function)
                layer.on('click', function (e) {
                    var city_name = e.target.feature.properties.cities;
                    var city_ID = e.target.feature.properties.luz;

                    $('#atlas-cities').val(city_name);
                    $('#atlas-cities').attr( 'data-id',city_ID);
                });
            }
    }).addTo(map);
}

function getJson (data){
        console.log("getJson ",data);
}

function service_Selector (DB_Server){
    // switch button for urban atlas
    $(document).on('click', ".atlasbox-class", function(){

        var value = $( this ).val();
        var color = $( this ).attr("data-color");
        var city = $( this ).attr("data-name");
        var type = $( this ).attr("data-type");
        var ID = type + city + value;
        var serverDB = DB_Server[type];

        // console.log(  " ID --> ", ID, "value --> ", value, " color --> ", color, " city --> ", city, " type --> ", type, " serverDB --> ", serverDB);

        if ( type =="WMS") {
            value_Service =  "WMS";


            var service = "WMS",
                layer = "LULC:paris",
                style = "Atlas_06",
                zIndex = 1000,
                filter = "code='" + value + "'",
                CRS = 'EPSG\:3035',
                server = serverDB.URL + "LULC/wms";
            //

            var layerClicked = window[ID];

            console.log(layerClicked);

            if ($(layerClicked).length === 0){

                console.log("undefined -> ");

                // // Add parameters to object
                WMS_Object (ID, server, service, serverDB.Version, layer, serverDB.Bbox, serverDB.Width, serverDB.Height, serverDB.CRS, serverDB.Format, serverDB.Transparent, serverDB.Tiled, style, zIndex, filter, CRS);

                layerClicked = window[ID];

                console.log("now defined -> ", layerClicked);

            } else {
                console.log("already exists-> ", layerClicked);

            }




            add_Leaflet_Layer (layerClicked);

            // http://localhost:8080/geoserver/LULC/wms?service=WMS&version=1.3.0&request=GetMap&layers=LULC:paris&styles=&bbox=3697144.7,2805533.88,3846587.23,2937132.0&width=768&height=676&srs=EPSG:3035&format=application/openlayers#

        } else {
            value_Service =  "WFS";
        }

        // console.log(  value_Service, " --> ", this);



    });

    $(document).on('click', "#btnService", function(){

            if ($('#btnService').val()=="WMS") {
                value_Service =  "WFS";
            } else {
                value_Service =  "WMS";
            }

            $( '#btnService' ).val(value_Service);
            $( '.atlasbox-class' ).attr("data-type", value_Service);

            // console.log(  value_Service, " --> ", this);

    });

}
        // $(".WMS_atlasbox").on('click', function() {
        //
        //     console.log('WMS_atlasbox: ' , this);
        //
        //     var title = 'paris',
        //         id = 'paris',
        //         service = "WMS",
        //         layer = "LULC:paris",
        //         style = "Atlas_06",
        //         zIndex = 100,
        //         filter = 'code=30000',
        //         server = "http://localhost:8080/geoserver/LULC/wms";
        //
        //     // Add parameters to object
        //      WMS_Object (id, title, server, service, DB_WMS.Version, layer, DB_WMS.Bbox, DB_WMS.Width, DB_WMS.Height, DB_WMS.CRS, DB_WMS.Format, DB_WMS.Transparent, DB_WMS.Tiled, style, zIndex, filter);
        //
        //     // var test =  window['paris'];
        //
        //     // console.log('WMS_Object: ' , test);
        //
        //     // if (map.hasLayer(test)) {
        //     //     map.removeLayer(test);
        //     // } else {
        //     //     map.addLayer(test);
        //     // }
        // });






        // $(".WFS_atlasbox").on('click', function() {
        //
        //     function display_WFS(data) {
        //
        //             var WMS_style = {
        //                     "clickable": true,
        //                     "color": "#ff3333" ,
        //                     "fillColor": "#734d26",
        //                     "weight": 2,
        //                     "opacity": 0.8,
        //                     "fillOpacity": 0.8
        //             };
        //
        //             L.geoJson(data, {
        //                     style: WMS_style
        //             }).addTo(map);
        //
        //     }
        //
        //     var owsrootUrl = 'http://localhost:8080/geoserver/LULC/ows';
        //
        //     var defaultParameters = {
        //             service : 'WFS',
        //             version : '2.0.0',
        //             request : 'GetFeature',
        //             typeName : 'LULC:paris',
        //             outputFormat : 'text/javascript',
        //             format_options : 'callback:getJson',
        //             cql_filter: "code='30000'",
        //             SrsName : 'EPSG:4326'
        //     };
        //
        //     var parameters = L.Util.extend(defaultParameters);
        //     var URL = owsrootUrl + L.Util.getParamString(parameters);
        //
        //     console.log("URL WFS:" , URL );
        //
        //
        //     // parse the WFS data
        //      $.ajax ({
        //             type: 'GET',
        //             url: URL,
        //             dataType: 'jsonp',
        //             cache: true,
        //             async: true,
        //             format: "text/javascript",
        //             jsonpCallback: 'getJson',
        //             success: display_WFS
        //     });
        //
        // });

        // $(".atlasbox-class").on('click', function() {
        //
        //     var code =  this.value;
        //     var filter =  "code='" + code + "'";
        //     console.log('WFS_atlasbox-class: ' , filter);
        //
        //     function display_WFS(data) {
        //
        //             var WMS_style = {
        //                     "clickable": true,
        //                     "color": "#ff3333" ,
        //                     "fillColor": "#734d26",
        //                     "weight": 2,
        //                     "opacity": 0.8,
        //                     "fillOpacity": 0.8
        //             };
        //
        //             L.geoJson(data, {
        //                     style: WMS_style
        //             }).addTo(map);
        //
        //     }
        //
        //     var owsrootUrl = 'http://localhost:8080/geoserver/LULC/ows';
        //
        //     var defaultParameters = {
        //             service : 'WFS',
        //             version : '2.0.0',
        //             request : 'GetFeature',
        //             typeName : 'LULC:paris',
        //             outputFormat : 'text/javascript',
        //             format_options : 'callback:getJson',
        //             cql_filter: filter,
        //             SrsName : 'EPSG:4326'
        //     };
        //
        //     var parameters = L.Util.extend(defaultParameters);
        //     var URL = owsrootUrl + L.Util.getParamString(parameters);
        //
        //     console.log("URL WFS:" , URL );
        //
        //
        //     // parse the WFS data
        //      $.ajax ({
        //             type: 'GET',
        //             url: URL,
        //             dataType: 'jsonp',
        //             cache: true,
        //             async: true,
        //             format: "text/javascript",
        //             jsonpCallback: 'getJson',
        //             success: display_WFS
        //     });
        //
        // });
