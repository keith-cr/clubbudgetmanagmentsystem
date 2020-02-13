var express = require('express');
var router = express.Router();
const sql = require('mssql');
const passport = require('passport');
require('dotenv').config();

/* GET login page. */
router.get('/', async function(req, res, next) {
  if (req.user)
    res.redirect('/');
  res.render('login', { title: "Login", bypassLayout: true, errors: req.flash('error'), successes: req.flash('success') });
});

router.post('/',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: 'Invalid username or password' })
);

module.exports = router;