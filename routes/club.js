var express = require('express');
var router = express.Router();
const sql = require('mssql');
const accessControl = require('../accessControl');
require('dotenv').config();

/* GET club page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, id);
    if (!hasAccess) {
      return next();
    }
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`EXEC GET_CLUB_INFORMATION @ID=${id}`;//select * from club where id=${id}`;
      const budgetYears = await sql.query`EXEC GET_BUDGETS_FOR_CLUB @ClubID=${id}`;
      if (result.recordset[0]) {
        for (let budget of budgetYears.recordset) {
          if (budget.RemainingBalance == null) {
            budget.RemainingBalance = budget.OriginalBalance;
          }
        }
        res.render('club', { user: req.user, title: result.recordset[0].Name, club: result.recordset[0], budgetYears: budgetYears.recordset, customJs: 'club.js', errors: req.flash('error'), successes: req.flash('success') });
      } else
        next(); // couldn't find club, pass to 404 handler
    } catch (err) {
        console.log(err);
    }
});

/* GET add budget page. */
router.get('/:id/add', async function(req, res, next) {
  let id = req.params["id"];
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC GET_CLUB_INFORMATION @ID=${id}`;
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, id);
    if (!hasAccess) {
      return next();
    }
    res.render('addbudget', { user: req.user, title: "Add Budget", club: result.recordset[0], errors: req.flash('error'), successes: req.flash('success') });
  } catch (err) {
      console.log(err);
  }
});

/* POST add budget page. */
router.post('/:id/add', async function(req, res, next) {
  let id = req.params["id"];
  let year = req.body.year;
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC GET_CLUB_INFORMATION @ID=${id}`;
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, id);
    if (!hasAccess) {
      return req.flash('error', 'Improper permissions to create Budget');
    }
    await sql.query`EXEC CREATE_BUDGET @ClubID = ${id}, @Year = ${year}`;
    req.flash('success', 'Budget successfully added');
  } catch (err) {
    if (err.originalError && err.originalError.info.message.includes("Violation of UNIQUE KEY"))
      req.flash('error', 'Budget year already exists for that club');
    else if (err.originalError && err.originalError.info.message.includes("CK_BudgetYear"))
      req.flash('error', 'Invalid budget year');
    else
      req.flash('error', 'Unknown error creating Budget');
      console.log(err);
  }
  res.send('');
});


module.exports = router;