/**
 * Created by Yang on 2014/8/26.
 */
var mysql = require('mysql');
var request = require('request');
var async = require("async");
var bcrypt = require('bcrypt-nodejs');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 3306, //port mysql
    database: 'nodejs'
});


module.exports = User;

function User(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

/**
 * Save the username, password to mySQL DB
 * if connect error on DB, return 201
 * if success insert on DB, return 200
 * if duplicate user on DB, return 400
 * if other error, return 401
 * @param callback
 */
User.prototype.save2DB = function (callback) {
    var user = this;
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(201);
        } else {
            var data = {
                u_username: user.u_username,
                u_password: user.u_password,
                u_salt: user.u_salt
            };
            connection.query("INSERT INTO p_users set ? ", data, function (err, rows) {
                if (err) {
                    connection.release();
                    if (err.errno == 1062) {
                        callback(400);
                    } else {
                        callback(401);
                    }
                }
                else {
                    connection.release();
                    callback(200);
                }
            });
        }
    });
};

/**
 * Save the username, password to easemob
 * if connect error on easemob, return 201
 * if success insert on easemob, return 200
 * if duplicate user on easemob, return 400
 * if other error, return 401
 * @param authToken
 * @param callback
 */
User.prototype.save2Easemob = function (authToken, callback) {
    var user = this;
    var options = {
        method: 'POST',
        json: {"username": user.u_username, "password": user.u_password},
        headers: {"Authorization": "Bearer " + authToken}
    };
    request.post('https://a1.easemob.com/koapanda/panacea/users', options, function (err, res, body) {
        if (err) {
            callback(201);
        } else {
            if (res.statusCode == 200) {
                callback(200);
            } else {
                if (res.statusCode == 400)
                    callback(400);
                else
                    callback(401);
            }
        }
    });
};

/**
 * save the user to the db and easemob, if the failed, rollback from both db and easemob
 * if success saved, callback 200
 * if unsuccess saved, but success rollback, callback 400
 * if unsuccess saved and unsuccess rollback on db, callback 202
 * if unsuccess saved, but unsuccess rollback on easemob, callback 201
 * @param authToken
 * @param callback
 */
User.prototype.save = function (authToken, callback) {
    var user = this;
    var u_salt = bcrypt.genSaltSync(8);
    var u_password = bcrypt.hashSync(user.new_password, u_salt, null);
    user.u_password = u_password;
    user.u_salt = u_salt;
    var asyncTasks = [];
    var easemobstatusCode = 201;
    var dbstatusCode = 201;

    asyncTasks.push(function (callback) {
        user.save2Easemob(authToken, function (statusCode) {
            easemobstatusCode = statusCode;
            if (easemobstatusCode == 201) {
                user.save2Easemob(authToken, function (statusCode) {
                    easemobstatusCode = statusCode;
                    callback();
                });
            } else {
                callback();
            }
        });
    });
    asyncTasks.push(function (callback) {
        user.save2DB(function (statusCode) {
            dbstatusCode = statusCode;
            if (dbstatusCode == 201) {
                user.save2DB(function (statusCode) {
                    dbstatusCode = statusCode;
                    callback();
                });
            } else {
                callback();
            }
        });
    });

    async.parallel(asyncTasks, function () {
        if (easemobstatusCode == 200 && dbstatusCode == 200) {
            callback(200);
        } else if (easemobstatusCode != 200 && dbstatusCode == 200) {
            user.deleteDB(function (statusCode) {
                if (statusCode != 200) {
                    user.deleteDB(function (statusCode) {
                        if (statusCode != 200) {
                            callback(201);
                            console.log("FAILED Rollback from Easemob, the username is " + user.u_username);
                        } else {
                            callback(400);
                        }
                    });
                } else {
                    callback(400);
                }
            });
        } else if (easemobstatusCode == 200 && dbstatusCode != 200) {
            user.deleteEasemob(authToken, function (statusCode) {
                if (statusCode != 200) {
                    user.deleteEasemob(authToken, function (statusCode) {
                        if (statusCode != 200) {
                            console.log("FAILED Rollback from DB, the username is " + user.u_username);
                            callback(202);
                        } else {
                            callback(400);
                        }
                    });
                } else {
                    callback(400);
                }
            });
        }
    });


};
/**
 * delete the user from mysql db
 * if connection error, callback 201
 * if success delete from db, callback 200
 * if no found from db, callback 199
 * other errors, callback 401
 * @param callback
 */
User.prototype.deleteDB = function (callback) {
    var user = this;
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(201);
        } else {
            connection.query("DELETE FROM p_users WHERE u_username = ? ", user.u_username, function (err, rows) {
                if (err) {
                    connection.release();
                    callback(401);
                }
                else {
                    connection.release();
                    if (rows.affectedRows == 0) {
                        callback(199);
                    } else {
                        callback(200);
                    }
                }
            });
        }
    });
};
/**
 * delete the the user from the easemob
 * if connection error, callback 201
 * if success delete from easemob, callback 200
 * if no found from easemob, callback 401
 * other errors, callback 402
 * @param authToken
 * @param callback
 */
User.prototype.deleteEasemob = function (authToken, callback) {
    var user = this;
    var options = {
        method: 'DELETE',
        //json: {"username": user.u_username, "password": user.u_password},
        headers: {"Authorization": "Bearer " + authToken}
    };
    request.del('https://a1.easemob.com/koapanda/panacea/users/' + user.u_username, options, function (err, res, body) {
        if (err) {
            callback(201);
        } else {
            if (res.statusCode == 200) {
                callback(200);
            } else {
                if (res.statusCode == 401)
                    callback(401);
                else
                    callback(402);
            }
        }
    });
};

User.prototype.delete = function (fn) {

};
/**
 * if sql query er_bad_field_error, callback 400
 * if sql query other errors, callback 401
 * if connection errors, callback 201
 * if success, callback 200
 * if no row changed and affected, callback 202
 * @param callback
 */
User.prototype.updateDBPassword = function (callback) {
    var user = this;
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(201);
        } else {
            connection.query('update p_users set u_password = ?, u_salt = ? where u_username = ?', [user.u_password, user.u_salt, user.u_username], function (err, rows) {
                if (err) {
                    connection.release();
                    if (err.errno == 1054) {
                        callback(400);
                    } else {
                        callback(401);
                    }
                }
                else {
                    connection.release();
                    if (rows.affectedRows == 1)
                        callback(200);
                    else
                        callback(202);
                }
            });
        }
    });
};
/**
 * if connection error callback 201
 * if query error callback 401
 * if success callback 200
 * if no found user, callback 202
 * @param authToken
 * @param callback
 */
User.prototype.updateEasemobPassword = function (authToken, callback) {
    var user = this;
    var options = {
        json: {"newpassword": user.u_password},
        headers: {"Authorization": "Bearer " + authToken}
    };
    request.put('https://a1.easemob.com/koapanda/panacea/users/' + user.u_username + '/' + 'password', options, function (err, res, body) {
        if (err) {
            callback(201);
        } else {
            if (res.statusCode == 200) {
                if (body.error)
                    callback(202);
                else
                    callback(200);
            } else {
                callback(401);
            }
        }
    });
};

/**
 * if success, callback 200
 * if other error, callback 401
 * if unsuccess update, but success rollback, callback 201
 * if unsuccess update and unsuccess rollback db, callback 203
 * if unsuccess update and unsuccess rollback easemob, callback 202
 * @param authToken
 * @param callback
 */
User.prototype.updatePasswordOnce = function (authToken, callback) {
    var user = this;
    var old_password;
    var old_salt;

    async.series({
            one: function (callback) {
                user.findDB(function (statusCode, userData) {
                    if (statusCode == 200) {
                        var checkpassword = bcrypt.hashSync(user.old_password, userData.u_salt, null);
                        if (userData.u_password == checkpassword) {
                            old_password = userData.u_password;
                            old_salt = userData.u_salt;
                            callback(null, userData);
                        } else {
                            callback(400, userData);
                        }
                    } else {
                        callback(401, null);
                    }
                });
            },
            two: function (callback) {
                var asyncTasks = [];
                var easemobstatusCode = 201;
                var dbstatusCode = 201;
                user.u_salt = bcrypt.genSaltSync(8);
                user.u_password = bcrypt.hashSync(user.new_password, user.u_salt, null);

                asyncTasks.push(function (callback) {
                    user.updateEasemobPassword(authToken, function (statusCode) {
                        easemobstatusCode = statusCode;
                        if (easemobstatusCode == 201) {
                            user.updateEasemobPassword(authToken, function (statusCode) {
                                easemobstatusCode = statusCode;
                                callback();
                            });
                        } else {
                            callback();
                        }
                    });
                });
                asyncTasks.push(function (callback) {
                    user.updateDBPassword(function (statusCode) {
                        dbstatusCode = statusCode;
                        if (dbstatusCode == 201) {
                            user.updateDBPassword(function (statusCode) {
                                dbstatusCode = statusCode;
                                callback();
                            });
                        } else {
                            callback();
                        }
                    });
                });

                async.parallel(asyncTasks, function () {
                    if (easemobstatusCode == 200 && dbstatusCode == 200) {
                        callback(null, null);
                    } else if (easemobstatusCode != 200 && dbstatusCode == 200) {
                        callback(202, null);
                    } else if (easemobstatusCode == 200 && dbstatusCode != 200) {
                        callback(203, null);
                    } else {
                        callback(201, null);
                    }
                });
            }
        },
        function (err, results) {
            if (err) {
                if (err == 203) {
                    user.updateEasemobPassword(authToken, function (statusCode) {
                        if (statusCode != 200) {
                            user.updateEasemobPassword(authToken, function (statusCode) {
                                if (statusCode != 200) {
                                    console.log("FAILED Rollback from Easemob, the username is " + user.u_username);
                                    callback(203);
                                } else {
                                    callback(201);
                                }
                            });
                        } else {
                            callback(201);
                        }
                    });
                } else if (err == 202) {
                    user.updateDBPassword(function (statusCode) {
                        if (statusCode != 200) {
                            user.updateDBPassword(function (statusCode) {
                                if (statusCode != 200) {
                                    console.log("FAILED Rollback from DB, the username is " + user.u_username);
                                    callback(203);
                                } else {
                                    callback(201);
                                }
                            });
                        } else {
                            callback(201);
                        }
                    });
                } else if (err == 400) {
                    console.log("incorrect password.");
                    callback(201);
                } else if (err == 401) {
                    console.log("db connection error.");
                    callback(201);
                }
            } else {
                callback(200);
            }
        });
};


/**
 * find a user by username
 * if find a user, return 200 and a json object include all information in db
 * if not found, return 400
 * if connection errors, return 201
 * if query error happened, return 401
 * @param callback
 */
User.prototype.findDB = function (callback) {
    var user = this;
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(201);
        } else {
            connection.query("SELECT * FROM p_users WHERE u_username = ? ", user.u_username, function (err, rows) {
                if (err) {
                    connection.release();
                    callback(401);
                }
                else {
                    connection.release();
                    if (rows.length == 1) {
                        callback(200, rows[0]);
                    } else {
                        callback(400);
                    }
                }
            });
        }
    });
};