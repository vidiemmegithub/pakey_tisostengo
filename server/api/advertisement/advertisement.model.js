'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var AdvertisementSchema = new Schema({
  validSince: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  picture: { type: String, required: true },
  link: { type: String, required: true },
  visibility: {type: String, enum: ['home', 'qualified', 'unqualified'], required: true },
  disabled: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  lastView: { type: Date, default: Date.new },
  createdAt: { type: Date, default: Date.new }
});


module.exports = mongoose.model('Advertisement', AdvertisementSchema);
