/**
 * Created by tianyang1 on 2014/8/21.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.render('resume/index', null);
});

module.exports = router;
