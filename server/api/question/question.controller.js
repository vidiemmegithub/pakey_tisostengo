'use strict';

const _ = require('lodash'),
      Question = require('./question.model'),
      User = require('../user/user.model'),
      co = require('co');

// Get list of public questions
exports.index = function(req, res) {
  co(function*() {
    let _questions;

    try {
      if (req.sort && req.sort.hasOwnProperty('comments')) {
        _questions = yield Question.aggregate([
          { $match: _.merge(req.filter, {'answer': {'$not': {'$eq': null}}, 'type': 'public'}) },
          { $project : _.merge({'text': true, 'author': true, 'date': true, 'pub_date': true, 'target_user': true, 'answer': true, 'tags': true, 'comments': true}, { comments_count: {$size: { "$ifNull": [ "$comments", [] ] } } }, (a, b) => { if (_.isArray(a)) {return a.concat(b);}}) },
          { $sort: {"comments_count": req.sort.comments} }
        ]).exec();
      }
      else {
        _questions = yield Question.find(_.merge(req.filter, {'answer': {'$not': {'$eq': null}}, 'type': 'public'}), req.fields, {limit: req.paging.limit, skip: req.paging.skip, sort: req.sort});
      }

      // populate author and target user
      yield User.populate(_questions, {path: 'author target_user', select: 'title firstname lastname specialization city', match: {'$or': [{'$or': [{banned: false}, {banned: null}]}, {role: 'editor'}]}});
      // remove question made by and sent to a banned user
      _.remove(_questions, question => !question.author || !question.target_user);

      if (!req.user) {
        _questions.forEach(question => { question.answer = undefined; });
      }

      return res.status(200).json({'questions': _questions});
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of all questions
exports.indexAll = function(req, res) {
  co(function*() {
    let _questions;

    try {
      if (req.sort && req.sort.hasOwnProperty('comments')) {
        _questions = yield Question.aggregate([
          { $match: req.filter },
          { $project : _.merge({'text': true, 'author': true, 'date': true, 'pub_date': true, 'target_user': true, 'answer': true, 'tags': true, 'comments': true}, { comments_count: {$size: { "$ifNull": [ "$comments", [] ] } } }, (a, b) => { if (_.isArray(a)) {return a.concat(b);}}) },
          { $sort: {"comments_count": req.sort.comments} }
        ]).exec();
      }
      else {
        _questions = yield Question.find(req.filter, req.fields, {limit: req.paging.limit, skip: req.paging.skip, sort: req.sort});
      }

      // populate author and target user
      yield User.populate(_questions, {path: 'target_user', select: 'title firstname lastname specialization'});
      // remove question made by and sent to a banned user
      //_.remove(_questions, question => !question.author || !question.target_user);

      return res.status(200).json({'questions': _questions});
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of question made by you
exports.indexOutgoing = function(req, res) {
  co(function*() {
    let _questions;

    try {
      _questions = yield Question
        .find(_.merge({'author': req.user._id}, req.filter), req.fields)
        .limit(req.paging.limit)
        .skip(req.paging.skip)
        .sort(_.isEmpty(req.sort) ? {'date': -1} : req.sort);

      return res.status(200).json({'questions': yield User.populate(_questions, {path: 'target_user', select: 'firstname lastname title dateOfBirth gender specialization city'})});
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of question to you
exports.indexIncoming = function(req, res) {
  co(function*() {
    let _questions;

    try {
      _questions = yield Question
        .find(_.merge({'target_user': req.user._id}, req.filter), req.fields)
        .limit(req.paging.limit)
        .skip(req.paging.skip)
        .sort(_.isEmpty(req.sort) ? {'date': -1} : req.sort);

      return res.status(200).json({'questions': yield User.populate(_questions, {path: 'author', select: 'firstname lastname title dateOfBirth gender specialization city'})});
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of last questions from the followed users
exports.indexFollowed = function(req, res) {
  co(function*() {
    let _user, _questions, _questionsObj;

    try {
      _user = yield User.findById(req.user._id, {'followed': true});
      _questions = yield Question.aggregate()
        .match(_.merge(req.filter, {'target_user': {'$in': _user.followed}, 'answer': {'$not': {'$eq': null}}, 'type': 'public'}))
        .sort({'pub_date': -1})
        .group({_id: '$target_user', 'recent': {'$first': '$$ROOT'}})
        .skip(req.paging.skip)
        .limit(req.paging.limit)
        .exec();

      _questionsObj = _questions.map(question => {
        delete question.recent.comments;
        delete question.recent.author;
        delete question.recent.attachments;
        delete question.recent.tags;
        delete question.recent.type;
        delete question.recent.date;
        delete question.recent.answer;
        delete question.recent.__v;
        return question.recent;
      });
      _questionsObj.sort((a,b) => b.pub_date.getTime()-a.pub_date.getTime());
      return res.status(200).json({'questions': yield User.populate(_questionsObj, {path: 'target_user', select: 'firstname lastname title'})});
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of last questions from the most followed users
exports.indexMostFollowed = function(req, res) {
  co(function*() {
    let _users, _questions, _questionsObj;

    try {
      _users = yield User.aggregate()
          .match(req.filter)
          .unwind('followed')
          .group({_id: '$followed', count : { $sum : 1 }})
          .sort({'count': -1})
          .exec();

      _questions = yield Question.aggregate()
        .match(_.merge(req.filter, {
          target_user: {$in: _users.map(user => user._id)},
          answer: {$not: {$eq: null}},
          type: 'public'
        }))
        .sort({'pub_date': -1})
        .group({_id: '$target_user', 'recent': {'$first': '$$ROOT'}})
        .skip(req.paging.skip)
        .limit(req.paging.limit)
        .exec();

      _questionsObj = _.sortBy(_questions.map(question => {
        delete question.recent.comments;
        delete question.recent.author;
        delete question.recent.attachments;
        delete question.recent.tags;
        delete question.recent.type;
        delete question.recent.date;
        delete question.recent.answer;
        delete question.recent.__v;
        return question.recent;
      }), question => _.findIndex(_users, user => user._id.equals(question.target_user)));

      return res.status(200).json({
        questions: yield User.populate(_questionsObj, {
          path: 'target_user',
          select: 'firstname lastname title'
        })
      });
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get a single question
exports.show = function(req, res) {
  co(function*() {
    let _question;

    try {
      _question = yield Question
        .findById(req.params.id, req.fields)
        .populate({
          path: 'author target_user comments.author',
          select: 'title firstname lastname dateOfBirth gender bio specialization city',
          match:{'$or': [{'$or': [{banned: false}, {banned: null}]}, {role: 'editor'}]}
        });

      if (!_question) {
        return res.status(400).send("Question not found");
      }
      // exit if article author or target is a banned user
      if (!_question.author || !_question.target_user) {
        return res.status(403).end();
      }

      // remove banned user comments
      _.remove(_question.comments, comment => !comment.author);

      if (req.user && req.user._id.toString() === _question.target_user._id.toString()) {
        if (!_question.read_date) {
          _question.read_date = Date.now();
          _question.markModified('read_date');
          yield _question.save();
        }
      }
      if (!req.user) {
        delete _question.answer;
      }
      return res.status(200).json(_question);
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Creates a new question in the DB.
exports.create = function(req, res) {
  let _author, _targetUser;

  co(function*() {
    try {
      _author = yield User.findById(req.user._id);
      req.body.author = req.user;

      if (!req.body.target_user) {
        return res.status(400).type('text').send("No target user specified");
      }
      if (req.body.author._id === req.body.target_user) {
        return res.status(400).type('text').send("Unable to post a question to myself");
      }

      _targetUser = yield User.findById(req.body.target_user);
      if (_targetUser.banned) {
        return res.status(400).type('text').send("You can not make questions to banend users");
      }
      if (req.body.type && req.body.type === 'private') {
        if (('unqualified' === _author.role && !_author.checkSubscriptionsState('private-channel-unq')) ||
            ('qualified' === _author.role && !_author.checkSubscriptionsState('private-channel-uq')) ||
            !_targetUser.checkSubscriptionsState('private-channel-uq')) {
          return res.status(403).end();
        }
      }

      Question.create(req.body, function(err) {
        if(err) {
          return handleError(res, err);
        }

        return res.status(204).end();
      });
    }
    catch(err) {
      return handleError(res, err);
    }
  })
};

// Updates an existing question in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Question.findById(req.params.id, function (err, question) {
    if (err) { return handleError(res, err); }
    if(!question) { return res.status(404).send('Not Found'); }
    var updated = _.merge(question, req.body);
    Object.keys(req.body).forEach(prop => updated.markModified(prop));
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(question);
    });
  });
};

// Deletes a question from the DB.
exports.destroy = function(req, res) {
  Question.findByIdAndRemove(req.params.id, function (err) {
    if(err) {
      return handleError(res, err);
    }

    res.status(204).end();
  });
};

exports.addComment = function (req, res) {
  co(function*() {
    try {
      var question = yield Question.findById(req.params.id);

      question.comments.push({
        text: req.body.text,
        author: req.user
      });

      yield question.save();

      res.sendStatus(201);
    } catch (err) {
      handleError(res, err);
    }
  });
};

exports.addAnswer = function (req, res) {
  if (!req.body.text || !req.body.category) {
    return handleError(res, "Answer text or category are not present");
  }
  co(function*() {
    try {
      var question = yield Question.findById(req.params.id);

      if (question.answer.text) {
        return handleError(res, "Answer already present");
      }

      question.answer = {
        text: req.body.text
      };
      question.pub_date = Date.now();
      question.category = req.body.category;
      if (req.body.tags) {
        question.tags = _.union(question.tags, req.body.tags);
      }

      yield question.save();

      res.sendStatus(201);
    }
    catch (err) {
      handleError(res, err);
    }
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
