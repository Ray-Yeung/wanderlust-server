'use strict';
const express = require('express');

const mongoose = require('mongoose');
const Place = require('../models/place');
const router = express.Router();
const passport = require('passport');

//if we build out a 'my trips' folder will need to validate the trip id

//Protect endpoints using JWT strategy
router.use('/places', passport.authenticate('jwt', {session: false, failWithError: true}));

//GET all places
router.get('/places', (req, res, next) => {
  const userId = req.user.id;
  console.log(userId);

  Place.find({ userId })
    .sort('name')
    .then(results => {
      // console.log(results);
      res.json(results);
    })
    .catch( err => {
      next(err);
    });
});

module.exports = router;
