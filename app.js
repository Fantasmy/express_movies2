'use strict';

// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// -- set routers

// const router = require('auth');
const authRoutes = require('./routes/auth');

const indexRouter = require('./routes/index');

// -- start app

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// ---session and cookies (middleware)

app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 30 * 24 * 60 * 60 // 1 day
  }),
  secret: 'some-thing',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));

// connect to db
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/code_along_mongoose', {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE
});

// -- middlewares

app.use(logger('dev')); // smart logs in the console - get / 200 102,00 ms.... - dev configures how morgan logs

app.use(express.json()); // for requests from browser in json format, to parse it
app.use(express.urlencoded({ extended: false })); // to parse form posts
app.use(cookieParser()); // parse cookies in the headers
app.use(express.static(path.join(__dirname, 'public')));
/* app.use((req, res, next) => { // custom middleware
  console.log(req);
  next(); // give back the controll to expresss
}); */
app.use((req, res, next) => {
  if (!req.session.counter) {
    req.session.counter = 1;
  } else {
    req.session.counter++;
  }
  console.log('SESSION ID', req.session.id);
  next();
});

app.use((req, res, next) => {
  app.locals.user = req.session.user;
  next();
});

// -- routes middlewares

app.use('/', indexRouter);

app.use('/auth', authRoutes);

// router.get('/auth/login', (req, res, next) => {
//   res.render('/auth/login');
// });

// router.get('/auth/signup', (req, res, next) => {
//   res.render('/auth/signup');
// });

// -- 404 and error handler

// NOTE: requires a views/not-found.ejs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found');
});

// NOTE: requires a views/error.ejs template
app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error');
  }
});

module.exports = app;
