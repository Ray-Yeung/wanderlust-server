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
  const { tripId } = req.query;
  const userId = req.user.id;
  console.log(userId);

  let filter = { userId };
  //will implement 
  if(tripId) {
    filter.tripId = tripId;
  }

  Place.find( filter )
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
  const { name, location = {}, photos = [], place_id, types = [], price_level, rating, phone_number, website, address, tripId } = req.body;
  console.log(tripId);

  const userId = req.user.id;
  console.log(userId);

  const newPlace = { name, location, photos, place_id, types, price_level, rating, phone_number, website, userId, address };
  //validate input
  if (!userId) {
    const err = new Error('Missing `userId` in request body');
    err.status = 400;
    return next(err);
  }

  if (tripId) {
    if (mongoose.Types.ObjectId.isValid(tripId)) {
      newPlace.tripId = tripId;
    } else {
      const err = new Error('The `tripId` is not valid');
      err.status = 400;
      return next(err);
    }
  }

  //create new place
  Place.create(newPlace)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        console.log(err.code);
        err = new Error('The place name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/places/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log(id, userId);

  Place.findOneAndRemove({ _id: id, userId })
    .then(result => {
      if (!result) {
        next();
      }
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;
