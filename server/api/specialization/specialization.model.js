'use strict';

const mongoose = require('mongoose');

let SpecializationSchema = new mongoose.Schema({
  name: { type: String, unique: true, index: 'text' },
  category: { type: String, index: 'text' }
});

module.exports = mongoose.model('Specialization', SpecializationSchema);
