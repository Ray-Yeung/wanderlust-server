'use strict';
const express = require('express');

const User = require('../models/user');

const router = express.Router();

//POST endpoint for Usernodemon
router.post('/users', (req, res, next) => {

  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  // if (missingField) {
  //   const err = new Error('error message');
  //   err.status = 422;
  //   // err.message(`Missing '${missingField}' in request body`);
  //   return next(err);
  // }

  const stringFields = ['username', 'password', 'firstname', 'lastname'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect input: expected string',
      location: nonStringField
    });
  }

  // if (nonStringField) {
  //   const err = new Error(`Field: '${nonStringField}' must be type String`);
  //   err.status = 422;
  //   return next(err);
  // }

  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  // if (nonTrimmedField) {
  //   const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with whitespace`);
  //   err.status = 422;
  //   return next(err);
  // }

  // bcrypt truncates after 72 characters, so let's not give the illusion
  // of security by storing extra **unused** info
  const sizedFields = {
    username: { min: 1 },
    password: { min: 8, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooLargeField}' must be at most ${max} characters long`);
    err.status = 422;
    return next(err);
  }

  // Username and password were validated as pre-trimmed
  let { username, password, firstname, lastname = '' } = req.body;
  firstname= firstname.trim();
  lastname = lastname.trim();
  // Remove explicit hashPassword if using pre-save middleware
  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        firstname,
        lastname
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;