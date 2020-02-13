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
      const result = await sql.query`select l.id, l.number, l.originalbalance, club.name as clubname, club.id as clubid, budget.id as budgetid, budget.year as budgetyear from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      const deductions = await sql.query`select d.timestamp, d.amount, d.id from deduction d where d.lineitemid=${id}`;
      console.log(deductions);
      if (result.recordset[0])
        res.render('lineitem', { user: req.user, title: "Line Item " + result.recordset[0].number, lineitem: result.recordset[0], deductions: deductions.recordset, customJs: 'lineitem.js' });
      else
        next(); // couldn't find lineitem, pass to 404 handler
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
      const result = await sql.query`select l.id, l.number, club.name as clubname, club.id as clubid, budget.id as budgetid, budget.year as budgetyear from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      res.render('adddeduction', { user: req.user, title: "Add Deduction", lineitem: result.recordset[0], errors: req.flash('error'), successes: req.flash('success'), });
    } catch (err) {
        console.log(err);
    }
});

/* POST add deduction page. */
router.post('/:id/add', async function(req, res, next) {
    let id = req.params["id"];
    let amount = req.body.amount;
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`select l.id as id, club.id as clubid, budget.id as budgetid from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      await sql.query`EXEC CREATE_DEDUCTION @ClubID = ${result.recordset[0].clubid}, @BudgetID = ${result.recordset[0].budgetid}, @LineItemID = ${result.recordset[0].id}, @amount = ${amount}`
      req.flash('success', 'Deduction successfully added');
    } catch (err) {
        req.flash('error', 'Unknown error creating deduction');
        console.log(err);
    }
    res.send('');
});

module.exports = router;