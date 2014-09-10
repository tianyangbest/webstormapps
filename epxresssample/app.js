/**
 * Created by tianyang1 on 2014/9/9.
 */


var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('hello world');
});

app.listen(3000);