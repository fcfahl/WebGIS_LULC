function html_Design () {

    // Uncheck the checkboxes (problem in Firefox)
    $('input:checkbox:not(#btnService)').removeAttr('checked');

    // Accordeon - expand layer panels
    $( "#accordion" )
        .accordion({
        header: "> div > h3",
        heightStyle: "content",
        collapsible: true,
        active: 1,
        icons: { "header": "ui-icon-plus", "activeHeader": "ui-icon-minus" },
    })
    .sortable({
        axis: "y",
        handle: "h3",
        stop: function( event, ui ) {
            // IE doesn't register the blur when sorting
            // so trigger focusout handlers to remove .ui-state-focus
            ui.item.children( "h3" ).triggerHandler( "focusout" );

            // Refresh accordion to handle new order
            $( this ).accordion( "refresh" );
        }
    });

    // Display Legend and metadata
    $(".boxlayer").change(function() {

        var value = $(this).attr("value");
        var index = $(this).attr("rel");

        var leg = "#leg_" + value;
        var tbl = "#tbl_" + value;

        if(this.checked) {
            $(leg).show();
            $(tbl).show();
            //  console.log( leg );
        }else{
            $(leg).hide();
            $(tbl).hide();
            // console.log( tbl );
        }
    });

    function sortPannel() {

        var $legCache = $('#legend');
        var $tblCache = $('#tables');

        $legCache.find('.leg').sort(function (a, b) {
            return +a.getAttribute('rel') - +b.getAttribute('rel');
        }).appendTo($legCache);

        $tblCache.find('.tbl').sort(function (a, b) {
            return +a.getAttribute('rel') - +b.getAttribute('rel');
        }).appendTo($tblCache);
    }

    // Drag and Drop layers
    $( "#lulc" ).sortable({

        update: function (e, ui) {

            console.clear();
            $("#lulc div").each(function (i, elm) {

                var name = ($(this).attr('id')),
                index = i,
                ID_leg = ("#leg_" + name),
                ID_table = ("#tbl_" + name),
                ID_opacity = ("#opy_" + name),
                index_ID = (100 - index);

                // update Json object
                window[name].options.zIndex = index_ID;
                window[name].wmsParams.zIndex = index_ID;

                console.log(window[name].wmsParams.layers, " : ",  window[name].wmsParams.zIndex);

                window[name].setZIndex(index_ID);

                // Let ADM always on top
                window["NUTS0"].setZIndex(500);

                //  console.log("index: " +  index);
                //  console.log("ID_leg: " + ID_leg);

                // Redefine rel value based on the new div sequence
                $(ID_leg).attr('rel', index);
                $(ID_table).attr('rel', index);

                var test =$(ID_leg).attr('rel');
                // console.clear()
                // console.log(ID_leg + ": rel: " + test);

                sortPannel();
            });
        }
    });

}

function leaflet_Control (DB_photo) {

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
        refresh_Photos (DB_photo);
    });

    // reflesh map on photo modal close
    $("#photo_close").on('click', function() {
        refresh_Photos (DB_photo, "refresh");
    });

    // change the photo pages
    $("#bt-page-back").on('click', function() {
        photo_Page -= 1;
        if (photo_Page<1){
            photo_Page = 1;
        }
        refresh_Photos (DB_photo, "backward");
    });

    $("#bt-page-forw").on('click', function() {
        photo_Page += 1;
        refresh_Photos (DB_photo, "forward");
    });

}

function map_Layers () {

    // $(document).on('click', "input:checkbox:not(.wms_Ignore, .switch-toogle, .atlas-checkbox)", function(event) {
    $(document).on('click', "input:checkbox:not(.wms_Ignore, .switch-toogle-photo, .WMS_atlasbox, .WFS_atlasbox, .atlasbox-class, #btnService, .atlas-checkbox)", function(event) {

        var layerClicked = window[event.target.value];

        // console.log('layerClicked: ' , layerClicked);
        // console.log('this for adding: ' , this);

        add_Leaflet_Layer (layerClicked);

    });

}

function add_Leaflet_Layer (layerName) {
    if (map.hasLayer(layerName)) {
        map.removeLayer(layerName);
        console.log('remove layer: ' , layerName);

    } else {
        map.addLayer(layerName);
        console.log('add layer: ' , layerName);
    }
}
