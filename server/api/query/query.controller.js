'use strict';

const _ = require('lodash'),
  User = require('../user/user.model'),
  Question = require('../question/question.model'),
  Article = require('../article/article.model'),
  co = require('co');

// Get list of questions and articles in which we found the requested string
exports.searchContent = [validateQuery, function (req, res) {
  co(function*() {
    let _questions = [],
      _articles = [];

    try {
      if (!req.query.type) {
        _questions = yield Question
          .find(_.merge(req.filter, { $text: { $search: req.body.string } }), { 'score': { $meta: "textScore" } })
          .sort({ 'score': { $meta: 'textScore' } });
        _articles = yield Article
          .find(_.merge(req.filter, { $text: { $search: req.body.string } }), {
            'score': { $meta: "textScore" },
            'thumbnail': false
          })
          .sort({ 'score': { $meta: 'textScore' } });
      }
      else {
        if ('articles' === req.query.type) {
          _articles = yield Article
            .find(_.merge(req.filter, { $text: { $search: req.body.string } }), {
              'score': { $meta: "textScore" },
              'thumbnail': false
            })
            .limit(req.paging.limit)
            .skip(req.paging.skip)
            .sort({ 'score': { $meta: 'textScore' } });
        }
        else if ('questions' === req.query.type) {
          _questions = yield Question
            .find(_.merge(req.filter, { $text: { $search: req.body.string } }), { 'score': { $meta: "textScore" } })
            .limit(req.paging.limit)
            .skip(req.paging.skip)
            .sort({ 'score': { $meta: 'textScore' } });
        }

      }

      // populate user fields
      yield User.populate(_articles, { path: 'author', select: 'title firstname lastname', match: { banned: { $ne: true } } });
      yield User.populate(_questions, {
        path: 'author target_user',
        select: 'title firstname lastname specialization city',
        match: { banned: { $ne: true } }
      });
      // remove content from and targetted to banned user
      _.remove(_articles, article => !article.author);
      _.remove(_questions, question => !question.author || !question.target_user);

      return res.status(200).json({
        articles: _articles,
        questions: _questions
      });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
}];

// Get list of users
exports.searchUsers = [validateQuery, function (req, res) {
  co(function*() {
    let _users;

    try {
      _users = yield User
        .find(_.merge(req.filter, {
          role: 'qualified',
          banned: { $ne: true },
          $text: { $search: req.body.string }
        }), { 'score': { $meta: "textScore" }, 'picture': false, 'hashedPassword': false, 'salt': false })
        .limit(req.paging.limit)
        .skip(req.paging.skip)
        .sort({ 'score': { $meta: 'textScore' } });

      return res.status(200).json({
        users: _users
      });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
}];

exports.searchPremiumUsers = [validateQuery, function (req, res) {
  co(function*() {
    let _premiumUsers;

    try {
      _premiumUsers = yield User.find({
        role: 'qualified',
        banned: { $ne: true },
        subscriptions: { $elemMatch: { name: 'ranking', '$or': [{deactivation_date: null}, {deactivation_date:{'$gte': new Date()}}] } },
        $text: { $search: req.body.string }
      }, {
        score: { $meta: "textScore" },
        picture: false,
        hashedPassword: false,
        salt: false
      });

      // take 5 random premium users
      _premiumUsers = _.sampleSize(_premiumUsers, 5);

      // increase premium views of each user
      yield Promise.all(_premiumUsers.map(user => user.update({ $inc: { premiumViews: 1 } })));

      return res.status(200).json({
        users: _premiumUsers
      });
    }
    catch (err) {
      console.error(err);
      return handleError(res, err);
    }
  });
}];

function validateQuery(req, res, next) {
  if (!req.body.hasOwnProperty('string')) {
    return res.status(400).send("Invalid query criteria");
  }
  next();
}

function handleError(res, err) {
  return res.status(500).send(err);
}
