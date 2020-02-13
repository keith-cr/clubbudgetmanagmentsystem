var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET logout page. */
router.get('/', async function(req, res, next) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;