/*
 This code is Copyright 2016 Barry Hunter
 and licenced for reuse under Creative Commons Attribution-Share Alike 3.0 licence.
 http://creativecommons.org/licenses/by-sa/3.0/

 Source: http://www.geograph.org/playground/

 */

function htmlentities(input) {
   var node = $('<div/>').text(input);
   return $(node).html();
}

function usage_log(action,param,value) {
   $.ajax({
      url: 'http://'+geograph_domain+'/stuff/record_usage.php',
      data: {action: action,param: param,value: value},
      xhrFields: { withCredentials: true }
   });
}

//////////////////////////////////////

var segmentv = [], segmentn = [];
                   segmentn.push('Older-Images');
segmentv.push(360*86400); segmentn.push('Last 360 days');
segmentv.push(180*86400); segmentn.push('Last 180 days');
segmentv.push(90*86400); segmentn.push('Last 90 days');
segmentv.push(60*86400); segmentn.push('Last 60 days');
segmentv.push(30*86400); segmentn.push('Last 30 days');
segmentv.push(7*86400); segmentn.push('Last 7 days');
segmentv.push(2*86400); segmentn.push('Last 2 days');
segmentv.push(86400); segmentn.push('Last 1 day');

function loadGroupBy(done) {
    $('#sortbar, #groupbar').show();

if ($('#advancedbar').css('display') != 'block') {
  togglerBar('advancedbar',$('.toggler a'));
}

    $('#samplebar, #pagesize').hide();
    var query = getTextQuery() + getFilterQuery();

    var attribute =$('#fgroup').attr('value');
    var newattr = $('#fgroup option:selected').attr('data-child');
    var n =$('#n').attr('value');

    var bits = $('#gorder').attr('value').split(/ /);
    var gorder = bits[0];
    var gdir = bits[1];

  var data = {
     match: query,
     limit: 100,
     option: 'ranker=none',
     select: "id,title,realname,grid_reference,takenday,hash,count(*) as count", //,groupby() as groupby
     group: attribute,
     n: n
  };
  if (data.select.indexOf(','+attribute) == -1) { //only add if not there already
     data.select += ','+attribute;
  }

  data = setSortSampleGeo(data,true);

  switch(attribute) {
     case 'submitted':data.select += ', INTERVAL(submitted, NOW()-'+segmentv.join(', NOW()-')+') AS segment'; data.group = attribute = 'segment'; break;

  }

  if (data.order) {
    data.within = data.order;
  } else if (getTextQuery().match(/ /)) {
    data.select += ',weight() as weight';
    data.order = 'weight desc';
    if (data.option) { data.option = data.option.replace(/ranker=none/,''); }
  } else {
    data.order = 'id desc';
  }

  switch(gorder) {
     case 'alpha': if (attribute == 'user_id') {
                      data.order = 'realname '+gdir+', '+data.order;
                   } else {
                      data.order = attribute+' '+gdir+', '+data.order;
                   }
                   break;
                   //todo, change to numeric if possible. maybe interger function?

     case 'weight': data.select += ',max(weight()) as wt';  data.order = 'wt '+gdir+', '+data.order;
                    if (data.option) { data.option = data.option.replace(/ranker=none/,''); } break;
     case 'images': data.order = 'count '+gdir+', '+data.order; break;
     case 'first': data.select += ',min(submitted) as submitted2';  data.order = 'submitted2 '+gdir+', '+data.order; break;
     case 'last': data.select += ',max(submitted) as submitted2';  data.order = 'submitted2 '+gdir+', '+data.order; break;
     case 'firsttaken': data.select += ',min(takendays) as takendays2,takenday';  data.order = 'takendays2 '+gdir+', '+data.order; break;
     case 'lasttaken': data.select += ',max(takendays) as takendays2,takenday';  data.order = 'takendays2 '+gdir+', '+data.order; break;
     case 'users': data.select += ',count(distinct user_id) as users';  data.order = 'users '+gdir+', '+data.order; break;
  }

  if (data.order)
    data.order = data.order.replace(/RAND\(\)/,'hash ASC'); //well hash is sort of random!
  if (data.within)
    data.within = data.within.replace(/RAND\(\)/,'hash ASC');

  usage_log('view','group',attribute+'/'+n+'/'+gorder+' '+gdir);
  if (!done)
     updateHash();

  $("#message").html('Loading...');
  $("#results").html('<img src="http://s1.geograph.org.uk/img/indicator.gif"/> Processing (this may take a while)...');

  var data_order = data.order;

  _call_cors_api(
    endpoint,
    data,
    'groupCallback',
    function(data) {
     if (data && data.rows) {
        hideOverviewMap();
        $("#results").empty();

        var loaded = 0;
        var groups = 0;
        images = [];
        var last = -1;
        $.each(data.rows,function(index,value) {
            if (value[attribute] != last)
                groups=groups+1;
            last = value[attribute];

            if (gorder == 'alpha') {
              if (attribute == 'monthname') {
                 data.rows[index].sorter2 = index;
                 data.rows[index].sorter1 = months.indexOf(value[attribute])+0;
              } else if (attribute == 'distance' || attribute == 'direction') {
                 data.rows[index].sorter2 = index;
                 data.rows[index].sorter1 = parseInt(value[attribute],10) || 0;
              }
            }
        });

        if (groups > 10) {
            show = 2;
        } else if (groups < 3) {
            show = 5;
        } else {
            show = 3;
        }
        last = -1;
        var idx = -1;
        var counter = 0;

        if (gorder == 'alpha' && (attribute == 'monthname' || attribute == 'distance' || attribute == 'direction')) {
           data.rows.sort( firstBy( function(a,b){ return a.sorter1 - b.sorter1 } )
                           .thenBy( function(a,b){ return a.sorter2 - b.sorter2 } ) );
           if (gdir == 'desc') {
               data.rows.reverse();
           }
        }

        var current = readCookie('markedImages');

        $.each(data.rows,function(index,value) {
            if (value[attribute] != last) {
                 if (last != -1) {
                      //$('#group'+idx+' div.title').prepend('<b>'+counter+' images</b> - ');
                      $('#group'+idx).addClass('group'+counter).append('<br/>');
                 }
                 idx++;

                 var friendly = value[attribute];
                 var filter = true;
                 if (attribute == 'decade') {
                    friendly = friendly.replace(/tt$/,'0s').replace(/0000s/,'Unknown');
                 } else if (attribute == 'takenyear') {
                    friendly = friendly.replace(/0000/,'Unknown');
                 } else if (attribute == 'user_id') {
                    friendly = value.realname;
                 } else if (attribute == 'segment') {
                    friendly = segmentn[parseInt(value.segment,10)];
                    filter = false;
                 } else if (attribute == 'takenmonth' || attribute == 'takenday') {
                    friendly = clean_date(text_date(friendly)).replace(/( Unknown)+$/,'');
                 } else if (attribute == 'scenti') {
                    filter = false;

//1000000000
//0123456789
//GEEEENNNNN - uneven, because grid is taller than wide

                    if (value[attribute].substr(1,9) == '000000000') {
                      friendly = 'Unknown';
                    } else {
                      if (value[attribute] >= 2000000000) {
                        var grid=new GT_Irish();
                      } else {
                        var grid=new GT_OSGB();
                      }
                      grid.eastings = value[attribute].substr(1,4)*100;
                      grid.northings= value[attribute].substr(5,5)*100;

                      friendly = grid.getGridRef(3).replace(/ /g,'');
                    }
                 } else if (attribute == 'viewsquare') {
                    filter = false;
                    if (value[attribute].substr(1,6) == '000000') {
                      friendly = 'Unknown';
                    } else {
                      if (value[attribute] >= 2000000) {
                        var grid=new GT_Irish();
                      } else {
                        var grid=new GT_OSGB();
                      }
                      grid.eastings = value[attribute].substr(4,3)*1000;
                      grid.northings= value[attribute].substr(1,3)*1000;

                      friendly = grid.getGridRef(2).replace(/ /g,'');
                    }
                 } else if (attribute == 'sequence') {
                    filter = false;
                 } else if (attribute == 'score') {
                    filter = false;
                 } else if (attribute == 'baysian') {
                    filter = false;
                 }

                 $("#results").append('<div class="group" id="group'+idx+'"><div class="title"><b>'+value['count']+' images</b> -</div></div>');

                 if (filter) {
                      $('#results #group'+idx+' div.title').append(' <a href="javascript:void(gt());void($(\'#display\').get(0).selectedIndex=0);void(addFilter(\''+attribute+'\',\''+value[attribute].addslashes()+'\',\''+friendly.addslashes()+'\'))" title="show only images in this group">'+friendly+'</a>');
                       if (newattr && value['count'] > 1) {
                              $('#results #group'+idx+' div.title').append(' <a href="javascript:void(gt());void($(\'#fgroup\').val(\''+newattr +'\'));void(addFilter(\''+attribute+'\',\''+value[attribute].addslashes()+'\',\''+friendly.addslashes()+'\'))" title="expand this group"><img src="http://s1.geograph.org.uk/img/closed.png"></a>');
                       }
                 } else {
                      $('#results #group'+idx+' div.title').append(' '+friendly);
                 }
                 if (value.users) {
                      $('#results #group'+idx+' div.title').append(' ['+value.users+' users]');
                 } else if (value.submitted2) {
                      $('#results #group'+idx+' div.title').append(' ['+from_timestamp(value.submitted2)+']');
                 } else if (value.takendays2 && (data_order == 'takendays2 desc, takendays DESC' || data_order == 'takendays2 asc, takendays ASC') ) { //we can't decode the mysql.to_days() function, so only works if can get the data from the first image.
                      $('#results #group'+idx+' div.title').append(' ['+space_date(value.takenday)+']');
                 }
                 last = value[attribute];
                 counter = 0;
            }
            value.thumbnail = getGeographUrl(value.id, value.hash, 'small');
            images.push(value);

            attr = (counter>=show || idx >3 )?'src="http://s1.geograph.org.uk/img/logo-20x20.png" data-src':'src';
            $('#group'+idx).append('<div class="thumb"><a href="http://'+geograph_domain+'/photo/'+value.id+'" onclick="return loadImage('+index+');" target="_blank" title="'+value.grid_reference+': '+value.title+' by '+value.realname+'" class="i"><img '+attr+'="'+value.thumbnail+'"></a></div>');

            counter=counter+1;
            loaded=loaded+1;
        });
        if (last != -1) {
             $('#group'+idx).addClass('group'+counter).append('<br/>');
        }

        //$('#results .group').hoverIntent(
        //   function () { $(this).css('overflow-y','auto'); },
        //   function () { $(this).css('overflow-y','hidden'); }
        //).bind('mousewheel', disableParentScroll);

        initLazy();
        addClassToMarked();

        $("#message").html(loaded+" of "+data.meta.total_found+" - in "+groups+" groups");
        $("#results").append('<br/>');
        if (data.meta.total_found > loaded) {
            $("#results").append("<p>As there are over "+loaded+" matching images. Only the "+loaded+" most recently submitted images have been put into clusters. This may change in the future.</p>");
        }


        data2 = setGeo({}); //cheap way of looking for extra filters!
        var count = 0;
        for (i in data2 ) {
            if (a.hasOwnProperty(i)) {
                count++;
            }
        }
        if (!count) {
            $("#results").append("<p>You can also try viewing these images in the <a href=\"http://www.geograph.org.uk/finder/groups.php?q="+encodeURIComponent(query)+"\">old Grouping interface</a>, which has access to more grouping functions, like tags, and automatic clusters</p>");
        }


     } else {
        if (data.meta.time)
           $("#message").html("<span>"+data.meta.time+" seconds</span>");
        else if (data.meta.error)
           $("#message").html(data.meta.error.replace(/^index [\w,]+:/,''));
        $("#results").html("No results found");
     }
   }
  );
}

///////////////////////////////

function loadDateSlider(display,sorting) {
    $('#groupbar, #sortbar, #pagesize').hide();
    $('#samplebar').show();

    var query = getTextQuery() + getFilterQuery();

  var data = {
     match: query,
     option: 'ranker=none',
     group: 'one',
     mnmx: 1,
     select: "min(takendays) as mn,max(takendays) as mx,1 as one",
     where: 'takendays > 1000'
  };

  data = setGeo(data);

  $("#message").html('Loading...');

  _call_cors_api(
    endpoint,
    data,
    'serveCallback',
    function(data) {
     if (data && data.rows) {
        hideOverviewMap();
        $("#results").empty();
        $("#results").append('<div id="sliderbar"><div id="slider"></div><div style="float:left">'+data.data.mn+'</div><div style="float:right">'+data.data.mx+'</div><div id="message2" style="text-align:center"></div></div>');
        $("#results").append('<p>drag the slider above to select a date - images closest to date shown first</p>');

                $("#slider").slider({
			value:100,
			min: to_days(data.data.mn),
			max: to_days(data.data.mx),
			step: 1,
			slide: function( event, ui ) {
                                var datestr = from_days(ui.value);
                                $("#message2").html(datestr);
                                if (daycache[query+'/'+datestr]) {
                                     loadDataSliderImages(datestr);
                                }
                                if (timer != null) {
                                     clearTimeout(timer);
                                }
                                timer = setTimeout(function() {
                                     loadDataSliderImages(datestr);
                                },400);
			}
		});

        var str = from_days($("#slider").slider("value"));
        loadDataSliderImages(str);

        $("#results").append('<div id="results2"></div>');
     } else {
        if (data.meta.time)
           $("#message").html("<span>"+data.meta.time+" seconds</span>");
        else if (data.meta.error)
           $("#message").html(data.meta.error.replace(/^index [\w,]+:/,''));
        $("#results").html("No results found");
     }
   }
  );
}

var daycache = new Object();

function loadDataSliderImages(datestr) {
  var query = getTextQuery() + getFilterQuery();
  var perpage = 20;

  var data = {
     match: query,
     limit: perpage,
     order: 'mysort ASC',
     option: 'ranker=none',
     select: "id,title,realname,hash,grid_reference,takenday,abs(to_days('"+datestr+"')-takendays) as mysort",
     where: 'takendays > 1000'
  };

  data = setSortSampleGeo(data,false);

  $("#message").html('Loading...');
  _call_cors_api(
    endpoint,
    data,
    'sliderCallback',
    function(data) {
     if (data && data.rows) {
        hideOverviewMap();
        daycache[query+'/'+datestr] = 1;
        $("#results2").empty();
        var loaded = 0;
        images = [];
        var first = '99999999';
        var last= '00000000';

        var keys = new Array();
        $.each(data.rows,function(index,value) {
            value.gridimage_id = value.id;
            value.thumbnail = getGeographUrl(value.id, value.hash, 'small');

            images.push(value);

            $("#results2").append('<div class="thumb"><a href="http://'+geograph_domain+'/photo/'+value.id+'" onclick="return loadImage('+index+');" title="'+value.grid_reference+' : '+value.title+' by '+value.realname+' /'+space_date(value.takenday)+'" class="i"><img src="'+value.thumbnail+'" onerror="refreshImage(this);"/></a></div>');

            if (value.takenday < first)
                 first = value.takenday;
            if (value.takenday > last)
                 last = value.takenday;
            loaded=loaded+1;
        });

        addClassToMarked();

        $("#message").html(loaded+" of "+data.meta.total_found+" : "+datestr);
        $("#results2").append('<div class="paging">Images shown between '+space_date(first)+' and '+space_date(last)+'</div>');
     } else {
        if (data.meta.time)
           $("#message").html("<span>"+data.meta.time+" seconds</span>");
        else if (data.meta.error)
           $("#message").html(data.meta.error.replace(/^index [\w,]+:/,''));
        $("#results2").html("No results found");
     }
  });
}

function addClassToMarked() {
        current = readCookie('markedImages');
        if (current) {
            splited = current.commatrim().split(',');
            for(i=0; i < splited.length; i++)
                $('a[href="http://'+geograph_domain+'/photo/'+splited[i]+'"] img').addClass('marked');
        }
}
function to_days(datestr) {
    var bits = datestr.split(/-/);
    var d = new Date(parseInt(bits[0],10), parseInt(bits[1],10)-1, parseInt(bits[2],10));

    return Math.floor(d / 86400000); //note may be negative!
}
function from_days(days) {
    var d = new Date(parseInt(days,10)*86400000);
    bits = [d.getFullYear(),d.getMonth()+1,d.getDate()];
    if (bits[1] < 10) bits[1] = "0"+bits[1];
    if (bits[2] < 10) bits[2] = "0"+bits[2];
    return bits.join('-');
}
function from_timestamp(ts) {
    var d = new Date(parseInt(ts,10)*1000);
    bits = [d.getFullYear(),d.getMonth()+1,d.getDate()];
    if (bits[1] < 10) bits[1] = "0"+bits[1];
    if (bits[2] < 10) bits[2] = "0"+bits[2];
    return bits.join('-');
}
function space_date(datestr) {
    return datestr.substring(0,4)+'-'+datestr.substring(4,6)+'-'+datestr.substring(6,8);
}
function text_date(datestr) {
    if (datestr.length == 4) {
        return datestr;
    } else if (datestr.length == 6) {
        return datestr.substring(0,4)+' '+months[parseInt(datestr.substring(4,6),10)];
    } else {
        return datestr.substring(0,4)+' '+shortmonths[parseInt(datestr.substring(4,6),10)]+' '+datestr.substring(6,8);
    }
}
function clean_date(date) {
    return date.replace(/0000/,'Unknown').replace(/\b00\b/,'Unknown').replace(/undefined/,'Unknown');
}

function distanceChanged(that) {
    if (map && myCircle) {
        myCircle.setRadius(parseInt(that.value,10)); //will call getMapImages via the radius_changed event
        automatedZoom = true;
        map.fitBounds(myCircle.getBounds());
    } else {
        loadThumbnails();
    }
    loadFacets();
    usage_log('set','distance',that.value);
}
function setDistanceDropdown(rad) {
          var ele = $('#distance').get(0);
          var found = false;
          rad = Math.round(rad);
          for(var w=0;w<ele.options.length;w++)
               if (ele.options[w].value == rad) {
                      ele.options[w].selected = true;
                      found = true;
               }
          if (!found) {
               var last = ele.options[ele.options.length-1];
               last.text = rad+'m';
               last.value = rad;
               last.selected = true;
          }
}

function setupBoundsFilter() {
    if (myCircle && myCircle.getMap() != null) {
         return;
    }

    if (!boundsFilter) {
         $('#filterbar').append('<li id="filterBounds" class="plus"><a href="#" onclick="return removeBoundsFilter();" title="delete filter">&#215;</a> Map Extents</li>');
         $('#samplebar').hide();
         usage_log('set','map','extents');
    }

    boundsFilter = map.getBounds().toString();
    savedZoom = map.getZoom();
    savedCenter = map.getCenter();

    getMapImages();

    //use a timer to prevent repeat zoom or quick drags triggering filters.
    if (timer != null) {
         clearTimeout(timer);
    }
    timer = setTimeout(function() {
         loadFacets();
         timer = null;
    },350);
}
function removeBoundsFilter(skipauto) {
    //the browser doesnt like killing a dom element, while still in the click event
    setTimeout(function() {
        $('#filterBounds').remove();
        $('#samplebar').show();
    },100);
    boundsFilter = false;
    if (!skipauto) {
          loadThumbnails();
          loadFacets();
    }
    return false;
}

function loadMap() {

   if (!window.google || !window.google.maps) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src  = "http://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyCdmlnz9LWCVTRhapVfPpbuqBa-0xAqZ0M&;sensor=false&libraries=geometry&callback=loadMap";
      $("head").append(s);
      return;
   }

    $('#samplebar, #sortbar, #pagesize').show();
    $('#groupbar').hide();
    hideOverviewMap();
    $("#message").html('Loading Map...').css({left:'0',right:'inherit'});
    $("#results").empty();
    if ($.browser.msie) {
        $("#results").append('<div style="height:10000px">1oading...</div>'); //really big just to make the top small;
        $('.mainarea').last().height($(window).height()-$('.mainarea').first().innerHeight()-30);
        $("#results").empty();
    }

    automatedZoom = true;

    var mapOptions = {
      zoom: 6,
      center: new google.maps.LatLng(55.739482,-3.69140),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    if (boundsFilter) {
           mapOptions.zoom = savedZoom;
           mapOptions.center = savedCenter;
    }

    map = new google.maps.Map(document.getElementById("results"), mapOptions);


    infoWindow = new google.maps.InfoWindow();

      var circleOptions = {
        strokeColor: "#FF0000",
        strokeOpacity: 0.7,
        strokeWeight: 1,
        fillColor: "#FF0000",
        fillOpacity: 0.1,
        map: wgs84location?map:null,
	editable: true,
        center: wgs84location?new google.maps.LatLng(wgs84location.latitude,wgs84location.longitude):null,
        radius: parseInt($('select#distance option:selected').val(),10)
      };
      myCircle = new google.maps.Circle(circleOptions);

      //google.maps.event.addListener(myCircle, 'mouseover', function() {
         // myCircle.setEditable(true);
      //});
      //google.maps.event.addListener(myCircle, 'mouseout', function() {
          //myCircle.setEditable(false);
      //});
      google.maps.event.addListener(myCircle, 'click', function() {
          automatedZoom = true;
          map.fitBounds(myCircle.getBounds());
      });
      google.maps.event.addListener(myCircle, 'center_changed', function() {
          var ll = myCircle.getCenter();

          //create a wgs84 coordinate
          wgs84=new GT_WGS84();
          wgs84.setDegrees(ll.lat(), ll.lng());

          var grid = false
          if (wgs84.isIreland2()) {
          	//convert to Irish
          	grid=wgs84.getIrish(true);

          } else if (wgs84.isGreatBritain()) {
          	//convert to OSGB
          	grid=wgs84.getOSGB();
          }

          if (grid) {
              //get a grid reference with 4 digits of precision
              var gridref = grid.getGridRef(4).replace(/ /g,'');

              $('#location').val(gridref);
              $("#order_distance").removeClass('disabled').text("Distance from "+gridref);
          } else {
              $('#location').val(ll.toUrlValue(6));
              $("#order_distance").removeClass('disabled').text("Distance from "+ll.toUrlValue(6));
          }
          wgs84location = new GT_WGS84();
          wgs84location.setDegrees(ll.lat(),ll.lng());
          if (myCircle.getMap()) {
              getMapImages();
              loadFacets();
          }
      });
      google.maps.event.addListener(myCircle, 'radius_changed', function() {
          setDistanceDropdown(myCircle.getRadius());

          if (myCircle.getMap()) {
              getMapImages();
              loadFacets();
          }
      });

      google.maps.event.addListener(map, 'dragend', function(evt) {
            setupBoundsFilter()
      });

      google.maps.event.addListener(map, 'zoom_changed', function(evt) {
            if (!automatedZoom) {
                    setupBoundsFilter()
            }

            //sometimes gmaps can call this twice in quick succession,
            // so reset after a delay so the second still sees it true
            timer = setTimeout(function() {
                  automatedZoom = false;
            },100);

            if (boundsFilter) {
                   boundsFilter = map.getBounds().toString();
                   savedZoom = map.getZoom();
                   savedCenter = map.getCenter();
            }
      });

      google.maps.event.addListener(map, 'click', function(evt) {
          if (myCircle && myCircle.getMap()) {
               myCircle.setMap(null); //remove it from the map to avoid setCenter firing an event.
          } else {
               var bounds = map.getBounds();
               var diagnoal = google.maps.geometry.spherical.computeDistanceBetween(bounds.getNorthEast(),bounds.getSouthWest());
               myCircle.setRadius(Math.round(diagnoal/10));
               if (boundsFilter)
                   removeBoundsFilter(true);
          }

          myCircle.setCenter(evt.latLng);
          if (!myCircle.getMap()) {
               myCircle.setMap(map);
               setTimeout(function() {
                    getMapImages();
                    loadFacets();
               },300);
          } else {
               getMapImages();
               loadFacets();
          }

          $('#distance').attr('disabled',false).parent().show();
          $('#clearMapLink').show();
          $('#order_distance').removeClass('disabled');
          $('#samplebar').hide();
          usage_log('set','map','circle');
      });

      if (wgs84location) {
          map.fitBounds(myCircle.getBounds());
          $('#clearMapLink').show();
      }

    images = {};

    getMapImages();
}


function getMapImages() {
    $('#sortbar, #pagesize').show();

    var displaymode = $('#display').attr('value');

    var query = getTextQuery() + getFilterQuery();
    //var perpage = 40;


  var data = {
     match: query,
     limit: perpage,
     select: "id,title,realname,user_id,hash,grid_reference,takenday,wgs84_lat,wgs84_long,takendays"
  };

  data = setSortSampleGeo(data,true);

  switch(sorting) {
     case '': $('#orderBy li').removeClass("autoselected");
              $('#order_spread').addClass("autoselected");
     case 'spread':  data.order="sequence ASC"; data.option='ranker=none';  break;
  }
  if (data.order)
    data.order = data.order.replace(/RAND\(\)/,'hash ASC'); //well hash is sort of random! and its stable of map zooming

  $("#message").html('Loading images...');

  _call_cors_api(
    endpoint,
    data,
    'serveCallback',
    function(data) {
     if (data && data.rows) {

        //remove the old markers
        $.each(images,function(id,value) {
            images[id].old = true;
        });

        var loaded = 0;
        var bounds = new google.maps.LatLngBounds();

        $.each(data.rows,function(index,value) {
          if (images[value.id] && images[value.id].displaymode == displaymode) {
            images[value.id].old = false;
          } else {
            if (images[value.id]) {
                images[value.id].setMap(null);
            }
            value.thumbnail = getGeographUrl(value.id, value.hash, 'small');

            var myicon;
            if (displaymode == 'map_dots') {
                 var dot = "dot_black.gif";
                 if (current) {
                      var re = new RegExp("\\b"+value.id+"\\b");
                      if (current == value.id || current.search(re) > -1)
                           dot = 'dot_marked.gif';
                 }

                 myicon= new google.maps.MarkerImage('http://s1.geograph.org.uk/img/'+dot,null,null,null,new google.maps.Size(10,10));
            } else {
                 myicon= new google.maps.MarkerImage(value.thumbnail,null,null,null,new google.maps.Size(36,36));
            }
            images[value.id] = new google.maps.Marker({
                 position: new google.maps.LatLng(rad2deg(parseFloat(value.wgs84_lat)),rad2deg(parseFloat(value.wgs84_long))),
                 map: map,
                 title: value.title+' by '+value.realname,
                 icon: myicon
            });
            images[value.id].displaymode = displaymode;
            images[value.id].id = value.id;

            google.maps.event.addListener(images[value.id], 'click', function() {
                 $('#imagediv').show();
                 //loadImage(value.id,false,'#imagedivinner');

  ele = $('#imagedivinner').empty();

if ($(window).height() > 640) {
url = "http://maps.google.com/maps/api/staticmap?markers=size:med|"+rad2deg(parseFloat(value.wgs84_lat))+","+rad2deg(parseFloat(value.wgs84_long))+"&size=220x120&sensor=false&style=feature:administrative.country%7Celement:labels%7Cvisibility:off";
zoom = map.getZoom();
  ele.append('<img src="'+url+'&zoom='+(zoom-1)+'"/> ');
  ele.append('<img src="'+url+'&zoom='+(zoom+1)+'"/>');
} else {
  ele.append('<a href="http://'+geograph_domain+'/photo/'+value.id+'" target="_blank">'+value.title+'</a> by <a href="http://'+geograph_domain+'/profile/'+value.user_id+'">'+value.realname+'</a><br/>');
}

  var current = readCookie('markedImages');
  var newtext = 'Mark';
  if (current) {
        var re = new RegExp("\\b"+value.id+"\\b");
        if (current == value.id || current.search(re) > -1)
           newtext = 'marked';
  }

  ele.append('<div style="float:right">[<a href="javascript:void(markImage('+value.id+'));" id="mark'+value.id+'">'+newtext+'</a>]</div>');

  ele.append('<a href="http://'+geograph_domain+'/photo/'+value.id+'" target="_blank"><img src="http://t0.geograph.org.uk/stamp.php?id='+value.id+'&title=on&gravity=SouthEast&hash='+value.hash+'"/></a>');
  ele.append('<br/><img src="http://i.creativecommons.org/l/by-sa/2.0/80x15.png"> <small><b>&copy; '+value.realname+'</b> and licensed for reuse under this <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">Creative Commons Licence</a></small>');

  ele.append('<p><a href="http://'+geograph_domain+'/photo/'+value.id+'" target="_blank">'+value.title+'</a> by <a href="http://'+geograph_domain+'/profile/'+value.user_id+'">'+value.realname+'</a></p>');
  ele.append('<p>For <a href="http://'+geograph_domain+'/gridref/'+value.grid_reference+'" target="_blank">'+value.grid_reference+'</a>, taken '+space_date(value.takenday)+'</p>');

 // ele.append('<p id="fixbtn"><small><a href="javascript:void(fixImage(\'#imagedivinner\'))">Try one stop fix</a></small></p>');


                 //infoWindow.setContent('<div class="iwindow"><b>'+value.grid_reference+' : '+value.title+'</b> by '+value.realname+' /'+space_date(value.takenday)+'<br/><a href="http://'+geograph_domain+'/photo/'+value.id+'" class="i" target="_blank"><img src="'+value.thumbnail.replace(/_120x120/,'_213x160')+'"></a></div>');
                 //infoWindow.open(map,images[value.id]);

                 $('#lightbox-background').show();

                 usage_log('show','main_map',value.id);
            });

            google.maps.event.addListener(images[value.id], 'mouseover', function() {
                 if (timer != null) {
                       clearTimeout(timer);
                 }
                  $('#preview').html('<img src="'+value.thumbnail+'"> <span><b>'+value.grid_reference+' : '+value.title+'</b> by '+value.realname+' /'+space_date(value.takenday)+"</span>");
                  timer = setTimeout(function() {
                       $('#preview img').attr('src',value.thumbnail.replace(/_120x120/,'_213x160'));
                  },2000);
            });
            google.maps.event.addListener(images[value.id], 'mouseout', function() {
                 if (timer != null) {
                       clearTimeout(timer);
                       timer = null;
                 }
                 $('#preview').empty();
            });

          }
          bounds.extend(images[value.id].getPosition());
          loaded=loaded+1;
        });
        if (!boundsFilter && (!myCircle || !myCircle.getMap())) {
            automatedZoom = true;
            map.fitBounds(bounds);
        }
        $.each(images,function(id,value) {
            if (images[id].old == true) {
                images[id].setMap(null);
                delete images[id];
            }
        });

        $("#message").html(loaded+" of "+data.meta.total_found+" <span>in "+data.meta.time+" seconds</span>");
     } else {
        if (data.meta.time) {
           $("#message").html("No results found, in "+data.meta.time+" seconds");
           $.each(images,function(id,value) {
              //if (images[id].old == true) {
                images[id].setMap(null);
                delete images[id];
              //}
           });
        }
        else if (data.meta.error)
           $("#message").html(data.meta.error.replace(/^index [\w,]+:/,''));
     }
   }
  );
}

function rad2deg (angle) {
    // Converts the radian number to the equivalent number in degrees
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/rad2deg
    // +   original by: Enrique Gonzalez
    // +      improved by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: rad2deg(3.141592653589793);
    // *     returns 1: 180
    return angle * 57.29577951308232; // angle / Math.PI * 180
}

function getGeographUrl(gridimage_id, hash, size) {

	yz=zeroFill(Math.floor(gridimage_id/1000000),2);
	ab=zeroFill(Math.floor((gridimage_id%1000000)/10000),2);
	cd=zeroFill(Math.floor((gridimage_id%10000)/100),2);
	abcdef=zeroFill(gridimage_id,6);

	if (yz == '00') {
		fullpath="/photos/"+ab+"/"+cd+"/"+abcdef+"_"+hash;
	} else {
		fullpath="/geophotos/"+yz+"/"+ab+"/"+cd+"/"+abcdef+"_"+hash;
	}

	switch(size) {
		case 'full': return "http://s0.geograph.org.uk"+fullpath+".jpg"; break;
		case 'med': return "http://s"+(gridimage_id%4)+".geograph.org.uk"+fullpath+"_213x160.jpg"; break;
		case 'small':
		default: return "http://s"+(gridimage_id%4)+".geograph.org.uk"+fullpath+"_120x120.jpg";
	}
}

function zeroFill(number, width) {
	width -= number.toString().length;
	if (width > 0) {
		return new Array(width + (/\./.test(number)?2:1)).join('0') + number;
	}
	return number + "";
}

function tabClick(tabname,divname,num,count) {
	for (var q=1;document.getElementById(tabname+q);q++) {

		document.getElementById(tabname+q).className = (num==q)?'tabSelected':'tab';
		if (divname != '' && document.getElementById(divname+q)) {
			document.getElementById(divname+q).style.display = (num==q)?'':'none';
		}

	}
	usage_log('show',divname,num);
	if (typeof resizeContainer != 'undefined') {
		setTimeout(resizeContainer,100);
	}
	return false;
}
function refreshImage(source) {
     //calling the ombed api should in theory cause the small thumbnail get created
     $.getJSON("http://api.geograph.org.uk/api/oembed?url="+encodeURIComponent(source.src)+"&output=json&callback=_",function(data) {
         source.onerror = null;
         source.src = source.src;
     });
}


/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0
https://github.com/Teun/thenBy.js ***/
firstBy=(function(){function e(f){f.thenBy=t;return f}function t(y,x){x=this;return e(function(a,b){return x(a,b)||y(a,b)})}return e})();
