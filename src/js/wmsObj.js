
// Storage the WMS object in the html local storage
// http://thejackalofjavascript.com/storing-objects-html5-local-storage/
function wmsObj (id, title, server, version, layers, bbox, width, height, CRS, format, transparent, tiled, styles, zIndex){

    var getMap_join = server + "version=" + version + "&request=GetMap&layers=" + layers + "&bbox=" + bbox + "&width=" + width + "&height=" + height + "&srs=" +  CRS + "&format=" + format;

    var args  = {
        "id": id,
        "title": title,
        "server": server,
        "layers": layers,
        "format": format,
        "transparent": transparent,
        "version": version,
        "tiled": tiled,
        "crs": CRS,
        "zIndex": zIndex,
        "styles": styles,
        "getMap":  getMap_join,
        };

        // var wmsLayer  = L.tileLayer.wms(server, {
        //     "layers": layers,
        //     "format": format,
        //     "transparent": transparent,
        //     "version": version,
        //     "tiled": tiled,
        //     "styles": styles,
        //     "zIndex": zIndex,
        //     "crs": SRS,
        // });

    localStorage.setItem(id, JSON.stringify(args));

    // console.log("args: ", args);
}

function wmsLeaflet (obj){
    var wmsLayer = JSON.parse(localStorage.getItem(obj));
    var id = wmsLayer.id;
    var arg = {
        layers: wmsLayer.layers,
        format: wmsLayer.format,
        transparent: wmsLayer.transparent,
        version: wmsLayer.version,
        tiled: wmsLayer.tiled,
        styles: wmsLayer.styles,
        zIndex: wmsLayer.zIndex,
        // crs: wmsLayer.CRS,
    };

    // Convert object parameters to Leaflet object
    window[id] = L.tileLayer.wms(wmsLayer.server, arg);

    // console.log((window[id]) , " : " , JSON.stringify(window[id]));
    // console.log(wmsLayer.layers);
    // console.log(Corine_06);
}



function mapBBOX () {

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

function displayFlickr (data){

    // console.log( "response: ", data ); // server response

    var ico = new L.Icon({
        iconUrl: 'https://s.yimg.com/pw/images/goodies/white-small-circle.png',
        shadowUrl: null,
        iconAnchor: [9,9],
        popupAnchor: [0,-10],
        iconSize: [15, 15],
    });

    var logo = "https://s.yimg.com/pw/images/goodies/white-flickr.png";

    $.each(data.photos.photo, function() {

        var url = 'https://www.flickr.com/photos/' + this.owner + '/' + this.id ;

    	var img = '<img src=" ' +  logo + ' "><br/><font color="red">'+ this.title+ '<br/><a id="'+ this.id+'" title="'+ this.title+ '" rel="pano" href="'+ url+ '" target="_new"><img src="'+ this.url_s+'" alt="'+this.title+'" width="180"/></a><br/>&copy;&nbsp;<a href="'+url  + '" target="_new">'+ this.owner+'</a>'+ this.upload_date + '</font>';



    // console.log( "url: ", url ); // server response

        var popup = L.popup({
            maxWidth: 600,
            maxHeight: 800
            })
            .setContent( img);

            var marker = L.marker([this.latitude, this.longitude], {icon: ico}).addTo(featureGroup);
            marker.bindPopup(popup);
     });


}

function Get_flickr (pSearch, pNumber, map_width, map_height){
    var flickrKey = "78a6ce549b86483a335a3377a3765ef0";

    var flickrData = {
        "api_key": flickrKey,
        "method": "flickr.photos.search",
        "has_geo": 1,
        "extras": "geo,url_s",
        "text": pSearch,
        "perpage": pNumber,
        "page": 1,
        "format": "json",
        "nojsoncallback": 1,
    };

    $.ajax({
        url: "https://api.flickr.com/services/rest/",
        data: flickrData,
        }).done(function( response ) {
            displayFlickr(response);
        });

}

function displayPanoramio(data){
    // console.log( "panoramio: ", data ); // server response

    var ico = new L.Icon({
        iconUrl: 'http://www.panoramio.com/img/panoramio-marker.png',
        shadowUrl: null,
        iconAnchor: [9,9],
        popupAnchor: [0,-10],
        iconSize: [15, 15],
    });

    var logo = "http://www.panoramio.com/img/glass/components/logo_bar/panoramio.png";

    $.each(data.photos, function() {

    	var img = '<img src=" ' +  logo + ' "><br/><font color="red">'+ this.photo_title+ '<br/><a id="'+ this.photo_id+'" title="'+ this.photo_title+ '" rel="pano" href="'+ this.photo_url+ '" target="_new"><img src="'+ this.photo_file_url+'" alt="'+this.photo_title+'" width="180"/></a><br/>&copy;&nbsp;<a href="'+this.owner_url+ '" target="_new">'+ this.owner_name+'</a>'+ this.upload_date + '</font>';

        var popup = L.popup({
            maxWidth: 600,
            maxHeight: 800
            })
            .setContent( img);

        var marker = L.marker([this.latitude, this.longitude], {icon: ico}).addTo(featureGroup);
        marker.bindPopup(popup);
    });
}

function Get_panoramio (pSearch, pNumber, map_width, map_height){

    var data = mapBBOX();
    // console.log( "panoData: ", data );

    var panoURL = "http://www.panoramio.com/map/get_panoramas.php?set=public&tag="+ pSearch + "&from=0&to=" + pNumber + "&minx=" + data.minx + "&miny=" + data.maxx + "&maxx=" + data.miny + "&maxy=" + data.maxy + "&size=small&mapfilter=true&callback=?";
    // console.log( "panoURL: ", panoURL ); // server response


    $.ajax({
        url: panoURL,

        // The name of the callback parameter, as specified by the YQL service
        jsonp: "callback",

        // Tell jQuery we're expecting JSONP
        dataType: "jsonp",

        // Tell YQL what we want and that we want JSON
        data: {
            tag: pSearch,
            format: "json",
        },

        // Work with the response
        success: function(response) {
            displayPanoramio(response);
        }
    });


    // see example to be copied
    // view-source:http://techslides.com/demos/leaflet/leaflet-api-cache.html



}
