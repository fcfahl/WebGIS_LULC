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

        map_Layers ();

    // clear the layer name list on Modal
    $(".cleanButton" ).on('click', function () {
        console.log('cleanButton' );
        //  $(".wms_candidates").remove();
    });

    //  Add selected wms layers to Pannel
    $("#wms_add" ).on('click', function () {

        // get the checked checkboxes
        var checkedVals = $('.wms_Ignore:checkbox:checked').map(function() {
            console.log('checkedVals: ', this.value );
            return this.value;
        }).get();

        // Lopp throught the checked checkboxes
        $.each( checkedVals, function( index, value) {

            // Remove hidden class to show the delete icon
            $('.fa').removeClass( "hidden" );

            // Clone selected wms layers to pannel
            var ID = "#" + value;

            // clone wms layer to the pannel
            $( ID ).clone().addClass( "wms_selected" ).removeClass( "wms_candidates" ).appendTo( ".custom_Layers" );
            $( ID + " li input[type=checkbox] ").removeClass('wms_Ignore');

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

        var wmsLink = $('#wms_capability').val();
        // console.log('wmsLink: ' + wmsLink);

        // Get Layer names
        // http://fuzzytolerance.info/blog/2012/03/06/2012-03-06-parsing-wms-getcapabilities-with-jquery/
        $.ajax({
            type: "GET",
            url: wmsLink,
            dataType: "xml",
            success: function(xml) {
                parseXML (xml);}
        });

    });

}

function remove_WMS(ID, obj) {

    // var inText = document.getElemenyById(obj).innerHTML;
    //  Get the ID fist to identify the event (does not work as the toggle layer function)
    var layerClicked = window[ID];
    console.log('remove: ', ID );

    //   Remove map
    if (map.hasLayer(layerClicked))
        map.removeLayer(layerClicked);

    //   Remove Div
    $("#" + ID).remove();
}

function refresh_Photos (refresh_action) {

    // update page number
    $( "#page-number" ).html( "Page " + photo_Page)


    // check if panoraimo is on
    if ($('#btn_Pano').is(":checked")) {

        var service_Name = "Panoramio";
        var service_Photo = DB_photo[0][service_Name];

        if (map.hasLayer(group_Panoramio)) {
            map.removeLayer(group_Panoramio);
        } else {
            map.addLayer(group_Panoramio);
        }

        parse_Photos(service_Name, service_Photo, "zoom");
        console.log("service_Name", service_Name);
    }

    // check if Flickr is on
    if ($('#btn_Flick').is(":checked")) {

        var service_Name = "Flickr";
        var service_Photo = DB_photo[0][service_Name];

        if (map.hasLayer(group_Flickr)) {
            map.removeLayer(group_Flickr);
        } else {
            map.addLayer(group_Flickr);
        }

        parse_Photos(service_Name, service_Photo, "zoom");
        console.log("service_Name", service_Name);
    }

    // check if Geograph is on
    if ($('#btn_Geog').is(":checked")) {

        var service_Name = "Geograph";
        var service_Photo = DB_photo[0][service_Name];

        if (map.hasLayer(group_Geograph)) {
            map.removeLayer(group_Geograph);
        } else {
            map.addLayer(group_Geograph);
        }

        parse_Photos(service_Name, service_Photo, "zoom");
        console.log("service_Name", service_Name);
    }
}

function geotag_Photos () {

    // switch button
    $('.switch-toogle').on('click', function(event) {

        var service_Name = this.value;
        var service_Photo = DB_photo[0][service_Name];
        // console.log(photo_Service.url);

         if(this.checked) {
            parse_Photos(service_Name, service_Photo, "show");

         }else{
            parse_Photos(service_Name, service_Photo,"remove");
            // console.log( "remove: ", service_Name);
         }
    });
}
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

    var center = map.getCenter();

    // console.log("center lat: ", center.lat, " center lon:", center.lng);
    // console.log("west:", minx,  " | " , "East:", maxx,  " | ", "South:", miny,  " | ", "North:", maxy,  " | ", "zoom:", zoom);

    if(minx < fixed_bounds[1])
        minx = fixed_bounds[1];

    if(maxx > fixed_bounds[3])
        maxx = fixed_bounds[3];

    if(miny < fixed_bounds[0])
        miny = fixed_bounds[0];

    if(maxy > fixed_bounds[2])
        maxy = fixed_bounds[2];

    console.log("NEW -> west:", minx ,  " | " , "East:", maxx,  " | ", "South:", miny,  " | ", "North:", maxy,  " | ", "zoom:", zoom);

    var data  = {
        "zoom": zoom,
        "bounds": bounds,
        "width": width,
        "height": height,
        "minx": minx,
        "maxx": maxx,
        "miny": miny,
        "maxy": maxy,
        "bbox": minx + "," + miny + "," +  maxx + "," + maxy,
        "bbox_Geograph": miny + "," + minx + "," +  maxy + "," + maxx,
        "lat": center.lat,
        "lon": center.lng
    };

    return data;
}

function leaflet_Markers (service_Photo, service_Icon, group, lat, lon, img){

    // create a leaflet popup frame
    var popup = L.popup({
        maxWidth: service_Photo.maxWidth,
        maxHeight: service_Photo.maxHeight
    }).setContent( img);

    // create a leaflet marker
    var marker = L.marker([lat, lon], {
        icon: service_Icon
    }).addTo(group);
    marker.bindPopup(popup);

    // var marker = L.markerClusterGroup([lat, lon], {
    //     icon: service_Icon
    // }).addTo(group);
    // marker.bindPopup(popup);


    // var markerClusters = L.markerClusterGroup();
    //
    // for ( var i = 0; i < markers.length; ++i )
    // {
    // var popup = markers[i].name +
    //           '<br/>' + markers[i].city +
    //           '<br/><b>IATA/FAA:</b> ' + markers[i].iata_faa +
    //           '<br/><b>ICAO:</b> ' + markers[i].icao +
    //           '<br/><b>Altitude:</b> ' + Math.round( markers[i].alt * 0.3048 ) + ' m' +
    //           '<br/><b>Timezone:</b> ' + markers[i].tz;
    //
    // var m = L.marker( [markers[i].lat, markers[i].lng], {icon: myIcon} )
    //               .bindPopup( popup );
    //
    // markerClusters.addLayer( m );
    // }
    //
    // map.addLayer( markerClusters );
}

function parse_Photos (service_Name, service_Photo, action){

    // get photo search criteria values
    photo_Text = $("#photo_query").val();
    photo_Tag = $("#photo_tag").val();
    photo_Number = $("#photo_number").val();
    photo_Year = $("#photo_year").val();

    console.log("photo_Text: ", photo_Text, " photo_Tag: ", photo_Tag, " photo_Number: ", photo_Text, " photo_Year: ", photo_Year);

    // get boundary coordinates
    var data_BBOX = get_BBOX();

    var parms_Photo = {
        "api_key": service_Photo.key,
        "method": service_Photo.method,
        "has_geo": service_Photo.has_geo,
        "extras": service_Photo.extras,
        "text": service_Photo.text,
        "perpage": service_Photo.perpage,
        "page": service_Photo.page,
        "format": service_Photo.format,
        "bbox": data_BBOX.bbox,
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

    if(action == "remove") {

        if(service_Name == "Flickr"){
            map.removeLayer(group_Flickr);
        }else if (service_Name == "Panoramio") {
            map.removeLayer(group_Panoramio);
        }else if (service_Name == "Geograph") {
            map.removeLayer(group_Geograph);
        }else {
            console.log("PHOTO SERVICE NOT FOUND");
        }

    }else{

        if(service_Name == "Flickr"){
            parse_Flickr(service_Photo, parms_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year);
        }else if (service_Name == "Panoramio") {
            parse_Panoraimo(service_Photo, parms_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year);
        }else if (service_Name == "Geograph") {
            parse_Geograph(service_Photo, parms_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year);
        }else {
            console.log("PHOTO SERVICE NOT FOUND");
        }
    }
}

function display_Flickr (data_Photo, service_Photo, service_Icon, service_Logo){

        // loop through the photos
        $.each(data_Photo.photos.photo, function() {

            // console.log("flickr response: ", this);

            // var flickr_Year = Date.parse(this.datetaken)
            // console.log("flickr_Year: ", flickr_Year / 365);

            // create a html frame
            var photo_owner = service_Photo.url + this.owner ;
            var photo_url = photo_owner + '/' + this.id ;

            var photo_width =  '" width=250" ';
            var photo_logo = '<img src=" ' +  service_Logo + '" ><br/>';
            var photo_title =  '<p>' + this.title + '</p><br/>';

            var photo_credits=  '<span>&copy;&nbsp;<a href="' + photo_owner + '" target="_new">'+ this.owner + "</a></span>";

            if (this.description._content === "") {
                var photo_caption =  '<p><span>Tags: ' + this.tags + '<br/>Taken on ' + this.datetaken  + '</span></p>';

            } else {
                var photo_caption=  '<p><span>Description: ' + this.description._content + '<br/>Tags: ' + this.tags + '<br/>Taken on ' + this.datetaken  + '</span></p>';
            }

            var photo_img =  '<img src="'+ this.url_s + '" alt=' + this.title + photo_width + '/>';
            var photo_ref =  '<a id="' + this.id + '" title="'+ this.title  + '" rel="pano" href="' + photo_url + '" target="_new">' + photo_img + '</a><br/>';

            var img = "<div class=photo_frame>" + photo_logo + photo_title + photo_ref + photo_credits + photo_caption + "</div>";

            leaflet_Markers (service_Photo, service_Icon, group_Flickr, this.latitude, this.longitude, img);

        });

}

function parse_Flickr (service_Photo, parms_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year){


        var d = new Date(photo_Year)
        var d2 = Date.parse(d)

        console.log("year: ", d2);

        // get boundary coordinates
        var data_BBOX = get_BBOX();

        // check if the obect is empty or the bbox changed
        if( group_Flickr === "" || action === 'zoom') {

            // create a new object if it is empty
            group_Flickr = L.featureGroup([]).addTo(map);

            flickr_url = service_Photo.rest + "?method=" + service_Photo.method + "&api_key=" + service_Photo.key + "&text=" +  photo_Text + "&tags=" +  photo_Tag + "&per_page=" + photo_Number ;

            console.log(flickr_url);

            // parse the Flickr data
            $.when ( $.ajax ({
                    url:  flickr_url,
                    cache: true,
                    async: true,
                    data: parms_Photo
                })
            ).then(function( response ) {
                // var  data_Photo = response;
                display_Flickr(response, service_Photo, service_Icon, service_Logo);
            });

      }else{
          // remove layer
          map.addLayer(group_Flickr);
      }
}

function display_Panoraimo (data_Photo, service_Photo, service_Icon, service_Logo){

        // console.log("data_Photo", data_Photo);

    // loop through the photos
    $.each(data_Photo.photos, function() {

        // create a html frame
        var photo_width =  '" width=250" ';
        var photo_logo = '<img src=" ' +  service_Logo + '" ><br/>';
        var photo_title =  '<p>' + this.photo_title + '</p><br/>';

        var photo_credits=  '<span>&copy;&nbsp;<a href="' + this.owner_url + '" target="_new">'+ this.owner_name + "</a></span><br/><span>Photos provided by Panoramio are under the copyright of their owners</span>";
        var photo_caption =  '<p><span>Tags: ' + this.tags + '<br/>Uploaded on ' +this.upload_date  + '</span></p>';

        var photo_img =  '<img src="'+ this.photo_file_url + '" alt=' + this.photo_title + photo_width + '/>';
        var photo_ref =  '<a id="' + this.photo_id + '" title="'+ this.photo_title  + '" rel="pano" href="' + this.photo_url + '" target="_new">' + photo_img + '</a><br/>';

        var img = "<div class=photo_frame>" + photo_logo + photo_title + photo_ref + photo_credits + photo_caption + "</div>";

        leaflet_Markers (service_Photo, service_Icon, group_Panoramio, this.latitude, this.longitude, img);

    });
}

function parse_Panoraimo (service_Photo, parms_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year){


    // define search variables
    if ( photo_Text === "" ) {
        pTag = "public";
    } else {
        pTag = "public&tag="+ photo_Text;
    }

    if ( photo_Number === "" ) {
        pN = "&from=0&to=50";
    } else {
        pN = "&from=0&to=" + photo_Number;
    }


    // get boundary coordinates
    var data_BBOX = get_BBOX();

    // check if the obect is empty
    if( group_Panoramio === "" || action === 'zoom') {

        // create a new object if it is empty
        group_Panoramio = L.featureGroup([]).addTo(map);

        // create Panoraimo URL
        var url_Panoraimo = service_Photo.url + pTag + pN + "&minx=" + data_BBOX.minx + "&miny=" + data_BBOX.miny + "&maxx=" + data_BBOX.maxx + "&maxy=" + data_BBOX.maxy + "&size=small&mapfilter=true&callback=?";

        // console.log( "url_Panoraimo: ", url_Panoraimo ); // server response

        // parse the Panoraimo data
        $.when ( $.ajax ({
                url: url_Panoraimo,
                // The name of the callback parameter, as specified by the YQL service
                jsonp: "callback",
                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",
                // Tell YQL what we want and that we want JSON
                data: {
                    tag: photo_Tag,
                    format: "json",
                },
            })
        ).then(function( response ) {
            // var  data_Photo = response;
            display_Panoraimo(response, service_Photo, service_Icon, service_Logo);
        });

    }else{
        // remove layer
        map.addLayer(group_Panoramio);
    }

}

function display_Geograph (data_Photo, service_Photo, service_Icon, service_Logo){

    console.log("response geograph ", data_Photo);

    var geograph_ID = [];

    // parse the photo IDs (this is necessary prior to parse the photos because the Facets API does not return the proper lat long coordinates)
    $.each(data_Photo.matches, function(index, obj) {
        geograph_ID[index] = this.id;
    });

    $.each(geograph_ID, function(index, obj) {
        // var grid = this.attrs.grid_reference

        // console.log("this geograph ", this);

        var photo_URL =  "http://api.geograph.org.uk/api/photo/" + obj + "/" + service_Photo.key + "&?output=json";

        // // parse the Geograph data
        $.when ( $.ajax ({
            type: 'GET',
            url: photo_URL,
            dataType: 'jsonp',
            cache: true,
            async: true,
            contentType: "application/json"
            })
        ).then(function( photo ) {

            // create a html frame
            var photo_width =  '" width=250" ';
            var photo_logo = '<img src=" ' +  service_Logo + '" ><br/>';
            var photo_title =  '<p>' + photo.title + '</p><br/>';

            var creativecommons = "http://creativecommons.org/licenses/by-sa/2.0/";

            var photo_credits=  '<span>&copy;&nbsp;<a href="' + photo.imgserver + photo.profile_link  + '" target="_new">'+ photo.realname + '</a> and licensed for reuse under this <a href="' + creativecommons + '" target="CC"> Creative Commons Licence"</a></span>';
            var photo_caption =  '<p><span>Tags: ' + photo.tags + '<br/>Taken on ' + photo.taken  + '</span></p>';

            var photo_link = "http://www.geograph.org.uk/photo/" + obj;

            var photo_img =  '<img src="'+  photo.imgserver + photo.image + '" alt=' + photo.realname + photo_width + '/>';
            var photo_ref =  '<a id="' + obj + '" title="'+ photo.title + '" rel="pano" href="' + photo_link + '" target="_new">' + photo_img + '</a><br/>';

            var img = "<div class=photo_frame>" + photo_logo + photo_title + photo_ref + photo_credits + photo_caption + "</div>";

            leaflet_Markers (service_Photo, service_Icon, group_Geograph, photo.wgs84_lat, photo.wgs84_long, img);

        });
    });
}

function parse_Geograph (service_Photo, parms_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year){

    // check if the obect is empty or the bbox changed
    if( group_Geograph === "" || action === 'zoom') {

        // create a new object if it is empty
        group_Geograph = L.featureGroup([]).addTo(map);
        // var featureGroup = L.markerClusterGroup();

        // get boundary coordinates
        var data_BBOX = get_BBOX();

        var UK_BBOX = {
            north:55.811741,
            south:49.871159,
            west:-6.37988,
            east:1.76896
        };

        // var geograph_Select = "takenday,realname,title,grid_reference,wgs84_lat,wgs84_long,contexts,subjects,tags,place,county,country,placename_id"
        var geograph_Select = "*";
        var geograph_Limit = photo_Number;

        // var geograph_Geo="52.950583,-3.936389,2000";

        var url_Geograph = "http://api.geograph.org.uk/api-facet.php?a=1&pretty=1&limit=" + geograph_Limit + "&bounds=" + data_BBOX.bbox_Geograph;

        console.log("url_Geograph ", url_Geograph);

        // // parse the Geograph data
        $.when ( $.ajax ({
            type: 'GET',
            url: url_Geograph,
            dataType: 'jsonp',
            cache: true,
            async: true,
            contentType: "application/json"
            })
        ).then(function( response ) {
            display_Geograph(response, service_Photo, service_Icon, service_Logo);
        });


    } else {
        // remove layer
        map.addLayer(group_Geograph);
    }

}
