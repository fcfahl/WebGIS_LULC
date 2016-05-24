// var http = require('http');
// var server = http.createServer();
// server.on('request', function(req, res) {
//     res.writeHead(200, {'content-type': 'text/plain'});
//     res.write('Hello World!');
//     res.end();
// });
//
// var port = 3000;
// server.listen(port);
// server.once('listening', function() {
//     console.log('Hello World server listening on port %d', port);
// });


// var fs = require('fs');
//
// fs.readFile('./src/db.json', 'utf8', function(err, fileContent) {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log('got file content:', fileContent);
//   }
// });

// var EventEmitter = require('events').EventEmitter;
// var emitter = new EventEmitter();
//
//
// var count = 0;
// setInterval(function() {
//   emitter.emit('tick', count);
//   count ++;
// }, 1000);
//
// emitter.on('tick', function(count) {
//   console.log('tick:', count);
// });


// ____
var http = require('http');

var urls = [
  'http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=20&minx=-180&miny=-90&maxx=180&maxy=90&size=medium&mapfilter=true'
];


var allResults = [];
var responded = 0;

function collectResponse(res) {
  var responseBody = '';
  res.setEncoding('utf8');


  /// collect the response body
  res.on('data', function(d) {
    responseBody += d;

  });


  /// when the response ends, we should have all the response body
  res.on('end', function() {
    var response = JSON.parse(responseBody);
    console.log(response);

    // allResults = allResults.concat(response.results);
    // console.log('I have %d results for', response.results.length, res.req.path);
    // responded += 1;

  /// check if we have responses to all requests
  // if (responded == urls.length) {
    // console.log('All responses ended. Number of total results:', allResults.length);
    // }
  });
}

urls.forEach(function(url) {
  http.get(url, collectResponse);
});
