var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET import page. */
router.get('/', async function(req, res, next) {
    res.render('import');
});

router.post('/', async function (req, res) {
    let year = req.body.year;
    let clubid = req.body.clubid;
    try {
        await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
          + process.env.DB_HOST + '/' + process.env.DB_NAME)
        const result = await sql.query`insert into Budget (Year, ClubID) VALUES (${year}, ${clubid})`
        console.log(result)
      } catch (err) {
        console.log(err)
      }
    res.send('');
});

module.exports = router;
