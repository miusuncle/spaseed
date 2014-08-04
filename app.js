
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

function start () {
  var onRequest = function (request, response) {
     var pathname = url.parse(request.url).pathname;
     route(pathname, request, response);
  }
  http.createServer(onRequest).listen(8000);
  console.log('Server has started, please visit http://localhost:8000');
}

function route (pathname, request, response) {
  if (/^\/dest/.test(pathname)) {
    pathname = __dirname + pathname;
    fs.exists(pathname, function(exists) {
        if (exists) {
            switch (path.extname(pathname)) {
                case '.html':
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    break;
                case '.js':
                    response.writeHead(200, {'Content-Type': 'text/javascript'});
                    break;
                case '.css':
                    response.writeHead(200, {'Content-Type': 'text/css'});
                    break;
                case '.gif':
                    response.writeHead(200, {'Content-Type': 'image/gif'});
                    break;
                case '.jpg':
                    response.writeHead(200, {'Content-Type': 'image/jpeg'});
                    break;
                case '.png':
                    response.writeHead(200, {'Content-Type': 'image/png'});
                    break;
                default:
                    response.writeHead(200, {'Content-Type': 'application/octet-stream'});
            }

            fs.readFile(pathname, function (err, data) {
                response.end(data);
            });
            
        } else {
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end('<h1>404 Not Found</h1>');
        }
    });
  } else {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('index.html', function (err, data) {
        response.end(data);
    });
  }
}

start();
