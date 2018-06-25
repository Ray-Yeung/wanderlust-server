'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Trip = require('../models/trip');
const Place = require('../models/place');

const router = express.Router();

// Protect endpoints using JWT Strategy
router.use('/trips', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL TRIPS ========== */
router.get('/trips', (req, res, next) => {
  const userId = req.user.id;
  console.log(userId);

  Trip.find({ userId })
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE TRIP ========== */
router.get('/trips/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Trip.findOne({ _id: id, userId })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/trips', (req, res, next) => {
  const { name, location = {}, photos = [], place_id, address, comment = [] } = req.body;
  const userId = req.user.id;

  const newTrip = { name, location, photos, place_id, address, comment, userId };

  //validate input
  if (!userId) {
    const err = new Error('Missing `userId` in request body');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Trip.create(newTrip)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The trip name already exists');
        err.status = 400;
      }
      next(err);
    });
});

//need to test
/* ========== PUT/UPDATE A SINGLE ITEM ========== */
//have to figure out what will be updatable
router.put('/trips/:id', (req, res, next) => {
  const { id } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!comment) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const updateTrip = { comment, userId };

  Trip.findByIdAndUpdate(id, updateTrip, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The trip name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/trips/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log(userId, id);

  Trip.findOneAndRemove({ _id: id, userId })
    .then(results => {
      console.log(results);
      if (!results) {
        next();
      }
      //Do we want to clear out trip id from saved places as below or to actually delete them...maybe give option on front end?
      return Place.deleteMany(
        { tripId: id, userId }
        // { $unset: { tripId: '' } }
      );
    })
    // .then((results) => {
    //   console.log('results', results);
    //   res.status(204).json({id}).end();
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;