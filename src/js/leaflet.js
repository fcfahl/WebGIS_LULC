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

}

function map_Layers () {

    $(document).on('click', "input:checkbox:not(.wms_Ignore)", function(event) {

        var layerClicked = window[event.target.value];

        console.log('layerClicked: ' , layerClicked);
        console.log('this for adding: ' , this);

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
        zIndex: zIndex,
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
        WMS_Object (id, title, DB_WMS.Server, service, DB_WMS.Version, layer, DB_WMS.Bbox, DB_WMS.Width, DB_WMS.Height, DB_WMS.CRS, DB_WMS.Format, DB_WMS.Transparent, DB_WMS.Tiled, style, zIndex);

    });
}



function WFS_Layers () {

    //   WFS Implementation
      //
      var owsrootUrl = 'http://localhost:8080/geoserver/LULC/ows';

      var defaultParameters = {
          service : 'WFS',
          version : '2.0.0',
          request : 'GetFeature',
          typeName : 'LULC:paris',
          outputFormat : 'text/javascript',
          format_options : 'callback:getJson',
          SrsName : 'EPSG:3035'
      };

    //
    // var Atlas_06 = L.tileLayer.wms(server, {
    //     layers: 'LULC:Atlas_06',
    //     format: 'image/png',
    //     transparent: true,
    //     version: '1.3.0',
    //     tiled:true,
    //     zIndex: "28",
    //     minZoom: 8
    // });
    //

    //     var polyStyle = {
    //     "color": "#ffffff",
    //     "weight": 0,
    //     "fillOpacity": 0.75
    // };
    //
    //
    var geojsonLayer = new L.GeoJSON();

          function getJson(data) {
              console.log(data);
              geojsonLayer.addData(data, {style: polyStyle});
          }

          $.ajax({
              url: "http://localhost:8080/geoserver/LULC/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=LULC:NUTS0&maxFeatures=50&outputFormat=json&format_options=callback:getJson",
              dataType: 'json',
              jsonpCallback: 'getJson',
              success: getJson
          });

          map.addLayer(geojsonLayer);




    function onEachFeature(feature, layer) {
    // does this feature have a property named dz?
    if (feature.properties && feature.properties.Country) {
        layer.bindPopup(feature.properties.Country);
    }
    layer.on({
                    //mouseover: highlightFeature,
                    //mouseout: resetHighlight,
                    click: clickfunction
                });
    }







    // console.log (URL)





    // Create an empty layer where we will load the polygons
        var featureLayer = new L.GeoJSON();
        // Set a default style for out the polygons will appear
        var defaultStyle = {
            color: "#2262CC",
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.1,
            fillColor: "#2262CC"
        };
        // Define what happens to each polygon just before it is loaded on to
        // the map. This is Leaflet's special way of goofing around with your
        // data, setting styles and regulating user interactions.
        var onEachFeature = function(feature, layer) {
            // All we're doing for now is loading the default style.
            // But stay tuned.
            layer.setStyle(defaultStyle);
        };
        // Add the GeoJSON to the layer. `boundaries` is defined in the external
        // GeoJSON file that I've loaded in the <head> of this HTML document.





        var owsrootUrl = 'http://localhost:8080/geoserver/LULC/ows';

        var defaultParameters = {
            service : 'WFS',
            version : '1.0.0',
            request : 'GetFeature',
            typeName : 'LULC:NUTS0',
            outputFormat : 'text/javascript',
            format_options : 'callback:getJson',
            SrsName : 'EPSG:3035'
        };

        var parameters = L.Util.extend(defaultParameters);
        var URL = owsrootUrl + L.Util.getParamString(parameters);

        function getJson(data) {
            // console.log(data)
            var featureLayer = L.geoJson(data, {
                // And link up the function to run when loading each feature
                onEachFeature: onEachFeature
            });
        }

        // Finally, add the layer to the map.
        map.addLayer(featureLayer);

        $.ajax({
            url: URL,
            dataType: 'jsonp',
            jsonpCallback: 'getJson',
            success: getJson
        });

        var parameters = L.Util.extend(defaultParameters);

        var URL = owsrootUrl + L.Util.getParamString(parameters);

        var ajax = $.ajax({
            url : URL,
            dataType : 'jsonp',
            jsonpCallback : 'parseResponse',
            success : WFSLayer
        });

        function WFSLayer(data) {

        var fuffi= L.geoJson(data, {
        style: function (feature) {
            return {color: 'black',
                fillColor: '#ff0000',
                fillOpacity: 0.10};
            }
        }).addTo(map);

         // loading indicator end
         currentControl.removeClass('disabled');
                        text.css('visibility', 'visible');
                        indicator.css('display', 'none');
            loadMore.fadeOut(2500);
        // loading indicator end
        map.fitBounds(fuffi.getBounds());
        }


}
