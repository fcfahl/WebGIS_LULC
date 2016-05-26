    // zoom configuration

    var   southWest = L.latLng(31, -17.5),
            northEast = L.latLng(72, 45),
            centerView= L.latLng(56, 20),
            zoomLevel = 4;

    var map = L.map('map').setView(centerView, zoomLevel);
    // console.log('map:' + map)

	map.fitBounds([southWest, northEast]);

    // Leaflet.ZoomBox-master plugin
    var control = L.control.zoomBox({
        modal: false,  // If false (default), it deactivates after each use.
                  // If true, zoomBox control stays active until you click on the control to deactivate.
                // position: "topleft",
                // className: "customClass"  // Class to use to provide icon instead of Font Awesome
    }).addTo(map);

    // geotagged photos
    var featureGroup = L.featureGroup([]).addTo(map);
        // var featureGroup = L.markerClusterGroup();

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


    // LULC layers (WMS)
    var server = 'http://localhost:8080/geoserver/LULC/wms',
        workspace = "LULC:",
        format = 'image/png',
        transparent = true,
        version ='1.3.0',
        tiled = true,
        CRS = "EPSG:3035",
        bbox = "",
        width ="" ,
        height = "" ;

    // there is a problem on geoserver to set up a custom style - it seems to shift the color classes for discrete colortables - for this reason it is been using only the defaul raster style
    // var LULC_layers = ["NUTS0", "GLC_00","Corine_06", "Atlas_06", "GlobCover_09", "MODIS_10", "CCIESA_10", "GLand30_10"];
    // var LULC_styles = ["NUTS0", "raster","raster", "Atlas_06", "raster", "raster", "raster", "raster"];

    // loop through LULC_Layers
    $.each(LULC_layers, function (index, obj) {

        var title = LULC_layers[index],
            id = title,
            layer = workspace + title,
            styles = LULC_styles[index],
            zIndex = 100 - index;

        // Add parameters to object
        wmsObj (id, title, server, version, layer, bbox, width, height, CRS, format, transparent, tiled, styles, zIndex);

        // Create leaflet variables for each layer
        wmsLeaflet(title);

      });

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
