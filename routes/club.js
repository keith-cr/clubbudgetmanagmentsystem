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
      const result = await sql.query`select * from club where id=${id}`;
      const budgetYears = await sql.query`EXEC GET_BUDGETS_FOR_CLUB @ClubID=${id}`;
      if (result.recordset[0])
        res.render('club', { user: req.user, title: result.recordset[0].Name, club: result.recordset[0], budgetYears: budgetYears.recordset });
      else
        next(); // couldn't find club, pass to 404 handler
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;