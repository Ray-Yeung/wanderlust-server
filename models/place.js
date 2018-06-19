'use strict';

const mongoose = require('mongoose');

//schema to represent a place
//need to add these: address: 
// {type: String},
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
  types: [String],
  price_level: {type: Number},
  rating: {type: Number, min: 0, max: 5},
  phone_number: {type: String},
  website: {type: String},
  userId: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip_id: 
    {type: String}
});

//more efficient mongoose search
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
