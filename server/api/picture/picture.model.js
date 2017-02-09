'use strict';

const mongoose = require('mongoose');

let PictureSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  picture: String
});

module.exports = mongoose.model('Picture', PictureSchema);
