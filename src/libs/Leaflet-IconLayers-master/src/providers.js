var providers = {};

url_icons="libs/Leaflet-IconLayers-master/icons/"

providers['OpenStreetMap_Mapnik'] = {
    title: 'osm',
    icon: url_icons + 'openstreetmap_mapnik.png',
    layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
};

providers['OpenStreetMap_BlackAndWhite'] = {
    title: 'osm bw',
    icon: url_icons + 'openstreetmap_blackandwhite.png',
    layer: L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
};

providers['OpenStreetMap_DE'] = {
    title: 'osm de',
    icon: url_icons + 'openstreetmap_de.png',
    layer: L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
}

providers['Stamen_Toner'] = {
    title: 'toner',
    icon: url_icons + 'stamen_toner.png',
    layer: L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    })
};

providers['Esri_OceanBasemap'] = {
    title: 'esri ocean',
    icon: url_icons + 'esri_oceanbasemap.png',
    layer: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 13
    })
};

// providers['HERE_normalDay'] = {
    // title: 'normalday',
    // icon: url_icons + 'here_normalday.png',
    // layer: L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
        // attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
        // subdomains: '1234',
        // mapID: 'newest',
        // app_id: 'Y8m9dK2brESDPGJPdrvs',
        // app_code: 'dq2MYIvjAotR8tHvY8Q_Dg',
        // base: 'base',
        // maxZoom: 20
    // })
// };


// providers['HERE_normalDayGrey'] = {
    // title: 'normalday grey',
    // icon: url_icons + 'here_normaldaygrey.png',
    // layer: L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day.grey/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
        // attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
        // subdomains: '1234',
        // mapID: 'newest',
        // app_id: 'Y8m9dK2brESDPGJPdrvs',
        // app_code: 'dq2MYIvjAotR8tHvY8Q_Dg',
        // base: 'base',
        // maxZoom: 20
    // })
// };

// providers['HERE_satelliteDay'] = {
    // title: 'satellite',
    // icon: url_icons + 'here_satelliteday.png',
    // layer: L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/satellite.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
        // attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
        // subdomains: '1234',
        // mapID: 'newest',
        // app_id: 'Y8m9dK2brESDPGJPdrvs',
        // app_code: 'dq2MYIvjAotR8tHvY8Q_Dg',
        // base: 'aerial',
        // maxZoom: 20
    // })
// };

providers['CartoDB_Positron'] = {
    title: 'positron',
    icon: url_icons + 'cartodb_positron.png',
    layer: L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    })
};

providers['Google_Image'] = {
    title: 'Google Imagery',
    icon: url_icons + 'google_image.png',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains:['mt0','mt1','mt2','mt3'],
        maxZoom: 20
    })
};

// http://stackoverflow.com/questions/9394190/leaflet-map-api-with-google-satellite-layer

providers['Google_Image'] = {
    title: 'G. Imagery',
    icon: url_icons + 'Goolge_Imagery.png',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '&copy; Map data ©2015 Google',
        subdomains:['mt0','mt1','mt2','mt3'],
        maxZoom: 20
    })
};

providers['Google_Hybrid'] = {
    title: 'G. Hybrid ',
    icon: url_icons + 'Google_Hybrid.png',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        attribution: '&copy; Map data ©2015 Google',
        subdomains:['mt0','mt1','mt2','mt3'],
        maxZoom: 20
    })
};


providers['Google_Terrain'] = {
    title: 'G. Terrain',
    icon: url_icons + 'google_Terrain.PNG',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        attribution: '&copy; Map data ©2015 Google',
        subdomains:['mt0','mt1','mt2','mt3'],
        maxZoom: 20
    })
};


providers['Google_Maps'] = {
    title: 'G. Maps',
    icon: url_icons + 'Google_Maps.PNG',
    layer: L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Map data ©2015 Google',
        subdomains:['mt0','mt1','mt2','mt3'],
        maxZoom: 20
    })
};

// ######## BING

// for all possible values and explanations see "Template Parameters" in https://msdn.microsoft.com/en-us/library/ff701716.aspx
var imagerySet = "Aerial"; // AerialWithLabels | Birdseye | BirdseyeWithLabels | Road

var bing = new L.BingLayer("LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc", {type: imagerySet});

providers['Bing'] = {
    title: 'Bing',
    icon: url_icons + 'Bing.png',
    layer: bing,
};
