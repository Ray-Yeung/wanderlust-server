'use strict';

const mongoose = require('mongoose');

//schema to represent a place
const placeSchema = mongoose.Schema({
  name: 
    {type: String, 
      required: true},
  address: 
      {type: String},
  location: {
    type: {type: String},
    coordinates: []
  },
  photos: [],
  place_id:
    {type: String},
  price_level: {type: Number},
  rating: {type: Number},
  types: []
});