'use strict';

const express = require('express');
const router = express.Router();

const User = require('../models/user');

const bcrypt = require('bcrypt');
const bcryptSalt = 10;

router.get('/login', (req, res, next) => { // templates
  if (req.session.user) {
    return res.redirect('/movies');
  } else {
    res.render('auth/login');
  }
});

router.post('/login', (req, res, next) => { // redirect to url (localhost, same path)
  if (req.session.user) {
    return res.redirect('/movies');
  }

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }) // key : value
    .then(result => {
      if (!result) {
        res.redirect('/auth/login');
      } else if (bcrypt.compareSync(password, result.password)) {
        req.session.user = result;
        res.redirect('/movies');
      } else {
        res.redirect('/auth/signup');
      }
    })
    .catch(next);
});

router.get('/signup', (req, res, next) => { // templates
  if (req.session.user) {
    return res.redirect('/movies');
  }
  res.render('auth/signup');
});

/* router.post('/signup', (req, res, next) => { // redirect to url
  if (req.session.user) {
    return res.redirect('/movies');
  } else {
    res.redirect('/auth/signup');
  }
}); */

router.post('/signup', (req, res, next) => {
  if (req.session.user) {
    res.redirect('/movies');
  }

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.redirect('/auth/signup');
    console.log('something');
  }

  User.findOne({ username: username }) // check if there is already this user
    .then(result => {
      if (result) {
        return res.render('auth/signup');
      } else {
        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(password, salt);

        const user = new User({
          username,
          password: hashPass
        });

        user.save()
          .then(() => {
            req.session.user = user;
            res.redirect('/');
          })
          .catch(next);
        // .catch(err => {
        //   next(err);
      }
    })
    .catch(next);
});

router.post('/logout', (req, res, next) => {
  req.session.user = null; // delete req.session.user
  res.redirect('/movies');
});

module.exports = router;
