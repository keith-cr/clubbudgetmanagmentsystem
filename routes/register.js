var express = require('express');
var router = express.Router();
const sql = require('mssql');
const passport = require('passport');
const passwordManager = require('../passwordManager')
require('dotenv').config();

/* GET register page. */
router.get('/', async function(req, res, next) {
  res.render('register', { title: "Register", bypassLayout: true, errors: req.flash('error'), successes: req.flash('success') });
});

router.post('/', async function(req, res, next) {
  const username = req.body.username;
  const password = req.body.username;
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    let encryptedPassword = await passwordManager.cryptPassword(password);
    let result = await sql.query`EXEC CREATE_USER @Username = ${username}, @Password = ${encryptedPassword}`;
    req.login(result.recordset[0], function(err) {
      if (err) {
         console.log(err);
         req.flash('error', 'Registration successful, but login failed, please try to login');
         req.redirect('/login');
      }
      res.redirect('/'); 
    });
  } catch (err) {
    console.log(err);
    if (err.originalError && err.originalError.info.message.includes("Violation of UNIQUE KEY"))
      req.flash('error', 'Username already exists');
    else
      req.flash('error', 'Registration failed');
    res.redirect('/register');
  }
});

module.exports = router;