function WMS_external () {

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

    var layerClicked = window[ID];
    console.log('remove: ', ID );

    //   Remove map
    if (map.hasLayer(layerClicked))
        map.removeLayer(layerClicked);

    //   Remove Div
    $("#" + ID).remove();
}

function create_HTML (classN, ID, name, title, ref, checked){

    var icon_setting = "",
        FontAwesome_setting =  "",
        modal = "";

    if (classN == "atlas-layers-names"){

        class_Checkbox="atlas-checkbox";
        onclick_Function="remove_WMS";
        onclick_Model="";
        class_Hidden = " fa-fw ";
        FontAwesome_setting = " fa fa-cog ";
        // var modal = 'data-toggle="modal" data-target="#modal-template"'
        modal = 'data-toggle="modal" data-target="#Modal_' + name + '"';

    }else{
        class_Checkbox='"wmsBox wms_Ignore"';
        onclick_Function="remove_WMS";
        class_Hidden = " fa-fw hidden ";
    }

    if (checked === true){
        check = "checked";
    }else{
        check = "";
    }

    // create HTML element

        var FontAwesome = " fa-minus-circle ";

        var open_div = '<div id="' +  ID + '" class="' +  classN + '" >';
        var li =  '<li><input type="checkbox" value="' + ID  + '" autocomplete="off" class=' + class_Checkbox + ' id="I_' +  ID + '" ' + check + '>';
        var label = '<label for="I_'  +  ID  + '"><span>'  +  title  +  '</span></label>';

         // include a hidden class to hide the delete button
        var icon = '<span class="btn_delete"><br></span> <a> <i href="'  +  ref  + '" value="B_' + ID  + '" onclick="' + onclick_Function + '(\'' + ID  + '\', this)" class="fa ' + FontAwesome + class_Hidden + '"  aria-hidden="true"></i></a> ';

        if (FontAwesome_setting)
            icon_setting = '<span class="btn_setting"><br></span> <a> <i href="'  +  ref  + '" value="B_' + ID  + '" onclick="' + onclick_Model + '(\'' + ID  + '\', ' + '\'' + name + '\'' + ', this)" class="fa' + FontAwesome_setting  + '"  aria-hidden="true" ' + modal + '></i></a> ';

        var close_div = '</li></div>';

        var html = open_div + li + label + icon_setting + icon + close_div;

    return html;
}

function parseXML(xml) {

    var formatter = new  ol.format.WMSCapabilities();

    //  parse the data
    var response = formatter.read(xml);

    // this object contains all the GetCapabilities data
    var capability1 = (JSON.stringify(response, null, 2));

    // parse JSON
    var obj = jQuery.parseJSON( capability1 );
    //  console.log("parsed XML: ",  obj);

    // Request Parameters
    var version = obj.version,
        service = obj.Service,
        capability = obj.Capability;

    // Capability Parameters
    var layer = capability.Layer,
        request = capability.Request.GetCapabilities.DCPType[0].HTTP.Get.OnlineResource;

    // Layer Parameters
    var layerList = layer.Layer;

    // Service Parameters
    var server = service.OnlineResource;

    // loop through the object  data
    $.each(layerList, function (index, obj) {

        var list = layerList[index],
            layers = list.Name,
            title = list.Title,
            service = "WMS",
            CRS = list.CRS[0],
            bbox = list.BoundingBox[1].extent,
            width = 600,
            height = 600,
            transparent = true,
            tiled = true,
            styles = "",
            format = "image/png",
            zIndex = 200 - index,
            id = ("wms" + index + title.slice(0,5) + title.substr(-5)).replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ''),
            // filter = null,
            check = false,
            ref = "#" + id;

        // Create WMS object if it does not exists
        if($(ref).length === 0)
        {
            WMS_Object (id, server, service, version, layers, bbox, width, height, CRS, format, transparent, tiled, styles, zIndex);

            // Add layers to pannel
            var html = create_HTML("wms_candidates",id,name,title,ref, check);
            $(".wmsList").append(html);
        }
    });
}
