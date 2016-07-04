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

    // $(document).on('click', "input:checkbox:not(.wms_Ignore, .switch-toogle, .atlas-checkbox)", function(event) {
    $(document).on('click', "input:checkbox:not(.wms_Ignore, .switch-toogle, .WMS_atlasbox, .WFS_atlasbox, .WFS_atlasbox-class)", function(event) {

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
