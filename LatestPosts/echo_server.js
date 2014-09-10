/**
 * Created by tianyang1 on 2014/8/13.
 */
var net = require('net');

var server = net.createServer(function(socket) {
   socket.on('data', function(data) {
       socket.write(data);
   });
});

server.listen(8888);