var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET budget page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`select budget.year as year, club.name as clubname from budget join club on budget.clubid=club.id where budget.id=${id}`;
      const lineitems = await sql.query`select l.number, l.originalbalance, l.description, l.name, l.otfr from lineitem l where l.budgetid=${id}`;
      console.log(result.recordset[0]);
      console.log(lineitems.recordset);
      res.render('budget', { title:  result.recordset[0].clubname + "'s " + result.recordset[0].year + " Budget", budget: result.recordset[0], lineitems: lineitems.recordset });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;