// There are 3 ways to parse the getcapabilites file:
// 1: create a custom parser; the output will be a stored as xml (unless converted to json)
// 2: using openlayers library: the output will be a stored as json
// 3: using third parties libraries (e.g. https://github.com/w8r/wms-capabilities)


    function createHTML (classN, ID, name, title, ref, url){
        // create HTML element

        var open_div = '<div id="' +  ID + '" class="draggable ' +  classN + '"  >',
             li =  '<li><input type="checkbox" value="' + ID  + '" autocomplete="off" class="wmsBox wms_Ignore" id="' +  ID + '">',
             label = '<label for="'  +  ID  + '"><span>'  +  title  +  '</span></label></li>',
             // include a hidden class to hide the delete button
            icon = '<a><span  href="'  +  ref  + '" value="' + ID  + '" class="glyphicon glyphicon-remove-circle wms_delete hidden-xs hidden-lg"><br></span></a>',
            close_div = '</div>',


            html = open_div + li + label + icon + close_div;

        return html;

    }

    // Openlayers XML parser (works but each getcapabilities file seems to have a different structure - must undertand better the xml strucuture before using it) //
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
        //   console.log("layerList" +  layerList);

        // loop through the object  data
        $.each(layerList, function (index, obj) {
            // console.log(' SRS ' + layerList[index].SRS)

            var list = layerList[index],
                layers = list.Name,
                title = list.Title,
                CRS = list.CRS[0],
                bbox = list.BoundingBox[1].extent,
                width = 600,
                height = 600,
                transparent = true,
                tiled = true,
                styles = "",
                format = "image/png",
                zIndex = 200 - index;
                id = "wms" + index +"_" + title.slice(0,10).replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ''), // clip the name and remove the special characters to create an unique ID
                ref="#" + id;

            // Add parameters to object
            wmsObj (id, title, server, version, layers, bbox, width, height, CRS, format, transparent, tiled, styles, zIndex);

            // Create leaflet variables for each layer
            wmsLeaflet(id);

            // Add layers to pannel
             var html = createHTML("wms_candidates",id,name,title,ref);
             $(".wmsList").append(html);

        });

   }
