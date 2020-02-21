var express = require('express');
var router = express.Router();
const sql = require('mssql');
const accessControl = require('../accessControl');
require('dotenv').config();

/* GET import page. */
router.get('/', async function(req, res, next) {
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME)
    const result = await sql.query`EXEC CLUBS_FOR_USER @UserID=${req.user.ID}`
    res.render('import', {title: 'Import', errors: req.flash('error'), successes: req.flash('success'), clubs: result.recordset, importPage: true});
  } catch (err) {
    console.log(err);
  }
});

router.post('/', async function (req, res) {
    let body = req.body;
    let year = body.year;
    let clubid = body.clubid;
    let clubname = body.clubname;
    let categories = JSON.parse(body.categories);
    let lineItems = JSON.parse(body.lineItems);
    console.log(clubname);
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      if (clubid == -1) {
        let club = await sql.query`EXEC CREATE_CLUB @Name = ${clubname}`;
        clubid = club.recordset[0].id;
        await sql.query`EXEC CREATE_MEMBEROF @ClubID = ${clubid}, @UserID = ${req.user.ID}`
      } else {
        let hasAccess = await accessControl.isMemberOfClub(req.user.ID, clubid);
        if (!hasAccess) {
          return req.flash('error', 'Unable to import budget, improper permissions');;
        }
      }
      await sql.query`EXEC CREATE_BUDGET @Year = ${year}, @ClubID = ${clubid}`;
      let result = await sql.query`EXEC GET_BUDGET_ID @ClubID=${clubid}, @Year=${year}`;//select ID from BUDGET where Year = ${year} and ClubID = ${clubid}`
      let budgetID = result.recordset[0].ID;
      for (let category of categories) {
        await sql.query`EXEC CREATE_CATEGORY @BudgetID = ${budgetID}, @Name = ${category.name}, @Number = ${category.number}`;
      }
      for (let lineItem of lineItems) {
        let catNum = Math.floor(parseFloat(lineItem.number));
        let catResult = await sql.query`EXEC GET_CATEGORY_ID @BudgetID=${budgetID}, @CatNum=${catNum}`;//select ID from Category where BudgetID = ${budgetID} and Number = ${catNum}`;
        let catID = catResult.recordset[0].ID;
        console.log(lineItem.number);
        await sql.query`EXEC CREATE_LineItem @ClubID = ${clubid}, @BudgetID = ${result.recordset[0].ID}, 
          @Number = ${lineItem.number}, @OriginalBalance = ${lineItem.originalBal}, @Description = ${lineItem.desc}, 
          @Name = ${lineItem.name}, @CategoryID = ${catID}`;
      }
      req.flash('success', 'Budget file sucessfully imported');
    } catch (err) {
      if (err.originalError && err.originalError.info.message.includes("Violation of UNIQUE KEY"))
        req.flash('error', 'Unable to import budget, budget year already exists for that club');
      else
        req.flash('error', 'Unknown error importing file');
      console.log(err);
    }
    res.send('');
});

module.exports = router;
