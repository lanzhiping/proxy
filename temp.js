var http = require('http');

var options = {
    hostname : 'zhiping-proxy.herokuapp.com',
    port     : 80,
    path     : 'www.google.com:443',
    method     : 'CONNECT'
};

var req = http.request(options);

req.on('connect', function(res, socket) {
    socket.write('GET / HTTP/1.1\r\n' +
                 'Host: imququ.com\r\n' +
                 'Connection: Close\r\n' +
                 '\r\n');

    socket.on('data', function(chunk) {
        console.log(chunk.toString());
    });

    socket.on('error', function(error) {
        console.log(JSON.stringify(error));
    });

    socket.on('end', function() {
        console.log('socket end.');
    });
});

req.on('error', (error) => {
    console.log('req error', JSON.stringify(error))
})

req.end();