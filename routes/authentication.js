const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('./../models/user');
const routeAuthenticationGuard = require('./../middleware/route-authentication-guard');

const authenticationRouter = new express.Router();

authenticationRouter.get('/sign-up', (req, res, next) => {
  res.render('authentication/sign-up');
});

authenticationRouter.post('/sign-up', (req, res, next) => {
  const { username, password } = req.body;

  if (password.length === 0) {
    console.log('too short password');
    const err = new Error('You must create a password.');
    console.log(err);
    next(err);
  } else {
    bcrypt
      .hash(password, 10)
      .then(hashAndSalt => {
        return User.create({
          username,
          passwordHashAndSalt: hashAndSalt
        });
      })
      .then(user => {
        res.redirect('/');
      })
      .catch(err => {
        next(err);
      });
  }
});

authenticationRouter.get('/sign-in', (req, res, next) => {
  res.render('authentication/sign-in');
});

authenticationRouter.post('/sign-in', (req, res, next) => {
  const { username, password } = req.body;

  let user;

  User.findOne({ username })
    .then(document => {
      user = document;

      if (!user) {
        return Promise.reject(new Error('No user with that email.'));
      }

      const passwordHashAndSalt = user.passwordHashAndSalt;
      return bcrypt.compare(password, passwordHashAndSalt);
    })
    .then(comparison => {
      if (comparison) {
        req.session.userId = user._id;
        res.redirect('/');
      } else {
        const error = new Error('Password did not match.');
        return Promise.reject(error);
      }
    })
    .catch(err => {
      next(error);
    });
});

authenticationRouter.get(
  '/private',
  routeAuthenticationGuard,
  (request, response, next) => {
    response.render('private');
  }
);

authenticationRouter.get(
  '/main',
  routeAuthenticationGuard,
  (request, response, next) => {
    response.render('main');
  }
);

authenticationRouter.get(
  '/profile',
  routeAuthenticationGuard,
  (req, res, next) => {
    res.render('profile', { user });
  }
);

module.exports = authenticationRouter;