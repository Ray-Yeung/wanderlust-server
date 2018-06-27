'use strict';
const express = require('express');

const mongoose = require('mongoose');
const Comment = require('../models/comment');
const Place = require('../models/place');
const router = express.Router();
const passport = require('passport');

// Protect endpoints using JWT Strategy
router.use('/comments', passport.authenticate('jwt', { session: false, failWithError: true }));

//Will definitely implement post and delete comment
//GET comments
router.get('/comments', (req, res, next) => {
  console.log(req);
  const userId = req.user.id;
  console.log(userId);
  const placeId = req.place.id;

  Comment.find({ userId, placeId })
    .sort('created', -1)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

//POST new comment
router.post('/comments', (req, res, next) => {
  console.log(req.body);
  const { comment, placeId } = req.body;
  const userId = req.user.id;
  console.log(userId, placeId);

  const newComment = { comment, userId, placeId };

  Comment.create(newComment)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

//PUT/UPDATE comment

//DELETE comment

module.exports = router;