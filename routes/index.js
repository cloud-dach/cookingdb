var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Cooking DB' });
});

/* GET home page. */
router.get('/gagh', function(req, res) {
  res.render('gagh', { title: 'Klingonisches Gagh' });
});

/* GET home page. */
router.get('/kalender', function(req, res) {
  res.render('kalender', { title: 'Kalender' });
});
/* GET home page. */
router.get('/eingabe', function(req, res) {
  res.render('eingabe', { title: 'Rezepteingabe' });
});


module.exports = router;
