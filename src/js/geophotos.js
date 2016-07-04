function geotag_Photos (DB_photo) {

    // switch button
    $('.switch-toogle').on('click', function(event) {

        var service_Name = this.value;
        var service_Photo = DB_photo[service_Name];
        console.log("service_Photo: ", service_Photo);

         if(this.checked) {
            parse_Photos(service_Name, service_Photo, "show");

         }else{
            parse_Photos(service_Name, service_Photo,"remove");
            // console.log( "remove: ", service_Name);
         }
    });
}

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

    // console.log("NEW -> west:", minx ,  " | " , "East:", maxx,  " | ", "South:", miny,  " | ", "North:", maxy,  " | ", "zoom:", zoom);

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
        "bbox_Panoramio": "&minx=" + minx + "&miny=" + miny + "&maxx=" + maxx + "&maxy=" + maxy,
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

    // console.log("photo_Text: ", photo_Text, " photo_Tag: ", photo_Tag, " photo_Number: ", photo_Text, " photo_Year: ", photo_Year);

    // get boundary coordinates
    var data_BBOX = get_BBOX();

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
            parse_Flickr(service_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year);
        }else if (service_Name == "Panoramio") {
            parse_Panoraimo(service_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year);
        }else if (service_Name == "Geograph") {
            parse_Geograph(service_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year);
        }else {
            console.log("PHOTO SERVICE NOT FOUND");
        }
    }
}

function display_Flickr (data_Photo, service_Photo, service_Icon, service_Logo){

        // loop through the photos
        $.each(data_Photo.photos.photo, function() {

            // console.log("flickr response: ", this);

            // create a html frame
            var photo_owner = service_Photo.url + this.owner ;
            var photo_url = photo_owner + '/' + this.id ;

            var photo_width =  '" width=250" ';
            var photo_logo = '<img src=" ' +  service_Logo + '" ><br/>';
            var photo_title =  '<p>' + this.title + '</p><br/>';

            var photo_credits=  '<span>&copy;&nbsp;<a href="' + photo_owner + '" target="_new">'+ this.owner + "</a></span>";

            var photo_caption="";
            if (this.description._content === "") {
                photo_caption =  '<p><span>Tags: ' + this.tags + '<br/>Taken on ' + this.datetaken  + '</span></p>';

            } else {
                photo_caption=  '<p><span>Description: ' + this.description._content + '<br/>Tags: ' + this.tags + '<br/>Taken on ' + this.datetaken  + '</span></p>';
            }

            var photo_img =  '<img src="'+ this.url_s + '" alt=' + this.title + photo_width + '/>';
            var photo_ref =  '<a id="' + this.id + '" title="'+ this.title  + '" rel="pano" href="' + photo_url + '" target="_new">' + photo_img + '</a><br/>';

            var img = "<div class=photo_frame>" + photo_logo + photo_title + photo_ref + photo_credits + photo_caption + "</div>";

            leaflet_Markers (service_Photo, service_Icon, group_Flickr, this.latitude, this.longitude, img);

        });

}

function parse_Flickr (service_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year){

        // get boundary coordinates
        var data_BBOX = get_BBOX();

        // check if the obect is empty or the bbox changed
        if( group_Flickr === "" || action === 'zoom') {

            // create a new object if it is empty
            group_Flickr = L.featureGroup([]).addTo(map);

            // define search criteria

            var search_Text = "",
                search_Tag = "",
                search_Year = "";

            if ( photo_Text )
                search_Text = '&text=' + photo_Text;

            if ( photo_Tag )
                search_Tag = '&tags=' + photo_Tag;

            if (photo_Year) {
                var photo_Year_start = "1/1/" + photo_Year;
                var photo_Year_end = "12/31/" + photo_Year;

                var date_Start = new Date(photo_Year_start).getTime() / 1000;
                var date_End = new Date(photo_Year_end).getTime() / 1000;

                search_Year = '&min_taken_date=' + date_Start + '&max_taken_date=' + date_End;
            }

            // BUG: it is better to define the parameters on the URL than inside the parse function to avoid to get too many duplicated results
            flickr_url = service_Photo.rest + "?method=" + service_Photo.method + "&api_key=" + service_Photo.key   + "&per_page=" + photo_Number + "&page=" + photo_Page + search_Text + search_Tag + search_Year ;

            console.log(flickr_url);

            // parse the Flickr data
            $.when ( $.ajax ({
                    url:  flickr_url,
                    cache: true,
                    async: true,
                    data: {
                        // "api_key": service_Photo.key,
                        // "method": service_Photo.method,
                        "has_geo": service_Photo.has_geo,
                        "extras": service_Photo.extras,
                        "format": service_Photo.format,
                        "bbox": data_BBOX.bbox,
                        "nojsoncallback": service_Photo.jsoncallback
                    }
                })
            ).then(function( response ) {
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

    // console.log(this);

        // create a html frame
        var photo_width =  '" width=250" ';
        var photo_logo = '<img src=" ' +  service_Logo + '" ><br/>';
        var photo_title =  '<p>' + this.photo_title + '</p><br/>';

        var photo_credits=  '<span>&copy;&nbsp;<a href="' + this.owner_url + '" target="_new">'+ this.owner_name + "</a></span><br/><span>Photos provided by Panoramio are under the copyright of their owners</span>";
        var photo_caption =  '<p><span>Uploaded on ' +this.upload_date  + '</span></p>';

        var photo_img =  '<img src="'+ this.photo_file_url + '" alt=' + this.photo_title + photo_width + '/>';
        var photo_ref =  '<a id="' + this.photo_id + '" title="'+ this.photo_title  + '" rel="pano" href="' + this.photo_url + '" target="_new">' + photo_img + '</a><br/>';

        var img = "<div class=photo_frame>" + photo_logo + photo_title + photo_ref + photo_credits + photo_caption + "</div>";

        leaflet_Markers (service_Photo, service_Icon, group_Panoramio, this.latitude, this.longitude, img);

    });
}

function parse_Panoraimo (service_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year){

    // define search variables (not working on Panoramio)
    if ( photo_Tag ) {
        pTag = "public&tag="+ photo_Tag;
    } else {
        pTag = "public";
    }

    var page_min = "",
        page_max = "";

    if ( photo_Page == 1 ) {
        page_min = 0;
        page_max = photo_Number;
    } else {
        page_min = parseInt(photo_Number) * parseInt(photo_Page) - parseInt(photo_Number) + 1 ;
        page_max = parseInt(photo_Number) * parseInt(photo_Page) + 1;
    }

    var pN = '&from=' + page_min + '&to=' + page_max;

    // console.log("pN" , pN, " page_min ", page_min, " page_max ", page_max);

    // get boundary coordinates
    var data_BBOX = get_BBOX();

    // check if the obect is empty
    if( group_Panoramio === "" || action === 'zoom') {

        // create a new object if it is empty
        group_Panoramio = L.featureGroup([]).addTo(map);

        // create Panoraimo URL
        var url_Panoraimo = service_Photo.url + pTag + pN + data_BBOX.bbox_Panoramio + "&size=small&mapfilter=true&callback=?";

        console.log( "url_Panoraimo: ", url_Panoraimo ); // server response

        // parse the Panoramio data
        $.when ( $.ajax ({
                url: url_Panoraimo,
                jsonp: "callback",
                dataType: "jsonp",
                data: {
                    tag: photo_Tag,
                    upload_date: photo_Year,
                    format: "json",
                },
            })
        ).then(function( response ) {
            console.log("response", response);
            display_Panoraimo(response, service_Photo, service_Icon, service_Logo);
        });

    }else{
        // remove layer
        map.addLayer(group_Panoramio);
    }

}

function display_Geograph (data_Photo, service_Photo, service_Icon, service_Logo){

    // console.log("response geograph ", data_Photo);

    var geograph_ID = [];

    // parse the photo IDs (this is necessary prior to parse the photos because the Facets API does not return the proper lat long coordinates)
    $.each(data_Photo.matches, function(index, obj) {
        geograph_ID[index] = this.id;
    });


    $.each(geograph_ID, function(index, obj) {
        // var grid = this.attrs.grid_reference

        console.log("this geograph ", this);

        var photo_URL =  "http://api.geograph.org.uk/api/photo/" + obj + "/" + service_Photo.key + "&output=json";

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

            // console.log("this photo ", photo);

            // create a html frame
            var photo_width =  '" width=250" ';
            var photo_logo = '<img src=" ' +  service_Logo + '" ><br/>';
            var photo_title =  '<p>' + photo.title + '</p><br/>';

            var creativecommons = "http://creativecommons.org/licenses/by-sa/2.0/";

            var photo_credits=  '<span>&copy;&nbsp;<a href="' + photo.imgserver + photo.profile_link  + '" target="_new">'+ photo.realname + '</a> and licensed for reuse under this <a href="' + creativecommons + '" target="CC"> Creative Commons Licence"</a></span>';

            // clean tags
            var clean_Tags = "";
            if (photo.tags){

                var clean_Split =  photo.tags.split('?');
                clean_Tags = "Tags: ";

                for ( i = 0; i < clean_Split.length; i++) {
                    if (clean_Split[i].startsWith("top:"))
                        clean_Tags += clean_Split[i].replace(/top:/ig, " ") + "; ";
                }
            }

            var photo_caption =  '<p><span>' + clean_Tags + '<br/>Taken on ' + photo.taken  + '</span></p>';

            var photo_link = "http://www.geograph.org.uk/photo/" + obj;

            var photo_img =  '<img src="'+  photo.imgserver + photo.image + '" alt=' + photo.realname + photo_width + '/>';
            var photo_ref =  '<a id="' + obj + '" title="'+ photo.title + '" rel="pano" href="' + photo_link + '" target="_new">' + photo_img + '</a><br/>';

            var img = "<div class=photo_frame>" + photo_logo + photo_title + photo_ref + photo_credits + photo_caption + "</div>";

            leaflet_Markers (service_Photo, service_Icon, group_Geograph, photo.wgs84_lat, photo.wgs84_long, img);

        });
    });
}

function parse_Geograph (service_Photo, service_Icon, service_Logo, action, photo_Text, photo_Tag, photo_Number, photo_Year){

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

        var geograph_Select = "takenday,realname,title,grid_reference,wgs84_lat,wgs84_long,contexts,subjects,tags,place,county,country,placename_id";
        // var geograph_Select = "*";

        // define number of photos criteria
        var offset = "";
        if ( photo_Page == 1 ) {
            offset = 0;
        } else {
            offset = parseInt(photo_Number) * parseInt(photo_Page) - parseInt(photo_Number) ;
        }

        // define search criteria (see http://sphinxsearch.com/docs/current.html#matching-modes)
        var seach_Text, seach_Tag, seach_Year = "";
        if ( photo_Text )
            seach_Text = '@title ' + photo_Text;

        if ( photo_Tag )
            seach_Tag = '@tags ' + photo_Tag;

        if ( photo_Year )
            seach_Year = '@takenyear ' + photo_Year;


        var seach_Criteria = "&q=" + $.grep([seach_Text, seach_Tag, photo_Year], Boolean).join(" ");

        console.log("seach_Criteria" , seach_Criteria);


        var url_Geograph = "http://api.geograph.org.uk/api-facet.php?a=1&pretty=1&limit=" + photo_Number + "&offset=" + offset + seach_Criteria +"&bounds=" + data_BBOX.bbox_Geograph + '&sort=title + ASC';

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

function refresh_Photos (DB_photo, refresh_action) {

    // update page number
    $( "#page-number" ).html( "Page " + photo_Page);

    // check if panoraimo is on
    if ($('#btn_Pano').is(":checked")) {

        service_Name = "Panoramio";
        service_Photo = DB_photo[service_Name];

        add_Leaflet_Layer (group_Panoramio);

        parse_Photos(service_Name, service_Photo, "zoom");

    }

    // check if Flickr is on
    if ($('#btn_Flick').is(":checked")) {

        service_Name = "Flickr";
        service_Photo = DB_photo[service_Name];

        add_Leaflet_Layer (group_Flickr);

        parse_Photos(service_Name, service_Photo, "zoom");

    }

    // check if Geograph is on
    if ($('#btn_Geog').is(":checked")) {

        service_Name = "Geograph";
        service_Photo = DB_photo[service_Name];

        add_Leaflet_Layer (group_Geograph);

        parse_Photos(service_Name, service_Photo, "zoom");

    }
}
