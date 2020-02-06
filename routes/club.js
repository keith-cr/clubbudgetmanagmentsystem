var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET club page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`select * from club where id=${id}`;
      const budgetYears = await sql.query`EXEC GET_BUDGETS_FOR_CLUB @ClubID=${id}`;
      console.log(result.recordset[0]);
      res.render('club', { title: result.recordset[0].Name, club: result.recordset[0], budgetYears: budgetYears.recordset });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;