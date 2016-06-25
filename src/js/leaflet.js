function leaflet_Control (LULC_layers) {

    // zoom configuration
    var   southWest = L.latLng(31, -17.5),
        northEast = L.latLng(72, 45),
        centerView= L.latLng(56, 20),
        zoomLevel = 4;

    map = L.map('map').setView(centerView, zoomLevel);
    map.fitBounds([southWest, northEast]);

    // Leaflet.ZoomBox-master plugin
    var control = L.control.zoomBox({
        modal: false,
        // If false (default), it deactivates after each use.
        // If true, zoomBox control stays active until you click on the control to deactivate.
        // position: "topleft",
        // className: "customClass"  // Class to use to provide icon instead of Font Awesome
    }).addTo(map);

    // Leaflet.NavBar-master plugin
    L.control.navbar().addTo(map);

    //Leaflet-MiniMap-master Plugin
    var OSM2 = L.tileLayer.provider('OpenStreetMap.Mapnik', {
        minZoom: 0,
        maxZoom: 13});
    var miniMap = new L.Control.MiniMap(OSM2, {
        toggleDisplay: true,
        position: 'topright'
    }).addTo(map);

    //leaflet-graphicscale-master Plugin
    var graphicScale = L.control.graphicScale({
        doubleLine: false,
        fill: 'hollow',
        showSubunits: false,
        position: 'bottomright'
    }).addTo(map);

    // Leaflet-IconLayers-master Plugin
    var layers = [];
    for (var providerId in providers) {
        layers.push(providers[providerId]);
    }
    layers.push({
        layer: {
            onAdd: function() {},
            onRemove: function() {}
        },
        title: 'empty'
    });
    var ctrl = L.control.iconLayers(layers).addTo(map);

    // Leaflet.ZoomLabel-master plugin
    L.control.zoomLabel({
        position: 'bottomleft'
    }).addTo(map);

    // get bbox on map zoom modification
    map.on('moveend', function() {
        refresh_Photos ();
    });

    // reflesh map on photo modal close
    $("#photo_close").on('click', function() {
        refresh_Photos ("refresh");
    });

    // change the photo pages
    $("#bt-page-back").on('click', function() {
        photo_Page -= 1;
        if (photo_Page<1){
            photo_Page = 1;
        }
        refresh_Photos ("backward");
    });

    $("#bt-page-forw").on('click', function() {
        photo_Page += 1;
        refresh_Photos ("forward");
    });

}

function map_Layers () {

    $(document).on('click', "input:checkbox:not(.wms_Ignore, .switch-toogle)", function(event) {

        var layerClicked = window[event.target.value];

        console.log('layerClicked: ' , layerClicked);
        // console.log('this for adding: ' , this);

        if (map.hasLayer(layerClicked)) {
            map.removeLayer(layerClicked);
        } else {
            map.addLayer(layerClicked);
        }
    });
}

function WMS_Object  (id, title, server, service, version, layer, bbox, width, height, CRS, format, transparent, tiled, style, zIndex){

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
        // crs: wmsLayer.CRS,
    };

    // create Leaflet object
    window[id] = L.tileLayer.wms(server, arg);
    // console.log(id);
}

function WMS_Layers (DB_WMS, DB_Service, layers, styles, workspaces) {
    // there is a problem on geoserver to set up a custom style - it seems to shift the color classes for discrete colortables - for this reason it is been using only the defaul raster style

    // loop through LULC_Layers
    $.each(layers, function (index, obj) {

        var title = layers[index],
            id = title,
            service = DB_Service.Type,
            layer = workspaces[index] + ":" + title,
            style = styles[index],
            zIndex = 100 - index,
            server = DB_WMS.Server + workspaces[index] + "/wms";

        // Add parameters to object
        WMS_Object (id, title, server, service, DB_WMS.Version, layer, DB_WMS.Bbox, DB_WMS.Width, DB_WMS.Height, DB_WMS.CRS, DB_WMS.Format, DB_WMS.Transparent, DB_WMS.Tiled, style, zIndex);

    });
}

function getJson (data){
        console.log("getJson ",data);
}

function WFS_Parse () {

        var geojsonLayer = new L.GeoJSON();

        var WMS_style = {
                "clickable": true,
                "color": "#ff3333" ,
                "fillColor": "#734d26",
                "weight": 1.0,
                "opacity": 0.6,
                "fillOpacity": 0.3
        };

        function display_Json(data) {

                L.geoJson(data, {
                        style: WMS_style
                }).addTo(map);
        }


        var owsrootUrl = 'http://localhost:8080/geoserver/LULC/ows';

        var defaultParameters = {
                service : 'WFS',
                version : '1.0.0',
                request : 'GetFeature',
                typeName : 'LULC:paris',
                outputFormat : 'text/javascript',
                format_options : 'callback:getJson',
                SrsName : 'EPSG:4326'
        };

        var parameters = L.Util.extend(defaultParameters);
        var URL = owsrootUrl + L.Util.getParamString(parameters);

        // parse the WFS data
         $.ajax ({
                type: 'GET',
                url: URL,
                dataType: 'jsonp',
                cache: true,
                async: true,
                format: "text/javascript",
                jsonpCallback: 'getJson',
                success: display_Json
        });



}
