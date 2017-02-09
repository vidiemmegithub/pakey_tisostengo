'use strict';

const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: String,
  text: String,
  thumbnail: String,
  category: String,
  creation_date: { type: Date, default: Date.now, immutable: true },
  pub_date: { type: Date, immutable: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', immutable: true },                            // this field is always immutable
  tags: { type: [String] },
  priority: {type: Boolean, default: false, immutable: ['qualified', 'unqualified', 'editor']},     // this field is immutable for all the listed roles
  editorial: {type: Boolean, default: false, immutable: ['qualified', 'unqualified', 'editor']},
  evidence: {type: Boolean, default: false, immutable: ['qualified', 'unqualified', 'editor']},
  evidence_uq: {type: Boolean, default: false, immutable: ['qualified', 'unqualified', 'editor']},
  evidence_unq: {type: Boolean, default: false, immutable: ['qualified', 'unqualified', 'editor']},
  comments: { type: [{
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    text: String
  }], default: [] }
});

// creation of text indexes to perform text $search queries
ArticleSchema.index({
  'text': 'text',
  'title': 'text'
}, {
  default_language: 'italian'
});

module.exports = mongoose.model('Article', ArticleSchema);
