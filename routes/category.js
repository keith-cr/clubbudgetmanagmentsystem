var express = require('express');
var router = express.Router();
const sql = require('mssql');
const accessControl = require('../accessControl');
require('dotenv').config();

/* GET category page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      const result = await sql.query`EXEC GET_CATEGORY @id=${id}`;//select l.id, l.number, l.originalbalance, club.name as clubname, club.id as clubid, budget.id as budgetid, budget.year as budgetyear from lineitem l join budget on l.budgetid=budget.id join club on budget.clubid=club.id where l.id=${id}`;
      if (result.recordset[0]) {
        let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
        if (!hasAccess) {
          return next();
        }
        res.render('category', { user: req.user, title: result.recordset[0].Name, category: result.recordset[0], errors: req.flash('error'), successes: req.flash('success') });
      } else
        next(); // couldn't find lineitem, pass to 404 handler

    } catch (err) {
        console.log(err);
    }
});

/* POST category page. */
router.post('/:id', async function(req, res, next) {
  let id = req.params["id"];
  let number = req.body.number;
  let name = req.body.name;
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC GET_CATEGORY @ID=${id}`;//select budget.year as year, club.name as clubname, budget.id, club.id as clubid from budget join club on budget.clubid=club.id where budget.id=${id}`;
    let hasAccess = await accessControl.isMemberOfClub(req.user.ID, result.recordset[0].clubid);
    if (!hasAccess) {
      return req.flash('error', 'Improper permissions to create category');
    }
    await sql.query`EXEC UPDATE_CATEGORY @ID = ${id}, @Name = ${name}, @Number = ${number}`;
    req.flash('success', 'Number successfully updated');
  } catch (err) {
      req.flash('error', 'Error updating Category');
      console.log(err);
  }
  res.send('');
});

/* POST delete category page. */
router.post('/:id/delete', async function(req, res, next) {
  let id = req.params["id"];
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    await sql.query`EXEC DELETE_CATEGORY @ID = ${id}`;
    req.flash('success', 'Category successfully deleted');
  } catch (err) {
    req.flash('error', 'Error deleting category');
    console.log(err);
  }
  res.send('');
});

module.exports = router;