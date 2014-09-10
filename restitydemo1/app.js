var restify = require('restify');

var server = restify.createServer({
    name: 'MyApp'
});

server.listen(3000);

function send(req, res, next) {
    res.send('hello ' + req.params.name);
    return next();
}


server.get('/hello/:name', send);