$( document ).ready(function() {

    //  Add layers to map (except those in the wms modal pannel - added class wms_Ignore to avoid adding the layer to the map before showing on the pannel)
    //jquery dynamically added checkbox
    //http://stackoverflow.com/questions/4692281/jquery-dynamically-added-checkbox-not-working-with-change-function
    $(document).on('click', "input:checkbox:not(.wms_Ignore)", function(event) {

         var layerClicked = window[event.target.value];

        //  console.log('layerClicked: ' , layerClicked);
        //  console.log('this for adding: ' , this);

         if (map.hasLayer(layerClicked)) {
             map.removeLayer(layerClicked);
         } else {
             map.addLayer(layerClicked);
         };
     });

     $(document).on('click', ".wms_delete ", function(event) {
          var layer = $(this).attr('value');     //  Get the ID fist to identify the event (does not work as the toggle layer function)
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
      $("#wms_add" ).on('click', function ()
      {
         // get the checked checkboxes
        var checkedVals = $('.wmsBox:checkbox:checked').map(function() {
            return this.value;
        }).get();

        // Lopp throught the checked checkboxes
        $.each( checkedVals, function( index, value ){
            //   Clone selected wms layers to pannel
            var   ID = "#" + value;
            $('.wms_delete').removeClass( "hidden-xs" ); //remove hidden class to show the delete icon
            $('.wms_delete').removeClass( "hidden-lg" ); //remove hidden class to show the delete icon
            $('.wmsBox').removeClass( "wms_Ignore" ); //remove ignore class to allow toggling the layer
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

    // ############################ Photo

    function addPhotos (type, pSearch, pNumber, map_width, map_height) {

            // console.log("type: ", type );

        if ( type === "addFlickr") {
            var flickrData = Get_flickr (pSearch, pNumber, map_width, map_height);

        } else {
            var panoData = Get_panoramio (pSearch, pNumber, map_width, map_height);
            // console.log( "panoData: ", panoData ); // server response



            // console.log( panoData ); // server response

            // $.each(panoraimoData.photos, function() {
            //     var marker = L.marker([this.latitude, this.longitude]).addTo(featureGroup);
            //     marker.bindPopup("<b>"+this.photo_title+"</b><br><img src='" + this.photo_file_url + "'>");
            // });


            // var myOptions = {
            //   'width': 300,
            //   'height': 200
            // };
            // //
            // var data = new panoramio.PhotoRequest(panoraimoData);
            // console.log ("PhotoRequest: ", data)
            //
            // var wapiblock = document.getElementById('custom');
            // var widget = new panoramio.PhotoWidget(wapiblock, data, myOptions);
            // console.log("widget:", widget);

            // $.each(data, function() {
            //     // var marker = L.marker([this.latitude, this.longitude]).addTo(featureGroup);
            //     // marker.bindPopup("<b>"+this.title+"</b><br><img src='" + this.url_s + "'>");
            //
            //     console.log("myRequest:", this );
            //  });


            // var panoramio = new L.Panoramio({maxLoad: pNumber, maxTotal: 250});

            // map.addLayer(panoramio);


        };



    };

    // get bbox of the visible map
    // http://stackoverflow.com/questions/22948096/get-the-bounding-box-of-the-visible-leaflet-map
    $(function() {
        map.on('dragend zoomend', function onDragEnd(){
            var map_width = map.getBounds().getEast() - map.getBounds().getWest();
            var map_height = map.getBounds().getNorth() - map.getBounds().getSouth();

            // console.log (
            // 'center:' + map.getCenter() +'\n'+
            // 'width:' + map_width +'\n'+
            // 'height:' + map_height +'\n'+
            // 'size in pixels:' + map.getSize());

            var pSearch = $('#photo_query').val();
            var pNumber= $('#photo_number').val();

        });
    });

    $(".btn-photo" ).on('change', function (event) {

        var layer = $(this).attr('value');     //  Get the ID fist to identify the event (does not work as the toggle layer function)
        var layerClicked = window[layer];

        var pSearch = $('#photo_query').val();
        var pNumber= $('#photo_number').val();

        var map_width = map.getBounds().getEast() - map.getBounds().getWest();
        var map_height = map.getBounds().getNorth() - map.getBounds().getSouth();

        // console.log("pSearch: ", pSearch,  " pNumber: ", pNumber);

        //
        // jsonLayer = new L.LayerJSON({
        //      url:'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=78a6ce549b86483a335a3377a3765ef0&text=italia&has_geo=1&extras=geo,url_s&per_page=100&page=1&format=json&nojsoncallback=1',
        //      propertyItems: 'photos.photo',
        //      propertyLoc: ['latitude','longitude'],
        //      buildPopup: popupContent,
        // });
        //
        // map.addLayer(jsonLayer);

        // toggle icon
        // http://stackoverflow.com/questions/23266545/how-to-toggle-font-awesome-icon-on-click
        $(this).find('i').toggleClass('"" fa-check');

        //
        if($(layerClicked).prop('checked')) {
            // console.log(layer,': checked' );
            addPhotos  (layer, pSearch, pNumber, map_width, map_height);

        } else {
            console.log(layer,': unchecked' );

        };



    });




});
