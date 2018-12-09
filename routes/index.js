var express = require('express');
var router = express.Router();
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/openMapGl', (req, res, next) => {
  res.send(config.openMapKey);
})

router.post('/basic', (req, res, nex) => {
  console.log(req);
})

module.exports = router;
