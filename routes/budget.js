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
      const result = await sql.query`select budget.year as year, club.name as clubname, budget.id, club.id as clubid from budget join club on budget.clubid=club.id where budget.id=${id}`;
      const lineitems = await sql.query`EXEC GET_LINEITEMS_FROM_BUDGET @BudgetID_1=${id}`;
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
        res.render('budget', { user: req.user, title:  result.recordset[0].clubname + "'s " + result.recordset[0].year + " Budget", budget: result.recordset[0], lineitems: lineitems.recordset, customJs: 'budget.js' });
      } else
        next(); // couldn't find budget, pass to 404 handler
    } catch (err) {
      console.log(err);
      if (err.originalError && err.originalError.info.message.includes('BudgetID doesn\'t exist'))
        next(); // couldn't find budget, pass to 404 handler
    }
});

module.exports = router;