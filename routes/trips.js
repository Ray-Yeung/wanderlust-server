'use strict';

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

tripSchema.index({ name: 1, userId: 1 }, { unique: true });

tripSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Trip', tripSchema);