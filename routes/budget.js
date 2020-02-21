var express = require('express');
var router = express.Router();
const sql = require('mssql');
const accessControl = require('../accessControl');
require('dotenv').config();

/* GET budget page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`EXEC GET_BUDGET_INFORMATION @ID=${id}`;//select budget.year as year, club.name as clubname, budget.id, club.id as clubid from budget join club on budget.clubid=club.id where budget.id=${id}`;
      const lineitems = await sql.query`EXEC GET_LINEITEMS_FROM_BUDGET @BudgetID_1=${id}`;
      const categories = await sql.query`EXEC GET_CATEGORIES_FOR_BUDGET @BudgetID=${id}`;
      for (lineitem of lineitems.recordset) {
          if(lineitem.remainingbalance==null) {
            lineitem.remainingbalance=lineitem.originalbalance;
            lineitem.deductions=0;
          }
      }
      if (result.recordset[0]) {
        let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
        if (!hasAccess) {
          return next();
        }
        res.render('budget', { user: req.user, title:  result.recordset[0].clubname + "'s " + result.recordset[0].year + " Budget", budget: result.recordset[0], lineitems: lineitems.recordset, categories: categories.recordset, customJs: 'budget.js', errors: req.flash('error'), successes: req.flash('success') });
      } else
        next(); // couldn't find budget, pass to 404 handler
    } catch (err) {
      console.log(err);
      if (err.originalError && err.originalError.info.message.includes('BudgetID doesn\'t exist'))
        next(); // couldn't find budget, pass to 404 handler
    }
});

/* GET add lineitem page. */
router.get('/:id/add', async function(req, res, next) {
  let id = req.params["id"];
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC GET_BUDGET_INFORMATION @ID=${id}`;//select budget.year as year, club.name as clubname, budget.id, club.id as clubid from budget join club on budget.clubid=club.id where budget.id=${id}`;
    const categories = await sql.query`EXEC GET_CATEGORIES_FOR_BUDGET @BudgetID=${id}`;
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
    if (!hasAccess) {
      return next();
    }
    res.render('addlineitem', { user: req.user, title: "Add Line Item", budget: result.recordset[0], categories: categories.recordset, errors: req.flash('error'), successes: req.flash('success') });
  } catch (err) {
      console.log(err);
  }
});

/* POST add lineitem page. */
router.post('/:id/add', async function(req, res, next) {
  let id = req.params["id"];
  let number = req.body.number;
  let catID = req.body.categorySelect;
  let originalBal = req.body.originalBal;
  let description = req.body.description;
  let name = req.body.name;
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC GET_BUDGET_INFORMATION @ID=${id}`;//select budget.year as year, club.name as clubname, budget.id, club.id as clubid from budget join club on budget.clubid=club.id where budget.id=${id}`;
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
    if (!hasAccess) {
      return req.flash('error', 'Improper permissions to create line item');
    }
    await sql.query`EXEC CREATE_LINEITEM @ClubID = ${result.recordset[0].clubid}, @BudgetID = ${result.recordset[0].id}, @Name = ${name}, @Description = ${description}, @CategoryID = ${catID}, @Number = ${number}, @OriginalBalance = ${originalBal}`;
    req.flash('success', 'Line Item successfully added');
  } catch (err) {
      req.flash('error', 'Unknown error creating Line Item');
      console.log(err);
  }
  res.send('');
});

/* GET add category page. */
router.get('/:id/addCat', async function(req, res, next) {
  let id = req.params["id"];
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC GET_BUDGET_INFORMATION @ID=${id}`;//select budget.year as year, club.name as clubname, budget.id, club.id as clubid from budget join club on budget.clubid=club.id where budget.id=${id}`;
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
    if (!hasAccess) {
      return next();
    }
    res.render('addcategory', { user: req.user, title: "Add Category", budget: result.recordset[0], errors: req.flash('error'), successes: req.flash('success') });
  } catch (err) {
      console.log(err);
  }
});

/* POST add category page. */
router.post('/:id/addCat', async function(req, res, next) {
  let id = req.params["id"];
  let number = req.body.number;
  let name = req.body.name;
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC GET_BUDGET_INFORMATION @ID=${id}`;//select budget.year as year, club.name as clubname, budget.id, club.id as clubid from budget join club on budget.clubid=club.id where budget.id=${id}`;
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
    if (!hasAccess) {
      return req.flash('error', 'Improper permissions to create line item');
    }
    await sql.query`EXEC CREATE_CATEGORY @BudgetID = ${result.recordset[0].id}, @Name = ${name}, @Number = ${number}`;
    req.flash('success', 'Category successfully added');
  } catch (err) {
      req.flash('error', 'Unknown error creating Category');
      console.log(err);
  }
  res.send('');
});

/* POST delete budget page. */
router.post('/:id/delete', async function(req, res, next) {
  let id = req.params["id"];
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    await sql.query`EXEC DELETE_BUDGET @BudgetID = ${id}`;
    req.flash('success', 'Budget successfully deleted');
  } catch (err) {
    req.flash('error', 'Error deleting budget');
    console.log(err);
  }
  res.send('');
});

module.exports = router;