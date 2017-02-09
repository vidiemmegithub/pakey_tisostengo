'use strict';

const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var MessageSchema = new Schema({
  type: { type: String, enum: ['abuse', 'information', 'technical'], default: 'information', immutable: true },
  url: { type: String, immutable: true },
  text: { type: String, immutable: true, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  pub_date: { type: Date, default: Date.now, immutable: true },
  resolved_date: { type: Date, immutable: true },
  firstname: { type: String, immutable: true, required: true },
  lastname: { type: String, immutable: true, required: true },
  email: { type: String, lowercase: true, immutable: true, required: true },
});

// Validations
MessageSchema.pre('save', function(next) {
    if (this.type === 'abuse') {
      return next((!this.url) ? new Error('Il campo url è obbligatorio') : null);
    }
    next();
});
module.exports = mongoose.model('Message', MessageSchema);
