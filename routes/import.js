var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET import page. */
router.get('/', async function(req, res, next) {
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME)
    const result = await sql.query`select * from club`
    res.render('import', {title: 'Import', errors: req.flash('error'), successes: req.flash('success'), clubs: result.recordset, importPage: true});
  } catch (err) {
    console.log(err)
  }
});

router.post('/', async function (req, res) {
    let year = req.body.year;
    let clubid = req.body.clubid;
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`insert into Budget (Year, ClubID) VALUES (${year}, ${clubid})`
      console.log(result);
      req.flash('success', 'Budget file sucessfully imported');
    } catch (err) {
      if (err.originalError.info.message.includes("Violation of UNIQUE KEY"))
        req.flash('error', 'Unable to import budget, budget year already exists for that club');
      else
        req.flash('error', 'Unknown error importing file');
      console.log(JSON.stringify(err.originalError.info.message));
    }
    res.send('');
});

module.exports = router;
