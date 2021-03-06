var express = require('express');
var router = express.Router();
const sql = require('mssql');
const accessControl = require('../accessControl');
const moment = require('moment');
require('dotenv').config();

/* GET deduction page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`EXEC GET_DEDUCTION_INFORMATION @ID=${id}`;//select d.id, d.amount, l.id as lid, l.number, club.name as clubname, club.id as clubid, budget.id as budgetid, budget.year as budgetyear from deduction d join budget on d.budgetid=budget.id join club on d.clubid=club.id join lineitem l on l.id=d.lineitemid where d.id=${id}`;
      if (result.recordset[0]) {
        let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
        if (!hasAccess) {
          return next();
        }
        res.render('updatededuction', { user: req.user, customJs: "updatededuction.js", title: "Update Deduction", deduction: result.recordset[0], errors: req.flash('error'), successes: req.flash('success') });
      } else
        next(); // couldn't find lineitem, pass to 404 handler
    } catch (err) {
        console.log(err);
    }
});

/* POST deduction page. */
router.post('/:id', async function(req, res, next) {
  let id = req.params["id"];
  let amount = req.body.amount;
  let timestamp = req.body.timestamp;
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    await sql.query`EXEC UPDATE_DEDUCTION @ID = ${id}, @amount = ${amount}, @TimeStamp = ${moment(timestamp).toDate()}`;
    req.flash('success', 'Deduction successfully updated');
  } catch (err) {
      req.flash('error', 'Unknown error updating deduction');
      console.log(err);
  }
  res.send('');
});

/* POST delete deduction page. */
router.post('/:id/delete', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      await sql.query`EXEC DELETE_DEDUCTION @ID = ${id}`;
      req.flash('success', 'Deduction successfully deleted');
    } catch (err) {
      req.flash('error', 'Unknown error deleting deduction');
      console.log(err);
    }
    res.redirect('/lineitem');
});

module.exports = router;