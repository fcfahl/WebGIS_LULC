$( document ).ready(function() {

    localStorage.clear();

    $.getJSON('db.json').success(function (data)
     {

         var DB_layers = data[0].Layers;
        //  console.log(DB_layers);

         var DB_services = data[0].Services;
         // console.log(DB_services);

        //  for (var i = 0; i < DB_layers.length; i++) {
        //  console.log(DB_layers[i].ID);
        // }
       // Add JSON to localStorage under serverData
        //  localStorage.setItem("serverData", JSON.stringify(DB_layers));

        // http://stackoverflow.com/questions/22536620/jquery-posting-json-to-local-file

     });

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

     function sortPannel() {

         var $legCache = $('#legend');
         var $tblCache = $('#tables');

         $legCache.find('.leg').sort(function (a, b) {
             return +a.getAttribute('rel') - +b.getAttribute('rel');
         })
             .appendTo($legCache);

         $tblCache.find('.tbl').sort(function (a, b) {
             return +a.getAttribute('rel') - +b.getAttribute('rel');
         })
             .appendTo($tblCache);
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

     // Opacity parameter
     function updateOpacity(layer) {
         var ID_layer = layer.getAttribute('data-id');
         var myVar = eval(ID_layer);
         var _leaflet_id = layer.id;


          console.log ('Value: ' + layer.value + ', layer: ' + _leaflet_id + ', id: ' + ID_layer);
         if (_leaflet_id) {
             myVar.setOpacity(layer.value);
         }

     }

    });


});
