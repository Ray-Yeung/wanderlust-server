'use strict';

const User = require('../models/user');
const { Strategy: LocalStrategy } = require('passport-local');

//Setting up local login strategy
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  User.findOne({ username })
    .then(results => {
      user = results;
      if (!user) {
        return Promise.reject({
          reason: 'Login Error',
          message: 'Wrong username',
          location: 'username',
          status: 422
        });
      }

      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'Login Error',
          message: 'Wrong password',
          location: 'password',
          status: 422
        });
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason !== 'Login Error') {
        return done(null, false);
      }

      return done(err);
    });
});

module.exports = localStrategy;