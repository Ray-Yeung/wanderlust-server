'use strict';

const mongoose = require('mongoose');
const moment = require('moment')
//schema to represent a place
const commentSchema = new mongoose.Schema({
  // _id = new ObjectId(),
  comment: 
    {type: String},
  created: {type: String,  default: moment((Date.now())).format('hh:mmA MM/DD/YY')},
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