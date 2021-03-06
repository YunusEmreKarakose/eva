const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
//session
const session = require('express-session');
//routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const companiesRouter = require('./routes/companies');
const tRouter = require('./routes/transactions');
//db
const mysql = require('./db/mysqlDb');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:'eva',
  resave:'false',
  saveUninitialized:false
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/companies', companiesRouter);
app.use('/transactions', tRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
