'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Movie = require('../models/movie');

// Get movies db

router.get('/', (req, res, next) => {
  res.redirect('/movies');
});

router.get('/movies', (req, res, next) => {
  Movie.find({})
    .then((result) => {
      const data = {
        movies: result
      };
      res.render('index', data);
    });
});

router.get('/movies/create', (req, res, next) => {
  res.render('movie-create');
});

router.get('/movies/:movieId', (req, res, next) => {
  // validate mongo id and send 404 if invalid
  if (!mongoose.Types.ObjectId.isValid(req.params.movieId)) {
    res.status(404);
    res.render('not-found');
    return;
  }
  Movie.findOne({ _id: req.params.movieId })
    .then((result) => {
      // check if movie exists, send 404 if not
      if (!result) {
        // res.status(404);
        // res.render('not-found');
        next();
        return;
      }
      const data = {
        movie: result
      };
      res.render('movie', data);
    })
    // catch all errors, send them to the global error handler
    .catch(next);
});

module.exports = router;
