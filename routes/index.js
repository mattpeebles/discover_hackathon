var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.post('/basic', (req, res, nex) => {
  console.log(req);
})

module.exports = router;
