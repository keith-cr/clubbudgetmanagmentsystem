var express = require('express');
var router = express.Router();
const sql = require('mssql');
const accessControl = require('../accessControl');
require('dotenv').config();

/* GET lineitem page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`EXEC GET_LINEITEM @id=${id}`;//select l.id, l.number, l.originalbalance, club.name as clubname, club.id as clubid, budget.id as budgetid, budget.year as budgetyear from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      const deductions = await sql.query`EXEC GET_DEDUCTION_INFORMATION_FOR_LINEITEM @id=${id}`;//select d.timestamp, d.amount, d.id from deduction d where d.lineitemid=${id}`;
      if (result.recordset[0]) {
        const categories = await sql.query`EXEC GET_CATEGORIES_FOR_BUDGET @BudgetID=${result.recordset[0].budgetid}`;
        let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
        if (!hasAccess) {
          return next();
        }
        res.render('lineitem', { user: req.user, title: "Line Item " + result.recordset[0].number, lineitem: result.recordset[0], deductions: deductions.recordset, categories: categories.recordset, customJs: 'lineitem.js', errors: req.flash('error'), successes: req.flash('success') });
      } else
        next(); // couldn't find lineitem, pass to 404 handler

    } catch (err) {
        console.log(err);
    }
});

/* POST lineitem page. */
router.post('/:id', async function(req, res, next) {
  let id = req.params["id"];
  let number = req.body.number;
  let catID = req.body.categorySelect;
  let originalBal = req.body.originalBal;
  let description = req.body.description;
  let name = req.body.name;
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC GET_LINEITEM_INFORMATION @ID=${id}`;//select budget.year as year, club.name as clubname, budget.id, club.id as clubid from budget join club on budget.clubid=club.id where budget.id=${id}`;
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
    if (!hasAccess) {
      return req.flash('error', 'Improper permissions to create line item');
    }
    await sql.query`EXEC UPDATE_LINEITEM @ID = ${id}, @Name = ${name}, @Description = ${description}, @CategoryID = ${catID}, @Number = ${number}, @OriginalBalance = ${originalBal}`;
    req.flash('success', 'Line Item successfully updated');
  } catch (err) {
      req.flash('error', 'Error updating Line Item');
      console.log(err);
  }
  res.send('');
});

/* GET add deduction page. */
router.get('/:id/add', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`EXEC GET_LINEITEM_INFORMATION @ID=${id}`;//select l.id, l.number, club.name as clubname, club.id as clubid, budget.id as budgetid, budget.year as budgetyear from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
      if (!hasAccess) {
        return next();
      }
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
      const result = await sql.query`EXEC GET_LINEITEM_INFORMATION @ID=${id}`;//select l.id as id, club.id as clubid, budget.id as budgetid from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
      if (!hasAccess) {
        return req.flash('error', 'Improper permissions to create deduction');
      }
      await sql.query`EXEC CREATE_DEDUCTION @ClubID = ${result.recordset[0].clubid}, @BudgetID = ${result.recordset[0].budgetid}, @LineItemID = ${result.recordset[0].id}, @amount = ${amount}, @DeductorID=${req.user.ID}`
      req.flash('success', 'Deduction successfully added');
    } catch (err) {
        req.flash('error', 'Unknown error creating deduction');
        console.log(err);
    }
    res.send('');
});

/* POST delete lineitem page. */
router.post('/:id/delete', async function(req, res, next) {
  let id = req.params["id"];
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    await sql.query`EXEC DELETE_LINEITEM @ID = ${id}`;
    req.flash('success', 'Line Item successfully deleted');
  } catch (err) {
    req.flash('error', 'Error deleting line item');
    console.log(err);
  }
  res.send('');
});

module.exports = router;