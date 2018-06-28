'use strict';

const mongoose = require('mongoose');

//schema to represent a place
const commentSchema = new mongoose.Schema({
  // _id = new ObjectId(),
  comment: 
    {type: String},
  created: { type: Date, default: Date.now },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' },
  placeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Place' }
});

//return _id as id
commentSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = commentSchema;
// module.exports = mongoose.model('Comment', commentSchema);