function html_Design (LULC_layers) {

    // Uncheck the checkboxes (problem in Firefox)
    $('input:checkbox').removeAttr('checked');

    // Accordeon - expand layer panels
    $( "#accordion" )
        .accordion({
        header: "> div > h3",
        heightStyle: "content",
        collapsible: true,
        active: 2,
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

    // Syncronyse the expand button in all tabs
    function expand() {
        // Getter
        var label = $( "#expand").button( "option", "label" );
        // console.log(" button expand: " + label );

        if(label === "Expand All") {
            $('.panel-collapse:not(".in")').collapse('show');
        }
        else {
            $('.panel-collapse.in').collapse('hide');
        }
    }

    // Expand All button
    $( "#expand" ).button().on( "click", function() {
        var label = $(this).button( "option", "label" );
        if(label === "Expand All") {
            $(this).button( "option", "label", "Collapse All" );
            $('.ui-widget-content').show();

            // Expand-collapse legend option
            $('.panel-collapse:not(".in")').collapse('show');
            // console.log( "expand button" );
        }
        else {
          $(this).button( "option", "label", "Expand All" );
            $('.ui-widget-content').hide();
            // console.log( label );

            // Expand-collapse legend option
            $('.panel-collapse.in').collapse('hide');
        }
    });

    expand();

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

function WMS_Custom (){

    //  Add layers to map (except those in the wms modal pannel - added class wms_Ignore to avoid adding the layer to the map before showing on the pannel)
        //jquery dynamically added checkbox
        //http://stackoverflow.com/questions/4692281/jquery-dynamically-added-checkbox-not-working-with-change-function

    $(document).on('click', "input:checkbox:not(.wms_Ignore)", function(event) {

         var layerClicked = window[event.target.value];

         console.log('layerClicked: ' , layerClicked);
         console.log('this for adding: ' , this);

        if (map.hasLayer(layerClicked)) {
             map.removeLayer(layerClicked);
        } else {
             map.addLayer(layerClicked);
        };
    });


    $(document).on('click', ".wms_delete ", function(event) {

        //  Get the ID fist to identify the event (does not work as the toggle layer function)
        var layer = $(this).attr('value');

        var layerClicked = window[layer];
        var href = $(this).attr('href');
        //
        //  console.log('layerClicked: ' , layerClicked);
        //  console.log('href: ' , href);

        //   Remove map
        if (map.hasLayer(layerClicked))
            map.removeLayer(layerClicked);

        //   Remove layer name
        $(href).remove();
    });

    // clear the layer name list on Modal
    $(".cleanButton" ).on('click', function () {
        console.log('cleanButton' );
        //  $(".wms_candidates").remove();
    });

    //  Hide buttons in Modal
    $("#modalButton" ).on('click', function () {
        $(".modal-footer").hide();
        $(".modal-body").show();
    });

    $("#wms_close" ).on('click', function () {
        console.log('close modal: ' );
    });

    //  Add selected wms layers to Pannel
    $("#wms_add" ).on('click', function () {

        // get the checked checkboxes
        var checkedVals = $('.wmsBox:checkbox:checked').map(function() {
            return this.value;
        }).get();

        // Lopp throught the checked checkboxes
        $.each( checkedVals, function( index, value) {

            // Clone selected wms layers to pannel
            var   ID = "#" + value;

            // Remove hidden class to show the delete icon
            $('.wms_delete').removeClass( "hidden-xs" );

            // Remove hidden class to show the delete icon
            $('.wms_delete').removeClass( "hidden-lg" );

            // Remove ignore class to allow toggling the layer
            $('.wmsBox').removeClass( "wms_Ignore" );

            $( ID ).clone().addClass( "wms_selected" ).appendTo( ".wms_custom" );

            // Get the layer object
            var layerClicked = window[value];

            // Add the layer to the map
            map.addLayer(layerClicked);
        });

        // clean the wmlist to avoid duplicated IDs
        $(".wmsList" ).empty();
    });

    //  MODAL: add custom WMS layers
    $("#wms_submit").on('click', function () {

        //  Show footer after submit button is clicked
        $(".modal-body").hide();
        $(".modal-footer").show();

        var wmsLink = $('#wms_capability').val();
        // console.log('wmsLink: ' + wmsLink);

        // Get Layer names
        // http://fuzzytolerance.info/blog/2012/03/06/2012-03-06-parsing-wms-getcapabilities-with-jquery/
        $.ajax({
            type: "GET",
            url: wmsLink,
            dataType: "xml",
            success: function(xml) { parseXML (xml);}
        });

    });

}

function geotag_Photos (photo_Services) {

    // console.log(photo_Services[0].Flickr);

    function get_BBOX () {

        var fixed_bounds = [31, -17.5, 72, 45];

        var zoom = map.getZoom(),
            bounds = map.getBounds(),
            minx = bounds.getWest(),
            maxx = bounds.getEast(),
            miny = bounds.getSouth(),
            maxy = bounds.getNorth(),
            width = maxx - minx,
            height = maxy - miny;

        // console.log("west:", minx,  " | " , "East:", maxx,  " | ", "South:", miny,  " | ", "North:", maxy,  " | ", "zoom:", zoom);

        if(minx < fixed_bounds[1])
            minx = fixed_bounds[1];

        if(maxx > fixed_bounds[3])
            maxx = fixed_bounds[3];

        if(miny < fixed_bounds[0])
            miny = fixed_bounds[0];

        if(maxy > fixed_bounds[2])
            maxy = fixed_bounds[2];

        // console.log("NEW -> west:", minx,  " | " , "East:", maxx,  " | ", "South:", miny,  " | ", "North:", maxy,  " | ", "zoom:", zoom);

        var data  = {
            "zoom": zoom,
            "bounds": bounds,
            "width": width,
            "height": height,
            "minx": minx,
            "maxx": maxx,
            "miny": miny,
            "maxy": maxy,
        };

        return data;
    }

    function parse_Photos (){



    }

    function display_Photos (){



    }

}
