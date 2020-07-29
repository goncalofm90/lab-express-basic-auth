const { join } = require('path');
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const mongoose = require('mongoose');

const mongoStore = connectMongo(expressSession);

const deserializeUser = require('./middleware/deserialize-user');
const bindUserToResponseLocals = require('./middleware/bind-user-to-response-local');
const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');

const app = express();

// Setup view engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(join(__dirname, 'public')));
app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(
  sassMiddleware({
    src: join(__dirname, 'public'),
    dest: join(__dirname, 'public'),
    outputStyle:
      process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: true
  })
);

app.use(
  expressSession({
    secret: 'ABC',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 15 * 24 * 60 * 60 * 1000 },
    store: new mongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60
    })
  })
);

app.use(deserializeUser);
app.use(bindUserToResponseLocals);

app.use('/', indexRouter);
app.use('/authentication', authenticationRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;