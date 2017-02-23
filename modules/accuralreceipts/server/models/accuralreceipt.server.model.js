'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Accuralreceipt Schema
 */
var AccuralreceiptSchema = new Schema({
  docno: {
    unique: true,
    type: String,
    default: '',
    required: 'Please fill Accuralreceipt docno',
    trim: true
  },
  docdate: {
    type: Date,
    required: 'Please fill Accuralreceipt docdate'
  },
  namedeliver: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  items: {
    required: 'Please fill Accuralreceipt items',
    type: [{
      type: Schema.ObjectId,
      ref: 'Order'
    }]
  },
  billamount: Number,
  imgslip: String,
  arstatus: {
    type: String,
    default: 'wait for review'
  },
  historystatus: {
    type: [{
      status: String,
      datestatus: Date
    }]
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Accuralreceipt', AccuralreceiptSchema);
