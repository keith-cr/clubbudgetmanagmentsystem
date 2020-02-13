var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();
const ensureLogin = require('connect-ensure-login');

/* GET home page. */
router.get('/', ensureLogin.ensureLoggedIn('/login'), async function(req, res, next) {
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`EXEC CLUBS_FOR_USER @UserID=${req.user.ID}`;
      res.render('index', { user: req.user, title: 'Clubs', data: result.recordset, clubsPage: true });
    } catch (err) {
      console.log(err)
    }
});

module.exports = router;