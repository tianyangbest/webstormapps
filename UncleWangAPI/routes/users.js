var fs = require('fs');
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
var async = require("async");
var User = require('../models/User');

var authtoken = "";
var authoptions = {method: 'POST',
    json: {"grant_type": "client_credentials", "client_id": "YXA6_MbFkCU_EeSoFWP7gMBAuw", "client_secret": "YXA67Z1jkAoV-HVOKqEqUmH72OE2sw4"}}


// Update the Auth access token after the node.js is restarted
request.post('https://a1.easemob.com/koapanda/panacea/token', authoptions, function (err, res, body) {

    if (err) {
        console.log("Error connect to the easemob on post to https://a1.easemob.com/koapanda/panacea/token");
    } else {
        if (res.statusCode == 200) {
            authtoken = body.access_token;
            console.log('Auth token updated.');
            console.log(authtoken);
        } else {
            console.log('error: ' + res.statusCode);
            console.log(body);
        }
    }

});

//test
router.post('/save2DB', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var u_username = input.u_username;
    var u_salt = bcrypt.genSaltSync(8);
    var u_password = bcrypt.hashSync(input.u_password, u_salt, null);
    var user = new User({
        u_username: u_username,
        u_password: u_password,
        u_salt: u_salt
    });
    user.save2DB(function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});


//test
router.post('/updateDBPassword', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var u_username = input.u_username;
    var u_password = input.u_password;
    var u_salt = 'asdasdaewqrwefwefwrefwerf';
    var user = new User({
        u_username: u_username,
        u_password: u_password,
        u_salt: u_salt
    });
    user.updateDBPassword(function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});



//test
router.post('/updatePassword', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var u_username = input.u_username;
    var u_password = input.u_password;
    var new_password = input.new_password;
    var user = new User({
        u_username: u_username,
        u_password: u_password,
        new_password: new_password
    });
    user.updatePassword(authtoken, function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});

//test
router.post('/findDB', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var u_username = input.u_username;
    var user = new User({
        u_username: u_username
    });
    user.findDB(function (statusCode, res) {
        if (statusCode == 200)
            console.log(res);
        console.log(statusCode);
    });
    res.end();
});

//test
router.post('/save2Easemob', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var u_username = input.u_username;
    var u_salt = bcrypt.genSaltSync(8);
    var u_password = bcrypt.hashSync(input.u_password, u_salt, null);
    var user = new User({
        u_username: u_username,
        u_password: u_password,
        u_salt: u_salt
    });
    user.save2Easemob(authtoken, function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});


//test
router.put('/updateEasemobPassword', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var u_username = input.u_username;
    var u_salt = bcrypt.genSaltSync(8);
    var u_password = input.u_password;
    var user = new User({
        u_username: u_username,
        u_password: u_password,
        u_salt: u_salt
    });
    user.updateEasemobPassword(authtoken, function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});

router.delete('/deleteEasemob', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var u_username = input.u_username;
    var u_salt = bcrypt.genSaltSync(8);
    var u_password = bcrypt.hashSync(input.u_password, u_salt, null);
    var user = new User({
        u_username: u_username,
        u_password: u_password,
        u_salt: u_salt
    });
    user.deleteEasemob(authtoken, function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});

router.delete('/deleteDB', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var u_username = input.u_username;
    var u_salt = bcrypt.genSaltSync(8);
    var u_password = bcrypt.hashSync(input.u_password, u_salt, null);
    var user = new User({
        u_username: u_username,
        u_password: u_password,
        u_salt: u_salt
    });
    user.deleteDB(function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});

router.post('/save', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var user = new User({
        u_username: input.u_username,
        new_password: input.new_password
    });
    user.save(authtoken, function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});


router.post('/updatePasswordOnce', function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var user = new User({
        u_username: input.u_username,
        new_password: input.new_password,
        old_password: input.old_password
    });
    user.updatePasswordOnce(authtoken, function (statusCode) {
        console.log(statusCode);
    });
    res.end();
});


// Update the Auth access token, the auth access token expires in 7 days.
router.post('/updateAuthtoken', function (req, res) {
    request.post('https://a1.easemob.com/koapanda/panacea/token', authoptions, function (error, response, body) {
        if (error) {
            console.log("Error connect to the easemob on post to https://a1.easemob.com/koapanda/panacea/token");
        } else {
            if (response.statusCode == 200) {
                authtoken = body.access_token;
                console.log('Auth token updated.');
                console.log(authtoken);
                res.send(body);
                res.end();
            } else {
                console.log('error: ' + response.statusCode);
                console.log(body);
                res.send(body);
                res.end();
            }
        }

    });

});

/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

module.exports = router;
