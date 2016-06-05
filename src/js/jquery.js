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

    $(document).on('click', "input:checkbox:not(.wms_Ignore, .switch_toogle )", function(event) {

         var layerClicked = window[event.target.value];

         console.log('layerClicked: ' , layerClicked);
         console.log('this for adding: ' , this);

        if (map.hasLayer(layerClicked)) {
             map.removeLayer(layerClicked);
        } else {
             map.addLayer(layerClicked);
        }
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

function geotag_Photos () {

    // switch button
    $(document).on('click', "input:checkbox(.switch_toogle)", function(event) {

        var service_Name = this.value;

        var service_Photo = DB_photo[0][service_Name];
        // console.log(photo_Service.url);

         if(this.checked) {
            parse_Photos(service_Name, service_Photo, "show");
            // console.log( "show: ",  service_Name);
         }else{
            parse_Photos(service_Name, service_Photo,"remove");
            // console.log( "remove: ", service_Name);
         }
    });

    // get bbox coordinates
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

    // parse data
    function parse_Photos (service_Name, service_Photo, action, pSearch, pNumber){

        // set default values
        if (pSearch === undefined) {
            pSearch = "";
        }

        if (pNumber === undefined) {
            pNumber = 50;
        }

        var parms_Photo = {
            "api_key": service_Photo.key,
            "method": service_Photo.method,
            "has_geo": service_Photo.has_geo,
            "extras": service_Photo.extras,
            "text": pSearch,
            "perpage": pNumber,
            "page": service_Photo.page,
            "format": service_Photo.format,
            "nojsoncallback": service_Photo.jsoncallback
        };

        var service_Icon = new L.Icon({
            iconUrl: service_Photo.marker,
            shadowUrl: null,
            iconAnchor: [9,9],
            popupAnchor: [0,-10],
            iconSize: [15, 15],
        });

        var service_Logo = service_Photo.logo;

        if(action == "show") {

            if(service_Name == "Flickr"){
                display_Flickr(service_Photo, parms_Photo, service_Icon, service_Logo, pSearch, pNumber);
            }else if (service_Name == "Panoramio") {
                display_Panoramio(service_Photo, parms_Photo, service_Icon, service_Logo, pSearch, pNumber);
            }else if (service_Name == "Geograph") {
                display_Geograph(service_Photo, parms_Photo, service_Icon, service_Logo, pSearch, pNumber);
            }else {
                console.log("PHOTO SERVICE NOT FOUND");
            }

        }else{

            if(service_Name == "Flickr"){
                map.removeLayer(group_Flickr);
            }else if (service_Name == "Panoramio") {
                map.removeLayer(group_Panoramio);
            }else if (service_Name == "Geograph") {
                map.removeLayer(group_Geograph);
            }else {
                console.log("PHOTO SERVICE NOT FOUND");
            }
        }
    }

    function display_Flickr (service_Photo, parms_Photo, service_Icon, service_Logo, pSearch, pNumber){

        // check if the obect is empty
        if( group_Flickr === "") {

            // create a new object if it is empty
            group_Flickr = L.featureGroup([]).addTo(map);
            // var featureGroup = L.markerClusterGroup();

            // parse the Flickr data
            var data_Photo = JSON.parse (
                $.ajax({
                    url:  service_Photo.rest,
                    data: parms_Photo,
                    async: false
                }).responseText
            );

            // loop through the photos
            $.each(data_Photo.photos.photo, function() {

                // get the url for each photo
                var url = service_Photo.url + this.owner + '/' + this.id ;
                var img = '<img src=" ' +  service_Logo + ' "><br/><font color="red">'+ this.title+ '<br/><a id="'+ this.id+'" title="'+ this.title+ '" rel="pano" href="'+ url + '" target="_new"><img src="'+ this.url_s+'" alt="'+this.title+'" width="180"/></a><br/>&copy;&nbsp;<a href="'+ url  + '" target="_new">'+ this.owner+'</a>'+ this.upload_date + '</font>';

                // console.log( "url: ", url ); // server response

                // create a photo frame
                var popup = L.popup({
                    maxWidth: service_Photo.maxWidth,
                    maxHeight: service_Photo.maxHeight
                }).setContent( img);

                // create a marker
                var marker = L.marker([this.latitude, this.longitude], {
                    icon: service_Icon
                }).addTo(group_Flickr);
                marker.bindPopup(popup);
            });

        }else{
            // remove layer
            map.addLayer(group_Flickr);
        }
    }

    function display_Panoramio (service_Photo, parms_Photo, service_Icon, service_Logo, pSearch, pNumber){

        // define search variables
        if ( pSearch === "") {
            var pTag = "public";
        } else {
            var pTag = "public&tag="+ pSearch;
        }

        if ( pNumber === "") {
            var pN = "&from=0&to=50";
        } else {
            var pN = "&from=0&to=" + pNumber;
        }

        // get boundary coordinates
        var data_BBOX = get_BBOX();

        // check if the obect is empty
        if( group_Panoramio === "") {

            // create a new object if it is empty
            group_Panoramio = L.featureGroup([]).addTo(map);

            // create Panoraimo URL
            var url_Panoraimo = service_Photo.url + pTag + pN + "&minx=" + data_BBOX.minx + "&miny=" + data_BBOX.maxx + "&maxx=" + data_BBOX.miny + "&maxy=" + data_BBOX.maxy + "&size=small&mapfilter=true&callback=?";

            console.log( "url_Panoraimo: ", url_Panoraimo ); // server response


            // parse the Panoraimo data
            var data_Photo =
                $.ajax({
                    url: url_Panoraimo,
                    // The name of the callback parameter, as specified by the YQL service
                    jsonp: "callback",
                    // Tell jQuery we're expecting JSONP
                    dataType: "jsonp",
                    // Tell YQL what we want and that we want JSON
                    data: {
                        tag: pSearch,
                        format: service_Photo.format
                    },
                    success: function(response) {
                        return response;
                    }
                });
            var result = Object.keys(data_Photo);
            // var test = JSON.parse(data_Photo)
            console.log("data_Photo: ", data_Photo);
            console.log("data_Photo: ", data_Photo.responseJSON.photos);
            // console.log("data_Photo: ", data_Photo.done);
            // console.log("data_Photo: ", data_Photo.success);
            // console.log(test);
            console.log(result);


        }else{
            // remove layer
            map.addLayer(group_Panoramio);
        }

    }

    function display_Geograph (service_Photo, parms_Photo, service_Icon, service_Logo, pSearch, pNumber){

                console.log( "Geograph: ");

    }

}
