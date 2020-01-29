var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET login page. */
router.get('/', async function(req, res, next) {
  res.render('login', { title: "Login", bypassLayout: true });
});

module.exports = router;