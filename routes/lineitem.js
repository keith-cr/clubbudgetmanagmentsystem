var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET lineitem page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`select l.id, l.number, l.originalbalance, club.name as clubname, club.id as clubid, budget.id as budgetid from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      const deductions = await sql.query`select d.timestamp, d.amount, d.id from deduction d where d.lineitemid=${id}`;
      console.log(deductions);
      res.render('lineitem', { title: "Line Item " + result.recordset[0].number, lineitem: result.recordset[0], deductions: deductions.recordset });
    } catch (err) {
        console.log(err);
    }
});

/* GET add deduction page. */
router.get('/:id/add', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`select l.id, l.number, club.id as clubid, budget.id as budgetid from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      res.render('adddeduction', { title: "Add Deduction", lineitem: result.recordset[0] });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;