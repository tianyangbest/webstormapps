/**
 * Created by tianyang1 on 2014/8/21.
 */
var request = require('request');
request('http://baidu.com', function (error, response, body) {
    console.log(error);
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
    }
})