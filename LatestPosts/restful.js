/**
 * Created by tianyang1 on 2014/8/15.
 */
var http = require('http');
var server = http.createServer(function(req, res) {
    req.setEncoding('uft8');
   req.on('data', function(chunk) {
       console.log('parsed', chunk);
   });
    req.on('end', function() {
       console.log('done parsing');
        res.end();
    });
});