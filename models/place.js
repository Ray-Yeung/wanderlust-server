'use strict';

const mongoose = require('mongoose');
const commentSchema = require('./comment');
//schema to represent a place
const placeSchema = mongoose.Schema({
  name: 
    {type: String, 
      required: true},
  location: {
    lat: String,
    lng: String
  },
  address: 
    {type: String},
  photos: [],
  place_id:
    {type: String},
  comments: [commentSchema],
  // comments: [],
  // comments: [],
  types: [String],
  price_level: {type: Number},
  rating: {type: Number, min: 0, max: 5},
  phone_number: {type: String},
  website: {type: String},
  userId: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }
});

// more efficient mongoose search
placeSchema.index({ place_id: 1, userId: 1 }, {unique: true});

//return _id as id
placeSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Place', placeSchema);
