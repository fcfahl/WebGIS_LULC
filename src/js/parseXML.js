// There are 3 ways to parse the getcapabilites file:
// 1: create a custom parser; the output will be a stored as xml (unless converted to json)
// 2: using openlayers library: the output will be a stored as json
// 3: using third parties libraries (e.g. https://github.com/w8r/wms-capabilities)


// http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/Vettoriali/Carta_geologica.map&service=wms&request=getCapabilities&version=1.3.0

function create_HTML (classN, ID, name, title, ref, url){
    // create HTML element

    var FontAwesome = "fa-minus-square-o";

    var open_div = '<div id="' +  ID + '" class="' +  classN + '" >',
         li =  '<li><input type="checkbox" value="' + ID  + '" autocomplete="off" class="wmsBox wms_Ignore" id="I_' +  ID + '">',
         label = '<label for="I_'  +  ID  + '"><span>'  +  title  +  '</span></label>',
         // include a hidden class to hide the delete button
        icon = '<span class="btn_delete"><br></span> <a> <i href="'  +  ref  + '" value="B_' + ID  + '" onclick="remove_WMS(\'' + ID  + '\', this)" class="fa ' + FontAwesome + ' fa-fw hidden"  aria-hidden="true"></i></a></li> ',
        close_div = '</div>',

        html = open_div + li + label + icon + close_div;



    return html;
}

// Openlayers XML parser (works but each getcapabilities file seems to have a different structure - must undertand better the xml strucuture before using it) //
function parseXML(xml) {

    var formatter = new  ol.format.WMSCapabilities();

    //  parse the data
    var response = formatter.read(xml);
    // console.log(response);

    // this object contains all the GetCapabilities data
    var capability1 = (JSON.stringify(response, null, 2));

    // parse JSON
    var obj = jQuery.parseJSON( capability1 );
    //  console.log("parsed XML: ",  obj);

    // Request Parameters
    var version = obj.version,
        service = obj.Service,
        capability = obj.Capability;
        // console.log("capability: ",  capability);

    // Capability Parameters
    var layer = capability.Layer,
        request = capability.Request.GetCapabilities.DCPType[0].HTTP.Get.OnlineResource;
        // console.log("layer: ",  layer);

    // Layer Parameters
    var layerList = layer.Layer;
    // console.log("layerList: ",  layerList);

    // Service Parameters
    var server = service.OnlineResource;
    // console.log("server" +  server);

    // loop through the object  data
    $.each(layerList, function (index, obj) {

        // console.log(' layers: ', layerList[index])

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
            id = ("wms" + index + title.slice(0,5) + title.substr(-5)).replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '') // clip the name and remove the special characters to create an unique ID
            ref="#" + id;

        // Create WMS object if it does not exists
        if($(ref).length === 0)
        {
            WMS_Object (id, title, server, service, version, layers, bbox, width, height, CRS, format, transparent, tiled, styles, zIndex);

            // Add layers to pannel
            var html = create_HTML("wms_candidates",id,name,title,ref);
            $(".wmsList").append(html);
        }



    });

}
