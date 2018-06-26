'use strict';
const express = require('express');

const mongoose = require('mongoose');
const Comment = require('../models/comment');
const Place = require('../models/place');
const router = express.Router();
const passport = require('passport');

// Protect endpoints using JWT Strategy
router.use('/trips', passport.authenticate('jwt', { session: false, failWithError: true }));

//POST new comment


module.exports = router;