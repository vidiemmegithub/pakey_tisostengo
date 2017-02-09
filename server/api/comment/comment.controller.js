'use strict';

const _ = require('lodash'),
      mongoose = require('mongoose'),
      User = require('../user/user.model'),
      Question = require('../question/question.model'),
      Article = require('../article/article.model'),
      co = require('co');

// Get list of comments made by this user
exports.indexByUser = function(req, res) {
  co(function*() {
    let _questions, _articles, _retQuestions, _retArticles;

    try {
      _questions = yield Question
        .find({'comments.author': req.user._id}, {'text': true, 'target_user': true, 'pub_date': true, 'comments.date': true, 'comments.author': true})
        .populate({path: 'comments.author target_user', select: 'title firstname lastname specialization city', match: {'$or': [{banned: false}, {role: 'editor'}]}});
      _articles = yield Article
        .find({'comments.author': req.user._id}, {'title': true, 'author': true, 'pub_date': true, 'comments.date': true, 'comments.author': true})
        .populate({path: 'author comments.author', select: 'title firstname lastname', match: {'$or': [{banned: false}, {role: 'editor'}]}});

      // remove comments made by banned users
      _articles.forEach(article => _.remove(article.comments, comment => !comment.author));
      _questions.forEach(question => _.remove(question.comments, comment => !comment.author));
      // remove content without comment
      _.remove(_articles, article => (!article.author || (article.comments.length === 0)));
      _.remove(_questions, question => (!question.target_user || (question.comments.length === 0)));
      
      _retQuestions = _questions.map(question => {
        return {
          _id: question._id,
          elType: 'question',
          title: question.text,
          pub_date: question.pub_date,
          user: question.target_user,
          comments: question.comments
        }
      });
      _retArticles = _articles.map(article => {
        return {
          _id: article._id,
          elType: 'article',
          title: article.title,
          pub_date: article.pub_date,
          user: article.author,
          comments: article.comments
        }
      });
      return res.status(200).json(_retQuestions.concat(_retArticles).sort((a, b) => {
        let _bDate = b.comments.sort((a, b) => (b.date.getTime() - a.date.getTime()))[0],
            _aDate = a.comments.sort((a, b) => (b.date.getTime() - a.date.getTime()))[0];
      
        return (_bDate.date.getTime() - _aDate.date.getTime());
      }));
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of article commented by this user
exports.indexArticlesByUser = function(req, res) {
  co(function*() {
    let _articles;

    if (Object.keys(req.fields).length === 0) {
      req.fields = {thumbnail: false};
    }
    else {
      _.merge(req.fields, {author: true, comments: true})
    }
    try {
      _articles = yield Article
        .find({'comments.author': req.user._id}, req.fields)
        .sort({'pub_date': -1})
        .limit(req.paging.limit)
        .skip(req.paging.skip)
        .populate({path: 'author comments.author', select: 'title firstname lastname', match: {'$or': [{banned: false}, {role: 'editor'}]}});

       // remove comments made by banned users
      _articles.forEach(article => _.remove(article.comments, comment => !comment.author));
      // remove content without comment
      _.remove(_articles, article => (!article.author || (article.comments.length === 0)));
      
     return res.status(200).json({'articles': _articles});
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of questions commented by this user
exports.indexQuestionsByUser = function(req, res) {
  co(function*() {
    let _questions;

    if (Object.keys(req.fields).length === 0) {
      req.fields = {thumbnail: false};
    }
    else {
      _.merge(req.fields, {target_user: true, comments: true})
    }
    try {
      _questions = yield Question
        .find({'comments.author': req.user._id}, req.fields)
        .sort({'pub_date': -1})
        .limit(req.paging.limit)
        .skip(req.paging.skip)
        .populate({path: 'comments.author target_user', select: 'title firstname lastname specialization city', match: {'$or': [{banned: false}, {role: 'editor'}]}});
        
      // remove comments made by banned users
      _questions.forEach(question => _.remove(question.comments, comment => !comment.author));
      // remove content without comment
      _.remove(_questions, question => (!question.target_user || (question.comments.length === 0)));
      
      return res.status(200).json({'questions': _questions});
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

exports.addToCollection = function(req, res) {
  co(function*() {
    let _comment = {
          text: req.body.text,
          author: req.user._id
        },
        _doc, _updated;

    try {      
      _doc = yield mongoose.model(_.startCase(req.params.collection.substr(0, req.params.collection.length-1))).findByIdAndUpdate(req.params.id, {'$push': {comments: _comment}}, {new: true});
      _updated = _.last(_doc.comments);
      
      res.status(201).json(yield User.populate(_updated, {path: 'author', select: 'title firstname lastname'}));
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

exports.remove = function(req, res) {
  co(function*() {
    let _doc;
    
    try {      
      if ((_doc = yield Question.findOne({'comments._id': req.params.id}, {target_user: true, 'comments._id': true}))) {
        if (req.user.role === 'admin' || req.user._id.toString() === _doc.target_user.toString()) {
          yield _doc.update({'$pull': {comments: {_id: req.params.id}}});
        }
        else {
          return res.status(403).end()
        }
      }
      else if ((_doc = yield Article.findOne({'comments._id': req.params.id}, {author: true, 'comments._id': true}))) {
        if (req.user.role === 'admin' || req.user._id.toString() === _doc.author.toString()) {
          yield _doc.update({'$pull': {comments: {_id: req.params.id}}});
        }
        else {
          return res.status(403).end()
        }
      }
      else {
        return res.status(400).type('text').send("Comment not found");
      }
      
      res.status(204).end();
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
