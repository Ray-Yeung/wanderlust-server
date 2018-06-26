'use strict';

const mongoose = require('mongoose');

//schema to represent a place
const commentSchema = mongoose.Schema({
  comment: 
    {type: String},
  userId: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  placeId: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'Place' }
});

//return _id as id
commentSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Comment', commentSchema);