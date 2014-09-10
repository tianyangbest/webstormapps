/**
 * Created by tianyang1 on 2014/9/9.
 */
var request = require('request');

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

exports.findAll = function(req, res) {
    res.send([{name:'wine1'}, {name:'wine2'}, {name:'wine3'}]);
};