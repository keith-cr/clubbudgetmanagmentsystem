var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET home page. */
router.get('/', async function(req, res, next) {
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME)
      const result = await sql.query`select * from club`
      console.log(result.recordset);
      res.render('index', { title: 'Clubs', data: result.recordset, clubsPage: true });
    } catch (err) {
      console.log(err)
    }
});

module.exports = router;
