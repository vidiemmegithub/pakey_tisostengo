'use strict';

const ObjectId = require('mongoose').Types.ObjectId,
      async = require('async'),
      Question = require('../question/question.model'),
      Article = require('../article/article.model'),
      co = require('co');

// Get list of tags
exports.index = function(req, res) {
  let _tags = [];
  
  try {
    async.parallel({
      questions: function (done) {
        Question.aggregate()
          .project({'tags': true})
          .unwind('tags')
          .group({_id: '$tags', count: {$sum: 1}})
          .sort({'count': -1})
          .exec(done);
      },
      articles: function (done) {
        Article.aggregate()
          .project({'tags': true})
          .unwind('tags')
          .group({_id: '$tags', count: {$sum: 1}})
          .sort({'count': -1})
          .exec(done);
      }
    }, function(err, result) {
      async.each(result.questions.concat(result.articles), (tag, next) => {
        async.detect(_tags, (item, done) => {
          done(item._id === tag._id);
        }, res => {
          if (res) {
            res.count += tag.count;
          }
          else {
            _tags.push(tag);
          }
          next();
        });
        }, () => {
          return res.status(200).json({'tags': _tags.sort((a,b) => b.count-a.count).map(tag => tag._id)});
        });
    });
  }
  catch(err) {
    console.log(err);
    return handleError(res, err);
  }
};

// Get list of tags used by this user
exports.indexByUser = function(req, res) {
  co(function*() {
    let _tags = [],
        _questions, _articles;
    
    try {
      _questions = yield Question.aggregate()
        .match({'target_user': new ObjectId(req.params.userId)})
        .project({'tags': true})
        .unwind('tags')
        .group({_id: '$tags', count: {$sum: 1}})
        .sort({'count': -1})
        .exec();
      _articles = yield Article.aggregate()
        .match({'author': new ObjectId(req.params.userId)})
        .project({'tags': true})
        .unwind('tags')
        .group({_id: '$tags', count: {$sum: 1}})
        .sort({'count': -1})
        .exec();
    
      async.each(_questions.concat(_articles), (tag, next) => {
        async.detect(_tags, (item, done) => {
          done(item._id === tag._id);
        }, res => {
          if (res) {
            res.count += tag.count;
          }
          else {
            _tags.push(tag);
          }
          next();
        });
        }, () => {
          return res.status(200).json({'tags': _tags.sort((a,b) => b.count-a.count).map(tag => tag._id)});
        });
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}