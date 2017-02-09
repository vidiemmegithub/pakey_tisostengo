'use strict';

const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  text: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  pub_date: { type: Date },
  read_date: { type: Date },
  category: String,
  target_user: { type: Schema.Types.ObjectId, ref: 'User' },
  answer: {
    text: {type: String},
    date: {type: Date}
  },
  type: { type: String, enum: ['public', 'private'], default: 'public' },
  tags: { type: [String] },
  comments: { type: [{
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    text: String
  }], default: [] },
  attachments: [{
    name: String,
    location: String
  }]
});

// creation of text indexes to perform text $search queries
QuestionSchema.index({
  'text': 'text',
  'answer.text': 'text'
}, {
  default_language: 'italian'
});

module.exports = mongoose.model('Question', QuestionSchema);
