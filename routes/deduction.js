var express = require('express');
var router = express.Router();
var sql = require('mssql');
require('dotenv').config();

/* GET deduction page. */
router.get('/:id', async function(req, res, next) {
    let id = req.params["id"];
    // TODO, pass to 404 handler for now
    next();
});

/* POST delete deduction page. */
router.post('/:id/delete', async function(req, res, next) {
    let id = req.params["id"];
    try {
      await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
        + process.env.DB_HOST + '/' + process.env.DB_NAME);
      await sql.query`EXEC DELETE_DEDUCTION @ID = ${id}`
      req.flash('success', 'Deduction successfully deleted');
    } catch (err) {
      req.flash('error', 'Unknown error deleting deduction');
      console.log(err);
    }
    res.redirect('/lineitem');
});

module.exports = router;