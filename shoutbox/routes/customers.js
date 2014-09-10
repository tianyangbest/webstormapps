/**
 * Created by tianyang1 on 2014/8/19.
 */
var bcrypt = require('bcrypt-nodejs');

exports.list = function(req, res) {
    req.getConnection(function(err, connection) {
       connection.query('select * from p_users', function(err, rows) {
          if (err) {
              console.log("Error Selecting : %s", err);
              return res.send(404);
          }
          res.json(rows);
       });
    });
};


exports.add = function (req, res) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    console.log(req.body);
    users[req.body.id] = req.body;
    res.send({status: "success", message: "add user success"});
    console.log(users);
};


/*Save the customer*/
exports.save = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function (err, connection) {
        var u_salt = bcrypt.genSaltSync(8);
        var u_password = bcrypt.hashSync(input.u_password, u_salt, null);
        var data = {
            u_username : input.u_username,
            u_password : u_password,
            u_salt : u_salt
        };
        var query = connection.query("INSERT INTO p_users set ? ",data, function(err, rows)
        {
            if (err)
                console.log("Error inserting : %s at %s ",err, Date() );
            res.end();
        });
    });
};