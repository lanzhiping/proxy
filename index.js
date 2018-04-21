// //  Install npm dependencies first
// //  npm init
// //  npm install --save url@0.10.3
// //  npm install --save http-proxy@1.11.1

// var httpProxy = require("http-proxy");
// var http = require("http");
// var url = require("url");
// var net = require('net');

// var server = http.createServer(function (req, res) {
//   var urlObj = url.parse(req.url);
//   var target = urlObj.protocol + "//" + urlObj.host;

//   console.log("Proxy HTTP request for:", target);

//   var proxy = httpProxy.createProxyServer({});
//   proxy.on("error", function (err, req, res) {
//     console.log("proxy error", err);
//     res.end();
//   });

//   proxy.web(req, res, {target: target});
// }).listen(process.env.PORT || 8080, () => {
//     console.log('this is the port your clients will connect to')
// });

// var regex_hostport = /^([^:]+)(:([0-9]+))?$/;

// var getHostPortFromString = function (hostString, defaultPort) {
//   var host = hostString;
//   var port = defaultPort;

//   var result = regex_hostport.exec(hostString);
//   if (result != null) {
//     host = result[1];
//     if (result[2] != null) {
//       port = result[3];
//     }
//   }

//   return ( [host, port] );
// };

// server.addListener('connect', function (req, socket, bodyhead) {
//   var hostPort = getHostPortFromString(req.url, 443);
//   var hostDomain = hostPort[0];
//   var port = parseInt(hostPort[1]);
//   console.log("Proxying HTTPS request for:", hostDomain, port);

//   var proxySocket = new net.Socket();
//   proxySocket.connect(port, hostDomain, function () {
//       proxySocket.write(bodyhead);
//       socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
//     }
//   );

//   proxySocket.on('data', function (chunk) {
//     socket.write(chunk);
//   });

//   proxySocket.on('end', function () {
//     socket.end();
//   });

//   proxySocket.on('error', function () {
//     socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
//     socket.end();
//   });

//   socket.on('data', function (chunk) {
//     proxySocket.write(chunk);
//   });

//   socket.on('end', function () {
//     proxySocket.end();
//   });

//   socket.on('error', function () {
//     proxySocket.end();
//   });

// });

// server.setTimeout(0)


var http = require('http');
var net = require('net');
var url = require('url');

function request(cReq, cRes) {
    var u = url.parse(cReq.url);

    var options = {
        hostname : u.hostname,
        port     : u.port || 80,
        path     : u.path,
        method     : cReq.method,
        headers     : cReq.headers
    };

    var pReq = http.request(options, function(pRes) {
        cRes.writeHead(pRes.statusCode, pRes.headers);
        pRes.pipe(cRes);
    }).on('error', function(e) {
        cRes.end();
    });

    console.log('proxying request for: ', u.hostname, u.port)

    cReq.pipe(pReq);
}

function connect(cReq, cSock) {
    var u = url.parse('http://' + cReq.url);

    var pSock = net.connect(u.port, u.hostname, function() {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function(e) {
        cSock.end();
    });

    console.log('proxying request https for: ', u.hostname, u.port)

    cSock.pipe(pSock);
}

http.createServer()
    .on('request', request)
    .on('connect', connect)
    .listen(process.env.PORT || 8888, '0.0.0.0');