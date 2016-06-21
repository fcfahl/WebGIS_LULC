/*
 This code is Copyright 2016 Barry Hunter
 and licenced for reuse under Creative Commons Attribution-Share Alike 3.0 licence.
 http://creativecommons.org/licenses/by-sa/3.0/

 Source: http://www.geograph.org/playground/

 */

var endpoint = "http://api.geograph.org.uk/api-facetql.php";
var geograph_domain = (window.location.hostname=='ww2.scenic-tours.co.uk')?'www.geograph.org.uk':window.location.hostname;

var months = [ "Unknown", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
var shortmonths = ['unkn', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function reset() {
   window.location.hash='';
   window.location.reload();
   return false;
}

function gt() {
   $(window).scrollTop(0);
   return false;
}

(function ($, undefined) {
    $.fn.clearable = function () {
        var $this = this;
        $this.after('<div class="clear-holder" />');
        var helper = $('<span class="clear-helper" title="clear input">&#215;</span>');
        $this.next().append(helper);

        helper.click(function(){
            $this.val("").trigger('keypress').focus();
        });
    };
})(jQuery);

if (!String.prototype.trim) {
     String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
}
if (!String.prototype.addslashes) {
     String.prototype.addslashes=function() {
       return this.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
     };
}

var refreshOnCtrlRelease = false;
var ctrlHeldDown = false;
var firstFilter = null;
var firstFacet = null;

$(document).keydown(function(e){
        if (e.target && e.target.form) {
            return;
        }
	switch(e.which){
		case 37: case 38: case 80: //up/right
                         if (guiders && $(".guider:visible").length > 0) {
                              guiders.prev();
                         } else if (image) {
                              loadImage(imageidx-1,-1);
                         } else if ($('#prevBtn').length > 0) {
                              $('#prevBtn').get(0).click();
                         }
                         break;
		case 39: case 40: case 78: case 32: //down/left/space
                         if (guiders && $(".guider:visible").length > 0) {
                              guiders.next();
                         } else if (image) {
                              loadImage(imageidx+1,1);
                         } else if ($('#nextBtn').length > 0) {
                              $('#nextBtn').get(0).click();
                         }
                         break;
		case 49: case 50: case 51: case 52: case 53:  //1-5
                         if ($('#nextBtn').length) {
                              loadThumbnails(parseInt(e.which,10)-48); //49=1,53=5 etc
                         }
                         break;
                case 27: //esc
                         closeImage();
                         if (guiders) guiders.hideAll();
                         $('#helpdiv, #historydiv, #facetsearch, #imagediv, #lightbox-background, #overviewmap, #myriadmap').hide();
                         break;
                case 17: //ctrlHeldDown = true;
                         break;
                case 112: //F1
                         if (guiders && $(".guider:visible").length > 0) {
                             guiders.hideAll();
                         }
                         $('#lightbox-background').show();
                         $('#helpdiv').show('fast');  e.preventDefault(); break;

	}
}).keyup(function(e){
   if (e.which == 17) {
       if (refreshOnCtrlRelease) {
           loadThumbnails();
           loadFacets();
           refreshOnCtrlRelease = false;
           firstFilter = null;
       }
       ctrlHeldDown = false;
   }
});

function toggleLightBox(id) {
   var state = $(id).is(":hidden");
   $(id+', #lightbox-background')[state ? "show" : "hide"]();
   usage_log('show','div',id);
}

function showOverviewMap(lat,lng,id,hash) {
     var size = ($(window).width() > 1100)?300:150;
size =250;
     url = "http://maps.google.com/maps/api/staticmap?markers=size:med|"+lat+","+lng+"&zoom=7&size="+size +"x"+size+"&sensor=false&style=feature:administrative.country%7Celement:labels%7Cvisibility:off";

     $('#overviewmap').empty().append($('<img/>').attr('src',url.replace(/zoom=\d/,'zoom=12'))).show('fast')
              .append('<br/><br/>').append($('<img/>').attr('src',url));

     if (id && hash) {
         url = "http://www.geograph.org.uk/map_frame.php?id="+id+"&hash="+hash
         $('#overviewmap').prepend('<br/><br/>').prepend($('<iframe scrolling="no" frameborder="0"/>').attr('src',url));
     }

}
function hideOverviewMap() {
     $('#overviewmap').hide();
}

var togglecount = 0;
function togglerBar(divid,that) {
   $('#'+divid).toggle(0,function() {

      src =  $(that).find('img').attr('src');
      if ($(this).css('display') == 'block') {
         $(that).find('img').attr('src',src.replace(/closed/,'open'));
         $(that).find('small').hide();
      } else {
         $(that).find('img').attr('src',src.replace(/open/,'closed'));
         if (togglecount < 4)
             $(that).find('small').show();
      }

      if ($.browser.msie && divid == 'advancedbar' && map) {
          $('.mainarea').last().height($(window).height()-$('.mainarea').first().innerHeight()-30);

      }

      togglecount = togglecount + 1;
   });
   if (guiders && $(".guider:visible").length > 0 && guiders._currentGuiderID == 'g_toggler') {
       setTimeout(function() { guiders.hideAll(true).show('g_toggler2'); }, 200);
   }
   return false;
}

var sorting = '';
var direction = 'down';
var sample = '';

$(function() {
   $('#orderBy li').click(function() {
       if ($(this).hasClass('disabled') || $(this).hasClass('selected')) {
            return false;
       }
       $('#orderBy li').removeClass("selected");

       sorting = $(this).attr('id').replace(/order_/,'');
       $(this).addClass("selected");
       if (sorting.length > 0)
            $('#orderBy li').removeClass("autoselected");

       if (sorting == 'taken' || sorting == 'submitted') {
            sorting = sorting + '_' + direction;
            $('#orderDirection').show();
       } else {
            $('#orderDirection').hide();
       }

       loadThumbnails();
       //loadFacets();
       usage_log('set','sorting',sorting);
   });
   $('#orderDirection li').click(function() {
       if ($(this).hasClass('selected')) {
            return false;
       }
       $('#orderDirection li').removeClass("selected");
       direction = $(this).attr('id').replace(/direction_/,'');
       $(this).addClass("selected");

       sorting = sorting.replace(/_\w+/,'_' + direction);

       loadThumbnails();
       //loadFacets();
       usage_log('set','sorting',sorting);
   });
   $('#sampleBy li').click(function() {
       if ($(this).hasClass('disabled') || $(this).hasClass('selected')) {
            return false;
       }
       $('#sampleBy li').removeClass("selected");
       sample = $(this).attr('id').replace(/sample_/,'');
       $(this).addClass("selected");

       loadThumbnails();
       //loadFacets();
       usage_log('set','sample',sample);
   });

	if (typeof showMarkedImages != 'undefined') {
		showMarkedImages();
	}

});

function selectOption(key,value) {
    if (key == 'order') {
       if (value.indexOf('taken') == 0 || value.indexOf('submitted') == 0) {
            var split = value.split(/_/);

            $('#orderDirection li').removeClass("selected");
            $('#direction_'+split[1]).addClass("selected");

            value = split[0];

            $('#orderDirection').show();
       } else {
            $('#orderDirection').hide();
       }
    }

    $('#'+key+'By li').removeClass("selected");
    $('#'+key+'_'+value).addClass("selected");
}

var guiders = null;

$(function() {
jQuery.cachedScript = function(url, success) {

  return jQuery.ajax({
    dataType: "script",
    cache: true,
    url: url,
    success: success
  });
};
});

function startTour() {
    if (!guiders) {
        guiders = 'started'; //just to prevent repeats while still loading...

        $('head').append('<link rel="stylesheet" href="http://s1.geograph.org.uk/guider/guiders-1.2.8.css" type="text/css" />');

        $.cachedScript('http://s1.geograph.org.uk/guider/guiders-1.2.8.js', function() {
            $.cachedScript('http://s1.geograph.org.uk/guider/browser_guider.v7.js', function() {
                setTimeout('startTour()',100);
            });
        });
        return false;
    }
    $(function() {
        guiders.show('g_welcome');
    });
    return false;
}

////////////////////////////////
// SETUP AND DEALING WITH HASH CHANGES/HISTORY

function grabLink(that) {
    if ($(that).hasClass('disabled')) {
        return false;
    }
    $(that).addClass('disabled');
    $.getJSON("http://www.geograph.org.uk/stuff/getlink.php?url="+encodeURIComponent(window.location.href)+"&callback=?",function(shorturl) {
        if (shorturl.ok) {
            prompt("Short URL to this view:",shorturl.tinyurl);
        } else {
            alert("failed :(");
        }
        $(that).removeClass('disabled');
    });
    usage_log('use','link',window.location.href);
    return false;
}

function updateLink(that) {
    that.href = window.location.href;
}

function setByValue(ele,value) {
        for(q=0;q<ele.options.length;q++)
                if (ele[q].value == value)
                        ele.selectedIndex = q;
}

var disable_hashevent = false;

$(function() {

  $("#facet_q").clearable();
  $("#q").clearable();
  $("#location").clearable();
  $('#lightbox-background').click(function (){
      $('#helpdiv, #historydiv, #facetsearch, #imagediv, #lightbox-background').hide();
  });
  $('#topbar .clear-helper').hide();

  $(window).hashchange( function(){
    if (!disable_hashevent && window.location.hash.length> 0) {
       $('#q').attr('value','');
       filters = new Array();
       $('#filterbar li').remove();
       markedfilter = false;
       var mypage = 1;
       var bits = window.location.hash.replace(/^#/,'').replace(/\+/g,'%20').replace(/q=Last%20(\d+)%20days?%20/,'days=$1/q=').replace(/q=Older-Images%20/,'q=').split(/\//);
       var list = $('#searchin input').attr('checked',true);
       for (var q=1;q<bits.length;q++) {
           if (m = bits[q].match(/^showhelp/)) {
               $('#helpdiv, #lightbox-background').show('fast');
           } else if (m = bits[q].match(/^showtour/)) {
               startTour();
           } else if (m = bits[q].match(/^f=(.*)/)) {
               m[1] = m[1].replace(/C/,'HIJK');
               list.attr('checked',false);
               for(idx=0;idx<m[1].length;idx=idx+1) {
                  var needle = m[1].charAt(idx);
                  list.each(function(index) {
                     if ($(this).attr('title') == needle) {
                         $(this).attr('checked',true);
                         return false;
                     }
                  });
               }
           } else if (m = bits[q].match(/^q=(.*)/)) {
               $('#q').attr('value',decodeURIComponent(m[1]));
           } else if (m = bits[q].match(/^loc=(.*)/)) {
               setLocationBox(decodeURIComponent(m[1]),null,true);

               if (!(m[1].toUpperCase().match(/^\s*(\w{1,2}\d{2,10})/) && !m[1].toUpperCase().match(/^[^:]*\b([A-Z]{1,2})([0-9]{1,2}[A-Z]?) *([0-9]?)([A-Z]{0,2})\b/i))) {
                      isautosearch = true;
                      $( "#location" ).autocomplete('search'); //open the autocomplete so the user can select...
               }

           } else if (m = bits[q].match(/^page=(\d+)/)) {
               mypage = parseInt(m[1],10);
           } else if (m = bits[q].match(/^content_id=(\d+)/)) {
               content_id = parseInt(m[1],10);
               if (!content_title)
                   content_title = 'In Collection';
               $('#filterbar').append('<li id="filtercontent_id" class="plus"><a href="#" onclick="return deleteSpecial(\'content\',event);" title="delete filter">&#215;</a> '+content_title+'</li>');
           } else if (m = bits[q].match(/^content_title=([^\/]+)/)) {
               content_title = decodeURIComponent(m[1]);
           } else if (m = bits[q].match(/^my_square=(\d+)/)) {
               my_square = parseInt(m[1],10);
               $('#filterbar').append('<li id="filtermy_square" class="plus"><a href="#" onclick="return deleteSpecial(\'squares\',event);" title="delete filter">&#215;</a> Your Squares</li>');
           } else if (m = bits[q].match(/^since=(\d+)/)) {
               since_ts = parseInt(m[1],10);
               var days = Math.round(((new Date().getTime() / 1000)-since_ts)/(60*60*24));
               $('#filterbar').append('<li id="filtersince" class="plus"><a href="#" onclick="return deleteSpecial(\'since\',event);" title="delete filter">&#215;</a> Last '+days+' Days</li>');
           } else if (m = bits[q].match(/^days=(\d+)/)) {
               since_days = parseInt(m[1],10);
               since_ts = Math.round(new Date().getTime() / 1000)-(60*60*24*since_days);
               $('#filterbar').append('<li id="filtersince" class="plus"><a href="#" onclick="return deleteSpecial(\'since\',event);" title="delete filter">&#215;</a> Last '+since_days+' Days</li>');
           } else if (m = bits[q].match(/^taken=(\d{4}-\d{2}-\d{2})?,(\d{4}-\d{2}-\d{2})?/)) {
               specialFilter('takenrange',true);
               from_date = m[1];
               to_date = m[2];
               $('#starttaken').val(from_date);
               $('#endtaken').val(to_date);
           } else if (m = bits[q].match(/^submitted=(\d+)?,(\d+)?/)) {
               specialFilter('daterange',true);
               since_ts = parseInt(m[1],10);
               before_ts = parseInt(m[2],10);
               if (since_ts)
                  $('#startdate').val(from_timestamp(since_ts));
               if (before_ts)
                  $('#enddate').val(from_timestamp(before_ts));
           } else if (m = bits[q].match(/^sort=(\w+)/)) {
               sorting = m[1];
               selectOption('order',sorting);
           } else if (m = bits[q].match(/^marked=(\d+)/)) {
               specialFilter('marked',true);
               markedfilter = parseInt(m[1],10);
           } else if (m = bits[q].match(/^sample=(\w+)/)) {
               sample= m[1];
               selectOption('sample',sample);
           } else if (m = bits[q].match(/^display=(\w+)/)) {
               setByValue($('#display').get(0),m[1]);
           } else if (m = bits[q].match(/^group=(\w+)/)) {
               setByValue($('#fgroup').get(0),m[1]);
           } else if (m = bits[q].match(/^n=(\d+)/)) {
               setByValue($('#n').get(0),m[1]);
           } else if (m = bits[q].match(/^gorder=([\w%\+ ]+)/)) {
               setByValue($('#gorder').get(0),decodeURIComponent(m[1]));
           } else if (m = bits[q].match(/^image=(\d+)/)) {
               imagetoload = parseInt(m[1],10);

               //check if the image is in images array already, if so load it!
               if (images && images.length > 1) {
                  for(var q=0;q<images.length;q++) {
                     if (images[q].id == imagetoload) {
                         loadImage(q);
                         imagetoload = null;
                     }
                  }
               }

           } else if (m = bits[q].match(/^pagesize=(\d+)/)) {
               perpage = parseInt(m[1],10);
               var ele = $('#pagesize').get(0);
               for(var w=0;w<ele.options.length;w++)
                  if (ele.options[w].value == m[1])
                      ele.options[w].selected = true;
           } else if (m = bits[q].match(/^dist=(\w+)/)) {
               setDistanceDropdown(parseInt(m[1],10));
           } else if (m = bits[q].match(/^(\w+)(%20|\+| )-(.*)/)) {
               var txt = decodeURIComponent(m[3]).replace(/(^\(?"|"\)?$)/g,'').replace(/" \| "/g,' | ');
               addFilter(m[1],txt,txt.replace(/^top:/g,''),0,1);
           } else if (m = bits[q].match(/^(\w+)(%20|\+| )(.*)/)) {
               var txt = decodeURIComponent(m[3]).replace(/(^\(?"|"\)?$)/g,'').replace(/" \| "/g,' | ');
               addFilter(m[1],txt,txt.replace(/^top:/g,''),1,1);
           }
       }
       loadThumbnails(mypage);
       loadFacets();
    }
  });

  $(window).hashchange();

  //hatipp to http://stackoverflow.com/questions/5802467/prevent-scrolling-of-parent-element
  $(".lightbox").bind('mousewheel', disableParentScroll);
  $('#q').focus();

  if (window.location.hash.length == 0) {
       loadThumbnails();
       loadFacets();
  }
});

function disableParentScroll(e, d) {
    if (d > 0 && $(this).scrollTop() == 0)
        e.preventDefault()
    else
        if (d < 0 &&  $(this).scrollTop() == $(this).get(0).scrollHeight - $(this).innerHeight())
                e.preventDefault()
}

var lastHistory = '';

function updateHash() {
    var bits = [''];
    var historyString = '';

    var list = $('#searchin input:checked');
    var searchintotal = $('#searchin input').length;
    var str = new Array();
    if (list.length > 0 && list.length < searchintotal) {
        list.each(function(index) {
           str.push($(this).attr('title'));
        });
        bits.push("f="+str.join(''));
    }

    var query = $('#q').attr('value');
    if (query.length>0) {
       bits.push("q="+encodeURIComponent(query).replace(/%20/g,'+'));
       historyString = '{'+query+'}';
       if (list.length > 0 && list.length < 7) {
           historyString = historyString + '[in '+list.length+' fields]';
       }
       $('#q').css('background-color','lightgreen');
       $('#q').parent().find('.clear-helper').show();
    } else {
       $('#q').css('background-color','');
       $('#q').parent().find('.clear-helper').hide();
    }

    var loc= $('#location').attr('value');
    if (loc.length>0) {
       bits.push("loc="+encodeURIComponent(loc));

       var dis= $('select#distance option:selected');
       bits.push("dist="+encodeURIComponent(dis.val()));

       historyString = dis.text()+'/{'+loc+'}';
       $('#location').css('background-color','lightgreen');
       $('#location').parent().find('.clear-helper').show();
    } else {
       $('#location').css('background-color','');
       $('#location').parent().find('.clear-helper').hide();
    }
    if (content_id) {
       bits.push("content_id="+encodeURIComponent(content_id));
       historyString = historyString + " Content #"+content_id;
    }
    if (my_square) {
       bits.push("my_square="+encodeURIComponent(my_square));
       historyString = historyString + " in Your Squares";
    }
    if (since_ts || before_ts) {
       if (since_days) {
          bits.push("days="+encodeURIComponent(since_days));
          historyString = historyString + ", submitted in last "+(since_days+0)+" days";
       } else {
          bits.push("submitted="+encodeURIComponent(since_ts || '')+','+encodeURIComponent(before_ts || ''));
           historyString = historyString + ", submitted between "+
                (since_ts?from_timestamp(since_ts):'any') + " and "+
                (before_ts?from_timestamp(before_ts):'any');
       }
    }
    if (from_date || to_date) {
       bits.push("taken="+encodeURIComponent(from_date || '')+','+encodeURIComponent(to_date || ''));
       historyString = historyString + ", submitted between "+
                (from_date || 'any') + " and "+
                (to_date || 'any');
    }
    if (markedfilter) {
       bits.push("marked="+markedfilter);
       historyString = historyString + ", in your marked list";
    }
    txt = getFilterUrl();
    if (txt) {
        var parts = txt.split(/ @/);
        for(var q=1;q<parts.length;q++)
           bits.push(encodeURIComponent(parts[q]).replace(/%20/g,'+'));

        for(var q=0;q<filters.length;q++)
           if (filters[q][F_ENABLED])
               historyString = historyString + (filters[q][F_INCLUSIVE]?' +{':' -{')+filters[q][F_VALUE]+'}';
    }

    var display = $('#display').attr('value');
    if (display && display  != '') {
        bits.push("display="+(display));
        var ele = $('#display').get(0);
        historyString = historyString + ' ('+ele.options[ele.selectedIndex].text+')';
    }

    if (display && display == 'group') {
        var ele = $('#fgroup').get(0);
        bits.push("group="+ele.options[ele.selectedIndex].value);

        var n = $('#n').val();
        bits.push("n="+n);

        var gorder = $('#gorder').get(0);
        bits.push("gorder="+encodeURIComponent(gorder.options[gorder.selectedIndex].value));

        historyString = historyString + ' ('+n+' Grouped: '+ele.options[ele.selectedIndex].text+' by '+gorder.options[gorder.selectedIndex].text+')';

    } else if (perpage && perpage != 20) {
        bits.push("pagesize="+(perpage));
        historyString = historyString + ' ('+perpage+')';
    }

    if (sorting && sorting != '') {
        bits.push("sort="+(sorting));
        var split = sorting.split(/_/);
        var t1 = $('#order_'+split[0]).text();
        if (split[1])
            t1 = t1+' '+((split[1] == 'up')?'Earliest':'Recent');
        historyString = historyString + ' ('+t1+')';
    }
    if (sample && sample != '') {
        bits.push("sample="+(sample));
        var t1 = $('#sample_'+sample).text();
        historyString = historyString + ' ('+t1+')';
    }
    if (currentpage && currentpage > 1) {
        bits.push("page="+(currentpage));
        historyString = historyString + ' -- page '+currentpage;
    }

    if (imageidx && images[imageidx]) {
        bits.push('image='+images[imageidx].gridimage_id);
        historyString = historyString + ' :: Image #'+images[imageidx].gridimage_id;
    } else if (imagetoload) {
        bits.push('image='+imagetoload);
        historyString = historyString + ' :: Image #'+imagetoload;
    }
    if (bits.length == 1)
        bits[0] = 'start';

    if (historyString != lastHistory) {
        addHistoryEvent(historyString,bits.join('/'));
    }
    lastHistory = historyString;

    disable_hashevent = true;
    window.location.hash = '!'+bits.join('/');
    setTimeout(function () {
        disable_hashevent = false;
        document.title = "Geograph Browser :: "+historyString;
    } ,500);
}
var myCounter = 1;

function addHistoryEvent(text,newHash) {
    var ele = $('ol#historylist li');
    if (ele.length > 1) {
        var foundCurrent = -1;
        var foundSame = -1;
        ele.each(function(index) {
            if (this.title == text) {
                foundSame = index;
            }
            if ($(this).attr('class') == 'current') {
                foundCurrent  = index;
            }
        });
        if (foundSame > -1) {
            $('ol#historylist li.current').removeClass('current');
            $(ele.get(foundSame)).addClass('current');
            return;
        }
        if (foundCurrent > 0) {
            ele.each(function(index) {
                if (index < foundCurrent) {
                    var val = parseInt($(this).css('marginLeft'),10);
                    $(this).css('marginLeft',(val + 30)+'px');
                }
            });
        }
    }
    $('ol#historylist li.current').removeClass('current');

    text = htmlentities(text);

    text2 = text.replace(/\+{/g,'<span class="plus">');
    text2 = text2.replace(/-{/g,'<span class="minus">');
    text2 = text2.replace(/(\w+)\/{/g,'within $1 of <span class="location">');
    text2 = text2.replace(/{/g,'<span class="query">');
    text2 = text2.replace(/}/g,'</span>');

    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    if (minutes < 10){
        minutes = "0" + minutes
    }

    $('ol#historylist').prepend('<li class="current" title="'+text+'" value="'+myCounter+'">'+text2+' <small>'+ hours + ':' + minutes + ' ' + ((hours > 11)?'PM':'AM') + '</small> <input type=button value="Go" onclick="window.location.hash=\''+newHash+'\'"></li>');
    myCounter++;
}

function addCountToHistory(count) {
    var ele = $('ol#historylist li');
    if (ele.length > 0) {
        ele.each(function(index) {
            if (this.title == lastHistory) {
                if ($(this).text().indexOf(' images)') == -1)
                    $(this).append(' ('+count+' images)');
                return;
            }
        });
    }
}

////////////////////////////////
// General Application

var timer = null;
var filters = new Array();
var images = null;
var image = null;
var imageidx = null;
var imagetoload = null;
var perpage = 20;
var currentpage = 1;
var map;
var myCircle;
var infoWindow;
var wgs84location;
var boundsFilter = false;
var savedZoom;
var savedCenter;
var automatedZoom = false;
var content_id = null;
var content_title = null;
var my_square = null;
var before_ts = null;
var since_ts = null;
var since_days = null;
var from_date = null;
var to_date = null;
var markedfilter = false;

function myClick(event) {
    if (timer != null) {
         clearTimeout(timer);
    }
    timer = setTimeout(function() {
        loadThumbnails();
        loadFacets();
        timer = null;
    },900);
    return true;
}

function myPress(that,event) {
    if (timer != null) {
         clearTimeout(timer);
    }

    var unicode=event.keyCode? event.keyCode : event.charCode;

    if (unicode == 13) { //enter
           $('#loader').hide();
           if (that.id == 'q') {
               if ($('#topbar li.selected').length > 0) {
                   $('#topbar li.selected a').get(0).click(); //.trigger('click'); doesnt seem to work?
               } else {
                   loadThumbnails();
                   loadFacets();
                   $('#autocomplete').hide('fast');
                   usage_log('query','q',that.value);
               }
           } else if (that.id == 'location') {
               if ($('#topbar li.selected').length > 0) {
                   $('#topbar li.selected a').get(0).click(); //.trigger('click'); doesnt seem to work?
               } else {
                   $('#autocomplete').hide('fast');
                   usage_log('query','location',that.value);
               }
           } else if (that.id == 'facet_q') {
               searchFacet2();
               usage_log('query',searchFacetSaved[0],that.value);
           }
           if (event.preventDefault) {
                   event.preventDefault();
                   event.stopPropagation();
           }
           if (document.all) {
                   event.cancelBubble = true;
           }

           return false;
    }

    timer = setTimeout(function() {
         if (that.id == 'q') {
             $('#loader').show();
             //loadSuggestions(that,event);
             var display = $('#display').attr('value');
             if (display == '' || display == 'plus' || display == 'details')
                loadThumbnails(1,undefined,10);
         } else if (that.id == 'location') {
             if (that.value == '') {
                setLocationBox(that.value,false);
             }
             //text entry is captured by the autocomplete plugin
         } else if (that.id == 'facet_q') {
             searchFacet2();
         }
         timer = null;
    },400);
    return
}

function myDown(that,event) {
    var unicode=event.keyCode? event.keyCode : event.charCode;

    if (unicode == 40) { //down
           var ele = $('#topbar li.selected');

           if (ele.length > 0) {
                var next = ele.next();
                if (next.length) {
                      ele.removeClass('selected');
                      next.addClass('selected');
                }
           } else if (that.id == 'q') {
                //$("#autocomplete").show('fast');
                //$("#autocomplete li").first().addClass('selected');
           }

    } else if (unicode == 38) { //up
           var ele = $('#topbar li.selected');

           if (ele.length > 0) {
                var prev = ele.prev();
                if (prev.length) {
                      ele.removeClass('selected');
                      prev.addClass('selected');
                }
           }
    }
}

  function loadSuggestions(that,event) {

    param = 'q='+encodeURIComponent(that.value+'*')+'&limit=40';
    $.getJSON("http://wac.3c13.edgecastcdn.net/803C13/nearby/geograph/sample2.php".replace(/sample/,'sample_auto')+"?"+param+"&callback=?",

    // on search completion, process the results
    function (data) {

      var div = $('#autocomplete').empty().show('fast');
      div.append('<input type="button" onclick="$(\'#autocomplete\').hide();" value="Close" style="float:right;"/>');
      div.append('<ul></ul>');

      var ul = $('#autocomplete ul');

      if (data && data.matches && data.matches.length > 0) {

        $.each(data.matches, function(index,value) {
          var type = value[0];
          var text = value[1];
          ul.append("<li>"+type+" - <a href=\"javascript:void(addFilterText('"+type+"','"+text+"'))\"><span class=\"plus\" title=\"add this as a active filter\">"+text+"</span></a></li>");
        });
         ul.append("<li>"+data.matches.length+" of "+data.total_found+"</li>");


      } else {
        //ul.append("<li>no results</li>");
        $('#autocomplete').hide();
      }
    });
  }

function getWgs84FromGrid(query) {
	var gridref = query.toUpperCase().match(/^\s*(\w{1,2}\d{2,10})/);
        if (!gridref) {
                return false;
        }
	var grid=new GT_OSGB();
	var ok = false;
	if (grid.parseGridRef(gridref[1])) {
		ok = true;
	} else {
		grid=new GT_Irish();
		ok = grid.parseGridRef(gridref[1])
	}
        if (ok) {
		//convert to a wgs84 coordinate
		return grid.getWGS84(true);
        } else {
                return false;
        }
}

var isautosearch = false;

$(function () {

	$( "#location" ).autocomplete({
		minLength: 1,
                search: function(event, ui) {
                        if (this.value.search(/^\s*\w{1,2}\d{2,10}\s*$/) > -1) {
                 		ok = getWgs84FromGrid(this.value);
		                if (ok) {
                    			setLocationBox(this.value,ok);
                    	        } else {
		                   	$("#message").html("Does not appear to be a valid grid-reference '"+this.value+"'");
                                        $("#placeMessage").show().html("Does not appear to be a valid grid-reference '"+this.value+"'");
                                        setTimeout('$("#placeMessage").hide()',3500);
                 		}
                                $( "#location" ).autocomplete( "close" );
                                return false;
                        }
                },
                source: function( request, response ) {

                	_get_tags(request.term,'finder/places',function(data) {

				if (!data || !data.items || data.items.length < 1) {
					$("#message").html("No places found matching '"+request.term+"'");
                                        $("#placeMessage").show().html("No places found matching '"+request.term+"'");
                                        setTimeout('$("#placeMessage").hide()',3500);
		                        return;
				}
                                var results = [];
				$.each(data.items, function(i,item){
                                        results.push({value:item.gr+' '+item.name,label:item.name,gr:item.gr,title:item.localities});

				});
				results.push({value:'',label:'',title:data.query_info});
				results.push({value:'',label:'',title:data.copyright});
                        	response(results);

                	        if (isautosearch && results.length == 3) {
                                        setLocationBox(results[0].value);
                                        $("#location").autocomplete("close");
                                        isautosearch = false;
                                        return;
                                }
                                isautosearch = false;
                	});

		},
                select: function(event,ui) {
                        setLocationBox(ui.item.value,false,false);
                        return false;
                }
	})
        .data( "autocomplete" )._renderItem = function( ul, item ) {
                var re=new RegExp('('+$("#location").val()+')','gi');
		return $( "<li></li>" )
			.data( "item.autocomplete", item )
			.append( "<a>" + item.label.replace(re,'<b>$1</b>') + " <small> " + (item.gr||'') + "<br>" + item.title.replace(re,'<b>$1</b>') + "</small></a>" )
			.appendTo( ul );
	};


});


function setLocationBox(value,wgs84,skipautoload) {
     $('#location').val(value);

     if (value.length == 0) {
                if (wgs84location) {
                        wgs84location = null;
                        $('#distance').attr('disabled',true).parent().hide();
                        $('#clearMapLink').hide();
                        if (sorting == 'distance') {
                              sorting = '';
                              selectOption('order','');
                        }
                        $('#order_distance').addClass('disabled').text("Distance");
                        $('#samplebar').show();
                        loadThumbnails();
                        loadFacets();
                }
                if (map && myCircle) {
                        myCircle.setMap(null);
                }
                wgs84location = null;
                return false;
     }

     $("#order_distance").removeClass('disabled').html("Distance<small> from "+value.replace(/^\w{1,2}\d{4} /,'')+"</small>");
     $('#topbar li.selected').removeClass('selected');
     $('#samplebar').hide();
     if (sample) {
           sample = '';
           selectOption('sample','');
     }
     if ($('#display').val().indexOf('map') == 0) {
          $('#clearMapLink').show();
     }

     wgs84location = null;
     if (wgs84) {
          wgs84location = wgs84;
     } else {
          ok = getWgs84FromGrid(value);

          if (ok) {
                   wgs84location = ok;
          }
     }
     $('#distance').attr('disabled',false).parent().show();

     if (!skipautoload && wgs84location) {
          loadThumbnails();
          loadFacets();
     }
     usage_log('set','location',value);
     return false;
}

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

////////////////////////////////
// SHOW THUMBNAILS

function tryAnother() {
    var ele = $('#display').get(0);
    ele.selectedIndex = Math.floor(Math.random()*ele.options.length);
    loadThumbnails();
}

var displayCounter=0;

function loadThumbnails(page,clear,thumblimit) {
    var display = $('#display').attr('value');

if (display == 'map_dots') {
    $('.toomany').show().attr('disabled',false);
} else {
    $('.toomany').hide().attr('disabled',true);
    if (perpage > 100) {
        $('#pagesize').val(100);
        perpage=100;
    }
}

    if (map) {
          if (display.indexOf('map') == 0) {
               if (wgs84location) {
                   var newLatLng = new google.maps.LatLng(wgs84location.latitude,wgs84location.longitude);
                   if (wgs84location && myCircle && (!myCircle.getCenter() || !myCircle.getCenter().equals(newLatLng))) {
                       myCircle.setCenter(newLatLng); //calling the same latlng as current triggers center_changed.
                       automatedZoom = true;
                       map.fitBounds(myCircle.getBounds());
                       if (!myCircle.getMap()) {
                            myCircle.setMap(map);
                       }
                   }
               }
               updateHash();
               getMapImages();
               return;
          } else {
               $('#results').empty().css({position:'',backgroundColor:'',overflow:''}); //undo stuff set by gmaps
               map = null;
               myCircle = null;
               $("#message").html('Clearing Map...').css({left:'inherit',right:'0'});
          }
    }

  var query = getTextQuery() + getFilterQuery();

  var data = {
     match: query,
     limit: thumblimit?thumblimit:perpage,
     select: "id,title,realname,user_id,hash,grid_reference,takenday"
  };

    if (page && page > 1) {
        data.offset=((page-1)*data.limit);
    } else {
        var page = 1;
    }
    usage_log('view','page',page);
    currentpage = page;
    updateHash();

  data = setSortSampleGeo(data,true);

  switch(sorting) {
     case '': $('#orderBy li').removeClass("autoselected");
              if (wgs84location) {
                      data.order="geodist ASC"; data.option='ranker=none';
                      $('#order_distance').addClass("autoselected");
              } else if ($('#q').attr('value').length == 0) {
                      data.order="id DESC"; data.option='ranker=none';
                      $('#order_submitted').addClass("autoselected");
              } else {
                      $('#order_relevance').addClass("autoselected");
              }
  }

  if (data.order&& data.order== "id DESC" && data.match == '' && !$.param( data ).match(/filter/) ) {
     //bust the cache!
     data.random = (new Date()).toDateString();
     data.recent = 1; //small optimization to only use the last 1/4 shard.
  }
  switch(display) {
     case 'group': return loadGroupBy(true); break;

     case 'map':
     case 'map_dots': return loadMap(); break;
     case 'date_slider': return loadDateSlider(display,sorting); break;

     case 'details': data.select += ',imageclass,tags,subjects,contexts,country,county,place'; break;
  }

  $("#message").html('Loading...');
  $('#samplebar, #sortbar, #pagesize').show();
  $('#groupbar').hide();

  _call_cors_api(
    endpoint,
    data,
    'serveCallback',
    function(data) {
     if (data && data.rows) {
        hideOverviewMap();

        if (typeof clear !== "undefined") {
            $("#results div.paging").remove();
            $("#results br").remove();
        } else {
            $("#results").empty();
            images = [];
        }

        var loaded = 0;

        if (display == 'details') {
          $("#results").append('<table id="resultstable"><tbody></tbody></table>');
          $.each(data.rows,function(index,value) {
            value.gridimage_id = value.id;
            value.thumbnail = getGeographUrl(value.id, value.hash, 'small');

            images.push(value);
            var year = value.takenday.substr(0,4);
            if(value.title.indexOf(year) == 0)
                 value.title = value.title.replace(new RegExp(year+'[\s:?]*\s+'),'');

            var rows = [];
            var first = '<a href="http://'+geograph_domain+'/gridref/'+value.grid_reference+'">'+value.grid_reference+'</a> : <a href="http://'+geograph_domain+'/photo/'+value.gridimage_id+'">'+value.title+'</a> by <a href="http://'+geograph_domain+'/profile/'+value.user_id+'">'+value.realname+'</a>';
            rows.push('Taken: '+space_date(value.takenday));
            if (value.imageclass.length) {
                 rows.push('Category: '+value.imageclass);
            }
            if (value.contexts.length) {
                 var list = value.contexts.replace(/(^\s*_SEP_\s*|\s*_SEP_\s*$)/g,'').split(/ _SEP_ /);
                 rows.push('Geographical Context: '+list.join(' &middot; '));
            }
            if (value.subjects.length) {
                 var list = value.subjects.replace(/(^\s*_SEP_\s*|\s*_SEP_\s*$)/g,'').split(/ _SEP_ /);
                 rows.push('Subject: '+list.join(' &middot; '));
            }
            if (value.tags.length) {
                 var list = value.tags.replace(/(^\s*_SEP_\s*|\s*_SEP_\s*$)/g,'').split(/ _SEP_ /);
                 rows.push('Tags: '+list.join(', '));
            }
            rows.push('Location: '+value.country+' &gt; '+value.county+' &gt; '+value.place+'');
            //rows.push('');

            $("#resultstable > tbody:last").append('<tr><td align="center"><a href="http://'+geograph_domain+'/photo/'+value.gridimage_id+'" onclick="return loadImage('+(images.length-1)+');" title="'+value.grid_reference+' : '+value.title+' by '+value.realname+' /'+space_date(value.takenday)+'" class="i"><img src="'+value.thumbnail+'" onerror="refreshImage(this);"/></a></td><td>'+first+'<br/><small>'+rows.join('<br/>')+'</small></td></tr>');
            loaded=loaded+1;
          });
        } else {
          var thumbSize = (display == 'plus')?'med':'small';
          var thumbClass = (display == 'plus')?'thumbmed':'thumb';
          $.each(data.rows,function(index,value) {
            value.gridimage_id = value.id;
            value.thumbnail = getGeographUrl(value.id, value.hash, thumbSize);
            images.push(value);

            $("#results").append('<div class="'+thumbClass+'"><a href="http://'+geograph_domain+'/photo/'+value.gridimage_id+'" onclick="return loadImage('+(images.length-1)+');" title="'+value.grid_reference+' : '+value.title+' by '+value.realname+' /'+space_date(value.takenday)+'" class="i"><img src="'+value.thumbnail+'" onerror="refreshImage(this);"/></a></div>');
            loaded=loaded+1;
          });
        }

        if (data.meta.total_found > perpage && !thumblimit) {
            var pages = Math.ceil(data.meta.total/perpage);
            var start = (page > 10)?(page-10):1;
            var show = (pages > page+10)?(page+10):pages;

            var str = '<div class="paging">';
            if (sorting == 'random') {
               str = str + 'Selection: ';
            } else {
               str = str + 'Page: ';
            }
            if (start > 1) {
                str = str + '<a href="javascript:void(loadThumbnails(1));void(gt())" title="back to the first page">First</a> ... ';
            }
            if (page > 1) {
                str = str + '<a href="javascript:void(loadThumbnails('+(page-1)+'));void(gt())" id="prevBtn">&lt; Prev</a> ';
            }
            for(var i=start;i<=show;i++) {
                if (i == page) {
                   str = str + '<b>'+i+'</b> ';
                } else {
                   str = str + '<a href="javascript:void(loadThumbnails('+i+'));void(gt())">'+i+'</a> ';
                }
            }
            if (show < pages) {
                str = str + '... ';
            }
            if (page < pages) {
                str = str + '<a href="javascript:void(loadThumbnails('+(page+1)+'));void(gt())" id="nextBtn">Next &gt;</a> ';
            }
            if (show < pages && sorting != 'random') {
                str = str + '... '+Math.ceil(data.meta.total/perpage);
            }
            if (data.meta.total_found > perpage) {
                 str = str + ' &middot; [<strong>'+data.meta.total_found+' images</strong>]';
            }
            $("#results").append(str+'</div>');

            if (typeof clear === "undefined") {
                 $("#results").prepend(str.replace(/class="paging"/,'class="paging" style="font-size:0.8em"')+'</div><br/>');
            }

        } else {
            if (thumblimit && loaded < data.meta.total_found) {
                $("#results").append('<div style="float:left;margin:10px;"><input type=button value="load rest of the results" onclick="loadThumbnails();loadFacets();"/>');
            }
            var str = '<div class="paging">';
            str = str + '<small><b>'+data.meta.total_found+'</b> images</small>';
            if (thumblimit && loaded < data.meta.total_found) {
                str = str + ' (Showing '+loaded+" of "+data.meta.total_found+' - <b>Press ENTER to see more</b>)';
            }
            $("#results").append(str+'</div>');
        }

        $("#message").html(loaded+" of "+data.meta.total_found);
        $("#results").append('<br/>');
        addCountToHistory(data.meta.total_found);

        addClassToMarked();

        if (imagetoload) {
          for(var q=0;q<images.length;q++) {
            if (images[q].id == imagetoload) {
              loadImage(q);
            }
          }
          imagetoload = null;
        }

        if (typeof guiders!="undefined" && $(".guider:visible").length == 0 && displayCounter%10==0) {
                $("#results").append('<p>New here? <b><a href="javascript:void(startTour())" style="color:orange">Start Tour</a></b> <small>- take a quick <a href="javascript:void(startTour())">interactive tour</a> highlighting the major features. (or press F1 for more help)</p>');

                if (data.meta.total_found > 50 && display != 'details') {

$("#results").append('<p>Did you know, you can view these images '+

'<a href="#" onclick="gt();setByValue($(\'#display\').get(0),\'details\');loadThumbnails();return false">with Details</a>, '+

'<a href="#" onclick="gt();setByValue($(\'#display\').get(0),\'map_dots\');$(\'#pagesize\').val(100);perpage=100;loadThumbnails();return false">on a Map</a>, '+

'as a <a href="#" onclick="gt();setByValue($(\'#fgroup\').get(0),\'decade\');setByValue($(\'#gorder\').get(0),\'alpha desc\');setByValue($(\'#display\').get(0),\'group\');loadThumbnails();return false">breakdown by Decade</a>, '+

'<a href="#" onclick="gt();setByValue($(\'#fgroup\').get(0),\'takenmonth\');setByValue($(\'#gorder\').get(0),\'alpha desc\');setByValue($(\'#display\').get(0),\'group\');loadThumbnails();return false">Month taken</a>, '+

'<a href="#" onclick="gt();setByValue($(\'#fgroup\').get(0),\'county\');setByValue($(\'#gorder\').get(0),\'alpha desc\');setByValue($(\'#display\').get(0),\'group\');loadThumbnails();return false">County</a>, '+

'or <a href="#" onclick="gt();setByValue($(\'#fgroup\').get(0),\'hectad\');setByValue($(\'#gorder\').get(0),\'images desc\');setByValue($(\'#display\').get(0),\'group\');loadThumbnails();return false">even Hectad</a>? (more available via the Mode dropdown above)</p>');

                }
        }
        displayCounter++;
     } else {
        if (data.meta.time)
           $("#message").html("<span>"+data.meta.time+" seconds</span>");
        else if (data.meta.error)
           $("#message").html(data.meta.error.replace(/^index [\w,]+:/,''));
        $("#results").html("<br/><br/><br/><big>No results found</big>");
     }
    }
  );
}


////////////////////////////////
// SHOWING LARGE IMAGE

function closeImage() {
  imageidx = image = imagetoload = null;
  $('#image').remove();
  $('#imagediv, #overviewmap').hide();
  updateHash();
}
function fixImage(parent) {
    if (!parent)
            parent = '#image';
    usage_log('use','fix',$(parent+' img').last().attr('src'));
    $(parent+' img').last().attr('src',"http://geo-graph.appspot.com/lucky/"+$(parent+' img').last().attr('src'));
    setTimeout(function(){$('#fixbtn').remove();},10);
}
function loadImage(idx,preloadnext,parent) {
  if (images.length == 0 || !images[idx]) {
     return;
  }

  hideOverviewMap();

  gt();
  var ele = $('#image');
  if (!ele.length) {
     if (!parent)
            parent = '#results';
     if ($(parent).find('.paging').length == 2) {
         $(parent).find('br').first().after('<blockquote id="image"></blockquote>');
     } else if ($(parent).find('#sliderbar').length == 1) {
         $('#sliderbar').after('<blockquote id="image"></blockquote>');
     } else {
         $(parent).prepend('<blockquote id="image"></blockquote>');
     }
     ele = $('#image');
  }

  var current = readCookie('markedImages');
  var newtext = 'Mark';
  if (current) {
        var re = new RegExp("\\b"+images[idx].id+"\\b");
        if (current == images[idx].id || current.search(re) > -1)
           newtext = 'marked';
  }

  ele.html('<div style="float:right">[<a href="javascript:void(markImage('+images[idx].id+'));" id="mark'+images[idx].id+'">'+newtext+'</a>]</div>');

  if (images[idx-1]) {
     var str = ['<a href="javascript:void(loadImage('+(idx-1)+',-1))">&lt; Prev</a>'];
  } else {
     var str = ['&lt; Prev'];
  }
  str.push('<a href="javascript:void(closeImage())" title="hide this big image">Close</a>');
  if (images[idx+1]) {
     str.push('<a href="javascript:void(loadImage('+(idx+1)+',1))">Next &gt;</a>');
  } else {
     str.push('Next &gt;');
  }
  ele.append('<div>'+str.join(' | ')+'</div>');

  image = images[idx];
  image.gridimage_id = image.id;
  imageidx = idx;

$('#titleBar').html(image.title);
setTimeout("$('#titleBar').empty();",3000);

    //CC MESSAGE
   ele.append('<div class="ccmessage"><a rel="license" href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank"><img alt="Creative Commons Licence [Some Rights Reserved]" src="http://creativecommons.org/images/public/somerights20.gif"></a> &copy; Copyright <a title="View profile" href="http://www.geograph.org.uk/profile/'+image.user_id+'" xmlns:cc="http://creativecommons.org/ns#" property="cc:attributionName" rel="cc:attributionURL dct:creator" target="_blank">'+image.realname+'</a> and <a href="http://www.geograph.org.uk/reuse.php?id='+image.id+'" target="_blank">available</a> under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/2.0/" about="'+_fullsize(image.thumbnail)+'" title="Creative Commons Attribution-Share Alike 2.0 Licence">Creative Commons Licence</a>.</div>')

    //IMAGE
    .append('<div style="min-height:300px"><a href="http://www.geograph.org.uk/photo/'+image.id+'" title="'+image.grid_reference+' : '+image.title+' by '+image.realname+'" target="_blank"><img src="'+_fullsize(image.thumbnail)+'" class="main"/></a></div>')

    //BUTTONS
    .append('<div class=buttons>'+
       '&middot; <a href="http://'+geograph_domain+'/photo/'+image.id+'" target="_blank">Photo Page</a> '+
       '&middot; <a href="http://'+geograph_domain+'/reuse.php?id='+image.id+'" target="_blank">Find out how to reuse</a> '+
       '&middot; <a href="http://'+geograph_domain+'/more.php?id='+image.id+'" id="larger'+image.id+'" style="display:none;font-weight:bold" target="_blank">Larger sizes available</a> '+
       '&middot; <a href="http://'+geograph_domain+'/stamp.php?id='+image.id+'" target="_blank">More Stamping Options</a> '+
       '&middot;<br/><a href="http://'+geograph_domain+'/reuse.php?id='+image.id+'&download='+image.hash+'" id="download" target="_blank">Download</a> the image to use. Please DO NOT use the image on our servers.</div>')

    //TITLE BAR
    .append('<div class="title"><a href="http://'+geograph_domain+'/photo/'+image.id+'" target="_blank"><b>'+image.title+'</b></a> by <a href="http://'+geograph_domain+'/profile/'+image.user_id+'" target="_blank">'+image.realname+'</a><br/>'+
            'For <a href="http://'+geograph_domain+'/gridref/'+image.grid_reference+'" target="_blank" id="gridref">'+image.grid_reference+'</a>, taken <b>'+space_date(image.takenday)+'</b></span></div>')

    //DESCRIPTION
    .append('<div class="maindesc" id="maindesc'+image.id+'"></div>')

    .append('<div class=buttons>More: '+
      '&middot; <a href="http://'+geograph_domain+'/browser/#!/loc='+image.grid_reference+'/dist=2000">Nearby</a> '+
      '&middot; <a href="http://'+geograph_domain+'/browser/#!/loc='+image.grid_reference+'/dist=100000/realname+%22'+encodeURIComponent(image.realname)+'%22">Same Contributor</a> '+
      '&middot; <a href="http://'+geograph_domain+'/browser/#!/loc='+image.grid_reference+'/dist=100000/takenday+%22'+image.takenday+'%22">Taken Same Day</a> '+
      '&middot; <a href="http://'+geograph_domain+'/related.php?id='+image.id+'&method=quick" target="_blank">Related Images</a> '+
      '</div>')
    ;

    //if(!$("#disable_stamp").is(':checked')) {
        timer11 = setTimeout(function() {
           url = 'http://t0.geograph.org.uk/stamp.php?id='+image.id+'&title=on&gravity=SouthEast&hash='+image.hash;
           $("#image img.main").prop('src',url);
           $("#image #download").prop('href',url);
        }, 1400);
   //}

  //ele.append('<p id="fixbtn"><small>Image over/under exposed? <a href="javascript:void(fixImage())">Try one stop fix</a></small></p>');


  if (preloadnext && images[imageidx+preloadnext] && images[imageidx+preloadnext].title && images[imageidx+preloadnext].thumbnail) {
       var imgloader = new Image();
       imgloader.src = _fullsize(images[imageidx+preloadnext].thumbnail);
  }

  _call_cors_api(
    'http://'+geograph_domain+'/stuff/description.json.php',
    {id: image.gridimage_id},
    'loaddesc',
    function(data) {
      if (data && (data.comment || data.snippets)) {
        if (data.comment) {

if ($("#q").val().length > 2) {
     var re=new RegExp('('+$("#q").val()+')','gi');
     data.comment = data.comment.replace(re,'<b>$1</b>');
}
            $('#maindesc'+image.gridimage_id).html(data.comment.replace(/ href=/g,' target="_blank" href='));
        }
        if (data.snippets) {
          if (data.snippets.length == 1 && !data.comment) {
            $('#maindesc'+image.gridimage_id).html(data.snippets[0].comment.replace(/ href=/g,' target="_blank" href='));
            $('#maindesc'+image.gridimage_id).append('<br/><br/><small>See other images of <a href="http://'+geograph_domain+'/browser/#!/snippets+%22'+encodeURIComponent(data.snippets[0].title)+'%22" title="See other images in '+data.snippets[0].title+' by '+data.snippets[0].realname+'" target="_blank">'+data.snippets[0].title+'</a></small>');
          } else {
            if (data.comment) {
              $('#maindesc'+image.gridimage_id).append('<br/><br/>');
            }
            for(var q=0;q<data.snippets.length;q++) {
              $('#maindesc'+image.gridimage_id).append('<div><strong>'+(data.snippets_as_ref?(q+1)+'. ':'')+'<a href="http://'+geograph_domain+'/browser/#!/snippets+%22'+encodeURIComponent(data.snippets[0].title)+'%22" title="See other images in '+data.snippets[q].title+' by '+data.snippets[q].realname+'" target="_blank">'+data.snippets[q].title+'</a></strong></div>');
              if (data.snippets[q].comment)
                $('#maindesc'+image.gridimage_id).append('<blockquote>'+data.snippets[q].comment.replace(/ href=/g,' target="_blank" href=')+'</blockquote>');
            }
          }
        }
        if ($('#maindesc'+image.gridimage_id).height() > 100) {
            $('#maindesc'+image.gridimage_id).css({height: '100px',overflow: 'auto'}).click(function() {
                $('#maindesc'+image.gridimage_id).css({height: 'inherit'});
                $('#descopener').hide();
            }).prepend('<div style="float:right" id="descopener"><img src="http://s1.geograph.org.uk/img/closed.png" title="Click to expand description"/></div>');

        }
      } else if (data && data.error) {
        var tmp = ele.find('> div').html();
        ele.html(tmp+"<br/><br/>Sorry. This image is no longer available");
      }
    }
  );

  var data = {
     where: "id="+image.gridimage_id,
     limit: 1,
     select: '*'
  }

  _call_cors_api(
    endpoint,
    data,
    'loadmain',
    function(data) {
      if (data && data.rows) {
          var obj = data.rows[0];
          $('#image img,#image #gridref').hoverIntent(function() {
              showOverviewMap(rad2deg(parseFloat(obj.wgs84_lat)),rad2deg(parseFloat(obj.wgs84_long)), (obj.scenti<2000000000)?obj.id:null, obj.hash);
          },function() {
              hideOverviewMap();
          });

          if (obj.original > 0)
            $('#image #larger'+image.gridimage_id).show('slow');

          var list = new Array();
          var single = ['takenyear','takenmonth','takenday','realname','myriad','hectad','grid_reference','imageclass','status','format','country','county','place'];
          var multiple = ['contexts','subjects','buckets','tags','groups','terms'];

          for (var w=0;w<single.length;w++) {
              if (single[w] && obj[single[w]] && obj[single[w]].length > 0) {
                  if (inFilters(single[w],obj[single[w]]) > -1) {
                      list.push('<b>'+obj[single[w]]+'</b>');
                  } else {
                      list.push('<a href="javascript:void(addFilter(\''+single[w]+'\',\''+obj[single[w]]+'\',\''+obj[single[w]]+'\'))" title="show only images in this '+single[w].toUpperCase()+'" class="newFilter">'+obj[single[w]]+'</a>');
                  }
              }
          }
          for (var w=0;w<multiple.length;w++) {
              if (multiple[w] && obj[multiple[w]] && obj[multiple[w]].length > 0) {
                  bits = obj[multiple[w]].replace(/(^\s*_SEP_\s*|\s*_SEP_\s*$)/g,'').split(/ _SEP_ /);
                  for (var ww=0;ww<bits.length;ww++) {
                      if (inFilters(multiple[w],bits[ww]) > -1) {
                          list.push('<b>'+bits[ww]+'</b>');
                      } else {
                          list.push('<a href="javascript:void(addFilter(\''+multiple[w]+'\',\''+bits[ww]+'\',\''+bits[ww]+'\'))" title="show only images in this '+multiple[w].toUpperCase()+'" class="newFilter">'+bits[ww]+'</a>');
                      }
                  }
              }
          }
          if (list.length) {
              ele.append('<div id="attribs">Attributes: '+list.join(', ')+'</a><br/><small><i>(click one to apply as a filter)</i></small></div>');
          }
      }
    }
  );

  usage_log('show','main',image.gridimage_id);

   if (guiders && $(".guider:visible").length > 0 && guiders._currentGuiderID == 'g_content') {
       setTimeout(function() { guiders.hideAll(true).show('g_mainimage'); }, 200);
   }

  updateHash();
  return false;
}

////////////////////////////////
// SHOWING FACETS

function loadFacets() {
    $("#sidebar #holder").remove();
    var create = ($("#sidebar div.facet").length == 0);

    loadFacets_helper(create,'Grid Squares','fmyriad','myriad','myriad','');
    loadFacet('fmyriad','myriad','myriad');

    loadFacets_helper(create,'Countries','fcountry','country','country','checked');
    loadFacet('fcountry','country','country');

    loadFacets_helper(create,'Taken Years','ftakenyear','takenyear','takenyear','checked');
    loadFacet('ftakenyear','takenyear','takenyear');

    loadFacets_helper(create,'Geographical Context','m_contexts','contexts','contexts','checked');
    loadFacetTags('m_contexts','contexts',10);
    loadFacets_helper(create,'Subject','m_subjects','subjects','subjects','');
    loadFacetTags('m_subjects','subjects',10);
      loadFacets_helper(create,'Tags','m_tags','tags','tags','checked');
      loadFacetTags('m_tags','tags',10);

    loadFacets_helper(create,'Automatic Clusters','m_groups','groups','groups','');
    loadFacetTags('m_groups','groups',10);

    loadFacets_helper(create,'Formats','fformat','format','format','');
    loadFacet('fformat','format','format');

    loadFacets_helper(create,'Contributors','frealname','realname','realname','');
    loadFacet('frealname','realname','realname');

    loadFacets_helper(create,'Status','fstatus','status','status','');
    loadFacet('fstatus','status','status');

    loadFacets_helper(create,'Shared Descriptions','m_snippets','snippets','snippets','');
    loadFacetTags('m_snippets','snippets',10);

    loadFacets_helper(create,'Buckets','m_buckets','buckets','buckets','');
    loadFacetTags('m_buckets','buckets',10);

    loadFacets_helper(create,'Terms','m_terms','terms','terms','');
    loadFacetTags('m_terms','terms',10);

    if (create) {
       $("#sidebar").append('<br/>');
       $("#fmyriad").hoverIntent(function() { initLazy(); $('#myriadmap').show(); },function() { $('#myriadmap').hide(); });
    }

    updateHash();
}

function loadFacets_helper(create,title,id,facet,display,checked) {
    if (create) {
       if (checked) {
           var checkbox = '<img src="http://s1.geograph.org.uk/img/open.png"';
       } else {
           var checkbox = '<img src="http://s1.geograph.org.uk/img/closed.png"';
       }
       if (id.indexOf('m_') == 0) {
           var js = 'loadFacetTags(\''+id+'\',\''+facet+'\',10);';
       } else {
           var js = 'loadFacet(\''+id+'\',\''+facet+'\',\''+display+'\');';
       }
       checkbox = checkbox + ' class="finger" onclick="togglerImg(this);'+js+'">';
       $("#sidebar").append('<div class="title"><a class="link2"></a><a class="link1"></a>'+checkbox+'<span onclick="togglerImg($(this).parent().find(\'img\').get(0));'+js+'">'+title+'</span><div class="info"></div></div>');
       $("#sidebar").append('<div id="'+id+'" class="facet"></div>');
    }
}

function togglerImg(that) {
    var src = $(that).attr('src');
    if (src.indexOf('closed') > -1) {
         $(that).attr('src',src.replace(/closed/,'open'));
         usage_log('show','group',$(that).parent().next().attr('id'));
    } else {
         $(that).attr('src',src.replace(/open/,'closed'));
         usage_log('hide','group',$(that).parent().next().attr('id'));
    }
}

var jsc = $.now();
var timers = new Object();

function loadFacet(id,facet,display,extra) {

  var ele = $("#"+id).prev().find('img');
  if (ele.length>0 && ele.attr('src').indexOf('closed') > -1) {
     $("#"+id).empty();
     $("#"+id).prev().find('.link1, .link2, .info').text('');
     return;
  }
  $('#myriadmap').hide();

  timers[facet] = setTimeout(function() {
      $("#"+id).css('opacity','0.3');
      timers[facet] = null;
  },400);

  var query = getTextQuery();
  if ($('#facet_q').attr('value').length) {
     if (facet == 'place') {
         query = query + " @(country,county,place) ("+$('#facet_q').attr('value').replace(/(\w+)\b/g,'$1*')+")";
     } else {
         query = query + " @"+searchFacetSaved[0]+" ("+$('#facet_q').attr('value').replace(/(\w+)\b/g,'$1*')+")";
     }
  }
  query = query + getFilterQuery();

  data = {
     group: facet,
     match: query,
     select: 'COUNT(*) AS count,GROUPBY() AS groupby',
     order: "count DESC",
     option: 'ranker=none'
  }

  data = setGeo(data);

  if (display) {
     data.select = display+','+data.select;
  }

  _call_cors_api(
    (extra)?(endpoint+'?'+extra):endpoint,
    data,
    function() { return "mc_" + ((id == 'facetresults')?jsc++:facet); },
    function(data) {
      if (timers[facet]) {
            clearTimeout(timers[facet]);
            timers[facet] = null;
      }
      $("#"+id).empty().css('opacity','inherit');
      if (data && data.rows) {

        var keys = new Array();
        var max = 0;
        $.each(data.rows,function(index,value) {
             keys.push(index);
             if (parseInt(value['count'],10) > max)
                 max = parseInt(value['count'],10);
        });

        if (keys.length == 1 && id != 'facetresults') {
          if (facet == 'myriad') {
            loadFacet(id,'hectad','hectad',extra);
            return;
          } else if (facet == 'hectad') {
            loadFacet(id,'grid_reference','grid_reference',extra);
            return;
          } else if (facet == 'country') {
            loadFacet(id,'county','county',extra);
            return;
          } else if (facet == 'county') {
            loadFacet(id,'place','place',extra);
            return;
          } else if (facet == 'takenyear') {
            loadFacet(id,'takenmonth','takenmonth',extra);
            return;
          } else if (facet == 'takenmonth') {
            loadFacet(id,'takenday','takenday',extra);
            return;
          } else if (facet == 'imageclass' && data.rows[keys[0]]['groupby'] == '') {
            return;
          }
        }
        if (id != 'facetresults') {
          switch (facet) {
             case 'country': $("#"+id).prev().find('span').html("Countries"); break;
             case 'county': $("#"+id).prev().find('span').html("Areas"); break;
             case 'place': $("#"+id).prev().find('span').html("Places"); break;
             case 'takenyear': $("#"+id).prev().find('span').html("Taken Years"); break;
             case 'takenmonth': $("#"+id).prev().find('span').html("Taken Months"); break;
             case 'takenday': $("#"+id).prev().find('span').html("Taken Days"); break;
          }
        }

        if (facet == 'distance' || facet == 'direction') {
            keys.sort( function(a,b){
               if (parseInt(data.rows[a][facet],10) > parseInt(data.rows[b][facet],10)) {
                   return 1
               }
               return -1 } );
        } else {
            keys.sort( function(a,b){
               if (data.rows[a][facet].toLowerCase() > data.rows[b][facet].toLowerCase()) {
                   return 1
               }
               return -1 } );

            if (facet == 'takenyear') {
               keys.reverse();
            }
        }

        var attribute = (display)?display:'groupby';
        var filter = (attribute == facet)?attribute:'groupby';

        if (filter == 'takenyear' || filter == 'takenmonth' || filter == 'takenday') {
            attribute = 'fakeattribute';
        }
        if (max == 1) max = 10;

        for(var q=0;q<keys.length;q++) {
            index = keys[q];
            value = data.rows[index];
            if (filter == 'takenyear' || filter == 'takenmonth' || filter == 'takenday')
                value[attribute] = clean_date(text_date(value[filter]));

            width = Math.round(100 * value['count'] / max)+40;
            if ((fid = inFilters(facet,value[filter])) > -1) {
                $("#"+id).append('<div><span style="width:'+width+'px">'+value['count']+'</span>'+'<b>'+value[attribute]+'</b> <a href="#" onclick="return deleteFilter('+fid+',event);" title="delete filter" class="delete">&#215;</a></div>');
            } else {
                $("#"+id).append('<div><span style="width:'+width+'px">'+value['count']+'</span>'+'<a href="javascript:void(addFilter(\''+facet+'\',\''+value[filter].addslashes()+'\',\''+value[attribute].addslashes()+'\'))" title="show only images in this group">'+value[attribute]+'</a><b class="exclude"><a href="javascript:void(addFilter(\''+facet+'\',\''+value[filter].addslashes()+'\',\''+value[attribute].addslashes()+'\',0))" title="exclude images in this group">(or exclude)</a></b></div>');
            }
        };

        $("#"+id).prev().find('.link2').text('');
        if (keys.length == 10 && data.meta.total_found > keys.length) {
            $("#"+id).prev().find('.link1').attr('href','javascript:void(loadFacet(\''+id+'\',\''+facet+'\',\''+display+'\',\'limit=100\'))').text('more');
            $("#"+id).prev().find('.link2').attr('href','javascript:void(searchFacet(\''+id+'\',\''+facet+'\',\''+display+'\'))').text('search');
        } else if (keys.length > 10) {
            $("#"+id).prev().find('.link1').attr('href','javascript:void(loadFacet(\''+id+'\',\''+facet+'\',\''+display+'\'))').text('less');
            if (data.meta.total_found > keys.length)
                $("#"+id).prev().find('.link2').attr('href','javascript:void(searchFacet(\''+id+'\',\''+facet+'\',\''+display+'\'))').text('search');
        } else if (facet == 'country') { //todo - only show if more than a few images (if less than 20 images, no point filtering by location)
            $("#"+id).prev().find('.link1').attr('href','javascript:void(searchFacet(\''+id+'\',\''+facet+'\',\''+display+'\'))').text('search');
        } else {
            $("#"+id).prev().find('.link1').text('');
        }

        $("#"+id).prev().find('.info').html((keys.length<data.meta.total_found?'top ':'')+keys.length+" of "+data.meta.total_found);

        $("#"+id+' div').hoverIntent(
           function () { $(this).addClass("hover"); },
           function () { $(this).removeClass("hover"); }
        );

      } else if ($('#facet_q').attr('value').length >= 2) {
        $("#facetsearch #"+id).html("No Matches");
        $("#"+id).prev().find('.link1, .link2, .info').text('');
      } else {
        $("#"+id).empty();
        $("#"+id).prev().find('.link1, .link2').text('');
        $("#"+id).prev().find('.info').text("no results");
      }
    }
  );
}

var tagText = new Object();

function loadFacetTags(id,facet,limit,extra) {
  var ele = $("#"+id).prev().find('img');
  if (ele.length>0 && ele.attr('src').indexOf('closed') > -1) {
     $("#"+id).empty();
     $("#"+id).prev().find('.link1, .link2, .info').text('');
     return;
  }
  var facet2 = facet.replace(/s$/,'_ids');

  timers[facet] = setTimeout(function() {
      //$("#"+id).html('loading...');
      $("#"+id).css('opacity','0.3');
      timers[facet] = null;
  },400);

  var query = getTextQuery();
  if ($('#facet_q').attr('value').length) {
     query = query + " @"+facet+" ("+$('#facet_q').attr('value').replace(/(\w+)\b/g,'$1*')+")";
  }
  query = query + getFilterQuery();

  data = {
     group: facet2,
     match: query,
     order: 'count DESC',
     select: facet+","+facet2+',COUNT(*) AS count,GROUPBY() AS groupby',
     limit: limit
  }

  data = setGeo(data);

  _call_cors_api(
    (extra)?(endpoint+'?'+extra):endpoint,
    data,
    function() { return "mc_" + ((id == 'facetresults')?jsc++:facet); },
    function(data) {
      $("#"+id).empty().css('opacity','inherit');
      if (timers[facet]) {
        clearTimeout(timers[facet]);
        timers[facet] = null;
      }
      if (data && data.rows) {

        var tags = new Array();
        var tagCount = new Object();
        var max = 0;

        var re = false;
        if (id == 'facetresults') {
             re = new RegExp("("+$('#facet_q').attr('value').trim().replace(/[^\w]+/g,'|')+")",'i');
        }

        $.each(data.rows,function(index,value) {
             tag_id = parseInt(value['groupby'],10);

             if (!tagText[tag_id]) {
                  var names = value[facet].replace(/(^\s*_SEP_\s*|\s*_SEP_\s*$)/g,'').split(/ _SEP_ /);
                  var ids = value[facet2].split(',');
                  for (var q=0;q<ids.length;q++) {
                       if (ids[q] == tag_id) {
                           tagText[tag_id] = names[q];
                       }
                  }
             }

             if (re && !tagText[tag_id].match(re)) {
                  //non matching string, short circuit away...
                  return;
             }
             value['count'] = parseInt(value['count'],10);
             tags.push(tag_id);
             tagCount[tag_id] = tagCount[tag_id]?tagCount[tag_id]+value['count']:value['count'];

             if (value['count'] > max)
                 max = value['count'];
        });
        tags.sort( function(a,b){
               if (tagText[a] && tagText[b] && tagText[a].toLowerCase() > tagText[b].toLowerCase()) {
                   return 1
               }
               return -1 } );

        if (max == 1) max = 10;

        for(var q=0;q<tags.length;q++) {
            tag_id = tags[q];
                    var bits = tagText[tag_id].split(/:/);
                    var text = (bits[0] == 'top' || bits[0] == 'bucket')?bits[1]:tagText[tag_id];
                    width = Math.round(100 * tagCount[tag_id] / max)+40;
                    if ((fid = inFilters(facet,tagText[tag_id])) > -1) {
                        $("#"+id).append('<div><span style="width:'+width+'px">'+tagCount[tag_id]+'</span>'+'<b>'+text+'</b> <a href="#" onclick="return deleteFilter('+fid+',event);" title="delete filter" class="delete">&#215;</a></div>');
                    } else {
                        $("#"+id).append('<div><span style="width:'+width+'px">'+tagCount[tag_id]+'</span>'+'<a href="javascript:void(addFilter(\''+facet+'\',\''+tagText[tag_id].addslashes()+'\',\''+text.addslashes()+'\'))">'+text+'</a><b class="exclude"><a href="javascript:void(addFilter(\''+facet+'\',\''+tagText[tag_id].addslashes()+'\',\''+text.addslashes()+'\',0))" title="exclude images in this group">(or exclude)</a></b></div>');
                    }
        };

        $("#"+id).prev().find('.link2').text('');
        if (limit == 10 && data.meta.total_found > limit) {
            $("#"+id).prev().find('.link1').attr('href','javascript:void(loadFacetTags(\''+id+'\',\''+facet+'\',100))').text('more');
            if (facet != 'contexts')
                 $("#"+id).prev().find('.link2').attr('href','javascript:void(searchFacet(\''+id+'\',\''+facet+'\',\'tags\'))').text('search');
        } else if (limit > 10) {
            $("#"+id).prev().find('.link1').attr('href','javascript:void(loadFacetTags(\''+id+'\',\''+facet+'\',10))').text('less');
            if (facet != 'contexts')
                 $("#"+id).prev().find('.link2').attr('href','javascript:void(searchFacet(\''+id+'\',\''+facet+'\',\'tags\'))').text('search');
        } else {
            $("#"+id).prev().find('.link1').text('');
        }

        $("#"+id).prev().find('.info').html((tags.length<data.meta.total_found?'top ':'')+tags.length+" of "+data.meta.total_found);

        $('#'+id+' div').hoverIntent(
           function () { $(this).addClass("hover"); },
           function () { $(this).removeClass("hover"); }
        );
      } else {
        $("#"+id).prev().find('.info').html("no results");
      }
    }
  );
}


////////////////////////////////
// SEARCHING FACETS

var searchFacetSaved = new Array();

function searchFacet(id,facet,display) {
    if (searchFacetSaved[0] == facet) {
        searchFacetSaved[0] = null;
        $('#facetsearch').hide('fast');
        return;
    }
    searchFacetSaved[0] = facet;
    searchFacetSaved[1] = display;
    searchFacetSaved[2] = id;
    if (facet == 'country') {
        var title = 'for a County/Place';
        searchFacetSaved[0] = searchFacetSaved[1] = 'place';
    } else {
        var title = $("#"+id).prev().find('span').text();
    }
    $('#lightbox-background').show();
    $('#facetsearch h3').text("Search "+title);
    $('#facetsearch').show('fast');
    $('#facetsearch #facet_q').focus();
    $(window).scrollTop(0);
    $('#facetsearch').scrollTop(0);
    searchFacet2();
    usage_log('use','searchfacet',facet);

    if (guiders && $(".guider:visible").length > 0 && guiders._currentGuiderID == 'g_sidebar4') {
       setTimeout(function() { guiders.hideAll(true).show('g_facetsearch'); }, 200);
    }

}

function searchFacet2() {
    if (searchFacetSaved[2].indexOf('m_') == 0) {
        loadFacetTags('facetresults',searchFacetSaved[0],300);
    } else {
        loadFacet('facetresults',searchFacetSaved[0],searchFacetSaved[1],'limit=100');
    }
}

////////////////////////////////
// GENERAL FILTER FUNCTIONS

function setGeo(data) {
  if (wgs84location) {
      data.geo=roundNumber(wgs84location.latitude,6)+","+roundNumber(wgs84location.longitude,6)+","+$('#distance').attr('value');
  } else if (boundsFilter) {
      data.bounds=boundsFilter;
  }
  if (content_id)
     data['filter[content_ids]'] = content_id;
  if (my_square)
     data['filter[my_square]'] = my_square;
  if (since_ts) {
     if (before_ts) {
       data['filterrange[submitted]'] = since_ts+","+before_ts;
     } else {
       data['filterrange[submitted]'] = since_ts+","+Math.round(new Date().getTime() / 1000);
     }
  } else if (before_ts) {
     data['filterrange[submitted]'] = "1,"+before_ts;
  }
  if (from_date) {
     if (to_date) {
       data['filterrange[takendays]'] = "to_days("+from_date+"),to_days("+to_date+")";
     } else {
       data['filterrange[takendays]'] = "to_days("+from_date+"),to_days(2020-01-01)";
     }
  } else if (to_date) {
     data['filterrange[takendays]'] = "to_days(1800-01-01),to_days("+to_date+")";
  }
  if (markedfilter) {
     current = readCookie('markedImages');
     if (current) {
        var splited = current.commatrim().split(',');
        data.where = 'id '+(markedfilter==2?'NOT ':'')+' IN ('+splited.join(',')+')';
     } else if (markedfilter == 1) {
        data.where = "1=0";
     }
  }
  return data;
}

function setSortSampleGeo(data,setsorting) {

  data = setGeo(data);

  if (setsorting) {
    switch(sorting) {
     case 'taken_down':  data.order="takendays DESC"; data.option='ranker=none';  break;
     case 'taken_up':  data.order="takendays ASC"; data.option='ranker=none';  break;
     case 'submitted_down':  data.order="id DESC"; data.option='ranker=none';  break;
     case 'submitted_up':  data.order="id ASC"; data.option='ranker=none';  break;
     case 'spread':  data.order="sequence ASC"; data.option='ranker=none';  break;
     case 'hash':  data.order="hash ASC"; data.option='ranker=none';  break;
     case 'score':  data.order="score DESC"; data.option='ranker=none';  break;
     case 'distance':  data.order="geodist ASC"; data.option='ranker=none';  break;
     case 'random':  data.order="RAND()";  break;
    }
  }
  switch(sample) {
     case 'contributor': data.select += ",withinfirstx(user_id,2) AS myint"; data['filter[myint][]']=1;  break;
     case 'place': data.select += ",withinfirstx(placename_id,2) AS myint"; data['filter[myint][]']=1;  break;
     case 'takendays': data.select += ",withinfirstx(takendays,2) AS myint"; data['filter[myint][]']=1;  break;
     case 'takenmonth': data.select += ",withinfirstxstring(takenmonth,2) AS myint"; data['filter[myint][]']=1;  break;
     case 'takenyear': data.select += ",withinfirstxstring(takenyear,2) AS myint"; data['filter[myint][]']=1;  break;
     case 'county': data.select += ",withinfirstxstring(county,2) AS myint"; data['filter[myint][]']=1;  break;
     case 'country': data.select += ",withinfirstxstring(country,2) AS myint"; data['filter[myint][]']=1;  break;
     case 'direction': data.select += ",withinfirstxstring(direction,2) AS myint"; data['filter[myint][]']=1;  break;
     case 'year': data.select += ",takenyear,withinfirstxstring(takenyear,4) AS myint"; data['filter[myint][]']=1;  break;
     case 'geographical':  data.groupByTile=4;  break;
  }
  return data;
}

var F_FACET= 0;
var F_VALUE= 1;
var F_DISPLAY= 2;
var F_ENABLED= 3;
var F_INCLUSIVE= 4;

function inFilters(facet,search) {
    if (!filters.length)
        return -2;
    for(var q=0;q<filters.length;q++)
        if (filters[q][F_ENABLED] && (filters[q][F_FACET] == facet) && (filters[q][F_VALUE] == search))
            return q;
    return -1;
}

function getTextQuery() {
    var raw = $('#q').attr('value');

    if (raw.length == 0) {
       return '';
    }

    //http: (urls) bombs out the field: syntax
    //$q = str_replace('http://','http ',$q);
    var query = raw.replace(/http:\/\//g,'http ');

    //remove any colons in tags - will mess up field: syntax
    query  =  query.replace(/\[([^\]]+)[:]([^\]]+)\]/g,'[$1~~~$2]');

    query = query.replace(/(-?)\b([a-z_]+):/g,'@$2 $1');
    query = query.replace(/@(year|month|day) /,'@taken$1 ');
    query = query.replace(/@gridref /,'@grid_reference ');
    query = query.replace(/@by /,'@realname ');
    query = query.replace(/@name /,'@realname ');
    query = query.replace(/@tag /,'@tags ');
    query = query.replace(/@subject /,'@subjects ');
    query = query.replace(/@context /,'@contexts ');
    query = query.replace(/@placename /,'@place ');
    query = query.replace(/@category /,'@imageclass ');
    query = query.replace(/@text /,'@(title,comment,imageclass,tags,subjects) ');
    query = query.replace(/@user /,'@user user');

    query = query.replace(/\b(\d{3})0s\b/g,'$1tt');
    query = query.replace(/\bOR\b/g,'|');

    //make excluded hyphenated words phrases
    query = query.replace(/(^|[^"\w]+)-(=?\w+)(-[-\w]*\w)/g,function(match,pre,p1,p2) {
        return pre+'-("'+(p1+p2).replace(/-/,' ')+'" | '+(p1+p2).replace(/-/,'')+')';
    });

    //make hyphenated words phrases
    query = query.replace(/(^|[^"\w]+)(=?\w+)(-[-\w]*\w)/g,function(match,pre,p1,p2) {
        return pre+'"'+(p1+p2).replace(/-/,' ')+'" | '+(p1+p2).replace(/-/,'');
    });

    //make excluded aposphies work (as a phrase)
    query = query.replace(/(^|[^"\w]+)-(=?\w+)(\'\w*[\'\w]*\w)/g,function(match,pre,p1,p2) {
        return pre+'-("'+(p1+p2).replace(/\'/,' ')+'" | '+(p1+p2).replace(/\'/,'')+')';
    });

    //make aposphies work (as a phrase)
    query = query.replace(/(^|[^"\w]+)(\w+)(\'\w*[\'\w]*\w)/,function(match,pre,p1,p2) {
        return pre+'"'+(p1+p2).replace(/\'/,' ')+'" | '+(p1+p2).replace(/\'/,'');
    });

    //change single quotes to double
    query = query.replace(/(^|\s)\b\'([\w ]+)\'\b(\s|$)/g, '$1"$2"$3');

    //fix placenames with / (the \b stops it replacing in "one two"/3
    query = query.replace(/\b\/\b/g,' ');

    //seperate out tags!
    if (m = query.match(/(-?)\[([^\]]+)\]/g)) {
       for(i=0;i<m.length;i++) {
          var value = m[i];
          query = query.replace(value,'');
          var bits = value.replace(/[\[\]-]+/g,'').split('~~~');
          var prefix = '*';
          if (bits.length > 1) {
             if (bits[0] == 'subject' || bits[0] == 'type' || bits[0] == 'context' || bits[0] == 'bucket') {
                 prefix = bits[0]+'s';
                 value = bits[1];
             } else if (bits[0] == 'top') {
                 prefix = 'contexts';
                 value = bits[1];
             } else {
                 prefix = 'tags';
                 value = bits[0]+' '+bits[1];
             }
          }
          query = query +' @'+prefix+' '+((value.indexOf('-')==0)?'-':'') + '"_SEP_ '+value.replace(/[\[\]-]+/g,'') + ' _SEP_"';
       }
    }

    if (query.length > 0 && query.indexOf('@') != 0) {//if first keyword is a field, no point setting ours.
        var list = $('#searchin input:checked');
        var searchintotal = $('#searchin input').length;
        var str = new Array();
        if (list.length > 0 && list.length <= 3) {
            list.each(function(index) {
              str.push($(this).val());
            });
            query = '@('+str.join(',')+') '+query;
        } else if (list.length > 3 && list.length < searchintotal) {
            var list = $('#searchin input');
            list.each(function(index) {
              if (!$(this).attr('checked'))
                 str.push($(this).val());
            });
            query = '@!('+str.join(',')+') '+query;
        }

    }

    return query;
}

function getFilterQuery() {
    if (!filters.length)
        return '';
    var str='';
    var plus = 0;
    var minus = 0;
    for(var q=0;q<filters.length;q++) {
        if (filters[q][F_ENABLED]) {
            str=str+' @'+filters[q][F_FACET]+ ((filters[q][F_INCLUSIVE])?' ':' -');
            (filters[q][F_INCLUSIVE])?(plus++):(minus++);
            if (filters[q][F_VALUE].indexOf(' | ') > -1) {
                str=str+'("'+filters[q][F_VALUE].replace(/[\/"'\(\)@^$-]+/g,' ').replace(/ \| /g,'" | "').replace(/\b(\w{2,})/g,'=$1')+'")';
            } else if (filters[q][F_FACET].match(/context|subject|tags|terms|buckets|groups|snippets|wikis|values/) ) {
                str=str+'="_SEP_ '+filters[q][F_VALUE].replace(/[\/"'\(\)\|@^$-]+/g,' ')+' _SEP_"';
            } else if (filters[q][F_FACET].match(/imageclass|realname|title|place|country|county/) ) {
                str=str+'="^'+filters[q][F_VALUE].replace(/[\/"'\(\)\|@^$-]+/g,' ')+'$"';
            } else {  //all the others like takenday, format and hectad, which are one word and wont be affected by stemming
                str=str+filters[q][F_VALUE].replace(/[\/"'\(\)\|@^$-]+/g,' ');
            }
        }
    }
    if (minus && !plus && $('#q').attr('value').length == 0) {
         str=str+' @status geograph|supplemental';
    }
    str = str.replace(/@user_id (-?)\"\^=/,'@user $1"user');
    str = str.replace(/@user_id (-?)/,'@user $1user');
    return str;
}
function getFilterUrl() {
    if (!filters.length)
        return '';
    var str='';
    for(var q=0;q<filters.length;q++) {
        if (filters[q][F_ENABLED]) {
            str=str+' @'+filters[q][F_FACET]+ ((filters[q][F_INCLUSIVE])?' ':' -');
            if (filters[q][1].indexOf(' | ') > -1) {
                str=str+'("'+filters[q][F_VALUE].replace(/ \| /g,'" | "')+'")';
            } else {
                str=str+'"'+filters[q][F_VALUE]+'"';
            }
        }
    }
    return str;
}

function addFilter(facet,value,display,inclusive,skipautoload) {
   if(typeof inclusive == "undefined") {
       inclusive = true;
   }
   if (user_id && display == 'user'+user_id) {
       display = "Your Photos";
   }
   var idx = filters.length;
   //              0    1     2      3 4
   filters.push([facet,value,display,1,inclusive]);
   var classNmae = inclusive?'plus':'minus';
   $('#filterbar').append('<li id="filter'+idx+'" class="'+classNmae+' finger" onclick="toggleFilterInclusive('+idx+')" title="click to toggle positive/negative on this filter ('+facet+')"><a href="#" onclick="return deleteFilter('+idx+',event);" title="delete filter">&#215;</a><input type="checkbox" checked onclick="toggleFilterActive('+idx+',event)" title="click to toggle Enabled/Disabled on this filter"> '+display+'</li>');

$('#filter'+idx).draggable({
   revert: 'invalid',
   opacity: .75,
   containment: '#filterbar',
   cursor: 'move',
   cursorAt: { top: 35, left: 45 }
});
$('#filter'+idx).droppable({
   drop: function(event, ui) {
       mergeFilters(
          parseInt($(this).attr('id').replace(/filter/,''),10),
          parseInt(ui.draggable.attr('id').replace(/filter/,''),10),
          false,
          event
       );
   },
   activeClass: 'isDroppable',
   accept: function(target) {
       targetIdx = parseInt(target.attr('id').replace(/filter/,''),10);
       return (filters[targetIdx][F_FACET] == facet);
   }
});

   if (!skipautoload) {
      if (ctrlHeldDown) { // use a global, rather then e.ctrlKey, just to save having to be passed a event object
        //if second, merge it with the first
        if (firstFilter != null && firstFacet == facet) {
             firstFilter = mergeFilters(firstFilter,idx,true,{});
        } else {
             firstFilter = idx;
             firstFacet = facet;
        }
        refreshOnCtrlRelease = true;
        return idx;
      }
      loadThumbnails();
      loadFacets();
   }
   usage_log('add',facet,value);
   return idx;
}

function mergeFilters(to,from,skipautoload,event) {
   var facet = filters[to][F_FACET]; //both will be same facet, the "accept" checks only the same type can be merged
   var value = filters[to][F_VALUE] + " | " + filters[from][1];
   var display = filters[to][F_DISPLAY] + " | " + filters[from][2];
   deleteFilter(to,event,true);
   deleteFilter(from,event,true);
   return addFilter(facet,value,display,1,skipautoload);
}


function addFilterText(facet,value) {
   $('#autocomplete').hide();
   $('#topbar li.selected').removeClass('selected');

   var query = $('#q').attr('value');
   var words = query.split(/\s+/);
   var count = words.length;
   for(var q=words.length-1;q>=0;q--) {
       if (words[q] == facet || value.match(new RegExp('\\b'+words[q],'i'))) {
            words.pop();
       } else {
            break;
       }
   }
   if (words.length < count) {
       $('#q').attr('value',words.join(' '))
   }
   if (facet == 'tag') facet = 'tags';
   addFilter(facet,value,value);
   return false;
}

function toggleFilterInclusive(idx) {

   if (!$('li#filter'+idx+' input').attr('checked')) {
       //make it active!
       filters[idx][F_ENABLED] = 1;
       $('li#filter'+idx+' input').attr('checked',true);

   } else {
       //actully toggle
       filters[idx][F_INCLUSIVE] = 1 - filters[idx][F_INCLUSIVE];
   }

   $('li#filter'+idx).attr('class','finger '+(filters[idx][F_INCLUSIVE]?'plus':'minus'));

   loadThumbnails();
   loadFacets();
   usage_log('inclusive',filters[idx][F_FACET],filters[idx][F_INCLUSIVE]);
   return false;
}

function toggleMarkedInclusive() {
   if (markedfilter == 1) {
      var active = false;
      markedfilter = 2
   } else {
      var active = true;
      markedfilter = 1;
   }
   $('li#filtermarked').attr('class','finger '+(active?'plus':'minus'));
   loadThumbnails();
   loadFacets();
   usage_log('inclusive','marked',active);
   return false;
}

function toggleFilterActive(idx,event) {
   if (event.preventDefault) {
      event.stopPropagation();
   }
   if (document.all) {
       event.cancelBubble = true;
   }

   filters[idx][F_ENABLED] = 1 - filters[idx][F_ENABLED];
   $('li#filter'+idx+' input').attr('checked',filters[idx][F_ENABLED]?true:false)

   if (filters[idx][F_ENABLED]) {
       $('li#filter'+idx).removeClass('disabled');
   } else {
       $('li#filter'+idx).addClass('disabled');
   }
   loadThumbnails();
   loadFacets();
   usage_log('active',filters[idx][F_FACET],filters[idx][F_ENABLED]);
   return false;
}

function deleteFilter(idx,event,skipautoload) {
   if (event.preventDefault) {
      event.stopPropagation();
   }
   if (document.all) {
       event.cancelBubble = true;
   }
   filters[idx][F_ENABLED] = 0; //we just disable it in the array, rather than remove to avoid changing indexes.
   $('li#filter'+idx).remove(); //but do delete the UX for it!

   if (!skipautoload) {
      loadThumbnails();
      loadFacets();
   }
   usage_log('delete',filters[idx][F_FACET],filters[idx][F_VALUE]);
   return false;
}

function specialFilter(name, skipautoload) {
   if (name == 'you' && user_id && user_id > 0) {
      addFilter('user','user'+user_id,'Your Photos');

   } else if (name == 'marked') {
       $('#filtermarked').remove();
       markedfilter = 1;
       $('#filterbar').append('<li id="filtermarked" class="plus finger" onclick="toggleMarkedInclusive()" title="click to toggle positive/negative on this filter"><a href="#" onclick="return deleteSpecial(\'marked\',event);" title="delete filter">&#215;</a> Current Marked List</li>');

   } else if (name == 'squares' && user_id && user_id > 0) {
       $('#filtermy_square').remove();
       my_square = parseInt(user_id,10);
       $('#filterbar').append('<li id="filtermy_square" class="plus"><a href="#" onclick="return deleteSpecial(\'squares\',event);" title="delete filter">&#215;</a> Your Squares</li>');

   } else if (name == '30days' || name == '365days') {
       $('#filtersince').remove();
       since_days = (name == '30days')?30:365;
       since_ts = Math.round(new Date().getTime() / 1000)-(60*60*24*since_days);
       $('#filterbar').append('<li id="filtersince" class="plus"><a href="#" onclick="return deleteSpecial(\'since\',event);" title="delete filter">&#215;</a> Last '+since_days+' Days</li>');

   } else if (name == 'gallery') {
       $('#filtercontent_id').remove();
       content_id = 1;
       content_title = 'Showcase Gallery';
       $('#filterbar').append('<li id="filtercontent_id" class="plus"><a href="#" onclick="return deleteSpecial(\'content\',event);" title="delete filter">&#215;</a> '+content_title+'</li>');
   } else if (name == 'daterange') {
       $('#filtersubdate').remove();
       skipautoload = true;
       $('#filterbar').append('<li id="filtersubdate" class="plus"><a href="#" onclick="return deleteSpecial(\'subdate\',event);" title="delete filter">&#215;</a> Submitted <input size=12 type="text" id="startdate" onchange="return setDateRange(this,event)" placeholder="YYYY-MM-DD"> ...  <input size=12 type="text" id="enddate" onchange="return setDateRange(this,event)" placeholder="YYYY-MM-DD"></li>');

            $('#filtersubdate input[type=text]').datepicker({
               changeMonth: true,
               changeYear: true,
               minDate: '2005-02-6',
               maxDate: 0,
               yearRange: "2005:c",
               dateFormat: 'yy-mm-dd'
            });

   } else if (name == 'takenrange') {
       $('#filtertakendate').remove();
       skipautoload = true;
       $('#filterbar').append('<li id="filtertakendate" class="plus"><a href="#" onclick="return deleteSpecial(\'takendate\',event);" title="delete filter">&#215;</a> Taken <input size=10 type="text" id="starttaken" onchange="return setDateRange(this,event)" placeholder="YYYY-MM-DD"> ...  <input size=10 type="text" id="endtaken" onchange="return setDateRange(this,event)" placeholder="YYYY-MM-DD"></li>');

            $('#filtertakendate input[type=text]').datepicker({
               changeMonth: true,
               changeYear: true,
               maxDate: 0,
               yearRange: "1880:c",
               dateFormat: 'yy-mm-dd'
            });

   }
   usage_log('add',name,'');
   if (!skipautoload) {
      loadThumbnails();
      loadFacets();
   }
}

function deleteSpecial(name,event,skipautoload) {
   if (event.preventDefault) {
      event.stopPropagation();
   }
   if (document.all) {
       event.cancelBubble = true;
   }
   if (name == 'squares') {
      $('#filtermy_square').remove();
      my_square = null;
   } else if (name == 'marked') {
      $('#filtermarked').remove();
      markedfilter = false;
   } else if (name == 'since') {
      $('#filtersince').remove();
      since_days = since_ts = null;
   } else if (name == 'content') {
      $('#filtercontent_id').remove();
      content_id = null;
   } else if (name == 'subdate') {
      $('#filtersubdate').remove();
      since_days = since_ts = before_ts = null;
   } else if (name == 'takendate') {
      $('#filtertakendate').remove();
      to_date = from_date = null;
   }
   if (!skipautoload) {
      loadThumbnails();
      loadFacets();
   }
   return false;
}

function setDateRange(that,event,skipautoload) {
  if (that.id == 'startdate') {
     if (that.value.length == 10) {
        var bits = that.value.split(/-/);
        var d = new Date(parseInt(bits[0],10), parseInt(bits[1],10)-1, parseInt(bits[2],10));
        since_ts = Math.round(d.getTime() / 1000);
     } else {
        since_ts = null;
     }
  } else if (that.id == 'enddate') {
     if (that.value.length == 10) {
        var bits = that.value.split(/-/);
        var d = new Date(parseInt(bits[0],10), parseInt(bits[1],10)-1, parseInt(bits[2],10));
        before_ts = Math.round(d.getTime() / 1000);
     } else {
        before_ts = null;
     }
  } else if (that.id == 'starttaken') {
     if (that.value.length == 10) {
        var bits = that.value.split(/-/);
        var d = new Date(parseInt(bits[0],10), parseInt(bits[1],10)-1, parseInt(bits[2],10));
        from_date = from_timestamp(Math.round(d.getTime() / 1000));
     } else {
        from_date = null;
     }
  } else if (that.id == 'endtaken') {
     if (that.value.length == 10) {
        var bits = that.value.split(/-/);
        var d = new Date(parseInt(bits[0],10), parseInt(bits[1],10)-1, parseInt(bits[2],10));
        to_date = from_timestamp(Math.round(d.getTime() / 1000));
     } else {
        to_date = null;
     }
  }
  if (!skipautoload) {
      loadThumbnails();
      loadFacets();
  }
  return true;
}


$(function(){
  if (!(user_id && user_id > 0))
     $('.userspec').remove();
});

function initLazy() {
        jQuery( 'img[data-src]' ).not('.bound').addClass('bound').bind( 'scrollin', function() {
                var img = this, $img = jQuery(img);

                $img.hide();

                $img.unbind( 'scrollin' ); // clean up binding
                img.src = $img.attr( 'data-src' );
                $img.removeAttr( 'data-src' );

                $img.css('height','');

                $img.fadeIn();
        });
}

function markedListUpdate() {
   if(markedfilter) {
      loadThumbnails();
      loadFacets();
   }
   return false;
}

function markAllImageArray() {
   current = readCookie('markedImages');
   if (images && images.length) {
       for(var q=0;q<images.length;q++) {
           if (current) {
               var re = new RegExp("\\b"+images[q].id+"\\b");
               if (current != images[q].id && current.search(re) == -1)
                   markImage(images[q].id);
           } else
               markImage(images[q].id);
       }
   } else {
       $.each(images,function(id,value) {
           if (current) {
               var re = new RegExp("\\b"+id+"\\b");
               if (current != id && current.search(re) == -1)
                   markImage(id);
           } else
               markImage(id);
       });
   }
}
function unmarkAllImageArray() {
   if (!(current = readCookie('markedImages'))) {
       return;
   }

   if (images && images.length > 0) {
       for(var q=0;q<images.length;q++) {
           var re = new RegExp("\\b"+images[q].id+"\\b");
           if (current == images[q].id || current.search(re) > -1)
               markImage(images[q].id);
       }
   } else {
       $.each(images,function(id,value) {
           var re = new RegExp("\\b"+id+"\\b");
           if (current == id || current.search(re) > -1)
               markImage(id);
       });
   }
}
