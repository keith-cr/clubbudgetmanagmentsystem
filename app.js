const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');
const flash = require('express-flash');
const session = require('express-session');
const hbs = require('express-handlebars');
const hbshelpers = require('handlebars-helpers');
const multihelpers = hbshelpers();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var importRouter = require('./routes/import');
var clubRouter = require('./routes/club');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var budgetRouter = require('./routes/budget');
var lineItemRouter = require('./routes/lineitem');
var deductionRouter = require('./routes/deduction');

var app = express();

// view engine setup
app.engine(
  'hbs',
  hbs({
    helpers: {
      multihelpers,
      formatMoney: function (money) { 
        let number = parseInt(money);
        decSep = ".";
        thouSep = ",";
        var sign = number < 0 ? "-" : "";
        var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(2)));
        var j = (j = i.length) > 3 ? j % 3 : 0;

        return sign + "$" +
          (j ? i.substr(0, j) + thouSep : "") +
          i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
          (2 ? decSep + Math.abs(number - i).toFixed(2).slice(2) : "");
      },
    },
    partialsDir: ["views/partials"],
    extname: ".hbs",
    layoutsDir: "views",
    defaultLayout: "layout"
  })
);
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'g^h$J*k%754hr6', resave: true, saveUninitialized: false }));
app.use(flash(app));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/import', importRouter);
app.use('/club', clubRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/budget', budgetRouter);
app.use('/lineitem', lineItemRouter);
app.use('/deduction', deductionRouter);

app.use(function(req, res, next) {
  res.render('404', {bypassLayout: true});
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
