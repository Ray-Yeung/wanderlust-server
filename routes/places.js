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
  //will implement 
  //if(trip_id) {filter.trip_id = tripId

  Place.find({ userId })
    .sort('name')
    .then(results => {
      console.log(results);
      res.json(results);
    })
    .catch( err => {
      next(err);
    });
});

//POST a place
router.post('/places', (req, res, next) => {
  const { name, location = {}, photos = [], place_id, types = [], price_level, rating, phone_number, website, address } = req.body;
  console.log(req.body);

  const userId = req.user.id;
  console.log(userId);

  const newPlace = { name, location, photos, place_id, types, price_level, rating, phone_number, website, userId, address };
  //validate input
  if (!userId) {
    const err = new Error('Missing `userId` in request body');
    err.status = 400;
    return next(err);
  }

  //create new place
  Place.create(newPlace)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The place name already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;
