/**
 * Created by Yang on 2014/8/20.
 */
var restify = require('restify');

var ip_addr = '127.0.0.1';
var port    =  '3000';

var server = restify.createServer({
    name : "myapp"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
var PATH = '/jobs';

server.post({path : PATH , version: '0.0.1'} ,postNewJob);


server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
});


function postNewJob(req , res , next){
    var job = {};
    job.title = req.params.title;
    job.description = req.params.description;
    job.location = req.params.location;
    job.postedOn = new Date();

    res.setHeader('Access-Control-Allow-Origin','*');
    res.end();
}