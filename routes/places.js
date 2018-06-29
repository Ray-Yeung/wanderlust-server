'use strict';
const express = require('express');

const mongoose = require('mongoose');
const Place = require('../models/place');
const Comment = require('../models/comment');
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

  // if(commentId) {
  //   filter.commentId = commentId;
  // }

  Place.find( filter )
    .populate('comments')
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

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
// router.put('/places/:id', (req, res, next) => {
//   const { id } = req.params;
//   console.log(id);
//   const { comment } = req.body;
//   console.log(comment);
//   const userId = req.user.id;

//   //validate input
//   if (!userId) {
//     const err = new Error('Missing `userId` in request body');
//     err.status = 400;
//     return next(err);
//   }

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     const err = new Error('The `id` is not valid');
//     err.status = 400;
//     return next(err);
//   }

//   // const updateComment = { comment, userId };

//   return Place.findOneAndUpdate( {_id: id}, {$push: {comments: comment}}, {new: true})
//     .then(response => {
//       console.log(response)
//       if (response) {
//         console.log(res.json(response));
//       } else {
//         next();
//       }
//     })
//     .catch(err => {
//       next(err);
//     });
// });

router.put('/places/:id/comment', (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  const {comment, placeId} = req.body;
  const commentProps = {comment, placeId};
  console.log(commentProps);
  const userId = req.user.id;
  console.log(userId);

  //validate input
  if (!userId) {
    const err = new Error('Missing `userId` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  // const updateComment = { comment, userId };

  Place.findOneAndUpdate( {_id: id}, {
    $push: {
      comments: { 'comment': comment, 'placeId': id }
    }
  }, {new: true})
    .then(Place.findOne({comments: {'comment': comment}}))
    .then(response => {
      console.log(response);
      if (response) {
        (res.json(response));
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE PLACE ========== */
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

//Deleting comment (ie updating comment array) throwing 'Cannot set headers after they are sent to the client' error
/* ========== DELETE/REMOVE A SINGLE COMMENT ========== */
router.delete('/places/:placeId/comment/:id', (req, res, next) => {
  const { placeId, id } = req.params;
  console.log(req.params);
  const userId = req.user.id;
  // const { placeId } = req.body;
  console.log(id, userId, placeId);

  Place.findOneAndUpdate({ _id: placeId }, {
    $pull: {
      comments: {'_id': id}
    }
  }, {new:true})
    .then(result => {
      console.log(result);
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;
